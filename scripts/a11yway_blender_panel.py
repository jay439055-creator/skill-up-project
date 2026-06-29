from __future__ import annotations

from math import cos, pi, sin

import bpy
from mathutils import Vector

from a11yway_blender_materials import MaterialMap


def rounded_rect_points(width: float, height: float, radius: float, segments: int = 14) -> list[tuple[float, float]]:
    left = -width / 2
    right = width / 2
    bottom = -height / 2
    top = height / 2
    corners = (
        (right - radius, top - radius, 0.0, pi / 2),
        (left + radius, top - radius, pi / 2, pi),
        (left + radius, bottom + radius, pi, pi * 1.5),
        (right - radius, bottom + radius, pi * 1.5, pi * 2),
    )
    points: list[tuple[float, float]] = []
    for center_x, center_y, start_angle, end_angle in corners:
        for index in range(segments + 1):
            angle = start_angle + (end_angle - start_angle) * (index / segments)
            points.append((center_x + cos(angle) * radius, center_y + sin(angle) * radius))
    return points


def get_front_panel_layout() -> tuple[Vector, float, float, float]:
    panel_center = Vector((-0.065, -1.758, -0.155))
    panel_width = 1.48
    panel_height = 0.61
    panel_radius = panel_height * 0.26
    return panel_center, panel_width, panel_height, panel_radius


def create_front_frame(materials: MaterialMap) -> None:
    panel_center, panel_width, panel_height, _panel_radius = get_front_panel_layout()
    outer_width = 1.492
    outer_height = 0.612
    inner_width = panel_width * 1.012
    inner_height = panel_height * 1.012
    frame_center = Vector((panel_center.x, panel_center.y - 0.014, panel_center.z))
    outer = rounded_rect_points(outer_width, outer_height, outer_height * 0.282)
    inner = rounded_rect_points(inner_width, inner_height, inner_height * 0.262)

    vertices = [(frame_center.x + x, frame_center.y, frame_center.z + z) for x, z in outer]
    vertices.extend((frame_center.x + x, frame_center.y, frame_center.z + z) for x, z in inner)
    count = len(outer)
    faces = [(index, (index + 1) % count, count + (index + 1) % count, count + index) for index in range(count)]

    mesh = bpy.data.meshes.new("A11yway_Front_Frame_Mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    for polygon in mesh.polygons:
        polygon.use_smooth = True

    obj = bpy.data.objects.new("A11yway_Front_Frame", mesh)
    obj.data.materials.append(materials["rim"])
    bpy.context.collection.objects.link(obj)
    solidify = obj.modifiers.new("A11yway front frame thickness", "SOLIDIFY")
    solidify.thickness = 0.009
    solidify.offset = 0
    bevel = obj.modifiers.new("A11yway front frame soft edge", "BEVEL")
    bevel.width = 0.0035
    bevel.segments = 7
    bevel.harden_normals = True
    weighted = obj.modifiers.new("A11yway front frame weighted normals", "WEIGHTED_NORMAL")
    weighted.keep_sharp = True


def create_front_ui_panel(materials: MaterialMap) -> None:
    panel_center, panel_width, panel_height, panel_radius = get_front_panel_layout()
    perimeter = rounded_rect_points(panel_width, panel_height, panel_radius)
    vertices = [(panel_center.x, panel_center.y, panel_center.z)]
    uvs = [(0.5, 0.5)]
    for point_x, point_z in perimeter:
        vertices.append((panel_center.x + point_x, panel_center.y, panel_center.z + point_z))
        uvs.append((point_x / panel_width + 0.5, point_z / panel_height + 0.5))

    faces = []
    for index in range(1, len(vertices)):
        next_index = 1 if index == len(vertices) - 1 else index + 1
        faces.append((0, index, next_index))

    mesh = bpy.data.meshes.new("A11yway_UI_Panel_Mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    uv_layer = mesh.uv_layers.new(name="A11yway UI UV")
    for polygon in mesh.polygons:
        polygon.use_smooth = True
        for loop_index in polygon.loop_indices:
            vertex_index = mesh.loops[loop_index].vertex_index
            uv_layer.data[loop_index].uv = uvs[vertex_index]

    obj = bpy.data.objects.new("A11yway_UI_Panel", mesh)
    obj.data.materials.append(materials["ui_panel"])
    bpy.context.collection.objects.link(obj)
    solidify = obj.modifiers.new("A11yway UI glass thickness", "SOLIDIFY")
    solidify.thickness = 0.005
    solidify.offset = 0
    bevel = obj.modifiers.new("A11yway UI glass soft edge", "BEVEL")
    bevel.width = 0.004
    bevel.segments = 6
    bevel.harden_normals = True
    weighted = obj.modifiers.new("A11yway UI glass weighted normals", "WEIGHTED_NORMAL")
    weighted.keep_sharp = True
