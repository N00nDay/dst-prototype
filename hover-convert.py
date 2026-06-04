#!/usr/bin/env python3
"""Convert a Hover XML geometry export into docs/data-aerial.jsx geometry.

Usage:  python3 hover-convert.py path/to/hover_export.xml > /tmp/generated.js
then splice the printed ROOF_MODEL / SEED_DOWNSPOUTS / ELEVATION_MODEL literals
into docs/data-aerial.jsx (the helper/derive functions below the literals are
hand-written and stay). Re-run with a new export to regenerate exact geometry.

The Hover XML is a 3D model: POINTs (x,y,z feet), LINEs (two points + type),
and FACEs (roof RF-x, wall/SI-x, window W-x, door D-x) each a POLYGON of lines
with a size (ft²) and pitch. We reconstruct each face's polygon, project the
roof top-down and each wall onto its own elevation plane, and group walls into
Front/Right/Back/Left by outward-normal azimuth.
"""
import sys, math, json
import xml.etree.ElementTree as ET

SRC = sys.argv[1] if len(sys.argv) > 1 else "20793846_craig_howell.xml"
root = ET.parse(SRC).getroot()
P = {p.get('id'): tuple(float(v) for v in p.get('data').split(',')) for p in root.iter('POINT')}
L = {l.get('id'): (l.get('path').split(',')[0], l.get('path').split(',')[1], l.get('type')) for l in root.iter('LINE')}
F = {}
for f in root.iter('FACE'):
    poly = f.find('POLYGON')
    F[f.get('id')] = {
        'id': f.get('id'), 'type': f.get('type'), 'name': f.get('name'),
        'children': [c for c in (f.get('children') or '').split(',') if c],
        'lines': poly.get('path').split(',') if poly is not None else [],
        'size': float(poly.get('size')) if poly is not None and poly.get('size') else 0,
        'pitch': float(poly.get('pitch')) if poly is not None and poly.get('pitch') else None,
    }


def loop(face):
    """Chain a face's boundary lines into an ordered vertex loop."""
    segs = [L[li][:2] for li in face['lines'] if li in L]
    if not segs:
        return []
    lp = [segs[0][0], segs[0][1]]
    used = {0}
    while len(used) < len(segs):
        last = lp[-1]
        found = False
        for i, s in enumerate(segs):
            if i in used:
                continue
            if s[0] == last:
                lp.append(s[1]); used.add(i); found = True; break
            if s[1] == last:
                lp.append(s[0]); used.add(i); found = True; break
        if not found:
            break
    if len(lp) > 1 and lp[0] == lp[-1]:
        lp = lp[:-1]
    return lp


allp = list(P.values())
bx = sum(p[0] for p in allp) / len(allp)
by = sum(p[1] for p in allp) / len(allp)


def newell_xy(vs):
    nx = ny = 0
    for i in range(len(vs)):
        a = P[vs[i]]; b = P[vs[(i + 1) % len(vs)]]
        nx += (a[1] - b[1]) * (a[2] + b[2])
        ny += (a[2] - b[2]) * (a[0] + b[0])
    return nx, ny


# ── ROOF (top-down) ──
roof = [f for f in F.values() if f['type'] == 'ROOF']
rpts = [(P[v][0], P[v][1]) for f in roof for v in loop(f)]
RW, RH = 430, 300
ex = (min(p[0] for p in rpts), max(p[0] for p in rpts), min(p[1] for p in rpts), max(p[1] for p in rpts))
rs = min((RW - 20) / (ex[1] - ex[0]), (RH - 20) / (ex[3] - ex[2]))
rox = 10 + ((RW - 20) - (ex[1] - ex[0]) * rs) / 2
roy = 10 + ((RH - 20) - (ex[3] - ex[2]) * rs) / 2


def proj_roof(xy):
    return [round(rox + (xy[0] - ex[0]) * rs, 1), round(RH - (roy + (xy[1] - ex[2]) * rs), 1)]


facets = []
for f in roof:
    vs = loop(f)
    pitch = f['pitch'] or 8
    facets.append({'id': f['name'], 'pts': [proj_roof((P[v][0], P[v][1])) for v in vs],
                   'areaSq': round(f['size'] / 100, 2), 'pitch': f"{round(pitch)}/12",
                   'slope': 'flat' if pitch < 3.5 else 'steep'})
tot = sum(x['areaSq'] for x in facets) or 1
for x in facets:
    sh = x['areaSq'] / tot
    x['stepFlash'] = round(77 * sh, 1); x['apronFlash'] = round(58 * sh, 1)
owners = {}
for f in roof:
    for li in f['lines']:
        owners.setdefault(li, set()).add(f['name'])
edges = []
for li, ow in owners.items():
    a, b, tp = L[li]
    edges.append({'id': li, 'type': (tp or 'EAVE').lower(), 'len': round(math.dist(P[a], P[b])),
                  'h': round((P[a][2] + P[b][2]) / 2, 1),
                  'a': proj_roof((P[a][0], P[a][1])), 'b': proj_roof((P[b][0], P[b][1])),
                  'facets': sorted(ow)})

# ── ELEVATIONS ──
si = [f for f in F.values() if f['type'] == 'WALL' and (f['name'] or '').startswith('SI-')]


