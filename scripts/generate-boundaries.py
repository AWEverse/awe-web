import os
import json

# Конфигурация слоёв FSD
layers = ["shared", "entities", "features", "widgets", "pages", "app", "composers"]
layer_paths = { layer: [] for layer in layers }

# Рекурсивно ищем директории первого уровня внутри каждого слоя
base_dir = "src"
for layer in layers:
  layer_dir = os.path.join(base_dir, layer)
if os.path.isdir(layer_dir):
  for sub in os.listdir(layer_dir):
    sub_path = os.path.join(layer_dir, sub)
if os.path.isdir(sub_path):
  layer_paths[layer].append(sub)

# Правила доступа между слоями в соответствии с FSD
allowed_access = {
  "shared": [],
  "entities": ["shared", "entities", "composers"],
  "features": ["shared", "entities", "features", "composers"],
  "widgets": ["shared", "entities", "features", "widgets", "composers"],
  "pages": ["shared", "entities", "features", "widgets", "pages"],
  "app": ["shared", "entities", "features", "widgets", "pages", "app"],
}

# Генерация правил boundaries
rules = []
for from_layer in layers:
  allow = allowed_access.get(from_layer, [])
disallow = [l for l in layers if l not in allow]
if allow:
  rules.append({ "from": from_layer, "allow": allow })
if disallow:
  rules.append({ "from": from_layer, "disallow": disallow })

rules
