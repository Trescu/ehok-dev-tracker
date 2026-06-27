const STORAGE_KEY = 'ehokDevTrackerEmptyV7';
const AUTH_STORAGE_KEY = 'ehokDevTrackerSessionToken';
const SERVER_BASELINE_KEY = 'ehokDevTrackerServerBaselineCsv';
const AREAS = ['Tracker','Planning','Design','Frontend','Backend','Database','Security','Testing','Documentation','DevOps','UX','Accessibility','Refactor','Bugfix'];
const STATUSES = ['Backlog','To Do','In Progress','Review','Done','Blocked'];
const SPRINT_STATUSES = ['Tervezett','Folyamatban','Review','Kész','Blokkolt'];
const PRIORITIES = ['Alacsony','Közepes','Magas','Kritikus'];

const emptyState = { sprints:[], tasks:[], milestones:[], notes:[] };
let state = load();
let modalContext = null;

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`);
const now = () => new Date().toISOString();
const esc = (v='') => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

function load(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || structuredClone(emptyState); }
  catch { return structuredClone(emptyState); }
}
function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderAll();
}
function sprintById(id){ return state.sprints.find(s => s.id === id); }
function sprintName(id){ const s=sprintById(id); return s ? `${s.code ? s.code+' – ' : ''}${s.title}` : 'Nincs sprint'; }
function tasksForSprint(id){ return state.tasks.filter(t => t.sprintId === id); }
function doneCount(tasks){ return tasks.filter(t => t.status === 'Done').length; }
function percent(tasks){ return tasks.length ? Math.round(doneCount(tasks)/tasks.length*100) : 0; }
function badgeClass(v=''){
  const x=String(v).toLowerCase();
  if(x.includes('done')||x.includes('kész')) return 'done';
  if(x.includes('blocked')||x.includes('blokkol')||x.includes('kritikus')) return 'blocked critical';
  if(x.includes('progress')||x.includes('folyamat')||x.includes('review')) return 'progressing';
  return '';
}
function fmtDate(v){ return v || 'Nincs dátum'; }

function setView(view){
  $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  $$('.view').forEach(v => v.classList.toggle('active-view', v.id === view));
  const btn = $(`.nav-item[data-view="${view}"]`);
  if(btn) $('#pageTitle').textContent = btn.textContent;
  window.scrollTo({top:0, behavior:'smooth'});
}
$$('.nav-item').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));
$$('[data-jump]').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.jump)));

function renderDashboard(){
  const total = state.tasks.length;
  const done = state.tasks.filter(t=>t.status==='Done').length;
  const blocked = state.tasks.filter(t=>t.status==='Blocked').length;
  $('#statSprints').textContent = state.sprints.length;
  $('#statTasks').textContent = total;
  $('#statDone').textContent = done;
  $('#statBlocked').textContent = blocked;
  const allPercent = total ? Math.round(done/total*100) : 0;
  $('#overallPill').textContent = `${allPercent}%`;
  $('#overallBar').style.width = `${allPercent}%`;

  $('#areaProgress').innerHTML = AREAS.map(area => {
    const list = state.tasks.filter(t=>t.area===area);
    const p = percent(list);
    return `<div class="area-row"><span>${area}</span><div class="progress"><div style="width:${p}%"></div></div><strong>${doneCount(list)}/${list.length}</strong></div>`;
  }).join('');

  const active = state.sprints.filter(s => ['Folyamatban','Review'].includes(s.status)).slice(0,4);
  $('#activeSprints').innerHTML = active.length ? active.map(renderSmallSprint).join('') : `<div class="empty">Nincs aktív sprint.</div>`;

  const upcoming = state.tasks.filter(t=>!['Done'].includes(t.status)).slice(0,5);
  $('#upcomingTasks').innerHTML = upcoming.length ? upcoming.map(t => `<article class="item-card"><div class="item-title">${esc(t.title)}</div><div class="meta">${esc(sprintName(t.sprintId))} · ${esc(t.area)} · ${esc(t.status)}</div></article>`).join('') : `<div class="empty">Nincs nyitott feladat.</div>`;

  $('#dashboardMilestones').innerHTML = state.milestones.slice(0,5).map(renderSmallMilestone).join('') || `<div class="empty">Nincs mérföldkő.</div>`;
}

function renderSmallSprint(s){
  const ts = tasksForSprint(s.id);
  const p = percent(ts);
  return `<article class="item-card">
    <div class="item-title">${esc(s.code ? s.code+' – ' : '')}${esc(s.title)}</div>
    <div class="meta">${fmtDate(s.startDate)} → ${fmtDate(s.endDate)}</div>
    ${s.description ? `<p class="meta">${esc(s.description)}</p>` : ''}
    <div class="progress" style="margin-top:12px"><div style="width:${p}%"></div></div>
    <div class="badges"><span class="badge ${badgeClass(s.status)}">${esc(s.status)}</span><span class="badge">${doneCount(ts)}/${ts.length} kész</span></div>
  </article>`;
}
function renderSmallMilestone(m){
  return `<article class="item-card"><div class="item-title">${esc(m.title)}</div><div class="meta">${fmtDate(m.dueDate)}</div><div class="badges"><span class="badge ${badgeClass(m.status)}">${esc(m.status)}</span></div></article>`;
}

function renderSprints(){
  const q = ($('#sprintSearch')?.value || '').toLowerCase();
  const list = state.sprints.filter(s => [s.title,s.code,s.status,s.description].some(v => String(v||'').toLowerCase().includes(q)));
  $('#sprintList').innerHTML = list.length ? list.map(renderSprint).join('') : `<div class="empty">Még nincs sprint. Importálj CSV-t vagy hozz létre egy új sprintet.</div>`;
}
function renderSprint(s){
  const ts = tasksForSprint(s.id);
  const p = percent(ts);
  const sprintAreas = [...new Set([...AREAS, ...ts.map(t => t.area || 'Planning')])];
  const groups = sprintAreas.map(area => {
    const items = ts.filter(t => (t.area || 'Planning') === area);
    if(!items.length) return '';
    return `<div class="task-group"><h3>${esc(area)}</h3>${items.map(renderInlineTask).join('')}</div>`;
  }).join('');
  return `<article class="sprint-card" data-sprint-id="${esc(s.id)}">
    <div class="sprint-summary">
      <button class="chevron" data-toggle-sprint="${esc(s.id)}" aria-label="Sprint lenyitása"><span class="chevron-icon" aria-hidden="true"></span></button>
      <div>
        <div class="item-title">${esc(s.code ? s.code+' – ' : '')}${esc(s.title)}</div>
        <div class="meta">${fmtDate(s.startDate)} → ${fmtDate(s.endDate)} · ${ts.length} feladat</div>
        ${s.description ? `<p class="meta">${esc(s.description)}</p>` : ''}
        <div class="progress" style="margin-top:12px"><div style="width:${p}%"></div></div>
      </div>
      <div class="sprint-actions">
        <span class="badge ${badgeClass(s.status)}">${esc(s.status)}</span>
        <span class="badge">${doneCount(ts)}/${ts.length} kész</span>
        <span class="badge">${p}%</span>
        <button class="secondary-btn" data-edit-sprint="${esc(s.id)}">Szerkesztés</button>
        <button class="danger-btn" data-delete-sprint="${esc(s.id)}">Törlés</button>
      </div>
    </div>
    <div class="sprint-details">
      <div class="card-actions" style="justify-content:flex-start;margin-bottom:14px">
        <button class="primary-btn" data-new-task-for-sprint="${esc(s.id)}">Új feladat ehhez</button>
      </div>
      ${groups || `<div class="empty">Ebben a sprintben még nincs feladat.</div>`}
    </div>
  </article>`;
}
function renderInlineTask(t){
  return `<div class="task-inline">
    <div>
      <div class="item-title">${esc(t.title)}</div>
      ${t.description ? `<p>${esc(t.description)}</p>` : ''}
      <div class="badges"><span class="badge ${badgeClass(t.status)}">${esc(t.status)}</span><span class="badge ${badgeClass(t.priority)}">${esc(t.priority)}</span>${t.tags ? `<span class="badge">${esc(t.tags)}</span>` : ''}</div>
    </div>
    <div class="task-actions">
      <select data-task-status="${esc(t.id)}">${STATUSES.map(s=>`<option ${s===t.status?'selected':''}>${s}</option>`).join('')}</select>
      <button class="secondary-btn" data-edit-task="${esc(t.id)}">Szerkesztés</button>
      <button class="danger-btn" data-delete-task="${esc(t.id)}">Törlés</button>
    </div>
  </div>`;
}

function renderTasks(){
  const q = ($('#taskSearch')?.value || '').toLowerCase();
  const area = $('#taskAreaFilter')?.value || '';
  const status = $('#taskStatusFilter')?.value || '';
  let list = state.tasks.filter(t => [t.title,t.description,t.area,t.status,t.priority,t.tags,sprintName(t.sprintId)].some(v => String(v||'').toLowerCase().includes(q)));
  if(area) list = list.filter(t=>t.area===area);
  if(status) list = list.filter(t=>t.status===status);
  $('#taskList').innerHTML = list.length ? list.map(renderTaskCard).join('') : `<div class="empty">Nincs feladat.</div>`;
}
function renderTaskCard(t){
  return `<article class="task-card">
    <div>
      <div class="item-title">${esc(t.title)}</div>
      ${t.description ? `<p>${esc(t.description)}</p>` : ''}
      <div class="badges"><span class="badge">${esc(sprintName(t.sprintId))}</span><span class="badge">${esc(t.area)}</span><span class="badge ${badgeClass(t.status)}">${esc(t.status)}</span><span class="badge ${badgeClass(t.priority)}">${esc(t.priority)}</span></div>
    </div>
    <div class="task-actions">
      <select data-task-status="${esc(t.id)}">${STATUSES.map(s=>`<option ${s===t.status?'selected':''}>${s}</option>`).join('')}</select>
      <button class="secondary-btn" data-edit-task="${esc(t.id)}">Szerkesztés</button>
      <button class="danger-btn" data-delete-task="${esc(t.id)}">Törlés</button>
    </div>
  </article>`;
}
function renderMilestones(){
  const q = ($('#milestoneSearch')?.value || '').toLowerCase();
  const list = state.milestones.filter(m => [m.title,m.description,m.status,m.dueDate].some(v=>String(v||'').toLowerCase().includes(q)));
  $('#milestoneList').innerHTML = list.length ? list.map(m => `<article class="item-card">
    <div class="item-title">${esc(m.title)}</div>
    ${m.description ? `<p class="meta">${esc(m.description)}</p>` : ''}
    <div class="badges"><span class="badge ${badgeClass(m.status)}">${esc(m.status)}</span><span class="badge">${fmtDate(m.dueDate)}</span></div>
    <div class="card-actions"><button class="secondary-btn" data-edit-milestone="${esc(m.id)}">Szerkesztés</button><button class="danger-btn" data-delete-milestone="${esc(m.id)}">Törlés</button></div>
  </article>`).join('') : `<div class="empty">Nincs mérföldkő.</div>`;
}
function renderNotes(){
  const q = ($('#noteSearch')?.value || '').toLowerCase();
  const list = state.notes.filter(n => [n.title,n.body,n.tags].some(v=>String(v||'').toLowerCase().includes(q)));
  $('#noteList').innerHTML = list.length ? list.map(n => `<article class="item-card">
    <div class="item-title">${esc(n.title)}</div>
    <div class="meta">${fmtDate(n.createdAt?.slice(0,10))}${n.tags ? ' · '+esc(n.tags) : ''}</div>
    ${n.body ? `<p class="meta">${esc(n.body)}</p>` : ''}
    <div class="card-actions"><button class="secondary-btn" data-edit-note="${esc(n.id)}">Szerkesztés</button><button class="danger-btn" data-delete-note="${esc(n.id)}">Törlés</button></div>
  </article>`).join('') : `<div class="empty">Nincs jegyzet.</div>`;
}
function renderFilters(){
  $('#taskAreaFilter').innerHTML = `<option value="">Minden terület</option>` + AREAS.map(a=>`<option>${a}</option>`).join('');
  $('#taskStatusFilter').innerHTML = `<option value="">Minden állapot</option>` + STATUSES.map(s=>`<option>${s}</option>`).join('');
}
function renderAll(){ renderDashboard(); renderSprints(); renderTasks(); renderMilestones(); renderNotes(); }

function openModal(type, id=null, extra={}){
  modalContext = {type,id,extra};
  const titles = {sprint:'Sprint szerkesztése', task:'Feladat szerkesztése', milestone:'Mérföldkő szerkesztése', note:'Jegyzet szerkesztése'};
  $('#modalTitle').textContent = id ? titles[type] : ({sprint:'Új sprint',task:'Új feladat',milestone:'Új mérföldkő',note:'Új jegyzet'}[type]);
  $('#modalForm').innerHTML = formHtml(type, id, extra);
  $('#modalBackdrop').hidden = false;
}
function closeModal(){ $('#modalBackdrop').hidden = true; modalContext=null; $('#modalForm').innerHTML=''; }
$('#modalClose').addEventListener('click', closeModal);
$('#modalBackdrop').addEventListener('click', e => { if(e.target.id === 'modalBackdrop') closeModal(); });
$$('[data-open-modal]').forEach(b => b.addEventListener('click', () => openModal(b.dataset.openModal)));

function formHtml(type, id, extra){
  if(type==='sprint'){
    const s = state.sprints.find(x=>x.id===id) || {code:'',title:'',description:'',startDate:'',endDate:'',status:'Tervezett'};
    return `<div class="form-row"><div class="form-field"><label>Kód</label><input name="code" value="${esc(s.code)}" placeholder="PC-00"></div><div class="form-field"><label>Állapot</label><select name="status">${SPRINT_STATUSES.map(x=>`<option ${x===s.status?'selected':''}>${x}</option>`).join('')}</select></div></div>
    <div class="form-field"><label>Cím</label><input name="title" value="${esc(s.title)}" required></div>
    <div class="form-row"><div class="form-field"><label>Kezdés</label><input type="date" name="startDate" value="${esc(s.startDate)}"></div><div class="form-field"><label>Vége</label><input type="date" name="endDate" value="${esc(s.endDate)}"></div></div>
    <div class="form-field"><label>Leírás</label><textarea name="description">${esc(s.description)}</textarea></div>${formButtons()}`;
  }
  if(type==='task'){
    const t = state.tasks.find(x=>x.id===id) || {title:'',description:'',sprintId:extra.sprintId||'',area:'Planning',status:'Backlog',priority:'Közepes',dueDate:'',estimateHours:'',tags:'',notes:''};
    return `<div class="form-field"><label>Cím</label><input name="title" value="${esc(t.title)}" required></div>
    <div class="form-field"><label>Leírás</label><textarea name="description">${esc(t.description)}</textarea></div>
    <div class="form-row"><div class="form-field"><label>Sprint</label><select name="sprintId"><option value="">Nincs sprint</option>${state.sprints.map(s=>`<option value="${esc(s.id)}" ${s.id===t.sprintId?'selected':''}>${esc(s.code ? s.code+' – ' : '')}${esc(s.title)}</option>`).join('')}</select></div><div class="form-field"><label>Terület</label><select name="area">${AREAS.map(a=>`<option ${a===t.area?'selected':''}>${a}</option>`).join('')}</select></div></div>
    <div class="form-row"><div class="form-field"><label>Állapot</label><select name="status">${STATUSES.map(s=>`<option ${s===t.status?'selected':''}>${s}</option>`).join('')}</select></div><div class="form-field"><label>Prioritás</label><select name="priority">${PRIORITIES.map(p=>`<option ${p===t.priority?'selected':''}>${p}</option>`).join('')}</select></div></div>
    <div class="form-row"><div class="form-field"><label>Határidő</label><input type="date" name="dueDate" value="${esc(t.dueDate)}"></div><div class="form-field"><label>Becsült óra</label><input type="number" step="0.5" name="estimateHours" value="${esc(t.estimateHours)}"></div></div>
    <div class="form-field"><label>Címkék</label><input name="tags" value="${esc(t.tags)}" placeholder="figma, responsive, api"></div>
    <div class="form-field"><label>Jegyzet</label><textarea name="notes">${esc(t.notes)}</textarea></div>${formButtons()}`;
  }
  if(type==='milestone'){
    const m = state.milestones.find(x=>x.id===id) || {title:'',description:'',dueDate:'',status:'Tervezett'};
    return `<div class="form-field"><label>Cím</label><input name="title" value="${esc(m.title)}" required></div>
    <div class="form-field"><label>Leírás</label><textarea name="description">${esc(m.description)}</textarea></div>
    <div class="form-row"><div class="form-field"><label>Dátum</label><input type="date" name="dueDate" value="${esc(m.dueDate)}"></div><div class="form-field"><label>Állapot</label><select name="status">${SPRINT_STATUSES.map(s=>`<option ${s===m.status?'selected':''}>${s}</option>`).join('')}</select></div></div>${formButtons()}`;
  }
  const n = state.notes.find(x=>x.id===id) || {title:'',body:'',tags:''};
  return `<div class="form-field"><label>Cím</label><input name="title" value="${esc(n.title)}" required></div>
  <div class="form-field"><label>Jegyzet</label><textarea name="body">${esc(n.body)}</textarea></div>
  <div class="form-field"><label>Címkék</label><input name="tags" value="${esc(n.tags)}"></div>${formButtons()}`;
}
function formButtons(){ return `<div class="form-actions"><button type="button" class="secondary-btn" id="cancelModal">Mégse</button><button type="submit" class="primary-btn">Mentés</button></div>`; }

$('#modalForm').addEventListener('click', e => { if(e.target.id === 'cancelModal') closeModal(); });
$('#modalForm').addEventListener('submit', e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  const {type,id} = modalContext;
  const collection = type === 'sprint' ? 'sprints' : type === 'task' ? 'tasks' : type === 'milestone' ? 'milestones' : 'notes';
  if(id){
    state[collection] = state[collection].map(x => x.id === id ? {...x, ...data, updatedAt:now()} : x);
  } else {
    state[collection].push({id:uid(), ...data, createdAt:now(), updatedAt:now()});
  }
  closeModal(); save();
});

document.addEventListener('click', e => {
  const t=e.target;
  const sprintCard = t.closest?.('.sprint-card');
  const toggleBtn = t.closest?.('[data-toggle-sprint]');
  const summary = t.closest?.('.sprint-summary');
  if(toggleBtn && sprintCard){ sprintCard.classList.toggle('open'); return; }
  if(summary && sprintCard && !t.closest?.('.sprint-actions, button, select, input, textarea, a, label')){
    sprintCard.classList.toggle('open');
    return;
  }
  if(t.dataset.newTaskForSprint) openModal('task', null, {sprintId:t.dataset.newTaskForSprint});
  if(t.dataset.editSprint) openModal('sprint', t.dataset.editSprint);
  if(t.dataset.editTask) openModal('task', t.dataset.editTask);
  if(t.dataset.editMilestone) openModal('milestone', t.dataset.editMilestone);
  if(t.dataset.editNote) openModal('note', t.dataset.editNote);
  if(t.dataset.deleteSprint && confirm('Törlöd a sprintet? A feladatok sprint nélkül maradnak.')){
    const id=t.dataset.deleteSprint; state.sprints=state.sprints.filter(x=>x.id!==id); state.tasks=state.tasks.map(task=>task.sprintId===id?{...task,sprintId:'',updatedAt:now()}:task); save();
  }
  if(t.dataset.deleteTask && confirm('Törlöd a feladatot?')){ state.tasks=state.tasks.filter(x=>x.id!==t.dataset.deleteTask); save(); }
  if(t.dataset.deleteMilestone && confirm('Törlöd a mérföldkövet?')){ state.milestones=state.milestones.filter(x=>x.id!==t.dataset.deleteMilestone); save(); }
  if(t.dataset.deleteNote && confirm('Törlöd a jegyzetet?')){ state.notes=state.notes.filter(x=>x.id!==t.dataset.deleteNote); save(); }
});
document.addEventListener('change', e => {
  if(e.target.dataset.taskStatus){
    const id=e.target.dataset.taskStatus;
    state.tasks=state.tasks.map(t=>t.id===id?{...t,status:e.target.value,updatedAt:now()}:t);
    save();
  }
});
['sprintSearch','taskSearch','taskAreaFilter','taskStatusFilter','milestoneSearch','noteSearch'].forEach(id => {
  document.addEventListener('input', e => { if(e.target.id===id) renderAll(); });
  document.addEventListener('change', e => { if(e.target.id===id) renderAll(); });
});

function csvEscape(v=''){
  v=String(v ?? '').replace(/\r?\n/g,'\\n');
  return /[",;]/.test(v) ? `"${v.replace(/"/g,'""')}"` : v;
}
function makeCsv(){
  const header = ['type','id','code','title','description','status','priority','area','sprintId','sprintCode','startDate','endDate','dueDate','estimateHours','tags','notes','body','createdAt','updatedAt'];
  const rows=[header];
  state.sprints.forEach(s => rows.push(['sprint',s.id,s.code,s.title,s.description,s.status,'','','','',s.startDate,s.endDate,'','','','','',s.createdAt,s.updatedAt]));
  state.tasks.forEach(t => rows.push(['task',t.id,'',t.title,t.description,t.status,t.priority,t.area,t.sprintId,sprintById(t.sprintId)?.code || '','','',t.dueDate,t.estimateHours,t.tags,t.notes,'',t.createdAt,t.updatedAt]));
  state.milestones.forEach(m => rows.push(['milestone',m.id,'',m.title,m.description,m.status,'','','','','','',m.dueDate,'','','','',m.createdAt,m.updatedAt]));
  state.notes.forEach(n => rows.push(['note',n.id,'',n.title,'','','','','','','','','','',n.tags,'',n.body,n.createdAt,n.updatedAt]));
  return rows.map(r => r.map(csvEscape).join(';')).join('\n');
}
function detectDelimiter(text){
  const firstLine = String(text || '').split(/\r?\n/)[0] || '';
  const semicolons = (firstLine.match(/;/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  return semicolons >= commas ? ';' : ',';
}
function parseCsv(text){
  const delimiter = detectDelimiter(text);
  const rows=[]; let row=[], cell='', q=false;
  for(let i=0;i<text.length;i++){
    const c=text[i], n=text[i+1];
    if(q && c==='"' && n==='"'){ cell+='"'; i++; continue; }
    if(c==='"'){ q=!q; continue; }
    if(!q && c===delimiter){ row.push(cell.replaceAll('\\n','\n')); cell=''; continue; }
    if(!q && (c==='\n' || c==='\r')){ if(c==='\r' && n==='\n') i++; row.push(cell.replaceAll('\\n','\n')); rows.push(row); row=[]; cell=''; continue; }
    cell+=c;
  }
  row.push(cell.replaceAll('\\n','\n')); rows.push(row);
  return rows.filter(r => r.some(x=>String(x).trim()!==''));
}
function importCsv(text){
  const rows=parseCsv(text);
  if(!rows.length) return structuredClone(emptyState);
  const head=rows.shift().map(h=>h.trim());
  const get=(r,k)=>r[head.indexOf(k)] ?? '';
  const next=structuredClone(emptyState);
  const pendingTasks=[];
  rows.forEach(r => {
    const type=get(r,'type');
    if(type==='sprint') next.sprints.push({id:get(r,'id')||uid(), code:get(r,'code'), title:get(r,'title'), description:get(r,'description'), status:get(r,'status')||'Tervezett', startDate:get(r,'startDate'), endDate:get(r,'endDate'), createdAt:get(r,'createdAt')||now(), updatedAt:get(r,'updatedAt')||now()});
    if(type==='task') pendingTasks.push(r);
    if(type==='milestone') next.milestones.push({id:get(r,'id')||uid(), title:get(r,'title'), description:get(r,'description'), status:get(r,'status')||'Tervezett', dueDate:get(r,'dueDate'), createdAt:get(r,'createdAt')||now(), updatedAt:get(r,'updatedAt')||now()});
    if(type==='note') next.notes.push({id:get(r,'id')||uid(), title:get(r,'title'), body:get(r,'body'), tags:get(r,'tags'), createdAt:get(r,'createdAt')||now(), updatedAt:get(r,'updatedAt')||now()});
  });
  pendingTasks.forEach(r => {
    let sprintId=get(r,'sprintId');
    if(!sprintId && get(r,'sprintCode')) sprintId = next.sprints.find(s=>s.code===get(r,'sprintCode'))?.id || '';
    next.tasks.push({id:get(r,'id')||uid(), title:get(r,'title'), description:get(r,'description'), status:get(r,'status')||'Backlog', priority:get(r,'priority')||'Közepes', area:get(r,'area')||'Planning', sprintId, dueDate:get(r,'dueDate'), estimateHours:get(r,'estimateHours'), tags:get(r,'tags'), notes:get(r,'notes'), createdAt:get(r,'createdAt')||now(), updatedAt:get(r,'updatedAt')||now()});
  });
  return next;
}
$('#exportBtn').addEventListener('click', () => {
  const blob=new Blob([makeCsv()],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='ehok-dev-tracker-export.csv'; a.click(); URL.revokeObjectURL(a.href);
});
$('#importInput').addEventListener('change', e => {
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      captureLocalBaselineIfMissing();
      state=importCsv(reader.result);
      save();
      alert('Importálás kész. A szerveren mentett állapotot a „Változtatások elvetése” gombbal tudod visszahozni.');
    } catch(err){
      console.error(err);
      alert('Hibás CSV fájl.');
    } finally {
      e.target.value = '';
    }
  };
  reader.readAsText(file);
});
$('#resetBtn').addEventListener('click', () => {
  if(confirm('Biztosan törlöd az összes helyi adatot? A szerveren mentett CSV nem törlődik.')){
    captureLocalBaselineIfMissing();
    state=structuredClone(emptyState); save();
  }
});


// Password gate + GitHub CSV sync via Vercel Functions
function getSessionToken(){
  return localStorage.getItem(AUTH_STORAGE_KEY) || '';
}
function setSessionToken(value){
  if(value) localStorage.setItem(AUTH_STORAGE_KEY, value);
  else localStorage.removeItem(AUTH_STORAGE_KEY);
}
function authHeaders(extra={}){
  const token = getSessionToken();
  return {
    'Accept':'application/json',
    ...(token ? {'Authorization': `Bearer ${token}`} : {}),
    ...extra
  };
}
async function loginWithPassword(password){
  const response = await fetch('/api/auth-check', {
    method:'POST',
    headers:{'Accept':'application/json', 'Content-Type':'application/json'},
    body: JSON.stringify({password})
  });
  const payload = await response.json().catch(() => ({}));
  if(!response.ok || payload.ok === false || !payload.token){
    throw new Error(payload.error || 'Hibás jelszó.');
  }
  return payload.token;
}
async function verifySession(){
  const response = await fetch('/api/auth-check', {
    method:'GET',
    headers: authHeaders()
  });
  const payload = await response.json().catch(() => ({}));
  if(!response.ok || payload.ok === false){
    throw new Error(payload.error || 'Lejárt munkamenet.');
  }
  return true;
}
function lockApp(message=''){
  document.body.classList.add('auth-locked');
  const input = $('#authPassword');
  const error = $('#authError');
  if(input) input.value = '';
  if(error){
    error.hidden = !message;
    error.textContent = message;
  }
}
function unlockApp(){
  document.body.classList.remove('auth-locked');
  renderFilters();
  renderAll();
}
async function attemptLogin(password){
  const error = $('#authError');
  const submit = $('#authSubmit');
  if(error){ error.hidden = true; error.textContent = ''; }
  if(submit){ submit.disabled = true; submit.textContent = 'Ellenőrzés...'; }
  try{
    const cleaned = String(password || '').trim();
    if(!cleaned) throw new Error('Add meg az admin jelszót.');
    const token = await loginWithPassword(cleaned);
    setSessionToken(token);
    unlockApp();
  }catch(err){
    setSessionToken('');
    lockApp(err.message || 'Sikertelen belépés.');
  }finally{
    if(submit){ submit.disabled = false; submit.textContent = 'Belépés'; }
  }
}
async function bootAuth(){
  const saved = getSessionToken();
  if(saved){
    try{
      await verifySession();
      unlockApp();
      return;
    }catch{
      setSessionToken('');
    }
  }
  lockApp('');
}
$('#authForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  attemptLogin($('#authPassword')?.value || '');
});