def wall_az(f):
    vs = loop(f); nx, ny = newell_xy(vs)
    cx = sum(P[v][0] for v in vs) / len(vs); cy = sum(P[v][1] for v in vs) / len(vs)
    ox, oy = cx - bx, cy - by
    if nx * ox + ny * oy < 0:
        nx, ny = -nx, -ny
    return math.degrees(math.atan2(ny, nx)) % 360


rows = sorted(si, key=lambda f: -f['size'])
base = wall_az(rows[0])


def buck(az):
    return int(round(((az - base) % 360) / 90)) % 4


BNAME = {3: 'front', 0: 'right', 1: 'back', 2: 'left'}
groups = {'front': [], 'right': [], 'back': [], 'left': []}
for f in rows:
    groups[BNAME[buck(wall_az(f))]].append(f)
wall_of = {}
for f in F.values():
    if f['type'] in ('WALL', 'EXTERIOR'):
        for c in f['children']:
            wall_of[c] = f
opening_side = {}
for cf in F.values():
    if cf['type'] not in ('WINDOW', 'DOOR', 'GARAGE'):
        continue
    w = wall_of.get(cf['id'])
    if w:
        opening_side[cf['id']] = BNAME[buck(wall_az(w))]
EW, EH = 880, 470
elevs = []
for sid in ['front', 'right', 'back', 'left']:
    walls = groups[sid]
    ma = math.radians(sum(wall_az(f) for f in walls) / len(walls))
    uax = (-math.sin(ma), math.cos(ma))

    def to2d(v):
        x, y, z = P[v]
        return (x * uax[0] + y * uax[1], z)
    wall_polys = [(f['name'], f['size'], [to2d(v) for v in loop(f)]) for f in walls]
    open_polys = []
    for cf in F.values():
        if cf['type'] in ('WINDOW', 'DOOR', 'GARAGE') and opening_side.get(cf['id']) == sid:
            typ = 'garage' if (cf['name'] == 'D-2' or cf['type'] == 'GARAGE') else ('door' if cf['type'] == 'DOOR' else 'window')
            open_polys.append((cf['name'], typ, [to2d(v) for v in loop(cf)]))
    pts2 = [p for _, _, poly in wall_polys for p in poly] + [p for _, _, poly in open_polys for p in poly]
    e = (min(p[0] for p in pts2), max(p[0] for p in pts2), min(p[1] for p in pts2), max(p[1] for p in pts2))
    sc = min((EW - 30) / (e[1] - e[0]), (EH - 30) / (e[3] - e[2]))
    ox = 15 + ((EW - 30) - (e[1] - e[0]) * sc) / 2
    oy = 15 + ((EH - 30) - (e[3] - e[2]) * sc) / 2

    def pr(p):
        return [round(ox + (p[0] - e[0]) * sc, 1), round(EH - (oy + (p[1] - e[2]) * sc), 1)]
    elevs.append({'id': sid, 'label': sid.capitalize(),
                  'walls': [{'id': n, 'sqft': round(s), 'pts': [pr(p) for p in poly]} for n, s, poly in wall_polys],
                  'openings': [{'id': n, 'type': t, 'pts': [pr(p) for p in poly]} for n, t, poly in open_polys]})

# ── emit JS literals ──
eaves = sorted([e for e in edges if e['type'] == 'eave'], key=lambda e: -e['len'])
ds = [{'id': f'D{i+1}', 'eaveId': eaves[ei]['id'], 't': t}
      for i, (ei, t) in enumerate([(0, 0.12), (0, 0.88), (1, 0.5), (2, 0.85), (3, 0.15)]) if ei < len(eaves)]
jp = lambda pts: '[' + ','.join('[%s,%s]' % (p[0], p[1]) for p in pts) + ']'
out = []
out.append("const ROOF_MODEL = {\n  source: 'hover', sourceId: 'HV-7024146', viewBox: '0 0 %d %d'," % (RW, RH))
out.append('  facets: [\n    ' + ',\n    '.join("{ id:%r, areaSq:%s, pitch:%r, slope:%r, stepFlash:%s, apronFlash:%s, pts:%s }" % (f['id'], f['areaSq'], f['pitch'], f['slope'], f['stepFlash'], f['apronFlash'], jp(f['pts'])) for f in facets) + '\n  ],')
out.append('  edges: [\n    ' + ',\n    '.join("{ id:%r, type:%r, len:%s, h:%s, a:[%s,%s], b:[%s,%s], facets:[%s] }" % (e['id'], e['type'], e['len'], e['h'], e['a'][0], e['a'][1], e['b'][0], e['b'][1], ','.join('%r' % x for x in e['facets'])) for e in edges) + '\n  ]\n};')
out.append('const SEED_DOWNSPOUTS = [%s];' % ', '.join("{ id:%r, eaveId:%r, t:%s }" % (d['id'], d['eaveId'], d['t']) for d in ds))
out.append("const ELEVATION_MODEL = {\n  source: 'hover', sourceId: 'HV-7024146', viewBox: '0 0 %d %d',\n  sides: [" % (EW, EH))
for el in elevs:
    out.append('    { id:%r, label:%r,' % (el['id'], el['label']))
    out.append('      walls: [' + ', '.join("{ id:%r, sqft:%s, pts:%s }" % (w['id'], w['sqft'], jp(w['pts'])) for w in el['walls']) + '],')
    out.append('      openings: [' + ', '.join("{ id:%r, type:%r, pts:%s }" % (o['id'], o['type'], jp(o['pts'])) for o in el['openings']) + '] },')
out.append('  ]\n};')
print('\n'.join(out))
