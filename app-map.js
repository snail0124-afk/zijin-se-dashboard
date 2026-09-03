const TYPE_COLOR = { boiler:"var(--accent)", vessel:"var(--info)", pipeline:"var(--teal)", crane:"var(--steel)", vehicle:"var(--warn)", elevator:"var(--muted)" };
const STATUS_COLOR = { normal:"var(--ok)", inspect:"var(--info)", warning:"var(--warn)", alarm:"var(--alarm)" };
const STATUS_LABEL = { normal:"正常", inspect:"待检", warning:"预警", alarm:"报警" };
const TYPE_LABEL = Object.fromEntries(DATA.EQUIPMENT_TYPES.map(t => [t.id, t.label]));
const ZONE_NAME = Object.fromEntries(DATA.ZONES.map(z => [z.id, z.name]));
const WEEK = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];
const state = { selectedId:"WHB-SL-01", typeFilter:"all", statusFilter:"all", query:"", zone:null, tab:"both", tick:0, mobile:null };
function pad(n){ return String(n).padStart(2,"0"); }
function hash(s){ let h=0; for(const c of s) h=(h*31+c.charCodeAt(0))|0; return h; }
function liveValue(p, tick, seed){
  const v = p.base + Math.sin(tick*0.37+seed)*p.amp + Math.sin(tick*0.13+seed*1.7)*p.amp*0.28;
  return Math.round(Math.min(p.max, Math.max(p.min, v)) * (10 ** p.digits)) / (10 ** p.digits);
}
function vis(){
  const q = state.query.trim().toLowerCase();
  return DATA.EQUIPMENT.filter(e => {
    if(state.typeFilter!=="all" && e.type!==state.typeFilter) return false;
    if(state.statusFilter!=="all" && e.status!==state.statusFilter) return false;
    if(state.zone && e.zoneId!==state.zone) return false;
    if(q && !(e.id+" "+e.name+" "+e.archive.location).toLowerCase().includes(q)) return false;
    return true;
  });
}
function glyph(type, size){
  size = size||14;
  const g = {
    boiler:'<rect x="3" y="5" width="10" height="8" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M6 5V3.5h4V5" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    vessel:'<rect x="4.5" y="3" width="7" height="10" rx="3.2" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    pipeline:'<path d="M2 8h3.2l1.6-3 2.4 6 1.6-3H14" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    crane:'<path d="M3 13V5h10M5 5v-2h6M8 5v6" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    vehicle:'<path d="M3 10V7.5h6.5l2 2.5H13v2H3z" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    elevator:'<rect x="4" y="2.5" width="8" height="11" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/>'
  };
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 16 16">'+(g[type]||'')+'</svg>';
}
function mapSvg(){
  const ids = new Set(vis().map(e=>e.id));
  const roads = ["M 40 118 L 1460 118","M 48 360 L 1460 360","M 60 508 L 920 508","M 70 748 L 1460 748","M 540 100 L 540 920","M 780 100 L 780 940","M 1108 110 L 1108 760","M 70 170 L 70 900","M 1460 80 L 1460 820","M 250 508 L 250 900","M 498 748 L 498 960"].join(" ");
  const fillOf = { hall:"var(--map-hall)", aux:"var(--map-bldg-2)", office:"var(--map-office)", solar:"var(--map-solar)", shed:"var(--map-shed)" };
  const buildings = DATA.BUILDINGS.map(b => {
    const dim = state.zone && b.zone!==state.zone;
    return '<rect x="'+b.x+'" y="'+b.y+'" width="'+b.w+'" height="'+b.h+'" rx="'+(b.rx||3)+'" fill="'+(fillOf[b.variant]||"var(--map-bldg)")+'" stroke="var(--map-stroke)" stroke-width="1.3" opacity="'+(dim?0.28:1)+'"/>';
  }).join("");
  const tanks = DATA.TANKS.map(t => {
    const dim = state.zone && t.zone!==state.zone;
    return '<g opacity="'+(dim?0.28:1)+'"><circle cx="'+t.cx+'" cy="'+t.cy+'" r="'+t.r+'" fill="var(--map-tank)" stroke="var(--map-stroke)" stroke-width="1.3"/></g>';
  }).join("");
  const labels = DATA.ZONE_LABELS.map(l => '<g data-zone-label="'+l.id+'" style="cursor:pointer"><text x="'+l.x+'" y="'+l.y+'" fill="var(--fg)" font-size="15" font-weight="600">'+l.name+'</text></g>').join("");
  const hits = DATA.ZONE_HITS.map(z => '<path d="'+z.d+'" fill="var(--accent)" fill-opacity="'+(state.zone===z.id?0.1:0)+'" style="pointer-events:all;cursor:pointer" data-zone="'+z.id+'"/>').join("");
  const markers = DATA.EQUIPMENT.map(eq => {
    const sel = eq.id===state.selectedId;
    const dim = !ids.has(eq.id);
    const r = sel?16:13;
    const stroke = STATUS_COLOR[eq.status];
    const name = sel ? '<text y="'+(r+16)+'" text-anchor="middle" fill="var(--fg)" font-size="11" font-weight="600">'+eq.name+'</text>' : '';
    return '<g class="marker" data-eq="'+eq.id+'" transform="translate('+eq.x+','+eq.y+')" opacity="'+(dim?0.22:1)+'"><circle r="'+r+'" fill="var(--surface)" stroke="'+stroke+'" stroke-width="1.6"/><g transform="translate(-7,-7)" style="color:'+TYPE_COLOR[eq.type]+'">'+glyph(eq.type,14)+'</g>'+name+'</g>';
  }).join("");
  return '<svg class="map" viewBox="0 0 '+DATA.MAP_W+' '+DATA.MAP_H+'"><rect width="'+DATA.MAP_W+'" height="'+DATA.MAP_H+'" fill="var(--bg-deep)"/><path d="'+roads+'" fill="none" stroke="var(--map-road)" stroke-width="22" stroke-linecap="round"/>'+buildings+tanks+hits+labels+markers+'</svg>';
}
