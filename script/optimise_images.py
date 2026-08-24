#!/usr/bin/env python3
"""
PRADAKO — IMAGE OPTIMISATION
============================

WHY THIS EXISTS
---------------
The image tree is 50 MB across 203 PNGs, several over 1.4 MB each. On a 4G
connection in a customer's plant that is a slow, expensive page. WebP at
quality 82 typically cuts these by 75-85% with no visible difference on
product photography against a white background.

    python3 tools/optimise_images.py            # dry run, reports savings only
    python3 tools/optimise_images.py --write    # writes .webp alongside .png
    python3 tools/optimise_images.py --write --rewrite-html

WHAT --rewrite-html DOES
------------------------
Wraps every <img src="images/...png"> in a <picture> element:

    <picture>
      <source srcset="images/foo.webp" type="image/webp">
      <img src="images/foo.png" alt="...">
    </picture>

The original PNG stays as the fallback, so nothing breaks on a browser without
WebP support (in practice only very old Safari). Nothing is deleted — the PNGs
remain the source of truth and the print catalogue pipeline still uses them.

    >>> Run this before deploying. It is the single largest performance win
    >>> available on this section and it costs nothing in quality.
"""

import os
import re
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
IMAGES = os.path.join(ROOT, "images")

QUALITY = 82
EXTS = (".png", ".jpg", ".jpeg")


def human(n):
    return "%.1f MB" % (n / 1048576.0) if n > 1048576 else "%.0f KB" % (n / 1024.0)


def convert(write):
    before = after = 0
    converted = skipped = 0

    for folder, _dirs, files in os.walk(IMAGES):
        for name in files:
            if not name.lower().endswith(EXTS):
                continue

            src = os.path.join(folder, name)
            dst = os.path.splitext(src)[0] + ".webp"
            size = os.path.getsize(src)
            before += size

            if os.path.exists(dst) and not write:
                after += os.path.getsize(dst)
                skipped += 1
                continue

            try:
                img = Image.open(src)
                if img.mode in ("P", "LA"):
                    img = img.convert("RGBA")

                if write:
                    img.save(dst, "WEBP", quality=QUALITY, method=6)
                    after += os.path.getsize(dst)
                else:
                    # estimate without writing to disk
                    import io
                    buf = io.BytesIO()
                    img.save(buf, "WEBP", quality=QUALITY, method=4)
                    after += buf.tell()

                converted += 1
            except Exception as error:
                print("  SKIP %s (%s)" % (src, error))
                after += size

    print("%s %d images" % ("Converted" if write else "Would convert", converted))
    if skipped:
        print("Already had .webp: %d" % skipped)
    print("Before : %s" % human(before))
    print("After  : %s" % human(after))
    if before:
        print("Saving : %s  (%.0f%%)" % (human(before - after), 100.0 * (before - after) / before))


IMG_RE = re.compile(
    r'<img\b(?![^>]*\bdata-no-webp\b)([^>]*?)\bsrc="([^"]+\.(?:png|jpe?g))"([^>]*?)>',
    re.IGNORECASE)


def rewrite_html():
    """Wrap <img> in <picture> with a WebP source, keeping the original as fallback."""
    touched = 0
    wrapped = 0

    for folder, _dirs, files in os.walk(ROOT):
        if any(part in folder for part in ("/tools", "/images", "/.git")):
            continue

        for name in files:
            if not name.endswith(".html"):
                continue

            path = os.path.join(folder, name)
            with open(path, encoding="utf-8") as fh:
                html = fh.read()

            if "<picture>" in html:
                continue

            count = [0]

            def repl(match):
                pre, src, post = match.group(1), match.group(2), match.group(3)

                # resolve relative to this html file to confirm the webp exists
                candidate = os.path.normpath(
                    os.path.join(folder, os.path.splitext(src)[0] + ".webp"))
                if not os.path.exists(candidate):
                    return match.group(0)

                count[0] += 1
                webp = os.path.splitext(src)[0] + ".webp"
                return ('<picture><source srcset="%s" type="image/webp">'
                        '<img%ssrc="%s"%s></picture>' % (webp, pre, src, post))

            out = IMG_RE.sub(repl, html)

            if count[0]:
                with open(path, "w", encoding="utf-8") as fh:
                    fh.write(out)
                touched += 1
                wrapped += count[0]

    print("Rewrote %d <img> tags across %d HTML files" % (wrapped, touched))


if __name__ == "__main__":
    write = "--write" in sys.argv
    convert(write)

    if "--rewrite-html" in sys.argv:
        if not write:
            print("\n--rewrite-html requires --write (there would be no .webp to point at)")
            sys.exit(1)
        print()
        rewrite_html()
