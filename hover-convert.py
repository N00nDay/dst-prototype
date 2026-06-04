#!/usr/bin/env python3
"""Convert a Hover XML geometry export into docs/data-aerial.jsx geometry.

Usage:  python3 hover-convert.py path/to/hover_export.xml > /tmp/generated.js
then splice the printed ROOF_MODEL / SEED_DOWNSPOUTS / ELEVATION_MODEL literals
into docs/data-aerial.jsx (the hand-written helpers below the literals stay).

Parses the 3D POINTS/LINES/FACES, reconstructs each face polygon, projects the
roof top-down and each wall onto its elevation plane, and groups walls into
Front/Right/Back/Left by outward-normal azimuth. Per elevation it emits a
`silhouette` (all walls + roof faces facing that way, for the full house
outline), the tappable SI wall regions, and the openings.

OVERRIDE pins recessed porch walls Hover draws in a different elevation than
their facing direction implies (their per-wall elevation isn't in the export).
"""
import sys, math, json
import xml.etree.ElementTree as ET
SRC = sys.argv[1] if len(sys.argv) > 1 else "20793846_craig_howell.xml"
root=ET.parse(SRC).getroot()
P={p.get('id'):tuple(float(v) for v in p.get('data').split(',')) for p in root.iter('POINT')}
L={l.get('id'):(l.get('path').split(',')[0],l.get('path').split(',')[1],l.get('type')) for l in root.iter('LINE')}
F={}
for f in root.iter('FACE'):
    poly=f.find('POLYGON')
    F[f.get('id')]={'id':f.get('id'),'type':f.get('type'),'name':f.get('name'),'children':[c for c in (f.get('children') or '').split(',') if c],'lines':poly.get('path').split(',') if poly is not None else [],'size':float(poly.get('size')) if poly is not None and poly.get('size') else 0,'pitch':float(poly.get('pitch')) if poly is not None and poly.get('pitch') else None}
def loop(f):
    segs=[L[li][:2] for li in f['lines'] if li in L]
    if not segs:return[]
    lp=[segs[0][0],segs[0][1]];u={0}
    while len(u)<len(segs):
        last=lp[-1];fd=False
        for i,s in enumerate(segs):
            if i in u:continue
            if s[0]==last:lp.append(s[1]);u.add(i);fd=True;break
            if s[1]==last:lp.append(s[0]);u.add(i);fd=True;break
        if not fd:break
    if len(lp)>1 and lp[0]==lp[-1]:lp=lp[:-1]
    return lp
allp=list(P.values());bx=sum(p[0] for p in allp)/len(allp);by=sum(p[1] for p in allp)/len(allp)
def newell(vs):
    nx=ny=0
    for i in range(len(vs)):
        a=P[vs[i]];b=P[vs[(i+1)%len(vs)]];nx+=(a[1]-b[1])*(a[2]+b[2]);ny+=(a[2]-b[2])*(a[0]+b[0])
    return nx,ny
def az(f):
    vs=loop(f)
    if len(vs)<3:return None
    nx,ny=newell(vs);cx=sum(P[v][0] for v in vs)/len(vs);cy=sum(P[v][1] for v in vs)/len(vs)
    if nx*(cx-bx)+ny*(cy-by)<0:nx,ny=-nx,-ny
    if abs(nx)<1e-6 and abs(ny)<1e-6: return None
    return math.degrees(math.atan2(ny,nx))%360
# roof (top-down) — unchanged
roof=[f for f in F.values() if f['type']=='ROOF']
rpts=[(P[v][0],P[v][1]) for f in roof for v in loop(f)]
RW,RH=430,300
ex=(min(p[0] for p in rpts),max(p[0] for p in rpts),min(p[1] for p in rpts),max(p[1] for p in rpts))
rs=min((RW-20)/(ex[1]-ex[0]),(RH-20)/(ex[3]-ex[2]));rox=10+((RW-20)-(ex[1]-ex[0])*rs)/2;roy=10+((RH-20)-(ex[3]-ex[2])*rs)/2
prj=lambda xy:[round(rox+(xy[0]-ex[0])*rs,1),round(RH-(roy+(xy[1]-ex[2])*rs),1)]
facets=[]
for f in roof:
    pit=f['pitch'] or 8
    facets.append({'id':f['name'],'pts':[prj((P[v][0],P[v][1])) for v in loop(f)],'areaSq':round(f['size']/100,2),'pitch':"%d/12"%round(pit),'slope':'flat' if pit<3.5 else 'steep'})
tot=sum(x['areaSq'] for x in facets) or 1
for x in facets: sh=x['areaSq']/tot; x['stepFlash']=round(77*sh,1); x['apronFlash']=round(58*sh,1)
owners={}
for f in roof:
    for li in f['lines']: owners.setdefault(li,set()).add(f['name'])
edges=[]
for li,ow in owners.items():
    a,b,tp=L[li]; edges.append({'id':li,'type':(tp or 'EAVE').lower(),'len':round(math.dist(P[a],P[b])),'h':round((P[a][2]+P[b][2])/2,1),'a':prj((P[a][0],P[a][1])),'b':prj((P[b][0],P[b][1])),'facets':sorted(ow)})
# elevations
base=az([f for f in F.values() if f['name']=='SI-10'][0])
def buck(a):return int(round(((a-base)%360)/90))%4
BN={0:'right',1:'back',2:'left',3:'front'}
OVERRIDE={'SI-27':'left'}   # porch wall Hover draws in the left elevation
def side_of_wall(f):
    if f['name'] in OVERRIDE: return OVERRIDE[f['name']]
    a=az(f); return BN[buck(a)] if a is not None else None
