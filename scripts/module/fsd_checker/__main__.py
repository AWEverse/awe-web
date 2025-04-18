# ------ fsd_checker/__main__.py ------
#!/usr/bin/env python
"""
Command-line interface for the FSD Architecture Checker.

This module provides a unified CLI for all FSD architecture checking functionality.
"""

import argparse
import sys
from typing import List

def main(args: List[str] = None) -> int:
    """Main CLI entry point for the FSD Checker."""
    parser = argparse.ArgumentParser(
        description="FSD Architecture Checker - Validate Feature-Sliced Design compliance"
    )

    subparsers = parser.add_subparsers(dest='command', help='Command to run')

    # Check command
    check_parser = subparsers.add_parser('check', help='Check FSD architecture compliance')
    check_parser.add_argument("--base-dir", default="src", help="Base directory containing FSD layers")
    check_parser.add_argument("--json-output", default="fsd_report.json", help="JSON report output path")
    check_parser.add_argument("--md-output", default="fsd_report.md", help="Markdown report output path")
    check_parser.add_argument("--quiet", action="store_true", help="Suppress console output")

    # Generate command
    gen_parser = subparsers.add_parser('generate', help='Generate FSD boundary rules')
    gen_parser.add_argument("--base-dir", default="src", help="Base directory containing FSD layers")
    gen_parser.add_argument("--output", default="fsd_boundaries.json", help="Output JSON file path")

    # Process command
    process_parser = subparsers.add_parser('process', help='Process and analyze FSD reports')
    process_parser.add_argument("input_file", help="Input JSON report file")
    process_parser.add_argument("--output-json", help="Filtered JSON report output path")
    process_parser.add_argument("--output-md", help="Markdown report output path")
    process_parser.add_argument("--from-layers", nargs="+", help="Filter violations from these layers")
    process_parser.add_argument("--to-layers", nargs="+", help="Filter violations to these layers")
    process_parser.add_argument("--summary", action="store_true", help="Print report summary")

    args = parser.parse_args(args)

    if args.command == 'check':
        from fsd_checker.scripts.moderators.moderate_fsd import main as check_main
        return check_main([
            "--base-dir", args.base_dir,
            "--json-output", args.json_output,
            "--md-output", args.md_output,
            *(["--quiet"] if args.quiet else [])
        ])

    elif args.command == 'generate':
        from fsd_checker.scripts.generate_boundaries import main as gen_main
        return gen_main([
            "--base-dir", args.base_dir,
            "--output", args.output
        ])

    elif args.command == 'process':
        from fsd_checker.scripts.moderators.moderate_fsd_report import main as process_main
        cmd_args = [args.input_file]
        if args.output_json:
            cmd_args.extend(["--output-json", args.output_json])
        if args.output_md:
            cmd_args.extend(["--output-md", args.output_md])
        if args.from_layers:
            cmd_args.extend(["--from-layers"] + args.from_layers)
        if args.to_layers:
            cmd_args.extend(["--to-layers"] + args.to_layers)
        if args.summary:
            cmd_args.append("--summary")
        return process_main(cmd_args)

    else:
        parser.print_help()
        return 1


if __name__ == "__main__":
    sys.exit(main())
