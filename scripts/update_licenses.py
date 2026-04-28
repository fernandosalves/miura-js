import os
import json

for parent in ['packages', 'apps']:
    parent_dir = os.path.join(os.getcwd(), parent)
    if not os.path.exists(parent_dir):
        continue
    for pkg in os.listdir(parent_dir):
        pkg_path = os.path.join(parent_dir, pkg)
        if os.path.isdir(pkg_path):
            json_path = os.path.join(pkg_path, 'package.json')
            if os.path.exists(json_path):
                with open(json_path, 'r') as f:
                    try:
                        data = json.load(f)
                    except Exception as e:
                        print(f"Error loading {json_path}: {e}")
                        continue
                
                data['license'] = 'MIT'
                
                with open(json_path, 'w') as f:
                    json.dump(data, f, indent=4)
                    f.write('\n')
                print(f"Updated {json_path}")
            else:
                print(f"No package.json in {pkg_path}")
