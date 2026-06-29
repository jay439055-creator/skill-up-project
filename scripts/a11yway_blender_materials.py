from __future__ import annotations

from pathlib import Path

import bpy

MaterialMap = dict[str, bpy.types.Material]


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
    tint_texture: bool = False,
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
        if tint_texture:
            tint = material.node_tree.nodes.new("ShaderNodeRGB")
            tint.outputs["Color"].default_value = base_color
            multiply = material.node_tree.nodes.new("ShaderNodeMixRGB")
            multiply.blend_type = "MULTIPLY"
            multiply.inputs["Fac"].default_value = 1.0
            material.node_tree.links.new(tex.outputs["Color"], multiply.inputs["Color1"])
            material.node_tree.links.new(tint.outputs["Color"], multiply.inputs["Color2"])
            material.node_tree.links.new(multiply.outputs["Color"], bsdf.inputs["Base Color"])
        else:
            material.node_tree.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])

    return material


def create_reference_materials(model_dir: Path, ui_panel_texture: Path) -> MaterialMap:
    return {
        "strap": make_principled(
            "A11yway muted woven strap",
            (0.7, 0.71, 0.69, 1.0),
            roughness=0.94,
            coat=0.06,
            coat_roughness=0.78,
            image_path=model_dir / "Strap_DiffuseMap_2048_a11yway.jpg",
            tint_texture=True,
        ),
        "shell": make_principled(
            "A11yway reference satin silver side shell",
            (0.43, 0.44, 0.45, 1.0),
            roughness=0.38,
            metallic=0.06,
            coat=0.36,
            coat_roughness=0.24,
        ),
        "side_pad": make_principled(
            "A11yway reference cool gray strap pod",
            (0.45, 0.46, 0.46, 1.0),
            roughness=0.4,
            metallic=0.03,
            coat=0.34,
            coat_roughness=0.24,
        ),
        "black_rubber": make_principled(
            "A11yway reference deep black facial interface",
            (0.004, 0.004, 0.0035, 1.0),
            roughness=0.48,
            coat=0.18,
            coat_roughness=0.34,
        ),
        "black_band": make_principled(
            "A11yway reference satin black structural band",
            (0.009, 0.009, 0.008, 1.0),
            roughness=0.34,
            coat=0.32,
            coat_roughness=0.22,
        ),
        "rim": make_principled(
            "A11yway reference narrow visor rim",
            (0.39, 0.402, 0.402, 1.0),
            roughness=0.34,
            metallic=0.18,
            coat=0.28,
            coat_roughness=0.3,
        ),
        "ui_panel": make_principled(
            "A11yway replaceable front UI panel",
            (1.0, 1.0, 1.0, 1.0),
            roughness=0.09,
            coat=0.9,
            coat_roughness=0.06,
            image_path=ui_panel_texture if ui_panel_texture.exists() else None,
        ),
    }


def replace_imported_strap_materials(materials: MaterialMap) -> None:
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH":
            continue
        for index, slot in enumerate(obj.data.materials):
            if slot is not None and slot.name.split(".")[0] == "MQ3S_Straps":
                obj.data.materials[index] = materials["strap"]
