"""
Core functionality for the FSD Architecture Checker.
"""

import os
import re
from typing import Dict, List, Tuple, Optional, Any


class FSDChecker:
    """
    Feature-Sliced Design architecture checker that validates project structure
    and import dependencies against FSD principles.
    """

    # Default FSD layers
    DEFAULT_LAYERS = ["shared", "entities", "features", "widgets", "pages", "app", "composers"]

    # Default allowed access between layers
    DEFAULT_ALLOWED_ACCESS = {
        "shared": [],
        "entities": ["shared", "entities", "composers"],
        "features": ["shared", "entities", "features", "composers"],
        "widgets": ["shared", "entities", "features", "widgets", "composers"],
        "pages": ["shared", "entities", "features", "widgets", "pages"],
        "app": ["shared", "entities", "features", "widgets", "pages", "app"],
        "composers": ["shared"]  # Composers can only access shared
    }

    def __init__(self,
                 base_dir: str = "src",
                 layers: Optional[List[str]] = None,
                 allowed_access: Optional[Dict[str, List[str]]] = None):
        """
        Initialize the FSD checker.

        Args:
            base_dir: Root directory to start scanning from
            layers: List of FSD layers to check (defaults to DEFAULT_LAYERS)
            allowed_access: Dict of allowed dependencies (defaults to DEFAULT_ALLOWED_ACCESS)
        """
        self.base_dir = base_dir
        self.layers = layers or self.DEFAULT_LAYERS
        self.allowed_access = allowed_access or self.DEFAULT_ALLOWED_ACCESS

        self.layer_modules: Dict[str, List[str]] = {layer: [] for layer in self.layers}
        self.import_violations: List[Dict[str, Any]] = []
        self.directory_violations: List[Dict[str, Any]] = []
        self.missing_layers: List[str] = []

        # Scan project structure immediately
        self.collect_layers_structure()

    def collect_layers_structure(self) -> None:
        """Scan project directory to map layer structure"""
        for layer in self.layers:
            layer_dir = os.path.join(self.base_dir, layer)
            if os.path.isdir(layer_dir):
                for sub in os.listdir(layer_dir):
                    sub_path = os.path.join(layer_dir, sub)
                    if os.path.isdir(sub_path):
                        self.layer_modules[layer].append(sub)
            else:
                self.missing_layers.append(layer)

    def check_directory_structure(self) -> None:
        """Verify directory structure follows FSD principles"""
        # Check for files at the root level of each layer (should be in a slice)
        for layer in self.layers:
            if layer in self.missing_layers:
                continue

            layer_dir = os.path.join(self.base_dir, layer)
            for item in os.listdir(layer_dir):
                item_path = os.path.join(layer_dir, item)
                if os.path.isfile(item_path) and not item.startswith('.') and not item == "index.ts":
                    self.directory_violations.append({
                        "type": "root_level_file",
                        "layer": layer,
                        "file": item_path,
                        "message": f"File should be within a slice, not at layer root"
                    })

    def _get_layer_from_path(self, file_path: str) -> Optional[str]:
        """Extract layer from file path"""
        path_parts = file_path.split(os.sep)
        for i, part in enumerate(path_parts):
            if part in self.layers and i < len(path_parts) - 1:
                return part
        return None

    def _get_layer_and_slice_from_import(self, import_path: str, current_layer: str) -> Tuple[Optional[str], Optional[str]]:
        """Parse import path to identify layer and slice"""
        if import_path.startswith('@') or import_path.startswith('src/'):
            # Handle absolute paths
            path_parts = import_path.replace('@/', '').replace('src/', '').split('/')
        else:
            # Handle relative paths - needs current file context
            return None, None  # Handled separately

        if len(path_parts) >= 2 and path_parts[0] in self.layers:
            return path_parts[0], path_parts[1]
        return None, None

    def analyze_imports(self) -> None:
        """Scan project files for imports and check against rules"""
        for layer in self.layers:
            if layer in self.missing_layers:
                continue

            layer_dir = os.path.join(self.base_dir, layer)
            self._scan_directory_for_imports(layer_dir, layer)

    def _scan_directory_for_imports(self, directory: str, layer: str) -> None:
        """Recursively scan directories for import violations"""
        for root, _, files in os.walk(directory):
            for file in files:
                if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                    file_path = os.path.join(root, file)
                    self._check_file_imports(file_path, layer)

    def _check_file_imports(self, file_path: str, layer: str) -> None:
        """Check imports in a file against FSD rules"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Extract imports
            import_patterns = [
                r'import\s+.*\s+from\s+[\'"](.+?)[\'"]',  # import X from 'path'
                r'import\s+[\'"](.+?)[\'"]',              # import 'path'
                r'require\s*\(\s*[\'"](.+?)[\'"]'         # require('path')
            ]

            all_imports = []
            for pattern in import_patterns:
                all_imports.extend(re.findall(pattern, content))

            # Filter out node_modules and relative imports within same directory
            project_imports = [imp for imp in all_imports if not (
                imp.startswith('.') and '/' not in imp and '\\' not in imp or
                not (imp.startswith('.') or imp.startswith('@') or imp.startswith('src/'))
            )]

            # Check each import against rules
            for import_path in project_imports:
                if import_path.startswith('.'):
                    # Handle relative imports
                    resolved_path = self._resolve_relative_import(file_path, import_path)
                    if resolved_path:
                        target_layer = self._get_layer_from_path(resolved_path)
                        if target_layer and target_layer not in self.allowed_access.get(layer, []):
                            self.import_violations.append({
                                "file": file_path,
                                "import": import_path,
                                "from_layer": layer,
                                "to_layer": target_layer,
                                "message": f"Layer '{layer}' cannot import from '{target_layer}'"
                            })
                else:
                    # Handle absolute imports
                    target_layer, _ = self._get_layer_and_slice_from_import(import_path, layer)
                    if target_layer and target_layer not in self.allowed_access.get(layer, []):
                        self.import_violations.append({
                            "file": file_path,
                            "import": import_path,
                            "from_layer": layer,
                            "to_layer": target_layer,
                            "message": f"Layer '{layer}' cannot import from '{target_layer}'"
                        })
        except Exception as e:
            print(f"Error processing file {file_path}: {e}")

    def _resolve_relative_import(self, file_path: str, relative_import: str) -> Optional[str]:
        """Resolve relative import to absolute path"""
        try:
            dir_path = os.path.dirname(file_path)
            if relative_import.startswith('./'):
                relative_import = relative_import[2:]
            elif relative_import.startswith('../'):
                parts = relative_import.split('/')
                up_count = 0
                for part in parts:
                    if part == '..':
                        up_count += 1
                    else:
                        break

                current_dir = dir_path
                for _ in range(up_count):
                    current_dir = os.path.dirname(current_dir)

                relative_part = '/'.join(parts[up_count:])
                return os.path.normpath(os.path.join(current_dir, relative_part))

            return os.path.normpath(os.path.join(dir_path, relative_import))
        except Exception:
            return None

    def generate_report(self) -> Dict[str, Any]:
        """Generate a comprehensive report of FSD violations"""
        return {
            "structure": {
                "layers": {layer: modules for layer, modules in self.layer_modules.items()},
                "missing_layers": self.missing_layers,
                "directory_violations": self.directory_violations
            },
            "imports": {
                "violations": self.import_violations,
                "total": len(self.import_violations)
            },
            "rules": {
                "allowed_access": self.allowed_access
            }
        }

    def run_checks(self) -> Dict[str, Any]:
        """Run all checks and generate report"""
        self.check_directory_structure()
        self.analyze_imports()
        return self.generate_report()
