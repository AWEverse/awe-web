
# FSD Architecture Checker

A comprehensive tool for validating Feature-Sliced Design (FSD) architecture compliance in your projects.

## Installation

```bash
# Install from source
git clone https://github.com/yourusername/fsd-checker.git
cd fsd-checker
pip install -e .

# Or directly from PyPI (once published)
pip install fsd-checker
```

## Features

- 📊 **Architecture Validation**: Analyze project structure against FSD principles
- 🔍 **Dependency Checking**: Detect illegal imports between layers
- 📝 **Comprehensive Reports**: Generate console, JSON, and markdown reports
- ⚙️ **Customizable Rules**: Define your own layer structure and dependency rules

## Usage

### Basic Usage

```bash
# Check FSD compliance
fsd-checker check --base-dir src

# Generate FSD boundary rules
fsd-checker generate --base-dir src --output fsd_boundaries.json

# Process and filter existing reports
fsd-checker process fsd_report.json --summary
```

### Command: `check`

Analyze your project for FSD compliance.

```bash
fsd-checker check [options]

Options:
  --base-dir DIR       Base directory containing FSD layers (default: src)
  --json-output FILE   JSON report output path (default: fsd_report.json)
  --md-output FILE     Markdown report output path (default: fsd_report.md)
  --quiet              Suppress console output
```

### Command: `generate`

Generate FSD boundary rules configuration.

```bash
fsd-checker generate [options]

Options:
  --base-dir DIR       Base directory containing FSD layers (default: src)
  --output FILE        Output JSON file path (default: fsd_boundaries.json)
```

### Command: `process`

Process and analyze existing FSD reports.

```bash
fsd-checker process INPUT_FILE [options]

Arguments:
  INPUT_FILE           Input JSON report file

Options:
  --output-json FILE   Filtered JSON report output path
  --output-md FILE     Markdown report output path
  --from-layers LAYERS Filter violations from these layers
  --to-layers LAYERS   Filter violations to these layers
  --summary            Print report summary
```

## Examples

### Check project and generate reports

```bash
# Check FSD compliance and generate reports
fsd-checker check --base-dir src --json-output reports/fsd_report.json --md-output reports/fsd_report.md
```

### Filter violations from specific layers

```bash
# Only show violations from the 'widgets' layer accessing 'app' layer
fsd-checker process fsd_report.json --from-layers widgets --to-layers app --summary
```

### Generate visualization-friendly reports

```bash
# Generate a markdown report from an existing JSON report
fsd-checker process fsd_report.json --output-md report.md
```

## FSD Architecture Principles

Feature-Sliced Design organizes code into layers:

1. `shared` - Reusable code with no business logic
2. `entities` - Business entities (User, Product, etc.)
3. `features` - Business features and processes
4. `widgets` - Composite UI components
5. `pages` - Application pages/screens
6. `app` - Application initialization and setup
7. `composers` - Layer compositions and dependency injection

Each layer can only import from layers below it in the hierarchy. For example, `features` can import from `entities` and `shared`, but not from `widgets` or `pages`.

## License

MIT


## Project Structure Summary

Here's what we've created - a complete, well-organized Python module for checking FSD architecture compliance:

```
fsd_checker/
├── __init__.py          # Package initialization
├── __main__.py          # CLI entry point
├── core.py              # Core FSD checking logic
├── reporters/           # Report generation modules
│   ├── __init__.py
│   ├── console.py       # Console reporting
│   ├── json_reporter.py # JSON reporting
│   └── markdown.py      # Markdown reporting
└── scripts/             # Command-line tools
    ├── __init__.py
    ├── generate_boundaries.py  # Generate FSD boundary rules
    └── moderators/      # Moderation tools
        ├── __init__.py
        ├── moderate_fsd.py          # Check FSD compliance
        └── moderate_fsd_report.py   # Process FSD reports
```

Plus we've added:
- `setup.py` - For making the package installable
- `README.md` - With detailed usage instructions

## Key Benefits

1. **Modular Design**: Cleanly separated components with well-defined responsibilities
2. **Flexible Reporting**: Multiple report formats (console, JSON, markdown)
3. **Command-line Interface**: Easy to use from the command line or CI/CD pipelines
4. **Extensible**: Easy to add new features or reporting formats
5. **Well-documented**: Comprehensive README with examples and usage instructions

## Usage Examples

### Basic Check

```bash
# Check your project for FSD compliance
fsd-checker check --base-dir src
```

### Generate FSD Boundary Rules

```bash
# Generate boundary rules for your project
fsd-checker generate --base-dir src --output fsd_boundaries.json
```

### Process and Filter Reports

```bash
# Process an existing report and create a filtered markdown report
fsd-checker process fsd_report.json --from-layers widgets --output-md filtered_report.md
```
