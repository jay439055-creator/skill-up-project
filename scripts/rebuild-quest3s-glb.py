from __future__ import annotations

import math
from pathlib import Path

import bpy


ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / "public" / "models" / "meta-quest3s"
SOURCE_FBX = MODEL_DIR / "HP_MetaQuest3S.FBX"
OUTPUT_GLB = MODEL_DIR / "Quest3S_A11yway_PBR.glb"


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()


def set_input(node: bpy.types.ShaderNode, names: tuple[str, ...], value) -> None:
    for name in names:
        socket = node.inputs.get(name)
        if socket is not None:
            socket.default_value = value
            return


def make_principled(
    name: str,
    base_color: tuple[float, float, float, float],
    roughness: float,
    metallic: float = 0.0,
    alpha: float = 1.0,
    coat: float = 0.0,
    coat_roughness: float = 0.3,
    image_path: Path | None = None,
) -> bpy.types.Material:
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    material.diffuse_color = base_color
    material.use_screen_refraction = alpha < 1.0
    material.blend_method = "BLEND" if alpha < 1.0 else "OPAQUE"

    bsdf = material.node_tree.nodes.get("Principled BSDF")
    if bsdf is None:
        return material

    set_input(bsdf, ("Base Color",), base_color)
    set_input(bsdf, ("Metallic",), metallic)
    set_input(bsdf, ("Roughness",), roughness)
    set_input(bsdf, ("Alpha",), alpha)
    set_input(bsdf, ("Specular IOR Level", "Specular"), 0.7)
    set_input(bsdf, ("Coat Weight", "Clearcoat"), coat)
    set_input(bsdf, ("Coat Roughness", "Clearcoat Roughness"), coat_roughness)

    if image_path is not None:
        image = bpy.data.images.load(str(image_path), check_existing=True)
        image.colorspace_settings.name = "sRGB"
        tex = material.node_tree.nodes.new("ShaderNodeTexImage")
        tex.image = image
        tex.extension = "REPEAT"
        material.node_tree.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])

    return material


def replace_materials() -> None:
    materials = {
        "MQ3S_FrontMainBody": make_principled(
            "A11yway Quest 3S warm white shell",
            (0.88, 0.875, 0.845, 1.0),
            roughness=0.32,
            coat=0.3,
            coat_roughness=0.2,
        ),
        "MQ3S_White1": make_principled(
            "A11yway Quest 3S side plastic",
            (0.86, 0.855, 0.825, 1.0),
            roughness=0.36,
            coat=0.22,
            coat_roughness=0.26,
        ),
        "MQ3S_Straps": make_principled(
            "A11yway Quest 3S bright woven strap",
            (0.94, 0.935, 0.9, 1.0),
            roughness=0.82,
            image_path=MODEL_DIR / "Strap_DiffuseMap_2048_a11yway.jpg",
        ),
        "MQ3S_EyeSidePadSupport": make_principled(
            "A11yway Quest 3S light rear pad fabric",
            (0.88, 0.875, 0.845, 1.0),
            roughness=0.84,
            image_path=MODEL_DIR / "EyeSidePadSupport_DiffuseMap_2048_a11yway.jpg",
        ),
        "MQ3S_Gray1": make_principled(
            "A11yway dark facial interface",
            (0.012, 0.012, 0.011, 1.0),
            roughness=0.56,
            coat=0.08,
            coat_roughness=0.55,
        ),
        "MQ3S_Black": make_principled(
            "A11yway black rubber",
            (0.01, 0.01, 0.009, 1.0),
            roughness=0.5,
            coat=0.12,
            coat_roughness=0.45,
        ),
        "MQ3S_DarkBlack": make_principled(
            "A11yway shadow seam black",
            (0.005, 0.005, 0.004, 1.0),
            roughness=0.44,
        ),
        "MQ3S_BlackGlass": make_principled(
            "A11yway glossy camera glass",
            (0.002, 0.002, 0.002, 1.0),
            roughness=0.055,
            coat=0.85,
            coat_roughness=0.08,
        ),
        "MQ3S_Lens": make_principled(
            "A11yway smoked lens glass",
            (0.01, 0.012, 0.016, 1.0),
            roughness=0.07,
            coat=0.9,
            coat_roughness=0.06,
        ),
        "MQ3S_Glass1": make_principled(
            "A11yway translucent inner lens",
            (0.025, 0.025, 0.026, 0.96),
            roughness=0.22,
            alpha=0.96,
            coat=0.45,
        ),
        "MQ3S_Glass2": make_principled(
            "A11yway front sensor glass",
            (0.018, 0.019, 0.021, 1.0),
            roughness=0.08,
            coat=0.75,
            coat_roughness=0.08,
        ),
        "MQ3S_Gray2": make_principled(
            "A11yway sensor graphite",
            (0.18, 0.18, 0.17, 1.0),
            roughness=0.48,
        ),
        "MQ3S_Chrome": make_principled(
            "A11yway satin metal detail",
            (0.72, 0.72, 0.69, 1.0),
            roughness=0.24,
            metallic=0.75,
        ),
    }

    for obj in bpy.context.scene.objects:
        if obj.type != "MESH":
            continue
        for index, slot in enumerate(obj.data.materials):
            if slot is None:
                continue
            material = materials.get(slot.name.split(".")[0])
            if material is not None:
                obj.data.materials[index] = material


