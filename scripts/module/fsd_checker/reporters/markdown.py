# ------ fsd_checker/reporters/markdown.py ------
"""
Markdown reporter for FSD Architecture Checker.
"""

import os
import datetime
from typing import Dict, Any

def generate_markdown_report(report: Dict[str, Any], output_file: str = "fsd_report.md") -> None:
    """Generate a markdown report of FSD architecture check results"""
    with open(output_file, 'w', encoding='utf-8') as md_file:
        # Header
        md_file.write("# FSD Architecture Check Report\n\n")
        md_file.write(f"*Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n\n")

        # Project structure overview
        md_file.write("## 📁 Project Structure\n\n")

        # Layer status table
        md_file.write("| Layer | Status | Slices |\n")
        md_file.write("|-------|--------|--------|\n")

        layers = list(report["rules"]["allowed_access"].keys())
        for layer in layers:
            if layer in report["structure"]["missing_layers"]:
                md_file.write(f"| `{layer}` | ❌ Missing | - |\n")
            else:
                slice_count = len(report["structure"]["layers"][layer])
                md_file.write(f"| `{layer}` | ✅ Present | {slice_count} |\n")

        md_file.write("\n")

        # Detailed structure
        md_file.write("### Layer Contents\n\n")
        for layer in layers:
            if layer not in report["structure"]["missing_layers"]:
                slices = report["structure"]["layers"][layer]
                md_file.write(f"<details>\n<summary><b>{layer}</b> ({len(slices)} slices)</summary>\n\n")

                if slices:
                    md_file.write("```\n")
                    for slice_name in sorted(slices):
                        md_file.write(f"└── {slice_name}\n")
                    md_file.write("```\n")
                else:
                    md_file.write("*No slices found in this layer*\n")

                md_file.write("</details>\n\n")

        # Dependency Rules
        md_file.write("## 📏 Dependency Rules\n\n")
        md_file.write("| Layer | Can Import From |\n")
        md_file.write("|-------|----------------|\n")

        for layer, allowed in report["rules"]["allowed_access"].items():
            allowed_str = ", ".join([f"`{l}`" for l in allowed]) if allowed else "*none*"
            md_file.write(f"| `{layer}` | {allowed_str} |\n")

        # Import Violations
        md_file.write("\n## 🔍 Import Violations\n\n")

        violations = report["imports"]["violations"]
        if not violations:
            md_file.write("✅ **No import violations found**\n\n")
        else:
            md_file.write(f"❌ **Found {len(violations)} violations**\n\n")

            # Group violations by from_layer -> to_layer
            violation_groups = {}
            for v in violations:
                key = f"{v['from_layer']} → {v['to_layer']}"
                if key not in violation_groups:
                    violation_groups[key] = []
                violation_groups[key].append(v)

            # List violation groups
            md_file.write("### Violation Summary\n\n")
            md_file.write("| From Layer | To Layer | Count |\n")
            md_file.write("|------------|----------|-------|\n")

            for group_key, group_violations in sorted(violation_groups.items()):
                from_layer, to_layer = group_key.split(" → ")
                md_file.write(f"| `{from_layer}` | `{to_layer}` | {len(group_violations)} |\n")

            # Detailed violations
            md_file.write("\n### Detailed Violations\n\n")

            for group_key, group_violations in sorted(violation_groups.items()):
                from_layer, to_layer = group_key.split(" → ")

                md_file.write(f"<details>\n<summary><b>{from_layer} → {to_layer}</b> ({len(group_violations)} violations)</summary>\n\n")

                for i, v in enumerate(group_violations[:20], 1):
                    file_path = v['file'].replace(os.path.join(os.getcwd(), ''), '')
                    md_file.write(f"**{i}.** `{file_path}`\n")
                    md_file.write(f"   - Imports: `{v['import']}`\n")
                    md_file.write(f"   - Error: {v['message']}\n\n")

                if len(group_violations) > 20:
                    md_file.write(f"*...and {len(group_violations) - 20} more violations*\n\n")

                md_file.write("</details>\n\n")

        # Directory Structure Issues
        md_file.write("## 📊 Directory Structure Issues\n\n")

        dir_violations = report["structure"]["directory_violations"]
        if not dir_violations:
            md_file.write("✅ **No directory structure issues found**\n\n")
        else:
            md_file.write(f"❌ **Found {len(dir_violations)} issues**\n\n")

            md_file.write("<details>\n<summary>Directory Structure Issues</summary>\n\n")

            for i, v in enumerate(dir_violations[:20], 1):
                file_path = v['file'].replace(os.path.join(os.getcwd(), ''), '')
                md_file.write(f"**{i}.** `{file_path}`\n")
                md_file.write(f"   - Error: {v['message']}\n\n")

            if len(dir_violations) > 20:
                md_file.write(f"*...and {len(dir_violations) - 20} more issues*\n\n")

            md_file.write("</details>\n\n")

        # Conclusion
        total_issues = len(violations) + len(dir_violations)
        if total_issues == 0:
            md_file.write("## ✅ Conclusion\n\n")
            md_file.write("Your project successfully follows the FSD architecture principles. Great job! 🎉\n")
        else:
            md_file.write("## ⚠️ Conclusion\n\n")
            md_file.write(f"Found **{total_issues}** issues that need to be addressed.\n\n")
            md_file.write("### Recommendations\n\n")

            if violations:
                md_file.write("1. **Fix import violations** - Ensure imports follow the allowed layer dependencies\n")
            if dir_violations:
                md_file.write(f"{'2' if violations else '1'}. **Fix directory structure** - Organize files according to FSD principles\n")

    print(f"\nMarkdown report exported to {output_file}")
