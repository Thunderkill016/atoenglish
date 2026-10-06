"""Rebuild the research bundle from pinned commits without executing project code."""
import concurrent.futures
import csv
import hashlib
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess
import time
import zipfile

BASE = Path.cwd() / "ejoy-nghien-cuu-toan-bo"
ROOT = BASE / "github-research"
TAG = "research-ejoy-2026-10-06"
REPO = "Thunderkill016/atoenglish"
OUTPUT = Path.cwd() / "ejoy-nghien-cuu-toan-bo-2026-10-06.zip"


def run(args, **kwargs):
    return subprocess.run(args, check=True, **kwargs)


def restore(repo, commit, folder):
    dest = ROOT / folder / repo.replace("/", "__")
    dest.mkdir(parents=True)
    run(["git", "init", "--quiet", str(dest)])
    run(["git", "-C", str(dest), "remote", "add", "origin", f"https://github.com/{repo}.git"])
    for attempt in range(3):
        try:
            run(["git", "-C", str(dest), "fetch", "--quiet", "--depth=1", "origin", commit], timeout=900)
            break
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
            if attempt == 2:
                raise
            time.sleep(3)
    run(["git", "-C", str(dest), "-c", "core.autocrlf=false", "checkout", "--quiet", "--detach", "FETCH_HEAD"], timeout=120)
    actual = subprocess.check_output(["git", "-C", str(dest), "rev-parse", "HEAD"], text=True).strip()
    if actual != commit:
        raise RuntimeError(f"Commit mismatch: {repo}")
    print(json.dumps({"restored": repo, "commit": actual}), flush=True)


def verify_inventory(csv_file, folder):
    count = 0
    total = 0
    with csv_file.open(newline="") as f:
        for row in csv.DictReader(f):
            if not row["sha256"]:
                continue
            p = ROOT / folder / row["repo"].replace("/", "__") / row["path"]
            digest = hashlib.sha256()
            size = 0
            if p.is_symlink():
                data = os.fsencode(os.readlink(p))
                digest.update(data)
                size = len(data)
            else:
                with p.open("rb") as source:
                    while chunk := source.read(1024 * 1024):
                        digest.update(chunk)
                        size += len(chunk)
            if digest.hexdigest() != row["sha256"] or size != int(row["bytes"]):
                raise RuntimeError(f"Source content differs from recorded research: {p}")
            count += 1
            total += size
    return {"verified_blobs": count, "verified_bytes": total}


def package(include_git=True):
    entries = []
    for current, dirs, files in os.walk(BASE, followlinks=False):
        cur = Path(current)
        if not include_git:
            dirs[:] = [d for d in dirs if d != ".git"]
        for d in list(dirs):
            p = cur / d
            if p.is_symlink():
                dirs.remove(d)
                entries.append(p)
        entries.extend(cur / fn for fn in files)
    manifest = []
    last = time.monotonic()
    stored_suffixes = {".pack", ".zip", ".gz", ".xz", ".zst", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".mp3", ".mp4", ".mkv", ".ogg", ".woff", ".woff2"}
    with zipfile.ZipFile(OUTPUT, "w", zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=True) as z:
        for index, p in enumerate(sorted(entries), 1):
            name = p.relative_to(BASE.parent).as_posix()
            if p.is_symlink():
                data = os.fsencode(os.readlink(p))
                info = zipfile.ZipInfo(name)
                info.create_system = 3
                info.external_attr = (stat.S_IFLNK | 0o777) << 16
                z.writestr(info, data, compress_type=zipfile.ZIP_STORED)
                manifest.append({"path": name, "type": "symlink", "target": os.readlink(p), "bytes": len(data)})
            else:
                z.write(p, name, compress_type=zipfile.ZIP_STORED if p.suffix.lower() in stored_suffixes else zipfile.ZIP_DEFLATED)
                manifest.append({"path": name, "type": "file", "bytes": p.stat().st_size})
            if time.monotonic() - last > 20:
                print(json.dumps({"packaged": index, "total": len(entries), "bytes": OUTPUT.stat().st_size}), flush=True)
                last = time.monotonic()
        z.writestr("ejoy-nghien-cuu-toan-bo/PACKAGE-MANIFEST.json", json.dumps({"rebuilt_on": "GitHub Actions", "includes_git_metadata": include_git, "entries": manifest}, ensure_ascii=False))
    return len(entries)


BASE.mkdir()
support = Path("research/ejoy-2026-10-06/research-support.zip")
if not support.exists():
    parts = sorted(Path("research/ejoy-2026-10-06").glob("research-support.zip.part-*"))
    if not parts:
        raise RuntimeError("Missing research support archive")
    support = Path("research-support.zip")
    with support.open("wb") as target:
        for part in parts:
            with part.open("rb") as source:
                shutil.copyfileobj(source, target)
