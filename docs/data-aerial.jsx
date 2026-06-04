/* global React */
/* Aerial geometry — AUTO-GENERATED from the Hover XML export (job 20793846)
   by /tmp/hover_gen2.py. Exact roof facets/edges + per-elevation walls (SI
   regions) and openings (windows/doors/garage), projected to 2D. */

const ROOF_MODEL = {
  source: 'hover', sourceId: 'HV-7024146', viewBox: '0 0 430 300',
  facets: [
    { id:'RF-4', areaSq:7.25, pitch:'8/12', slope:'steep', stepFlash:16.0, apronFlash:12.0, pts:[[266.2,148.6],[266.2,290.0],[319.8,290.0],[319.8,94.8]] },
    { id:'RF-1', areaSq:3.94, pitch:'8/12', slope:'steep', stepFlash:8.7, apronFlash:6.5, pts:[[233.3,205.4],[212.7,261.0],[212.7,290.0],[266.2,290.0],[266.2,148.6]] },
    { id:'RF-16', areaSq:3.01, pitch:'8/12', slope:'steep', stepFlash:6.6, apronFlash:5.0, pts:[[166.2,94.8],[166.2,136.9],[254.4,136.9],[254.4,94.8]] },
    { id:'RF-14', areaSq:2.51, pitch:'8/12', slope:'steep', stepFlash:5.5, apronFlash:4.2, pts:[[110.2,18.6],[110.2,102.6],[115.2,102.6],[111.4,99.0],[111.4,95.9],[144.2,126.6],[144.2,18.6]] },
    { id:'RF-15', areaSq:2.47, pitch:'8/12', slope:'steep', stepFlash:5.4, apronFlash:4.1, pts:[[178.1,18.6],[144.2,18.6],[144.2,126.6],[162.2,109.7],[172.4,93.1],[172.4,99.8],[173.0,99.8],[178.1,94.8]] },
    { id:'RF-10', areaSq:2.34, pitch:'8/12', slope:'steep', stepFlash:5.2, apronFlash:3.9, pts:[[166.2,136.9],[166.2,177.8],[194.0,150.7],[222.9,178.9],[254.4,178.9],[254.4,136.9]] },
    { id:'RF-12', areaSq:2.25, pitch:'8/12', slope:'steep', stepFlash:5.0, apronFlash:3.7, pts:[[210.8,94.8],[210.8,90.5],[173.1,90.5],[173.1,91.6],[178.1,91.6],[178.1,94.8],[173.0,99.8],[250.6,99.8],[250.6,148.6],[266.2,148.6],[319.8,94.8]] },
    { id:'RF-11', areaSq:1.73, pitch:'8/12', slope:'steep', stepFlash:3.8, apronFlash:2.9, pts:[[111.4,187.3],[170.0,167.6],[170.0,141.1],[115.3,141.1],[115.3,143.4],[111.4,143.4]] },
    { id:'RF-2', areaSq:1.53, pitch:'3/12', slope:'flat', stepFlash:3.4, apronFlash:2.5, pts:[[217.9,205.4],[217.9,223.6],[170.0,223.6],[170.0,205.4],[164.8,261.0],[212.7,261.0],[233.3,205.4]] },
    { id:'RF-9', areaSq:1.47, pitch:'8/12', slope:'steep', stepFlash:3.2, apronFlash:2.4, pts:[[166.2,177.8],[166.2,174.6],[170.0,170.9],[165.0,170.9],[165.0,227.4],[194.0,227.4],[194.0,150.7]] },
    { id:'RF-5', areaSq:1.46, pitch:'8/12', slope:'steep', stepFlash:3.2, apronFlash:2.4, pts:[[194.0,227.4],[194.0,150.7],[222.9,178.9],[222.9,227.4]] },
    { id:'RF-13', areaSq:1.29, pitch:'8/12', slope:'steep', stepFlash:2.8, apronFlash:2.1, pts:[[144.2,126.6],[162.2,109.7],[170.0,109.7],[170.0,141.1],[115.3,141.1],[115.3,128.2],[111.4,128.2],[111.4,95.9]] },
    { id:'RF-8', areaSq:1.11, pitch:'3/12', slope:'flat', stepFlash:2.4, apronFlash:1.8, pts:[[111.4,187.3],[111.4,204.8],[170.0,205.4],[170.0,167.6]] },
    { id:'RF-7', areaSq:0.76, pitch:'3/12', slope:'flat', stepFlash:1.7, apronFlash:1.3, pts:[[111.4,204.8],[130.0,242.6],[170.0,205.4]] },
    { id:'RF-6', areaSq:0.7, pitch:'5/12', slope:'steep', stepFlash:1.5, apronFlash:1.2, pts:[[250.6,148.6],[250.6,173.9],[217.9,173.9],[217.9,205.4],[233.3,205.4],[266.2,148.6]] },
    { id:'RF-3', areaSq:0.7, pitch:'3/12', slope:'flat', stepFlash:1.5, apronFlash:1.2, pts:[[130.0,242.6],[170.0,205.4],[164.8,261.0]] },
    { id:'RF-19', areaSq:0.16, pitch:'8/12', slope:'steep', stepFlash:0.4, apronFlash:0.3, pts:[[134.2,10.0],[139.0,22.4],[150.3,22.4],[155.1,10.0]] },
    { id:'RF-20', areaSq:0.09, pitch:'8/12', slope:'steep', stepFlash:0.2, apronFlash:0.1, pts:[[134.2,10.0],[120.7,22.4],[139.0,22.4]] },
    { id:'RF-18', areaSq:0.09, pitch:'8/12', slope:'steep', stepFlash:0.2, apronFlash:0.1, pts:[[150.3,22.4],[155.1,10.0],[168.6,22.4]] },
    { id:'RF-17', areaSq:0.04, pitch:'5/12', slope:'steep', stepFlash:0.1, apronFlash:0.1, pts:[[170.0,109.7],[162.2,109.7],[172.4,93.1],[172.4,99.8],[170.0,99.8]] }
  ],
  edges: [
    { id:'L1', type:'ridge', len:37, h:18.2, a:[266.2,148.6], b:[266.2,290.0], facets:['RF-1','RF-4'] },
    { id:'L2', type:'rake', len:17, h:13.6, a:[266.2,290.0], b:[319.8,290.0], facets:['RF-4'] },
    { id:'L3', type:'eave', len:51, h:9.0, a:[319.8,290.0], b:[319.8,94.8], facets:['RF-4'] },
    { id:'L4', type:'hip', len:22, h:13.6, a:[319.8,94.8], b:[266.2,148.6], facets:['RF-12','RF-4'] },
    { id:'L5', type:'valley', len:16, h:10.8, a:[233.3,205.4], b:[212.7,261.0], facets:['RF-1','RF-2'] },
    { id:'L6', type:'eave', len:7, h:9.0, a:[212.7,261.0], b:[212.7,290.0], facets:['RF-1'] },
    { id:'L7', type:'rake', len:17, h:13.6, a:[212.7,290.0], b:[266.2,290.0], facets:['RF-1'] },
    { id:'L8', type:'valley', len:18, h:15.4, a:[266.2,148.6], b:[233.3,205.4], facets:['RF-1','RF-6'] },
    { id:'L9', type:'rake', len:13, h:21.8, a:[166.2,94.8], b:[166.2,136.9], facets:['RF-16'] },
    { id:'L10', type:'ridge', len:23, h:25.5, a:[166.2,136.9], b:[254.4,136.9], facets:['RF-10','RF-16'] },
    { id:'L11', type:'rake', len:13, h:21.8, a:[254.4,136.9], b:[254.4,94.8], facets:['RF-16'] },
    { id:'L12', type:'eave', len:23, h:18.0, a:[254.4,94.8], b:[166.2,94.8], facets:['RF-16'] },
    { id:'L13', type:'eave', len:22, h:9.0, a:[110.2,18.6], b:[110.2,102.6], facets:['RF-14'] },
    { id:'L14', type:'rake', len:2, h:9.4, a:[110.2,102.6], b:[115.2,102.6], facets:['RF-14'] },
    { id:'L15', type:'stepflash', len:1, h:9.5, a:[115.2,102.6], b:[111.4,99.0], facets:['RF-14'] },
    { id:'L16', type:'flashing', len:1, h:9.2, a:[111.4,99.0], b:[111.4,95.9], facets:['RF-14'] },
    { id:'L17', type:'valley', len:13, h:12.0, a:[111.4,95.9], b:[144.2,126.6], facets:['RF-13','RF-14'] },
    { id:'L18', type:'ridge', len:28, h:14.7, a:[144.2,126.6], b:[144.2,18.6], facets:['RF-14','RF-15'] },
    { id:'L19', type:'rake', len:10, h:11.9, a:[144.2,18.6], b:[110.2,18.6], facets:['RF-14'] },
    { id:'L20', type:'rake', len:10, h:11.9, a:[178.1,18.6], b:[144.2,18.6], facets:['RF-15'] },
    { id:'L21', type:'valley', len:7, h:13.2, a:[144.2,126.6], b:[162.2,109.7], facets:['RF-13','RF-15'] },
    { id:'L22', type:'valley', len:5, h:10.8, a:[162.2,109.7], b:[172.4,93.1], facets:['RF-15','RF-17'] },
    { id:'L23', type:'flashing', len:2, h:9.9, a:[172.4,93.1], b:[172.4,99.8], facets:['RF-15'] },
    { id:'L24', type:'stepflash', len:0, h:9.9, a:[172.4,99.8], b:[173.0,99.8], facets:['RF-15'] },
    { id:'L25', type:'valley', len:2, h:9.4, a:[173.0,99.8], b:[178.1,94.8], facets:['RF-12','RF-15'] },
    { id:'L26', type:'eave', len:20, h:9.0, a:[178.1,94.8], b:[178.1,18.6], facets:['RF-15'] },
    { id:'L27', type:'rake', len:13, h:21.9, a:[166.2,136.9], b:[166.2,177.8], facets:['RF-10'] },
    { id:'L28', type:'valley', len:11, h:20.6, a:[166.2,177.8], b:[194.0,150.7], facets:['RF-10','RF-9'] },
    { id:'L29', type:'valley', len:12, h:20.5, a:[194.0,150.7], b:[222.9,178.9], facets:['RF-10','RF-5'] },
    { id:'L30', type:'eave', len:8, h:18.0, a:[222.9,178.9], b:[254.4,178.9], facets:['RF-10'] },
    { id:'L31', type:'rake', len:13, h:21.8, a:[254.4,178.9], b:[254.4,136.9], facets:['RF-10'] },
    { id:'L32', type:'rake', len:1, h:8.6, a:[210.8,94.8], b:[210.8,90.5], facets:['RF-12'] },
    { id:'L33', type:'eave', len:10, h:8.3, a:[210.8,90.5], b:[173.1,90.5], facets:['RF-12'] },
    { id:'L34', type:'stepflash', len:0, h:8.4, a:[173.1,90.5], b:[173.1,91.6], facets:['RF-12'] },
    { id:'L35', type:'flashing', len:1, h:8.4, a:[173.1,91.6], b:[178.1,91.6], facets:['RF-12'] },
    { id:'L36', type:'stepflash', len:1, h:8.7, a:[178.1,91.6], b:[178.1,94.8], facets:['RF-12'] },
    { id:'L37', type:'flashing', len:20, h:9.9, a:[173.0,99.8], b:[250.6,99.8], facets:['RF-12'] },
    { id:'L38', type:'stepflash', len:15, h:14.0, a:[250.6,99.8], b:[250.6,148.6], facets:['RF-12'] },
    { id:'L39', type:'ridge', len:4, h:18.2, a:[250.6,148.6], b:[266.2,148.6], facets:['RF-12','RF-6'] },
    { id:'L40', type:'eave', len:28, h:9.0, a:[319.8,94.8], b:[210.8,94.8], facets:['RF-12'] },
    { id:'L41', type:'valley', len:16, h:10.8, a:[111.4,187.3], b:[170.0,167.6], facets:['RF-11','RF-8'] },
    { id:'L42', type:'stepflash', len:8, h:14.9, a:[170.0,167.6], b:[170.0,141.1], facets:['RF-11'] },
    { id:'L43', type:'ridge', len:14, h:17.3, a:[170.0,141.1], b:[115.3,141.1], facets:['RF-11','RF-13'] },
    { id:'L44', type:'stepflash', len:1, h:17.1, a:[115.3,141.1], b:[115.3,143.4], facets:['RF-11'] },
    { id:'L45', type:'flashing', len:1, h:16.9, a:[115.3,143.4], b:[111.4,143.4], facets:['RF-11'] },
    { id:'L46', type:'rake', len:14, h:13.0, a:[111.4,143.4], b:[111.4,187.3], facets:['RF-11'] },
    { id:'L47', type:'stepflash', len:5, h:12.0, a:[217.9,205.4], b:[217.9,223.6], facets:['RF-2'] },
    { id:'L48', type:'flashing', len:12, h:11.4, a:[217.9,223.6], b:[170.0,223.6], facets:['RF-2'] },
    { id:'L49', type:'stepflash', len:5, h:12.0, a:[170.0,223.6], b:[170.0,205.4], facets:['RF-2'] },
    { id:'L50', type:'hip', len:15, h:10.8, a:[170.0,205.4], b:[164.8,261.0], facets:['RF-2','RF-3'] },
    { id:'L51', type:'eave', len:12, h:9.0, a:[164.8,261.0], b:[212.7,261.0], facets:['RF-2'] },
    { id:'L52', type:'other', len:4, h:12.6, a:[233.3,205.4], b:[217.9,205.4], facets:['RF-2','RF-6'] },
    { id:'L53', type:'flashing', len:1, h:18.3, a:[166.2,177.8], b:[166.2,174.6], facets:['RF-9'] },
    { id:'L54', type:'stepflash', len:2, h:18.6, a:[166.2,174.6], b:[170.0,170.9], facets:['RF-9'] },
    { id:'L55', type:'rake', len:2, h:18.5, a:[170.0,170.9], b:[165.0,170.9], facets:['RF-9'] },
    { id:'L56', type:'eave', len:15, h:18.0, a:[165.0,170.9], b:[165.0,227.4], facets:['RF-9'] },
    { id:'L57', type:'rake', len:9, h:20.5, a:[165.0,227.4], b:[194.0,227.4], facets:['RF-9'] },
    { id:'L58', type:'ridge', len:20, h:23.0, a:[194.0,227.4], b:[194.0,150.7], facets:['RF-5','RF-9'] },
    { id:'L59', type:'rake', len:9, h:20.5, a:[194.0,227.4], b:[222.9,227.4], facets:['RF-5'] },
    { id:'L60', type:'eave', len:13, h:18.0, a:[222.9,227.4], b:[222.9,178.9], facets:['RF-5'] },
    { id:'L61', type:'rake', len:10, h:12.1, a:[111.4,95.9], b:[111.4,128.2], facets:['RF-13'] },
    { id:'L62', type:'flashing', len:1, h:15.0, a:[111.4,128.2], b:[115.3,128.2], facets:['RF-13'] },
    { id:'L63', type:'stepflash', len:4, h:16.2, a:[115.3,128.2], b:[115.3,141.1], facets:['RF-13'] },
    { id:'L64', type:'stepflash', len:10, h:14.5, a:[170.0,141.1], b:[170.0,109.7], facets:['RF-13'] },
    { id:'L65', type:'other', len:2, h:11.7, a:[170.0,109.7], b:[162.2,109.7], facets:['RF-13','RF-17'] },
    { id:'L66', type:'eave', len:5, h:9.0, a:[111.4,187.3], b:[111.4,204.8], facets:['RF-8'] },
    { id:'L67', type:'hip', len:16, h:10.8, a:[111.4,204.8], b:[170.0,205.4], facets:['RF-7','RF-8'] },
    { id:'L68', type:'flashing', len:10, h:12.6, a:[170.0,205.4], b:[170.0,167.6], facets:['RF-8'] },
    { id:'L69', type:'eave', len:11, h:9.0, a:[111.4,204.8], b:[130.0,242.6], facets:['RF-7'] },
    { id:'L70', type:'hip', len:15, h:10.8, a:[130.0,242.6], b:[170.0,205.4], facets:['RF-3','RF-7'] },
    { id:'L71', type:'stepflash', len:7, h:17.0, a:[250.6,148.6], b:[250.6,173.9], facets:['RF-6'] },
    { id:'L72', type:'flashing', len:8, h:15.7, a:[250.6,173.9], b:[217.9,173.9], facets:['RF-6'] },
    { id:'L73', type:'stepflash', len:9, h:14.1, a:[217.9,173.9], b:[217.9,205.4], facets:['RF-6'] },
    { id:'L74', type:'eave', len:10, h:9.0, a:[130.0,242.6], b:[164.8,261.0], facets:['RF-3'] },
    { id:'L75', type:'hip', len:4, h:10.4, a:[134.2,10.0], b:[139.0,22.4], facets:['RF-19','RF-20'] },
    { id:'L76', type:'flashing', len:3, h:11.4, a:[139.0,22.4], b:[150.3,22.4], facets:['RF-19'] },
    { id:'L77', type:'hip', len:4, h:10.4, a:[150.3,22.4], b:[155.1,10.0], facets:['RF-18','RF-19'] },
    { id:'L78', type:'eave', len:5, h:9.3, a:[155.1,10.0], b:[134.2,10.0], facets:['RF-19'] },
    { id:'L79', type:'eave', len:5, h:9.3, a:[134.2,10.0], b:[120.7,22.4], facets:['RF-20'] },
    { id:'L80', type:'stepflash', len:5, h:10.4, a:[120.7,22.4], b:[139.0,22.4], facets:['RF-20'] },
    { id:'L81', type:'stepflash', len:5, h:10.4, a:[150.3,22.4], b:[168.6,22.4], facets:['RF-18'] },
    { id:'L82', type:'eave', len:5, h:9.3, a:[168.6,22.4], b:[155.1,10.0], facets:['RF-18'] },
    { id:'L83', type:'stepflash', len:3, h:11.2, a:[170.0,109.7], b:[170.0,99.8], facets:['RF-17'] },
    { id:'L84', type:'flashing', len:1, h:10.6, a:[170.0,99.8], b:[172.4,99.8], facets:['RF-17'] },
    { id:'L85', type:'rake', len:2, h:10.3, a:[172.4,99.8], b:[172.4,93.1], facets:['RF-17'] }
  ]
};
const SEED_DOWNSPOUTS = [{ id:'D1', eaveId:'L3', t:0.12 }, { id:'D2', eaveId:'L3', t:0.88 }, { id:'D3', eaveId:'L40', t:0.5 }, { id:'D4', eaveId:'L12', t:0.85 }, { id:'D5', eaveId:'L13', t:0.15 }];
const ELEVATION_MODEL = {
  source: 'hover', sourceId: 'HV-7024146', viewBox: '0 0 880 470',
  sides: [
    { id:'front', label:'Front',
      walls: [{ id:'SI-7', sqft:222, pts:[[506.5,413.1],[506.5,301.5],[774.7,301.5],[774.7,413.1],[840.0,413.1],[840.0,276.0],[844.1,276.0],[865.0,276.0],[641.4,127.0],[417.7,276.0],[438.7,276.0],[442.7,276.0],[442.7,413.1]] }, { id:'SI-4', sqft:87, pts:[[243.7,130.0],[243.7,228.4],[435.7,228.4],[435.7,130.0],[439.7,130.0],[460.6,130.0],[339.7,49.4],[218.7,130.0],[239.7,130.0]] }, { id:'SI-2', sqft:45, pts:[[243.7,402.0],[438.7,402.0],[438.7,276.0],[243.7,276.0]] }, { id:'SI-3', sqft:35, pts:[[15.0,402.0],[134.9,402.0],[134.9,276.0],[24.2,276.0],[24.2,283.4],[15.0,283.4]] }, { id:'SI-1', sqft:23, pts:[[138.9,402.0],[239.7,402.0],[239.7,276.0],[138.9,276.0]] }, { id:'SI-8', sqft:15, pts:[[572.0,130.0],[439.7,130.0],[439.7,158.9],[572.0,158.9]] }, { id:'SI-5', sqft:5, pts:[[312.9,132.0],[368.6,132.0],[367.6,124.8],[364.9,118.1],[360.4,112.3],[354.7,107.9],[347.9,105.1],[340.7,104.2],[333.5,105.1],[326.8,107.9],[321.0,112.3],[316.6,118.1],[313.8,124.8]] }],
      openings: [{ id:'W-103', type:'window', pts:[[384.1,366.6],[384.1,287.7],[339.0,287.7],[339.0,366.6]] }, { id:'W-102', type:'window', pts:[[314.4,366.6],[314.4,287.7],[281.5,287.7],[281.5,366.6]] }, { id:'W-104', type:'window', pts:[[426.1,366.6],[426.1,287.7],[404.0,287.7],[404.0,366.6]] }, { id:'W-118', type:'window', pts:[[102.5,372.0],[102.5,287.1],[55.7,287.1],[55.7,372.0]] }, { id:'D-1', type:'door', pts:[[182.6,283.3],[182.6,393.2],[233.8,393.2],[233.8,283.3]] }, { id:'D-2', type:'garage', pts:[[772.6,303.6],[508.6,303.6],[508.6,420.6],[772.6,420.6]] }, { id:'W-219', type:'window', pts:[[361.9,208.8],[361.9,138.8],[319.6,138.8],[319.6,208.8]] }] },
    { id:'right', label:'Right',
      walls: [{ id:'SI-10', sqft:359, pts:[[386.0,326.0],[386.0,450.4],[838.3,450.4],[838.3,303.8],[15.0,303.8],[15.0,450.4],[330.9,450.4],[330.9,326.0]] }, { id:'SI-9', sqft:126, pts:[[838.3,276.6],[838.3,147.7],[842.6,147.7],[865.0,147.7],[677.2,19.6],[489.4,147.7],[511.8,147.7],[516.1,147.7],[516.1,177.0],[624.7,135.0]] }, { id:'SI-27', sqft:106, pts:[[122.9,448.6],[122.9,450.4],[15.0,450.4],[15.0,303.8],[135.4,303.8],[135.4,311.8],[146.4,311.8],[146.4,303.8],[290.3,303.8],[290.3,438.5],[122.9,438.5]] }, { id:'SI-6', sqft:52, pts:[[511.8,178.7],[371.2,232.9],[294.6,251.9],[294.6,147.7],[511.8,147.7]] }],
      openings: [{ id:'D-3', type:'door', pts:[[381.6,330.3],[335.2,330.3],[335.2,447.8],[381.6,447.8]] }, { id:'W-105', type:'window', pts:[[194.9,394.1],[194.9,334.0],[151.6,334.0],[151.6,394.1]] }, { id:'W-106', type:'window', pts:[[474.6,345.7],[474.6,313.4],[423.9,313.4],[423.9,345.7]] }, { id:'D-5', type:'door', pts:[[63.4,328.1],[112.0,328.1],[112.0,445.7],[63.4,445.7]] }] },
    { id:'back', label:'Back',
      walls: [{ id:'SI-12', sqft:187, pts:[[452.9,242.0],[444.9,242.0],[444.9,230.1],[15.0,230.1],[15.0,367.2],[100.6,367.2],[100.6,367.1],[147.3,367.1],[147.3,367.2],[341.5,367.2],[452.9,367.2],[452.9,318.0]] }, { id:'SI-14', sqft:122, pts:[[605.2,205.8],[603.0,207.3],[283.1,207.3],[283.1,84.1],[611.3,84.1],[611.3,194.5],[605.2,194.5]] }, { id:'SI-18', sqft:65, pts:[[821.3,225.8],[799.0,225.8],[799.0,367.2],[840.0,367.2],[840.0,230.1],[844.1,230.1],[865.0,230.1],[723.4,137.6],[581.7,230.1],[602.6,230.1],[606.7,230.1],[606.7,367.2],[643.7,367.2],[643.7,225.8],[621.4,225.8],[621.4,216.4],[697.7,181.7],[745.0,181.7],[821.3,216.4]] }, { id:'SI-19', sqft:23, pts:[[759.0,367.2],[759.0,225.8],[683.7,225.8],[683.7,367.2]] }, { id:'SI-17', sqft:17, pts:[[683.7,225.8],[683.7,367.2],[643.7,367.2],[643.7,225.8]] }, { id:'SI-21', sqft:17, pts:[[799.0,367.2],[799.0,225.8],[759.0,225.8],[759.0,367.2]] }, { id:'SI-15', sqft:12, pts:[[556.0,367.2],[556.0,318.0],[494.8,318.0],[494.8,367.2]] }, { id:'SI-13', sqft:8, pts:[[486.4,367.2],[486.4,318.0],[452.9,318.0],[452.9,367.2]] }, { id:'SI-20', sqft:8, pts:[[597.3,318.0],[597.3,367.2],[563.8,367.2],[563.8,318.0]] }, { id:'SI-16', sqft:3, pts:[[597.3,242.0],[597.3,318.0],[597.3,367.2],[602.6,367.2],[602.6,242.0]] }],
      openings: [{ id:'W-107', type:'window', pts:[[82.8,307.0],[82.8,241.1],[39.9,241.1],[39.9,307.0]] }, { id:'W-108', type:'window', pts:[[225.4,307.0],[225.4,241.1],[182.4,241.1],[182.4,307.0]] }, { id:'W-109', type:'window', pts:[[353.6,278.6],[353.6,243.7],[319.0,243.7],[319.0,278.6]] }, { id:'W-001', type:'window', pts:[[146.0,385.9],[146.0,368.4],[101.9,368.4],[101.9,385.9]] }, { id:'W-221', type:'window', pts:[[586.3,161.1],[586.3,94.5],[546.2,94.5],[546.2,161.1]] }, { id:'W-220', type:'window', pts:[[436.4,161.1],[436.4,94.5],[396.3,94.5],[396.3,161.1]] }, { id:'W-114', type:'window', pts:[[744.1,315.1],[744.1,241.2],[698.3,241.2],[698.3,315.1]] }, { id:'W-113', type:'window', pts:[[675.4,315.1],[675.4,241.2],[655.6,241.2],[655.6,315.1]] }, { id:'W-115', type:'window', pts:[[788.0,315.1],[788.0,241.2],[768.2,241.2],[768.2,315.1]] }, { id:'W-110', type:'window', pts:[[479.5,311.0],[479.5,248.5],[459.1,248.5],[459.1,311.0]] }, { id:'W-112', type:'window', pts:[[589.6,311.0],[589.6,248.5],[569.2,248.5],[569.2,311.0]] }, { id:'W-111', type:'window', pts:[[549.7,311.0],[549.7,248.5],[500.4,248.5],[500.4,311.0]] }] },
    { id:'left', label:'Left',
      walls: [{ id:'SI-22', sqft:217, pts:[[462.2,201.5],[352.8,277.7],[352.8,300.7],[15.0,300.7],[15.0,440.9],[462.2,440.9]] }, { id:'SI-23', sqft:208, pts:[[630.3,233.0],[517.1,154.3],[383.4,247.3],[345.2,262.7],[345.2,151.6],[341.1,151.6],[319.7,151.6],[499.2,29.1],[644.6,128.2],[644.6,151.6],[865.0,151.6],[865.0,251.1],[791.7,233.0]] }, { id:'SI-11', sqft:141, pts:[[301.4,303.8],[306.0,300.7],[15.0,300.7],[15.0,440.9],[341.1,440.9],[341.1,312.9],[301.4,312.9]] }, { id:'SI-26', sqft:112, pts:[[558.0,440.9],[689.0,440.9],[689.0,300.7],[693.1,300.7],[714.5,300.7],[527.0,170.2],[527.0,283.3],[558.0,309.4]] }, { id:'SI-25', sqft:46, pts:[[790.9,300.7],[693.1,300.7],[693.1,429.5],[790.9,429.5]] }, { id:'SI-24', sqft:33, pts:[[865.0,300.7],[795.0,300.7],[795.0,429.5],[865.0,429.5]] }],
      openings: [{ id:'W-116', type:'window', pts:[[123.5,383.3],[123.5,308.6],[77.8,308.6],[77.8,383.3]] }, { id:'W-117', type:'window', pts:[[257.4,383.3],[257.4,308.6],[211.7,308.6],[211.7,383.3]] }, { id:'D-4', type:'door', pts:[[224.0,310.2],[275.6,310.2],[275.6,424.1],[224.0,424.1]] }] },
  ]
};
// ── Visual styles ──
const EDGE_STYLE = {
  eave:   { label: 'Eave',   color: 'oklch(0.6 0.02 80)' },
  rake:   { label: 'Rake',   color: 'oklch(0.62 0.17 145)' },
  ridge:  { label: 'Ridge',  color: 'oklch(0.6 0.21 25)' },
  hip:    { label: 'Hip',    color: 'oklch(0.68 0.16 55)' },
  valley: { label: 'Valley', color: 'oklch(0.55 0.17 295)' }
};
const OPENING_STYLE = {
  window: { label: 'Window', color: 'oklch(0.55 0.14 235)' },
  door:   { label: 'Door',   color: 'oklch(0.62 0.16 55)' },
  slider: { label: 'Slider', color: 'oklch(0.6 0.12 165)' },
  garage: { label: 'Garage', color: 'oklch(0.55 0.16 300)' }
};

