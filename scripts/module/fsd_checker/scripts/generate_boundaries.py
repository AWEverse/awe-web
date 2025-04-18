# ------ fsd_checker/scripts/generate_boundaries.py ------
#!/usr/bin/env python
"""
Script to generate FSD architecture boundary rules.

This script scans a project directory, identifies FSD layers and their modules,
and generates a JSON configuration for boundary rules.
"""

import os
import json
import argparse
import sys
from typing import Dict, List


def collect_layer_paths(base_dir: str, layers: List[str]) -> Dict[str, List[str]]:
    """
    Collect all modules within each FSD layer.

    Args:
        base_dir: Base directory containing FSD layers
        layers: List of FSD layer names

    Returns:
        Dictionary mapping layer names to lists of their modules
    """
    layer_paths = {layer: [] for layer in layers}

    for layer in layers:
        layer_dir = os.path.join(base_dir, layer)
        if os.path.isdir(layer_dir):
            for sub in os.listdir(layer_dir):
                sub_path = os.path.join(layer_dir, sub)
                if os.path.isdir(sub_path):
                    layer_paths[layer].append(sub)

    return layer_paths


def generate_boundary_rules(layers: List[str], allowed_access: Dict[str, List[str]]) -> List[Dict]:
    """
    Generate boundary rules based on allowed access between layers.

    Args:
        layers: List of all layers
        allowed_access: Dictionary mapping source layers to lists of allowed target layers

    Returns:
        List of boundary rule dictionaries
    """
    rules = []

    for from_layer in layers:
        allow = allowed_access.get(from_layer, [])
        disallow = [l for l in layers if l not in allow]

        if allow:
            rules.append({"from": from_layer, "allow": allow})

        if disallow:
            rules.append({"from": from_layer, "disallow": disallow})

    return rules


def main():
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(description="Generate FSD architecture boundary rules")
    parser.add_argument("--base-dir", default="src", help="Base directory containing FSD layers")
    parser.add_argument("--output", default="fsd_boundaries.json", help="Output JSON file path")
    args = parser.parse_args()

    # Default FSD layers
    layers = ["shared", "entities", "features", "widgets", "pages", "app", "composers"]

    # Collect layer paths
    layer_paths = collect_layer_paths(args.base_dir, layers)

    # Define allowed access between layers according to FSD principles
    allowed_access = {
        "shared": [],
        "entities": ["shared", "entities", "composers"],
        "features": ["shared", "entities", "features", "composers"],
        "widgets": ["shared", "entities", "features", "widgets", "composers"],
        "pages": ["shared", "entities", "features", "widgets", "pages"],
        "app": ["shared", "entities", "features", "widgets", "pages", "app"],
        "composers": ["shared"]
    }

    # Generate boundary rules
    rules = generate_boundary_rules(layers, allowed_access)

    # Create complete output
    output = {
        "layers": layer_paths,
        "rules": rules,
        "allowed_access": allowed_access
    }

    # Write to file
    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2)

    print(f"FSD boundary rules generated at {args.output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
