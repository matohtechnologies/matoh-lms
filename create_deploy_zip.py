import os
import zipfile

EXCLUDE_DIRS = {
    "node_modules",
    ".next",
    ".git",
    ".gemini",
    ".vscode",
    "dist",
    "coverage",
    "releases",
}

EXCLUDE_EXTS = {
    ".zip",
    ".log",
    ".pyc",
}

EXCLUDE_FILES = {
    ".env",
    ".env.local",
    ".env.production",
}

def make_zip(output_filename="matoh-deploy.zip"):
    root_dir = os.path.abspath(".")
    print(f"Packaging {output_filename} from {root_dir}...")
    
    count = 0
    with zipfile.ZipFile(output_filename, "w", zipfile.ZIP_DEFLATED) as zf:
        for dirpath, dirnames, filenames in os.walk(root_dir):
            dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
            
            rel_dir = os.path.relpath(dirpath, root_dir)
            if rel_dir != ".":
                zinfo = zipfile.ZipInfo(rel_dir.replace("\\", "/") + "/")
                zinfo.create_system = 3  # UNIX
                zinfo.external_attr = (0o755 << 16) | 0x10  # rwxr-xr-x + directory bit
                zf.writestr(zinfo, "")

            for f in filenames:
                if f in EXCLUDE_FILES or f == "create_deploy_zip.py":
                    continue
                ext = os.path.splitext(f)[1].lower()
                if ext in EXCLUDE_EXTS:
                    continue
                
                full_path = os.path.join(dirpath, f)
                rel_path = os.path.relpath(full_path, root_dir).replace("\\", "/")
                
                with open(full_path, "rb") as fp:
                    data = fp.read()
                
                zinfo = zipfile.ZipInfo(rel_path)
                zinfo.create_system = 3  # UNIX
                zinfo.external_attr = 0o644 << 16
                zf.writestr(zinfo, data)
                count += 1

    file_size_mb = os.path.getsize(output_filename) / (1024 * 1024)
    print(f"Successfully packaged {output_filename} ({file_size_mb:.2f} MB, {count} files).")

if __name__ == "__main__":
    make_zip()