def suppress_quest_camera_clusters() -> None:
    removable_names = (
        "MQ3S_FrontMainBody",
        "MQ3S_GogglesSide2",
        "MQ3S_EyeSidePad",
        "MQ3S_HeadsetSideCameras",
        "MQ3S_FrontCameras",
        "MQ3S_SideHoleRubber",
        "MQ3S_SideStrap2",
        "MQ3S_SideStrapSupport",
        "MQ3S_SideStrapSpeakers",
        "MQ3S_SideUSB_Port",
        "MQ3S_Goggles",
        "MQ3S_GogglesSide",
        "MQ3S_PowerButton",
        "MQ3S_BottomButtons",
    )
    for name in removable_names:
        obj = bpy.data.objects.get(name)
        if obj is not None:
            bpy.data.objects.remove(obj, do_unlink=True)


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

    bevel = obj.modifiers.new(f"{name} softened radius", "BEVEL")
    bevel.width = bevel_width
    bevel.segments = bevel_segments
    bevel.affect = "EDGES"
    bevel.harden_normals = True

    weighted = obj.modifiers.new(f"{name} weighted normals", "WEIGHTED_NORMAL")
    weighted.keep_sharp = True
    weighted.weight = 70

    for polygon in obj.data.polygons:
        polygon.use_smooth = True

    return obj


