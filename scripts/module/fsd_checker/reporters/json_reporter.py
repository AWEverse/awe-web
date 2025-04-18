# ------ fsd_checker/reporters/json_reporter.py ------
"""
JSON reporter for FSD Architecture Checker.
"""

import json
from typing import Dict, Any

def export_report_to_json(report: Dict[str, Any], output_file: str = "fsd_report.json") -> None:
    """Export report to JSON file"""
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)
    print(f"\nReport exported to {output_file}")
