from __future__ import annotations

import bpy
from mathutils import Vector

from a11yway_blender_materials import MaterialMap

REMOVED_REFERENCE_MISMATCH_NODES = {
    "MQ3S_BottomButtons",
    "MQ3S_EyeSidePad",
    "MQ3S_EyeSidePadSupport",
    "MQ3S_FrontCameras",
    "MQ3S_FrontMainBody",
    "MQ3S_Goggles",
    "MQ3S_GogglesSide",
    "MQ3S_GogglesSide2",
    "MQ3S_HeadsetSideCameras",
    "MQ3S_PowerButton",
    "MQ3S_SideHoleRubber",
    "MQ3S_SideStrap1",
    "MQ3S_SideStrap2",
    "MQ3S_SideStrapSpeakers",
    "MQ3S_SideStrapSupport",
    "MQ3S_SideUSB_Port",
}


def remove_reference_mismatch_nodes() -> None:
    for name in REMOVED_REFERENCE_MISMATCH_NODES:
        obj = bpy.data.objects.get(name)
        if obj is not None:
            bpy.data.objects.remove(obj, do_unlink=True)


def transform_vertices(
    name: str,
    pivot: tuple[float, float, float],
    scale: tuple[float, float, float],
    offset: tuple[float, float, float] = (0.0, 0.0, 0.0),
) -> None:
    obj = bpy.data.objects.get(name)
    if obj is None or obj.type != "MESH":
        return

    pivot_vector = Vector(pivot)
    offset_vector = Vector(offset)
    inverse_matrix = obj.matrix_world.inverted()

    for vertex in obj.data.vertices:
        world = obj.matrix_world @ vertex.co
        adjusted = Vector(
            (
                pivot_vector.x + (world.x - pivot_vector.x) * scale[0],
                pivot_vector.y + (world.y - pivot_vector.y) * scale[1],
                pivot_vector.z + (world.z - pivot_vector.z) * scale[2],
            )
        )
        vertex.co = inverse_matrix @ (adjusted + offset_vector)

    obj.data.update()


def match_site_strap_proportions() -> None:
    transform_vertices("MQ3S_TopStrap1", (0.0, -1.18, -0.08), (0.82, 0.38, 0.46), (0.0, -0.12, -0.02))
    transform_vertices("MQ3S_TopStrap2", (0.0, -1.2, -0.06), (0.74, 0.34, 0.44), (0.0, -0.12, -0.03))
    transform_vertices("MQ3S_BackSmallStrap", (-0.91, -1.32, 0.02), (0.74, 0.6, 0.5), (0.1, -0.08, -0.055))


def soften_imported_meshes() -> None:
    bevel_widths = {"MQ3S_TopStrap1": 0.006, "MQ3S_TopStrap2": 0.006, "MQ3S_BackSmallStrap": 0.004}
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH":
            continue
        for polygon in obj.data.polygons:
            polygon.use_smooth = True
        width = bevel_widths.get(obj.name)
        if width is not None:
            bevel = obj.modifiers.new("A11yway softened strap edge", "BEVEL")
            bevel.width = width
            bevel.segments = 10
            bevel.affect = "EDGES"
            bevel.harden_normals = True
        weighted = obj.modifiers.new("A11yway imported weighted normals", "WEIGHTED_NORMAL")
        weighted.keep_sharp = True
        weighted.weight = 60


def make_rounded_box(
    name: str,
    location: tuple[float, float, float],
    scale: tuple[float, float, float],
    material: bpy.types.Material,
    bevel_width: float,
    bevel_segments: int = 18,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(material)
    bevel = obj.modifiers.new(f"{name} production radius", "BEVEL")
    bevel.width = bevel_width
    bevel.segments = bevel_segments
    bevel.affect = "EDGES"
    bevel.harden_normals = True
    weighted = obj.modifiers.new(f"{name} weighted normals", "WEIGHTED_NORMAL")
    weighted.keep_sharp = True
    weighted.weight = 76
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def create_reference_headset_body(materials: MaterialMap) -> None:
    make_rounded_box(
        "A11ywayReferenceSilverBodyBarrel",
        (-0.14, -1.24, -0.22),
        (1.12, 0.53, 0.62),
        materials["shell"],
        0.19,
        34,
    )
    boxes = [
        ("A11ywayReferenceBlackUnderside", (-0.03, -1.15, -0.48), (1.02, 0.35, 0.15), "black_rubber", 0.076, 24),
        ("A11ywayReferenceRearBlackBand", (-0.06, -0.98, -0.17), (1.03, 0.11, 0.38), "black_band", 0.05, 18),
        ("A11ywayReferenceLeftSideStrapPod", (-0.86, -0.72, -0.18), (0.15, 0.51, 0.2), "side_pad", 0.058, 22),
        ("A11ywayReferenceLeftStrapEndCap", (-0.86, -0.5, -0.18), (0.18, 0.14, 0.2), "side_pad", 0.052, 20),
    ]
    for name, location, scale, material_key, bevel_width, bevel_segments in boxes:
        make_rounded_box(name, location, scale, materials[material_key], bevel_width, bevel_segments)
