function popupHtml(){
  const eq = DATA.EQUIPMENT.find(e=>e.id===state.selectedId);
  if(!eq) return "";
  const a = eq.archive;
  const values = eq.params.map((p,i)=>liveValue(p, state.tick, hash(eq.id)+i));
  const rows = [["设备ID",eq.id],["型号",a.model],["投用日期",a.installDate],["下次检验",a.nextInspect],["登记编号",a.registerNo],["部门",a.dept]];
  const params = eq.params.map((p,i)=>'<div class="row"><span class="muted">'+p.label+'</span><span class="v">'+values[i]+' '+p.unit+'</span></div>').join("");
  return '<section class="panel popup" data-stop="1"><div class="pop-head"><div><b>'+eq.name+'</b> <span class="badge '+eq.status+'">'+(STATUS_LABEL[eq.status]||eq.status)+'</span><div class="muted" style="font-size:12px">'+eq.id+' · '+(TYPE_LABEL[eq.type]||eq.type)+' · '+(ZONE_NAME[eq.zoneId]||eq.zoneId)+'</div></div><button class="xbtn" data-close>✕</button></div><div class="pop-grid"><div class="pop-col"><h3 class="ptitle">一机一档</h3><dl class="dl">'+rows.map(function(r){return '<dt>'+r[0]+'</dt><dd>'+r[1]+'</dd>';}).join('')+'</dl></div><div class="pop-col"><h3 class="ptitle">实时监测</h3>'+params+'</div></div></section>';
}
function alarms(){
  const items = DATA.ALARMS.map(function(a){
    return '<li><button data-eq="'+a.equipmentId+'"><span class="tag '+a.level+'">'+(a.level==="alarm"?"严重":"预警")+'</span> <span>'+a.message+'</span></button></li>';
  }).join("");
  return '<section class="panel pbody flex1"><h2 class="ptitle">实时报警</h2><ul class="alarm-list">'+items+'</ul></section>';
}
function pie(){
  const total = DATA.EQUIPMENT.length;
  const items = DATA.STATUSES.map(function(s){return {id:s.id,name:s.label,value:DATA.EQUIPMENT.filter(function(e){return e.status===s.id;}).length};}).filter(function(d){return d.value;});
  const list = items.map(function(d){return '<li><button data-status="'+d.id+'"><span class="dot" style="color:'+STATUS_COLOR[d.id]+'"></span> '+d.name+' '+d.value+'</button></li>';}).join("");
  return '<section class="panel pbody"><h2 class="ptitle">设备状态分布</h2><div>共 '+total+'台</div><ul class="legend-list">'+list+'</ul></section>';
}
function render(){
  const n=new Date();
  const clock=n.getFullYear()+'-'+pad(n.getMonth()+1)+'-'+pad(n.getDate())+' '+pad(n.getHours())+':'+pad(n.getMinutes())+' '+WEEK[n.getDay()];
  const alarm=DATA.EQUIPMENT.filter(function(e){return e.status==="alarm";}).length;
  const warn=DATA.EQUIPMENT.filter(function(e){return e.status==="warning";}).length;
  const inspect=DATA.EQUIPMENT.filter(function(e){return e.status==="inspect";}).length;
  const types=[{id:"all",label:"全部设备"}].concat(DATA.EQUIPMENT_TYPES.map(function(t){return {id:t.id,label:t.label};}));
  const statuses=[{id:"all",label:"全部状态"}].concat(DATA.STATUSES.map(function(s){return {id:s.id,label:s.label};}));
  const chips=types.map(function(t){return '<button class="chip '+(state.typeFilter===t.id?"on":"")+'" data-type="'+t.id+'">'+t.label+'</button>';}).join("")+statuses.map(function(s){return '<button class="chip '+(state.statusFilter===s.id?"on":"")+'" data-status="'+s.id+'">'+s.label+'</button>';}).join("");
  document.getElementById("app").innerHTML = '<header><div class="rule"></div><div><h1>紫金铜业特种设备指挥大屏</h1><p class="sub">特种设备安全监控 · 一机一档 · 实时监测</p></div><div class="rule rev"></div><div class="meta"><span class="muted">设备 <b style="color:var(--fg)">'+DATA.EQUIPMENT.length+'</b></span><span class="alarmc">报警 <b>'+alarm+'</b></span><span class="warnc">预警 <b>'+warn+'</b></span><span class="infoc">待检 <b>'+inspect+'</b></span><span class="clock">'+clock+'</span></div></header><div class="layout"><aside>'+pie()+'</aside><main><div class="panel map-wrap"><div class="chips">'+chips+'</div><div class="map-stage">'+mapSvg()+popupHtml()+'</div></div></main><aside class="right">'+alarms()+'</aside></div>';
  bind();
}
function bind(){
  document.querySelectorAll("[data-type]").forEach(function(el){el.addEventListener("click",function(){state.typeFilter=el.getAttribute("data-type");render();});});
  document.querySelectorAll("[data-status]").forEach(function(el){el.addEventListener("click",function(){state.statusFilter=el.getAttribute("data-status");render();});});
  document.querySelectorAll("[data-eq]").forEach(function(el){el.addEventListener("click",function(e){e.stopPropagation();state.selectedId=el.getAttribute("data-eq");state.tab="both";render();});});
  document.querySelectorAll("[data-zone]").forEach(function(el){el.addEventListener("click",function(e){e.stopPropagation();var z=el.getAttribute("data-zone");state.zone=state.zone===z?null:z;render();});});
  document.querySelectorAll("[data-zone-label]").forEach(function(el){el.addEventListener("click",function(e){e.stopPropagation();var z=el.getAttribute("data-zone-label");state.zone=state.zone===z?null:z;render();});});
  document.querySelectorAll("[data-close]").forEach(function(el){el.addEventListener("click",function(e){e.stopPropagation();state.selectedId=null;render();});});
}
document.addEventListener("keydown", function(e){ if(e.key==="Escape"){ state.selectedId=null; render(); } });
render();
setInterval(function(){ state.tick++; if(DATA.EQUIPMENT.find(function(e){return e.id===state.selectedId;})) render(); }, 1800);