with zipfile.ZipFile(support) as z:
    for item in z.infolist():
        rel = Path(item.filename)
        if rel.is_absolute() or ".." in rel.parts:
            raise RuntimeError("Unsafe support archive path")
    z.extractall(BASE)
primary = json.loads((ROOT / "analysis/repo-catalog.json").read_text())
external = json.loads((ROOT / "external-download-run.json").read_text())["downloads"]
jobs = [(r["repo"], r["commit"], "repos") for r in primary]
jobs += [(r["repo"], r["commit"], "external-repos") for r in external]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    futures = [pool.submit(restore, *job) for job in jobs]
    for future in concurrent.futures.as_completed(futures):
        future.result()
verification = {
    "primary": verify_inventory(ROOT / "analysis/all-files.csv", "repos"),
    "external": verify_inventory(ROOT / "analysis/external-files.csv", "external-repos"),
    "method": "Each source blob checked against the SHA256 and length recorded during research",
}
print(json.dumps(verification), flush=True)
(ROOT / "analysis/github-rebuild-verification.json").write_text(json.dumps(verification, indent=2))
file_count = package()
include_git = True
if OUTPUT.stat().st_size >= 2 * 1024**3:
    include_git = False
    file_count = package(include_git=False)
with zipfile.ZipFile(OUTPUT) as z:
    bad = z.testzip()
    if bad:
        raise RuntimeError(f"ZIP CRC failure: {bad}")
digest = hashlib.sha256()
with OUTPUT.open("rb") as f:
    while chunk := f.read(4 * 1024 * 1024):
        digest.update(chunk)
summary = {"bytes": OUTPUT.stat().st_size, "sha256": digest.hexdigest(), "files": file_count, "crc": "passed", "includes_git_metadata": include_git, **verification}
print(json.dumps(summary), flush=True)
checksum = OUTPUT.with_suffix(".zip.sha256")
checksum.write_text(digest.hexdigest() + "  " + OUTPUT.name + "\n")
git_note = "Kèm metadata .git của các snapshot dựng lại." if include_git else "Bỏ metadata .git để đáp ứng giới hạn 2 GiB/tệp của GitHub; toàn bộ file nguồn đã theo dõi vẫn đầy đủ."
notes = Path("research-release-notes.md")
notes.write_text(f"""Bộ nghiên cứu eJOY, Trancy và các sản phẩm/công cụ tương tự, ngày 06/10/2026.

- 39 snapshot repo chính và 5 snapshot submodule, ghim đúng commit đã nghiên cứu.
- Toàn bộ 28.017 blob nguồn được kiểm lại SHA256 và kích thước với inventory ban đầu.
- Kèm báo cáo eJOY/Trancy, danh mục repo, nguồn tham khảo, manifest, chỉ mục file, reading packets và script nghiên cứu.
- ZIP được đóng gói lại trên GitHub Actions từ đúng snapshot; metadata Git và byte ZIP có thể khác bản tạo trong workspace. {git_note}
- Chỉ 30 file được đọc đầy đủ ngữ nghĩa, 26 file đọc một phần; đọc byte và lập chỉ mục tự động không đồng nghĩa đã hiểu hết mọi file. Không khẳng định bao phủ tất cả sản phẩm/repo trên thị trường.

Kích thước ZIP: {summary['bytes']:,} byte.
SHA256: `{summary['sha256']}`.
Kiểm tra CRC ZIP: đạt.

Đây là prerelease tài liệu nghiên cứu. Commit ứng dụng được tham chiếu: `a0043069938c841a9bfa406a4c963da521e65ba8`.
""")
run(["gh", "release", "upload", TAG, str(OUTPUT), str(checksum), "--repo", REPO, "--clobber"], timeout=1800)
assets = json.loads(subprocess.check_output(["gh", "api", f"repos/{REPO}/releases/404303586/assets"], text=True))
asset = next(a for a in assets if a["name"] == OUTPUT.name)
if asset["size"] != summary["bytes"] or asset["state"] != "uploaded":
    raise RuntimeError("GitHub asset size/state verification failed")
if asset.get("digest") and asset["digest"] != "sha256:" + summary["sha256"]:
    raise RuntimeError("GitHub asset digest verification failed")
run(["gh", "release", "edit", TAG, "--repo", REPO, "--draft=false", "--prerelease", "--latest=false", "--notes-file", str(notes)])
print(json.dumps({"published": asset["browser_download_url"], "size": asset["size"], "digest": asset.get("digest")}), flush=True)
