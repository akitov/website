#!/usr/bin/env python3
"""Trim Phosphor's official web fonts to the icons in scripts/vendor/phosphor/icons.json.

Writes assets/fonts/phosphor-<style>.woff2 (fill, regular, light). The glyphs
are Phosphor's, unchanged; only unused glyphs are dropped (the full fonts are
130-155 KB each). Icons are font glyphs, not inline SVG, because Chrome on
macOS draws SVG with 4x MSAA (stepped edges) while glyphs get the text's
antialiasing.

Run after adding an icon to icons.json (needs fonttools and brotli):
    npm pack @phosphor-icons/web@2.1.2 && tar xzf phosphor-icons-web-2.1.2.tgz
    python3 -m venv /tmp/iv && /tmp/iv/bin/pip install fonttools brotli
    /tmp/iv/bin/python scripts/subset-icons.py package/src
"""
import json
import os
import sys

from fontTools import subset

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = {'fill': 'fill/Phosphor-Fill.woff2', 'regular': 'regular/Phosphor.woff2', 'light': 'light/Phosphor-Light.woff2'}


def main(src):
    icons = json.load(open(os.path.join(ROOT, 'scripts', 'vendor', 'phosphor', 'icons.json')))
    for style, rel in FONTS.items():
        cps = sorted({int(v['codepoint'], 16) for k, v in icons.items() if not k.startswith('_') and v['style'] == style})
        if not cps:
            continue
        out = os.path.join(ROOT, 'assets', 'fonts', f'phosphor-{style}.woff2')
        opts = subset.Options()
        opts.flavor = 'woff2'
        opts.layout_features = []
        opts.name_IDs = ['*']  # keep the copyright / license names
        opts.notdef_outline = True
        font = subset.load_font(os.path.join(src, rel), opts)
        s = subset.Subsetter(opts)
        s.populate(unicodes=cps)
        s.subset(font)
        subset.save_font(font, out, opts)
        print(f'{style}: {len(cps)} icons -> {os.path.relpath(out, ROOT)} ({os.path.getsize(out)} bytes)')


if __name__ == '__main__':
    main(sys.argv[1])
