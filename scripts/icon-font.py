#!/usr/bin/env python3
"""Build assets/fonts/icons.woff2 from the Lucide SVGs in scripts/vendor/lucide/.

Why a font: Chrome on macOS rasterizes SVG shapes on the GPU with 4x MSAA, so
curved icon edges get only 3 antialiasing shades and look stepped next to
text. Font glyphs go through the glyph cache and get the same antialiasing
as the text around them.

Each SVG is converted exactly: fills are kept, strokes are outlined at their
width with their caps and joins, and <mask> black shapes are subtracted
(the filled variants' cut-outs). No geometry is added.

The 24-unit viewBox becomes a 1em square: x 0..24 -> 0..UPM, y 24..0 -> 0..UPM,
so the glyph box sits on the baseline, like the inline SVG it replaces.
Codepoints are assigned from U+E001 in name order and written to
scripts/vendor/lucide/icons.json for scripts/build.mjs.

Run after adding or changing an icon (needs fonttools, skia-pathops, brotli):
    python3 -m venv /tmp/iconvenv
    /tmp/iconvenv/bin/pip install fonttools skia-pathops brotli
    /tmp/iconvenv/bin/python scripts/icon-font.py
"""
import json
import os
import re
import xml.etree.ElementTree as ET

import pathops
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.filterPen import FilterPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.svgLib.path import parse_path

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'scripts', 'vendor', 'lucide')
OUT_FONT = os.path.join(ROOT, 'assets', 'fonts', 'icons.woff2')
OUT_MAP = os.path.join(SRC, 'icons.json')
UPM = 2400  # 100 units per viewBox unit
SVG = '{http://www.w3.org/2000/svg}'

# Per-icon stroke width (the default is the file's, 2). The post nav chevron
# is drawn thin like the original's 15 x 28 chevron.
STROKE_WIDTH = {'chevron-left': 1.25, 'chevron-right': 1.25}

CAPS = {'round': pathops.LineCap.ROUND_CAP, 'butt': pathops.LineCap.BUTT_CAP, 'square': pathops.LineCap.SQUARE_CAP}
JOINS = {'round': pathops.LineJoin.ROUND_JOIN, 'miter': pathops.LineJoin.MITER_JOIN, 'bevel': pathops.LineJoin.BEVEL_JOIN}


def num(v, default=0.0):
    return float(v) if v not in (None, '') else default


def geometry(el):
    """The element's outline as SVG path data."""
    tag = el.tag.replace(SVG, '')
    if tag == 'path':
        return el.get('d')
    if tag == 'rect':
        x, y, w, h = (num(el.get(k)) for k in ('x', 'y', 'width', 'height'))
        rx = num(el.get('rx'), num(el.get('ry')))
        if not rx:
            return f'M{x},{y}H{x + w}V{y + h}H{x}Z'
        return (f'M{x + rx},{y}H{x + w - rx}A{rx},{rx} 0 0 1 {x + w},{y + rx}V{y + h - rx}'
                f'A{rx},{rx} 0 0 1 {x + w - rx},{y + h}H{x + rx}A{rx},{rx} 0 0 1 {x},{y + h - rx}'
                f'V{y + rx}A{rx},{rx} 0 0 1 {x + rx},{y}Z')
    if tag == 'circle':
        cx, cy, r = (num(el.get(k)) for k in ('cx', 'cy', 'r'))
        return f'M{cx - r},{cy}A{r},{r} 0 1 0 {cx + r},{cy}A{r},{r} 0 1 0 {cx - r},{cy}Z'
    raise ValueError(f'unsupported element <{tag}>')


class CloseMeetingEnds(FilterPen):
    """Close an open sub-path that ends where it starts (map-pin's outline):
    SVG joins those ends seamlessly; stroked as open they fill the shape."""
    def moveTo(self, pt):
        self.start = self.last = pt
        super().moveTo(pt)

    def lineTo(self, pt):
        self.last = pt
        super().lineTo(pt)

    def curveTo(self, *pts):
        self.last = pts[-1]
        super().curveTo(*pts)

    def qCurveTo(self, *pts):
        self.last = pts[-1]
        super().qCurveTo(*pts)

    def endPath(self):
        if abs(self.last[0] - self.start[0]) < 1e-3 and abs(self.last[1] - self.start[1]) < 1e-3:
            super().closePath()
        else:
            super().endPath()


