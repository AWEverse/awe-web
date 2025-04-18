# ------ fsd_checker/scripts/moderators/moderate_fsd.py ------
#!/usr/bin/env python
"""
Script to check FSD architecture compliance of a project.

This script runs the FSD Checker on a project directory and produces
console, JSON, and markdown reports of any violations.
"""

import argparse
import sys
from fsd_checker.core import FSDChecker
from fsd_checker.reporters import print_report, export_report_to_json, generate_markdown_report


def main():
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(description="Check FSD architecture compliance")
    parser.add_argument("--base-dir", default="src", help="Base directory containing FSD layers")
    parser.add_argument("--json-output", default="fsd_report.json", help="JSON report output path")
    parser.add_argument("--md-output", default="fsd_report.md", help="Markdown report output path")
    parser.add_argument("--quiet", action="store_true", help="Suppress console output")
    args = parser.parse_args()

    print(f"\nRunning FSD Architecture Check on {args.base_dir}")

    # Initialize and run the FSD checker
    checker = FSDChecker(args.base_dir)
    report = checker.run_checks()

    # Generate reports
    if not args.quiet:
        print_report(report)

    export_report_to_json(report, args.json_output)
    generate_markdown_report(report, args.md_output)

    # Return exit code based on violations
    has_violations = (
        report["imports"]["total"] > 0 or
        len(report["structure"]["directory_violations"]) > 0
    )

    return 1 if has_violations else 0


if __name__ == "__main__":
    sys.exit(main())
