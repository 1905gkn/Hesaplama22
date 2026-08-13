#!/usr/bin/env python3
"""Build loaded B2B display GLBs from the project's existing rack parts."""

from __future__ import annotations

import copy
import json
import struct
import sys
from pathlib import Path


def read_glb(path: Path) -> tuple[dict, bytes]:
    raw = path.read_bytes()
    magic, version, _ = struct.unpack_from("<4sII", raw, 0)
    if magic != b"glTF" or version != 2:
        raise ValueError(f"Unsupported GLB: {path}")
    offset = 12
    json_length, json_type = struct.unpack_from("<I4s", raw, offset)
    offset += 8
    if json_type != b"JSON":
        raise ValueError(f"Missing JSON chunk: {path}")
    document = json.loads(raw[offset : offset + json_length].decode("utf-8").rstrip("\x00 "))
    offset += json_length
    bin_length, bin_type = struct.unpack_from("<I4s", raw, offset)
    offset += 8
    if bin_type != b"BIN\x00":
        raise ValueError(f"Missing BIN chunk: {path}")
    return document, raw[offset : offset + bin_length]


def write_glb(path: Path, document: dict, binary: bytes) -> None:
    document["buffers"] = [{"byteLength": len(binary)}]
    json_bytes = json.dumps(document, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    json_bytes += b" " * ((4 - len(json_bytes) % 4) % 4)
    binary += b"\x00" * ((4 - len(binary) % 4) % 4)
    total = 12 + 8 + len(json_bytes) + 8 + len(binary)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(
        struct.pack("<4sII", b"glTF", 2, total)
        + struct.pack("<I4s", len(json_bytes), b"JSON")
        + json_bytes
        + struct.pack("<I4s", len(binary), b"BIN\x00")
        + binary
    )


def mesh_x_bounds(document: dict, mesh_index: int) -> tuple[float, float]:
    bounds = []
    for primitive in document["meshes"][mesh_index].get("primitives", []):
        accessor = document["accessors"][primitive["attributes"]["POSITION"]]
        if "min" in accessor and "max" in accessor:
            bounds.append((float(accessor["min"][0]), float(accessor["max"][0])))
    if not bounds:
        return 0.0, 0.0
    return min(item[0] for item in bounds), max(item[1] for item in bounds)


def append_geometry(target: dict, target_binary: bytearray, source: dict, source_binary: bytes) -> int:
    while len(target_binary) % 4:
        target_binary.append(0)
    byte_offset = len(target_binary)
    target_binary.extend(source_binary)

    view_offset = len(target.get("bufferViews", []))
    accessor_offset = len(target.get("accessors", []))
    mesh_offset = len(target.get("meshes", []))

    views = copy.deepcopy(source.get("bufferViews", []))
    for view in views:
        view["buffer"] = 0
        view["byteOffset"] = int(view.get("byteOffset", 0)) + byte_offset
    target.setdefault("bufferViews", []).extend(views)

    accessors = copy.deepcopy(source.get("accessors", []))
    for accessor in accessors:
        if "bufferView" in accessor:
            accessor["bufferView"] += view_offset
    target.setdefault("accessors", []).extend(accessors)

    meshes = copy.deepcopy(source.get("meshes", []))
    for mesh in meshes:
        for primitive in mesh.get("primitives", []):
            primitive["attributes"] = {
                name: index + accessor_offset for name, index in primitive.get("attributes", {}).items()
            }
            if "indices" in primitive:
                primitive["indices"] += accessor_offset
            # All prepared source GLBs share the same named B2B materials.
            primitive["material"] = int(primitive.get("material", 0))
    target.setdefault("meshes", []).extend(meshes)
    return mesh_offset


def build_variant(module_path: Path, pallet_path: Path, box_path: Path, output: Path, pallet_count: int) -> None:
    module, module_binary = read_glb(module_path)
    pallet, pallet_binary = read_glb(pallet_path)
    box, box_binary = read_glb(box_path)

    result = copy.deepcopy(module)
    result["asset"] = {"version": "2.0", "generator": "Rafex B2B GLB assembler"}
    result["scene"] = 0
    result["scenes"] = [{"name": f"B2B {pallet_count} pallet display", "nodes": []}]
    result["nodes"] = []
    result_binary = bytearray(module_binary)

    source_clear_left = 126.70318603515625
    source_clear_width = 2692.0
    target_clear_width = 2700.0 if pallet_count == 3 else 3600.0
    right_shift = target_clear_width - source_clear_width
    span_scale = target_clear_width / source_clear_width

    for source_node in module.get("nodes", []):
        node = copy.deepcopy(source_node)
        mesh_index = node.get("mesh")
        if mesh_index is not None and pallet_count == 4:
            x_min, x_max = mesh_x_bounds(module, mesh_index)
            if x_max - x_min > 1000:
                node["scale"] = [span_scale, 1, 1]
                node["translation"] = [source_clear_left * (1 - span_scale), 0, 0]
            elif (x_min + x_max) / 2 > 1500:
                node["translation"] = [right_shift, 0, 0]
        result["scenes"][0]["nodes"].append(len(result["nodes"]))
        result["nodes"].append(node)

    pallet_mesh_offset = append_geometry(result, result_binary, pallet, pallet_binary)
    box_mesh_offset = append_geometry(result, result_binary, box, box_binary)

    pallet_width = 800.0
    gap = (target_clear_width - pallet_count * pallet_width) / (pallet_count + 1)
    pallet_x = [source_clear_left + gap + index * (pallet_width + gap) for index in range(pallet_count)]
    support_heights = [281.69, 1481.69, 2681.69, 3881.69]
    pallet_height = 166.0

    for level, support_height in enumerate(support_heights, start=1):
        for position, x_value in enumerate(pallet_x, start=1):
            pallet_node = {
                "name": f"B2B pallet L{level} P{position}",
                "mesh": pallet_mesh_offset,
                "translation": [x_value, 0, -support_height],
            }
            box_node = {
                "name": f"B2B load L{level} P{position}",
                "mesh": box_mesh_offset,
                "translation": [x_value, 0, -(support_height + pallet_height)],
            }
            for node in (pallet_node, box_node):
                result["scenes"][0]["nodes"].append(len(result["nodes"]))
                result["nodes"].append(node)

    result.setdefault("extensionsUsed", [])
    result.setdefault("extras", {})["rafex"] = {
        "palletCount": pallet_count,
        "palletWidthMm": 800,
        "sectionWidthMm": int(target_clear_width),
        "spacingMm": gap,
    }
    write_glb(output, result, bytes(result_binary))


if __name__ == "__main__":
    if len(sys.argv) != 6:
        raise SystemExit("usage: build-b2b-display.py MODULE PALET BOX OUTPUT_3 OUTPUT_4")
    module_path, pallet_path, box_path, output_3, output_4 = map(Path, sys.argv[1:])
    build_variant(module_path, pallet_path, box_path, output_3, 3)
    build_variant(module_path, pallet_path, box_path, output_4, 4)