def to_path(d):
    p = pathops.Path()
    parse_path(d, CloseMeetingEnds(p.getPen()))
    return p


def union(paths):
    b = pathops.OpBuilder(fix_winding=True)
    for p in paths:
        b.add(p, pathops.PathOp.UNION)
    return b.resolve()


def ink(el, style):
    """Filled area of one element: its fill plus its outlined stroke."""
    st = dict(style)
    for k in ('fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'):
        if el.get(k) is not None:
            st[k] = el.get(k)
    shape = to_path(geometry(el))
    parts = []
    if st['fill'] != 'none':
        filled = pathops.Path()
        filled.addPath(shape)
        parts.append(filled)
    if st['stroke'] != 'none':
        s = pathops.Path()
        s.addPath(shape)
        s.stroke(float(st['stroke-width']), CAPS[st['stroke-linecap']], JOINS[st['stroke-linejoin']], 4)
        s.convertConicsToQuads()  # round caps/joins come out as conics
        parts.append(s)
    return union(parts) if parts else pathops.Path()


def icon_outline(name):
    root = ET.parse(os.path.join(SRC, f'{name}.svg')).getroot()
    style = {
        'fill': root.get('fill', 'black'),
        'stroke': root.get('stroke', 'none'),
        'stroke-width': str(STROKE_WIDTH.get(name, num(root.get('stroke-width'), 1))),
        'stroke-linecap': root.get('stroke-linecap', 'butt'),
        'stroke-linejoin': root.get('stroke-linejoin', 'miter'),
    }
    masks = {}
    for m in root.iter(f'{SVG}mask'):
        cut = [ink(el, {**style, 'fill': 'none', 'stroke': 'none'}) for el in m
               if (el.get('fill') or el.get('stroke')) and '#000' in (el.get('fill', '') + el.get('stroke', ''))]
        masks[m.get('id')] = union(cut)
    pieces = []
    for el in root:
        tag = el.tag.replace(SVG, '')
        if tag in ('mask', 'defs', 'title'):
            continue
        p = ink(el, style)
        ref = re.match(r'url\(#([^)]+)\)', el.get('mask', '') or '')
        if ref:
            p = pathops.op(p, masks[ref.group(1)], pathops.PathOp.DIFFERENCE, fix_winding=True)
        pieces.append(p)
    out = union(pieces)
    out.simplify(fix_winding=True)
    return out


def main():
    names = sorted(f[:-4] for f in os.listdir(SRC) if f.endswith('.svg'))
    cmap = {name: 0xE001 + i for i, name in enumerate(names)}
    glyphs = {'.notdef': TTGlyphPen(None).glyph()}
    metrics = {'.notdef': (UPM, 0)}
    for name in names:
        pen = TTGlyphPen(None)
        # viewBox units -> font units, y up: (x, y) -> (100x, 2400 - 100y)
        outline = icon_outline(name)
        outline.draw(TransformPen(Cu2QuPen(pen, max_err=1.0, reverse_direction=True), (100, 0, 0, -100, 0, UPM)))
        g = pen.glyph()
        glyphs[name] = g
        g.recalcBounds(None)
        metrics[name] = (UPM, getattr(g, 'xMin', 0))

    fb = FontBuilder(UPM, isTTF=True)
    fb.setupGlyphOrder(['.notdef'] + names)
    fb.setupCharacterMap({cp: name for name, cp in cmap.items()})
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=UPM, descent=0)
    fb.setupNameTable({
        'familyName': 'ak-icons',
        'styleName': 'Regular',
        'copyright': 'Icons: Lucide (lucide.dev), ISC License, Copyright (c) Lucide Icons and Contributors',
    })
    fb.setupOS2(sTypoAscender=UPM, sTypoDescender=0, sTypoLineGap=0, usWinAscent=UPM, usWinDescent=0)
    fb.setupPost()
    fb.font.flavor = 'woff2'
    fb.save(OUT_FONT)
    with open(OUT_MAP, 'w') as f:
        json.dump({name: f'{cp:x}' for name, cp in cmap.items()}, f, indent=2)
        f.write('\n')
    print(f'{len(names)} icons -> {os.path.relpath(OUT_FONT, ROOT)} ({os.path.getsize(OUT_FONT)} bytes)')


if __name__ == '__main__':
    main()