def make_rounded_panel_mesh(
    name: str,
    width: float,
    height: float,
    radius: float,
    front_y: float,
    depth: float,
    center_z: float,
    material: bpy.types.Material,
    segments: int = 14,
) -> bpy.types.Object:
    half_width = width / 2
    half_height = height / 2
    radius = min(radius, half_width - 0.001, half_height - 0.001)
    corners = (
        (half_width - radius, center_z + half_height - radius, 0, 90),
        (-half_width + radius, center_z + half_height - radius, 90, 180),
        (-half_width + radius, center_z - half_height + radius, 180, 270),
        (half_width - radius, center_z - half_height + radius, 270, 360),
    )

    perimeter: list[tuple[float, float]] = []
    for center_x, corner_z, start, end in corners:
        for step in range(segments + 1):
            angle = math.radians(start + (end - start) * step / segments)
            perimeter.append((center_x + math.cos(angle) * radius, corner_z + math.sin(angle) * radius))

    vertices = [(x, front_y, z) for x, z in perimeter]
    vertices.extend((x, front_y + depth, z) for x, z in perimeter)

    count = len(perimeter)
    faces: list[tuple[int, ...]] = [tuple(range(count)), tuple(reversed(range(count, count * 2)))]
    for index in range(count):
        next_index = (index + 1) % count
        faces.append((index, next_index, count + next_index, count + index))

    mesh = bpy.data.meshes.new(f"{name}Mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(material)

    for polygon in obj.data.polygons:
        polygon.use_smooth = True

    weighted = obj.modifiers.new("A11yway reference panel normals", "WEIGHTED_NORMAL")
    weighted.keep_sharp = True
    weighted.weight = 75
    return obj


def add_reference_headset_body() -> None:
    shell_material = make_principled(
        "A11yway reference satin silver structural shell",
        (0.44, 0.45, 0.46, 1.0),
        roughness=0.22,
        metallic=0.08,
        coat=0.5,
        coat_roughness=0.16,
    )
    side_arm_material = make_principled(
        "A11yway reference satin side arm",
        (0.49, 0.5, 0.51, 1.0),
        roughness=0.24,
        metallic=0.05,
        coat=0.46,
        coat_roughness=0.18,
    )
    black_rubber_material = make_principled(
        "A11yway reference deep black face cushion",
        (0.002, 0.002, 0.0015, 1.0),
        roughness=0.42,
        coat=0.15,
        coat_roughness=0.24,
    )
    rim_material = make_principled(
        "A11yway reference narrow bright visor rim",
        (0.72, 0.73, 0.73, 1.0),
        roughness=0.16,
        metallic=0.22,
        coat=0.58,
        coat_roughness=0.1,
    )
    gasket_material = make_principled(
        "A11yway reference black visor gasket",
        (0.002, 0.002, 0.002, 1.0),
        roughness=0.2,
        coat=0.42,
        coat_roughness=0.16,
    )
    visor_material = make_principled(
        "A11yway reference smoked black curved front glass",
        (0.0012, 0.0013, 0.0016, 1.0),
        roughness=0.03,
        coat=1.0,
        coat_roughness=0.035,
    )

    make_rounded_box(
        "A11ywayReferenceSilverBodyBarrel",
        location=(0.0, -1.31, -0.16),
        scale=(1.42, 0.78, 0.66),
        material=shell_material,
        bevel_width=0.17,
        bevel_segments=28,
    )
    make_rounded_box(
        "A11ywayReferenceBlackUnderside",
        location=(0.0, -1.12, -0.48),
        scale=(1.28, 0.68, 0.28),
        material=black_rubber_material,
        bevel_width=0.13,
        bevel_segments=22,
    )
    make_rounded_box(
        "A11ywayReferenceLeftSideArm",
        location=(-0.84, -0.82, -0.07),
        scale=(0.19, 1.2, 0.23),
        material=side_arm_material,
        bevel_width=0.055,
        bevel_segments=18,
    )
    make_rounded_box(
        "A11ywayReferenceRightSideArm",
        location=(0.84, -0.82, -0.07),
        scale=(0.19, 1.2, 0.23),
        material=side_arm_material,
        bevel_width=0.055,
        bevel_segments=18,
    )
    make_rounded_box(
        "A11ywayReferenceLeftArmEndCap",
        location=(-0.84, -1.42, -0.07),
        scale=(0.24, 0.18, 0.28),
        material=side_arm_material,
        bevel_width=0.06,
        bevel_segments=18,
    )
    make_rounded_box(
        "A11ywayReferenceRightArmEndCap",
        location=(0.84, -1.42, -0.07),
        scale=(0.24, 0.18, 0.28),
        material=side_arm_material,
        bevel_width=0.06,
        bevel_segments=18,
    )

    make_rounded_panel_mesh(
        "A11ywayReferenceFrontSilverRim",
        width=1.36,
        height=0.64,
        radius=0.18,
        front_y=-1.735,
        depth=0.018,
        center_z=-0.14,
        material=rim_material,
    )
    make_rounded_panel_mesh(
        "A11ywayReferenceFrontBlackGasket",
        width=1.29,
        height=0.575,
        radius=0.155,
        front_y=-1.748,
        depth=0.014,
        center_z=-0.14,
        material=gasket_material,
    )
    make_rounded_panel_mesh(
        "A11ywayReferenceFrontSmokedGlass",
        width=1.235,
        height=0.522,
        radius=0.138,
        front_y=-1.762,
        depth=0.012,
        center_z=-0.14,
        material=visor_material,
    )


def soften_geometry() -> None:
    bevel_widths = {
        "MQ3S_FrontMainBody": 0.014,
        "MQ3S_SideStrap2": 0.006,
        "MQ3S_SideStrapSupport": 0.008,
        "MQ3S_SideStrapSpeakers": 0.004,
        "MQ3S_PowerButton": 0.004,
        "MQ3S_BottomButtons": 0.004,
        "MQ3S_HeadsetSideCameras": 0.003,
        "MQ3S_FrontCameras": 0.003,
    }

    for obj in bpy.context.scene.objects:
        if obj.type != "MESH":
            continue
        for polygon in obj.data.polygons:
            polygon.use_smooth = True

        width = bevel_widths.get(obj.name)
        if width is not None:
            bevel = obj.modifiers.new("A11yway softened production edges", "BEVEL")
            bevel.width = width
            bevel.segments = 10
            bevel.affect = "EDGES"
            bevel.harden_normals = True

        weighted = obj.modifiers.new("A11yway weighted production normals", "WEIGHTED_NORMAL")
        weighted.keep_sharp = True
        weighted.weight = 60


def export_glb() -> None:
    bpy.ops.export_scene.gltf(
        filepath=str(OUTPUT_GLB),
        export_format="GLB",
        export_apply=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_draco_position_quantization=14,
        export_draco_normal_quantization=10,
        export_draco_texcoord_quantization=12,
    )


def main() -> None:
    clear_scene()
    bpy.ops.import_scene.fbx(filepath=str(SOURCE_FBX))
    replace_materials()
    suppress_quest_camera_clusters()
    add_reference_headset_body()
    soften_geometry()
    export_glb()
    print(f"Exported {OUTPUT_GLB}")


if __name__ == "__main__":
    main()