async function remoteJson(url, options={}){
  const headers = authHeaders(options.headers || {});
  const response = await fetch(url, {...options, headers});
  const payload = await response.json().catch(() => ({}));
  if(!response.ok || payload.ok === false){
    if(response.status === 401){
      setSessionToken('');
      lockApp('A munkamenet lejárt vagy hibás. Jelentkezz be újra.');
      throw new Error('Lejárt vagy hiányzó munkamenet.');
    }
    throw new Error(payload.error || `Sikertelen kérés: ${response.status}`);
  }
  return payload;
}
function setServerBaselineCsv(csv){
  if(typeof csv === 'string') localStorage.setItem(SERVER_BASELINE_KEY, csv);
}
function getServerBaselineCsv(){
  return localStorage.getItem(SERVER_BASELINE_KEY) || '';
}
function captureLocalBaselineIfMissing(){
  if(!getServerBaselineCsv()) setServerBaselineCsv(makeCsv());
}
async function loadFromGitHub(){
  try{
    const payload = await remoteJson('/api/load-tracker-csv');
    if(payload.missing || !payload.csv?.trim()){
      if(confirm('A szerveren még üres vagy nem létezik a CSV. Feltöltöd a jelenlegi helyi állapotot?')){
        await saveToGitHub();
      }
      return;
    }
    setServerBaselineCsv(payload.csv);
    state = importCsv(payload.csv);
    save();
    alert('Adatok betöltve szerverről.');
  }catch(err){
    console.error(err);
    alert(`Szerverről betöltés sikertelen: ${err.message}`);
  }
}
async function saveToGitHub(){
  try{
    const csv = makeCsv();
    const payload = await remoteJson('/api/save-tracker-csv', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({csv, message:`Update eHÖK dev tracker CSV - ${new Date().toISOString()}`})
    });
    setServerBaselineCsv(csv);
    alert(`Változtatások mentve.${payload.backup ? '\nElőző szerverállapot ideiglenes mentésbe került.' : ''}${payload.commit ? '\nCommit: '+payload.commit.slice(0,7) : ''}`);
  }catch(err){
    console.error(err);
    alert(`Mentés sikertelen: ${err.message}`);
  }
}
async function discardChanges(){
  try{
    if(!confirm('Elveted a változtatásokat? Ha van ideiglenes szervermentés, az előző fő CSV kerül visszaállításra.')) return;
    let csv = '';
    let restoredBackup = false;

    try{
      const restored = await remoteJson('/api/restore-tracker-backup', { method:'POST' });
      if(restored.csv?.trim()){
        csv = restored.csv;
        restoredBackup = true;
      }
    }catch(restoreErr){
      const payload = await remoteJson('/api/load-tracker-csv');
      csv = payload.csv?.trim() ? payload.csv : getServerBaselineCsv();
    }

    if(!csv){
      alert('Nincs visszaállítható szerverállapot.');
      return;
    }
    setServerBaselineCsv(csv);
    state = importCsv(csv);
    save();
    alert(restoredBackup ? 'Ideiglenes mentés visszaállítva, az előző fő CSV újra aktív.' : 'Helyi változtatások elvetve, a szerveren mentett állapot visszaállítva.');
  }catch(err){
    console.error(err);
    const fallback = getServerBaselineCsv();
    if(fallback && confirm(`Szerverről nem sikerült betölteni: ${err.message}\nVisszaállítsam az utoljára helyben eltárolt szerverállapotot?`)){
      state = importCsv(fallback);
      save();
      alert('Helyi mentett szerverállapot visszaállítva.');
      return;
    }
    alert(`Elvetés sikertelen: ${err.message}`);
  }
}
$('#remoteLoadBtn')?.addEventListener('click', loadFromGitHub);
$('#remoteSaveBtn')?.addEventListener('click', saveToGitHub);
$('#discardBtn')?.addEventListener('click', discardChanges);

bootAuth();


// v7.8 mobile sidebar behavior
(function setupMobileNavigation(){
  const menuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.querySelector('.sidebar');
  if(!menuBtn || !sidebar) return;
  const open = () => {
    document.body.classList.add('nav-open');
    menuBtn.setAttribute('aria-expanded','true');
    menuBtn.textContent = '×';
  };
  const close = () => {
    document.body.classList.remove('nav-open');
    menuBtn.setAttribute('aria-expanded','false');
    menuBtn.textContent = '☰';
  };
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    document.body.classList.contains('nav-open') ? close() : open();
  });
  document.addEventListener('click', (e) => {
    if(!document.body.classList.contains('nav-open')) return;
    if(sidebar.contains(e.target) || menuBtn.contains(e.target)) return;
    close();
  });
  document.querySelectorAll('.nav-item').forEach(btn => btn.addEventListener('click', () => {
    if(window.matchMedia('(max-width: 860px)').matches) close();
  }));
  window.addEventListener('resize', () => {
    if(!window.matchMedia('(max-width: 860px)').matches) close();
  });
})();
