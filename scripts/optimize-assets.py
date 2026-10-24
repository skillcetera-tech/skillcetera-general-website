    """Create delivery-sized WebP derivatives without changing original documentary assets."""
import json
import sys
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parent.parent
assets = root / "public" / "assets"

if len(sys.argv) >= 3:
    src_path = Path(sys.argv[1])
    dst_path = Path(sys.argv[2])
    max_dim = int(sys.argv[3]) if len(sys.argv) >= 4 else 2400
    quality = int(sys.argv[4]) if len(sys.argv) >= 5 else 92
    with Image.open(src_path) as original:
        orig_w, orig_h = original.size
        image = ImageOps.exif_transpose(original)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGB")
        image.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        dst_path.parent.mkdir(parents=True, exist_ok=True)
        image.save(dst_path, "WEBP", quality=quality, method=6)
    print(json.dumps({
        "width": orig_w,
        "height": orig_h,
        "originalBytes": src_path.stat().st_size,
        "webpBytes": dst_path.stat().st_size,
    }))
else:
    names = [
        "discussion-forum.png",
        "scavenger-hunt.png",
        "esc.png",
        "s-store.jpg",
        "meditation-retreat.jpg",
        "tedx.jpg",
        "moneyverse.png",
    ]
    for name in names:
        source = assets / name
        with Image.open(source) as original:
            image = ImageOps.exif_transpose(original).convert("RGB")
            image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
            destination = source.with_suffix(".webp")
            image.save(destination, "WEBP", quality=88, method=6)
            print(f"{name}: {source.stat().st_size:,} -> {destination.stat().st_size:,} bytes")
