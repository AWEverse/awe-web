# ------ fsd_checker/reporters/console.py ------
"""
Console reporter for FSD Architecture Checker.
"""

from typing import Dict, Any

def print_report(report: Dict[str, Any]) -> None:
    """Print formatted report to console"""
    print("\n=== FSD Architecture Check Report ===\n")

    print("📁 Project Structure:")
    layers = report["rules"]["allowed_access"].keys()
    for layer in layers:
        if layer in report["structure"]["missing_layers"]:
            print(f"  ❌ {layer} (missing)")
        else:
            print(f"  ✅ {layer} ({len(report['structure']['layers'][layer])} slices)")

    print("\n🔍 Import Violations:")
    if not report["imports"]["violations"]:
        print("  ✅ No import violations found")
    else:
        print(f"  ❌ Found {report['imports']['total']} violations:")
        for i, violation in enumerate(report["imports"]["violations"][:10], 1):
            print(f"  {i}. {violation['file']}")
            print(f"     ↳ Imports from: {violation['import']}")
            print(f"     ↳ Error: {violation['message']}")

        if len(report["imports"]["violations"]) > 10:
            print(f"     ... and {len(report['imports']['violations']) - 10} more violations")

    print("\n📊 Directory Structure Issues:")
    if not report["structure"]["directory_violations"]:
        print("  ✅ No directory structure issues found")
    else:
        print(f"  ❌ Found {len(report['structure']['directory_violations'])} issues:")
        for i, violation in enumerate(report["structure"]["directory_violations"][:10], 1):
            print(f"  {i}. {violation['file']}")
            print(f"     ↳ Error: {violation['message']}")

    print("\n=== End of Report ===")