walls_all=[f for f in F.values() if f['type']=='WALL']
si=[f for f in walls_all if (f['name'] or '').startswith('SI-')]
roof_side={}
for f in roof:
    a=az(f); roof_side[f['id']]=BN[buck(a)] if a is not None else None
wall_side={f['id']:side_of_wall(f) for f in walls_all}
wall_of={}
for f in F.values():
    if f['type'] in ('WALL','EXTERIOR'):
        for c in f['children']: wall_of[c]=f
opening_side={}
for cf in F.values():
    if cf['type'] in ('WINDOW','DOOR','GARAGE'):
        w=wall_of.get(cf['id'])
        if w: opening_side[cf['id']]=wall_side.get(w['id'])
EW,EH=880,470
elevs=[]
for sid in ['front','right','back','left']:
    swalls=[f for f in si if wall_side[f['id']]==sid]
    silf=[f for f in walls_all if wall_side[f['id']]==sid]+[f for f in roof if roof_side[f['id']]==sid]
    ma=math.radians(sum(az(f) for f in swalls)/len(swalls)); uax=(-math.sin(ma),math.cos(ma))
    to2d=lambda v:(P[v][0]*uax[0]+P[v][1]*uax[1],P[v][2])
    sil_polys=[[to2d(v) for v in loop(f)] for f in silf if len(loop(f))>=3]
    wall_polys=[(f['name'],f['size'],[to2d(v) for v in loop(f)]) for f in swalls]
    open_polys=[]
    for cf in F.values():
        if cf['type'] in ('WINDOW','DOOR','GARAGE') and opening_side.get(cf['id'])==sid:
            typ='garage' if (cf['name']=='D-2' or cf['type']=='GARAGE') else ('door' if cf['type']=='DOOR' else 'window')
            open_polys.append((cf['name'],typ,[to2d(v) for v in loop(cf)]))
    pts2=[p for poly in sil_polys for p in poly]+[p for _,_,poly in open_polys for p in poly]
    e=(min(p[0] for p in pts2),max(p[0] for p in pts2),min(p[1] for p in pts2),max(p[1] for p in pts2))
    sc=min((EW-30)/(e[1]-e[0]),(EH-30)/(e[3]-e[2]));ox=15+((EW-30)-(e[1]-e[0])*sc)/2;oy=15+((EH-30)-(e[3]-e[2])*sc)/2
    pr=lambda p:[round(ox+(p[0]-e[0])*sc,1),round(EH-(oy+(p[1]-e[2])*sc),1)]
    elevs.append({'id':sid,'label':sid.capitalize(),
        'silhouette':[[pr(p) for p in poly] for poly in sil_polys],
        'walls':[{'id':n,'sqft':round(s),'pts':[pr(p) for p in poly]} for n,s,poly in wall_polys],
        'openings':[{'id':n,'type':t,'pts':[pr(p) for p in poly]} for n,t,poly in open_polys]})
# emit
eaves=sorted([e for e in edges if e['type']=='eave'],key=lambda e:-e['len'])
ds=[{'id':f'D{i+1}','eaveId':eaves[ei]['id'],'t':t} for i,(ei,t) in enumerate([(0,0.12),(0,0.88),(1,0.5),(2,0.85),(3,0.15)]) if ei<len(eaves)]
jp=lambda pts:'['+','.join('[%s,%s]'%(p[0],p[1]) for p in pts)+']'
o=[]
o.append("const ROOF_MODEL = {\n  source: 'hover', sourceId: 'HV-7024146', viewBox: '0 0 %d %d',"%(RW,RH))
o.append('  facets: [\n    '+',\n    '.join("{ id:%r, areaSq:%s, pitch:%r, slope:%r, stepFlash:%s, apronFlash:%s, pts:%s }"%(f['id'],f['areaSq'],f['pitch'],f['slope'],f['stepFlash'],f['apronFlash'],jp(f['pts'])) for f in facets)+'\n  ],')
o.append('  edges: [\n    '+',\n    '.join("{ id:%r, type:%r, len:%s, h:%s, a:[%s,%s], b:[%s,%s], facets:[%s] }"%(e['id'],e['type'],e['len'],e['h'],e['a'][0],e['a'][1],e['b'][0],e['b'][1],','.join('%r'%x for x in e['facets'])) for e in edges)+'\n  ]\n};')
o.append('const SEED_DOWNSPOUTS = [%s];'%', '.join("{ id:%r, eaveId:%r, t:%s }"%(d['id'],d['eaveId'],d['t']) for d in ds))
o.append("const ELEVATION_MODEL = {\n  source: 'hover', sourceId: 'HV-7024146', viewBox: '0 0 %d %d',\n  sides: ["%(EW,EH))
for el in elevs:
    o.append('    { id:%r, label:%r,'%(el['id'],el['label']))
    o.append('      silhouette: ['+', '.join(jp(poly) for poly in el['silhouette'])+'],')
    o.append('      walls: ['+', '.join("{ id:%r, sqft:%s, pts:%s }"%(w['id'],w['sqft'],jp(w['pts'])) for w in el['walls'])+'],')
    o.append('      openings: ['+', '.join("{ id:%r, type:%r, pts:%s }"%(op['id'],op['type'],jp(op['pts'])) for op in el['openings'])+'] },')
o.append('  ]\n};')
print('\n'.join(o))