// ── lookups & geometry (roof / gutters) ──
const edgeById = (id) => (ROOF_MODEL.edges || []).find((e) => e.id === id) || null;
const facetById = (id) => (ROOF_MODEL.facets || []).find((f) => f.id === id) || null;
function pointOnEave(eave, t) {
  return [eave.a[0] + (eave.b[0] - eave.a[0]) * t, eave.a[1] + (eave.b[1] - eave.a[1]) * t];
}
function snapEaveEndT(eave, t) {
  if (!eave) return t < 0.5 ? 0 : 1;
  const len = Math.hypot(eave.b[0] - eave.a[0], eave.b[1] - eave.a[1]) || 1;
  const inset = Math.min(0.45, 9 / len);
  return t < 0.5 ? inset : 1 - inset;
}
// Downspout drop = gutter height (eave z above grade), unless overridden.
function downspoutDropLf(ds) {
  if (ds && ds.dropLf != null) return ds.dropLf;
  const e = edgeById(ds && ds.eaveId);
  return Math.round((e && e.h) || 18);
}
function downspoutAutoDrop(ds) {
  const e = edgeById(ds && ds.eaveId);
  return Math.round((e && e.h) || 18);
}
function nearestEavePoint(selectedEaveIds, x, y) {
  const sel = new Set(selectedEaveIds || []);
  let best = null;
  (ROOF_MODEL.edges || []).forEach((e) => {
    if (e.type !== 'eave' || !sel.has(e.id)) return;
    const dx = e.b[0] - e.a[0], dy = e.b[1] - e.a[1];
    const l2 = dx * dx + dy * dy || 1;
    let t = ((x - e.a[0]) * dx + (y - e.a[1]) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    const px = e.a[0] + dx * t, py = e.a[1] + dy * t;
    const d = Math.hypot(x - px, y - py);
    if (!best || d < best.dist) best = { eaveId: e.id, t, x: px, y: py, dist: d };
  });
  return best;
}

// ── Roofing ──
function deriveRoofMeasurements(model, selectedIds, opts) {
  const sel = new Set(selectedIds || []);
  const facets = (model.facets || []).filter((f) => sel.has(f.id));
  let area = 0, steep = 0, flat = 0, step = 0, apron = 0, pitch = '', maxArea = -1;
  facets.forEach((f) => {
    area += f.areaSq;
    if (f.slope === 'flat') flat += f.areaSq; else steep += f.areaSq;
    if (f.stepFlash) step += f.stepFlash;
    if (f.apronFlash) apron += f.apronFlash;
    if (f.areaSq > maxArea) { maxArea = f.areaSq; pitch = f.pitch; }
  });
  const byType = { eave: 0, rake: 0, ridge: 0, hip: 0, valley: 0 };
  (model.edges || []).forEach((e) => { if (e.facets.some((id) => sel.has(id))) byType[e.type] += e.len; });
  const r1 = (n) => Math.round(n * 10) / 10, r0 = (n) => Math.round(n);
  return {
    area: r1(area), area_steep: r1(steep), area_flat: r1(flat), pitch,
    eaves: r0(byType.eave), rakes: r0(byType.rake), ridge: r0(byType.ridge), hip: r0(byType.hip), valley: r0(byType.valley),
    drip_edge: r0(byType.eave + byType.rake), step_flashing: r0(step), apron_flashing: r0(apron),
    waste_pct: opts && opts.waste != null ? opts.waste : 12, stories: opts && opts.stories != null ? opts.stories : 2
  };
}
function allRoofFacetIds() { return (ROOF_MODEL.facets || []).map((f) => f.id); }
function allRoofEaveIds() { return (ROOF_MODEL.edges || []).filter((e) => e.type === 'eave').map((e) => e.id); }

// ── Gutters ──
function deriveGutterMeasurements(model, selectedEaveIds, downspouts, opts) {
  const sel = new Set(selectedEaveIds || []);
  let lf = 0;
  (model.edges || []).forEach((e) => { if (e.type === 'eave' && sel.has(e.id)) lf += e.len; });
  const active = (downspouts || []).filter((d) => sel.has(d.eaveId));
  let dsLf = 0;
  active.forEach((d) => { dsLf += downspoutDropLf(d); });
  const guards = !!(opts && opts.guards), r0 = (n) => Math.round(n);
  return { gutter_lf: r0(lf), downspouts: active.length, downspout_lf: r0(dsLf), guards_lf: guards ? r0(lf) : 0 };
}

// ── Windows & Doors (each opening is one real face — unique, no ties) ──
function openingType(key) {
  if (/^GD/i.test(key)) return 'garage';
  if (/^D/i.test(key)) return 'door';
  if (/^S/i.test(key)) return 'slider';
  return 'window';
}
function deriveWindoorMeasurements(model, selectedKeys, added) {
  const sel = new Set(selectedKeys || []);
  const typeOf = {};
  (model.sides || []).forEach((s) => (s.openings || []).forEach((o) => { typeOf[o.id] = o.type; }));
  (added || []).forEach((a) => { typeOf[a.id] = a.type; });
  let w = 0, d = 0, sl = 0, g = 0;
  Object.keys(typeOf).forEach((k) => {
    if (!sel.has(k)) return;
    const t = typeOf[k];
    if (t === 'window') w += 1; else if (t === 'door') d += 1; else if (t === 'slider') sl += 1; else if (t === 'garage') g += 1;
  });
  return { windows: w, doors: d, sliders: sl, garage_doors: g };
}
function allWindoorOpeningIds() {
  const s = new Set();
  (ELEVATION_MODEL.sides || []).forEach((sd) => (sd.openings || []).forEach((o) => s.add(o.id)));
  return [...s];
}

// ── Siding (walls = SI regions on the same elevations) ──
function sidingSqft(model, selectedIds) {
  const sel = new Set(selectedIds || []);
  let sqft = 0;
  (model.sides || []).forEach((s) => (s.walls || []).forEach((w) => { if (sel.has(w.id)) sqft += w.sqft; }));
  return sqft;
}
function deriveSidingMeasurements(model, selectedIds) {
  return { siding_area: Math.round(sidingSqft(model, selectedIds) / 100 * 10) / 10 };
}
function allSidingRegionIds() {
  const ids = [];
  (ELEVATION_MODEL.sides || []).forEach((s) => (s.walls || []).forEach((w) => ids.push(w.id)));
  return ids;
}
const ptsAttr = (pts) => pts.map((p) => p.join(',')).join(' ');

Object.assign(window, {
  ROOF_MODEL, EDGE_STYLE, SEED_DOWNSPOUTS, ELEVATION_MODEL, OPENING_STYLE,
  deriveRoofMeasurements, deriveGutterMeasurements, deriveWindoorMeasurements,
  deriveSidingMeasurements, sidingSqft, ptsAttr,
  allRoofFacetIds, allRoofEaveIds, allWindoorOpeningIds, allSidingRegionIds,
  edgeById, facetById, pointOnEave, snapEaveEndT, downspoutDropLf, downspoutAutoDrop, nearestEavePoint, openingType
});
