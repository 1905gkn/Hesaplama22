#!/usr/bin/env python3
"""Copy B2B GLBs and add named materials for live color controls."""

from __future__ import annotations

import json
import struct
import sys
from pathlib import Path


def prepare(source: Path, target: Path, model_kind: str) -> None:
    raw = source.read_bytes()
    magic, version, _ = struct.unpack_from("<4sII", raw, 0)
    if magic != b"glTF" or version != 2:
        raise ValueError(f"Unsupported GLB: {source}")

    offset = 12
    json_length, json_type = struct.unpack_from("<I4s", raw, offset)
    offset += 8
    if json_type != b"JSON":
        raise ValueError(f"Missing JSON chunk: {source}")
    document = json.loads(raw[offset : offset + json_length].decode("utf-8").rstrip("\x00 "))
    offset += json_length
    remaining_chunks = raw[offset:]

    materials = [
        {
            "name": "B2B_FOOT",
            "pbrMetallicRoughness": {
                "baseColorFactor": [0.0, 0.31, 0.49, 1.0],
                "metallicFactor": 0.58,
                "roughnessFactor": 0.34,
            },
        },
        {
            "name": "B2B_TRAVERSE",
            "pbrMetallicRoughness": {
                "baseColorFactor": [0.9, 0.75, 0.004, 1.0],
                "metallicFactor": 0.42,
                "roughnessFactor": 0.32,
            },
        },
        {
            "name": "B2B_LOAD",
            "pbrMetallicRoughness": {
                "baseColorFactor": [0.72, 0.48, 0.23, 1.0],
                "metallicFactor": 0.04,
                "roughnessFactor": 0.72,
            },
        },
    ]
    document["materials"] = materials

    for mesh in document.get("meshes", []):
        name = (mesh.get("name") or "").upper()
        if model_kind == "traverse" or "CC120" in name or "TRAVERS" in name or "KONNEKT" in name:
            material = 1
        elif model_kind in {"pallet", "box"}:
            material = 2
        else:
            material = 0
        for primitive in mesh.get("primitives", []):
            primitive["material"] = material

    json_bytes = json.dumps(document, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    json_bytes += b" " * ((4 - len(json_bytes) % 4) % 4)
    total_length = 12 + 8 + len(json_bytes) + len(remaining_chunks)
    output = struct.pack("<4sII", b"glTF", 2, total_length)
    output += struct.pack("<I4s", len(json_bytes), b"JSON") + json_bytes + remaining_chunks
    target.write_bytes(output)


if __name__ == "__main__":
    if len(sys.argv) != 4:
        raise SystemExit("usage: prepare-b2b-models.py SOURCE TARGET KIND")
    prepare(Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3])
