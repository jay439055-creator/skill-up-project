from __future__ import annotations

import sys
from pathlib import Path

import bpy

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

for module_name in ("a11yway_blender_geometry", "a11yway_blender_materials", "a11yway_blender_panel"):
    sys.modules.pop(module_name, None)

from a11yway_blender_geometry import (  # noqa: E402
    create_reference_headset_body,
    match_site_strap_proportions,
    remove_reference_mismatch_nodes,
    soften_imported_meshes,
)
from a11yway_blender_materials import create_reference_materials, replace_imported_strap_materials  # noqa: E402
from a11yway_blender_panel import create_front_frame, create_front_ui_panel  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / "public" / "models" / "meta-quest3s"
SOURCE_FBX = MODEL_DIR / "HP_MetaQuest3S.FBX"
OUTPUT_GLB = MODEL_DIR / "Quest3S_A11yway_PBR.glb"
UI_PANEL_TEXTURE = MODEL_DIR / "a11yway-ui-panel.png"


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()


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
    materials = create_reference_materials(MODEL_DIR, UI_PANEL_TEXTURE)
    bpy.ops.import_scene.fbx(filepath=str(SOURCE_FBX))
    remove_reference_mismatch_nodes()
    replace_imported_strap_materials(materials)
    match_site_strap_proportions()
    soften_imported_meshes()
    create_reference_headset_body(materials)
    create_front_frame(materials)
    create_front_ui_panel(materials)
    export_glb()
    print(f"Exported {OUTPUT_GLB}")


if __name__ == "__main__":
    main()
