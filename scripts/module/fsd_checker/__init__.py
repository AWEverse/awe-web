# Directory structure:
# fsd_checker/
# ├── __init__.py
# ├── core.py
# ├── reporters/
# │   ├── __init__.py
# │   ├── console.py
# │   ├── json_reporter.py
# │   └── markdown.py
# └── scripts/
#     ├── __init__.py
#     ├── generate_boundaries.py
#     └── moderators/
#         ├── __init__.py
#         ├── moderate_fsd_report.py
#         └── moderate_fsd.py

# ------ fsd_checker/__init__.py ------
"""
FSD Architecture Checker - A tool to validate Feature-Sliced Design architecture compliance.

This package provides tools to analyze and validate FSD architecture in projects.
"""

__version__ = '1.0.0'

from .core import FSDChecker
