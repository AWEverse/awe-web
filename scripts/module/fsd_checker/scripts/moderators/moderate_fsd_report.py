# ------ fsd_checker/scripts/moderators/moderate_fsd_report.py ------
#!/usr/bin/env python
"""
Script to process and filter FSD architecture reports.

This script takes an existing FSD report and can filter, analyze,
or transform it based on provided options.
"""

import argparse
import json
import sys
from typing import Dict, Any, List, Set

from fsd_checker.reporters import generate_markdown_report


def filter_violations_by_layers(report: Dict[str, Any],
                               from_layers: List[str] = None,
                               to_layers: List[str] = None) -> Dict[str, Any]:
    """
    Filter violations in the report by source and/or target layers.

    Args:
        report: Original FSD report
        from_layers: Only include violations from these layers
        to_layers: Only include violations to these layers

    Returns:
        Filtered report
    """
    if not from_layers and not to_layers:
        return report

    filtered_report = report.copy()
    filtered_violations = []

    for violation in report["imports"]["violations"]:
        include = True

        if from_layers and violation["from_layer"] not in from_layers:
            include = False

        if to_layers and violation["to_layer"] not in to_layers:
            include = False

        if include:
            filtered_violations.append(violation)

    filtered_report["imports"]["violations"] = filtered_violations
    filtered_report["imports"]["total"] = len(filtered_violations)

    return filtered_report


def summarize_report(report: Dict[str, Any]) -> None:
    """Print a concise summary of the report."""
    print("\n=== FSD Architecture Summary ===\n")

    # Layer statistics
    total_layers = len(report["rules"]["allowed_access"])
    missing_layers = len(report["structure"]["missing_layers"])

    print(f"Layers: {total_layers - missing_layers}/{total_layers} present")

    if report["structure"]["missing_layers"]:
        print(f"Missing layers: {', '.join(report['structure']['missing_layers'])}")

    # Violation statistics
    violation_count = report["imports"]["total"]
    directory_violations = len(report["structure"]["directory_violations"])

    if violation_count == 0 and directory_violations == 0:
        print("\n✅ No architectural violations found")
    else:
        print(f"\n❌ Found {violation_count} import violations and {directory_violations} directory issues")

        # Group import violations by layer pairs
        if violation_count > 0:
            layer_pairs = {}
            for v in report["imports"]["violations"]:
                key = f"{v['from_layer']} → {v['to_layer']}"
                layer_pairs[key] = layer_pairs.get(key, 0) + 1

            print("\nTop layer violations:")
            for pair, count in sorted(layer_pairs.items(), key=lambda x: x[1], reverse=True)[:5]:
                print(f"  {pair}: {count} violations")

def main():
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(description="Process and analyze FSD architecture reports")
    parser.add_argument("input_file", help="Input JSON report file")
    parser.add_argument("--output-json", help="Filtered JSON report output path")
    parser.add_argument("--output-md", help="Markdown report output path")
    parser.add_argument("--from-layers", nargs="+", help="Filter violations from these layers")
    parser.add_argument("--to-layers", nargs="+", help="Filter violations to these layers")
    parser.add_argument("--summary", action="store_true", help="Print report summary")
    args = parser.parse_args()

    # Load input report
    try:
        with open(args.input_file, 'r', encoding='utf-8') as f:
            report = json.load(f)
    except (json.JSONDecodeError, FileNotFoundError) as e:
        print(f"Error loading report: {e}")
        return 1

    # Apply filters if specified
    if args.from_layers or args.to_layers:
        report = filter_violations_by_layers(report, args.from_layers, args.to_layers)

    # Generate output if requested
    if args.output_json:
        with open(args.output_json, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2)
        print(f"Filtered report saved to {args.output_json}")

    if args.output_md:
        generate_markdown_report(report, args.output_md)
        print(f"Markdown report generated at {args.output_md}")

    # Print summary if requested
    if args.summary:
        summarize_report(report)

    # Return success code
    return 0


if __name__ == "__main__":
    sys.exit(main())
