const AREAS = ['Planning','Design','Frontend','Backend','Database','Security','Testing','Documentation','DevOps'];
const STATUSES = ['Backlog','To Do','In Progress','Review','Done','Blocked'];
const SPRINT_STATUSES = ['Tervezett','Folyamatban','Review','Kész','Blokkolt'];
const PRIORITIES = ['Alacsony','Közepes','Magas','Kritikus'];
const STORE_KEY = 'ehokDevTrackerV5';
const uid = () => crypto?.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = (v='') => String(v).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function makeSprint(code, name, goal, startDate, endDate, status='Tervezett') {
  return { id: uid(), code, name: `${code} – ${name}`, goal, startDate, endDate, status };
}
function task(sprintCode, title, area, status='Backlog', priority='Közepes', description='', estimate='') {
  return { id: uid(), sprintCode, title, area, status, priority, description, estimate };
}
function milestone(title, targetDate, status, description='') { return { id: uid(), title, targetDate, status, description }; }

function buildDefaultState(){
  const sprints = [
    makeSprint('PC-00','Projektindítás','Fejlesztői alapok, repo, lokális környezet, kezdeti UI alapok.','2026-06-26','2026-07-03','Folyamatban'),
    makeSprint('PC-01','Tenant rendszer','A HÖK tenant-ek alapmodellje és kezelése.','2026-07-04','2026-07-10'),
    makeSprint('PC-02','Felhasználókezelés','Felhasználók, profilok és tenant-kapcsolatok.','2026-07-11','2026-07-17'),
    makeSprint('PC-03','Hitelesítés','Biztonságos belépés, session/token kezelés.','2026-07-18','2026-07-24'),
    makeSprint('PC-04','Jogosultságok','Role/permission rendszer és UI.','2026-07-25','2026-07-31'),
    makeSprint('PC-05','Platform beállítások','Tenant settings, feature flag és konfiguráció.','2026-08-01','2026-08-07'),
    makeSprint('PC-06','Audit rendszer','Részletes audit naplózás és keresés.','2026-08-08','2026-08-14'),
    makeSprint('PC-07','Modulregiszter','Modulok nyilvántartása és tenant szintű aktiválás.','2026-08-15','2026-08-21'),
    makeSprint('PC-08','Publikus Platform API','HIP alapadatok kiszolgálása publikus API-n.','2026-08-22','2026-08-28'),
    makeSprint('PC-09','Stabilizáció','Refaktor, tesztek, dokumentáció, release előkészítés.','2026-08-29','2026-09-04')
  ];
  const tasks = [
    task('PC-00','Platform Core architektúra véglegesítése','Planning','In Progress','Kritikus','Monolit backend + moduláris frontend keretek pontosítása.'),
    task('PC-00','Repo struktúra kialakítása','DevOps','To Do','Magas'),
    task('PC-00','ASP.NET Core backend projekt inicializálása','Backend','To Do','Magas'),
    task('PC-00','PostgreSQL konténer beállítása Docker Compose-ban','Database','To Do','Magas'),
    task('PC-00','EF Core alap konfiguráció','Database','Backlog','Magas'),
    task('PC-00','Swagger/OpenAPI bekötése','Backend','Backlog','Közepes'),
    task('PC-00','Health check endpoint létrehozása','Backend','Backlog','Közepes'),
    task('PC-00','Frontend projekt inicializálása','Frontend','To Do','Magas'),
    task('PC-00','Admin shell mobil Figma terv','Design','To Do','Magas','Mobil-first alaplayout: sidebar helyett alsó/top navigációs viselkedés.'),
    task('PC-00','Admin shell tablet Figma terv','Design','Backlog','Magas'),
    task('PC-00','Admin shell desktop Figma terv','Design','Backlog','Magas'),
    task('PC-00','Design tokenek rögzítése','Design','Backlog','Magas','Színek, spacing, border radius, typography, shadow.'),
    task('PC-00','Alap layout frontend implementáció','Frontend','Backlog','Magas'),
    task('PC-00','Responsive shell tesztelés','Testing','Backlog','Magas'),
    task('PC-00','README és fejlesztési indítási útmutató','Documentation','To Do','Közepes'),
    task('PC-00','ADR mappa és sablon létrehozása','Documentation','Backlog','Közepes'),

    task('PC-01','Tenant lista mobil Figma terv','Design','Backlog','Magas'),
    task('PC-01','Tenant lista tablet/desktop Figma terv','Design','Backlog','Magas'),
    task('PC-01','Tenant részletező mobil Figma terv','Design','Backlog','Magas'),
    task('PC-01','Tenant szerkesztő form responsive Figma terv','Design','Backlog','Magas'),
    task('PC-01','Tenant entity létrehozása','Backend','Backlog','Kritikus'),
    task('PC-01','Tenant státuszok definiálása','Backend','Backlog','Magas'),
    task('PC-01','Tenant slug validáció','Backend','Backlog','Magas'),
    task('PC-01','Tenant migration elkészítése','Database','Backlog','Magas'),
    task('PC-01','Tenant CRUD API','Backend','Backlog','Kritikus'),
    task('PC-01','Tenant service/repository réteg','Backend','Backlog','Magas'),
    task('PC-01','Tenant lista frontend oldal','Frontend','Backlog','Magas'),
    task('PC-01','Tenant létrehozás/szerkesztés frontend form','Frontend','Backlog','Magas'),
    task('PC-01','Tenant státusz badge komponens','Frontend','Backlog','Közepes'),
    task('PC-01','Tenant empty/error állapotok','Frontend','Backlog','Közepes'),
    task('PC-01','Tenant CRUD tesztek','Testing','Backlog','Magas'),
    task('PC-01','Tenant képernyők responsive tesztelése','Testing','Backlog','Magas'),

    task('PC-02','Felhasználó lista mobil Figma terv','Design','Backlog','Magas'),
    task('PC-02','Felhasználó lista tablet/desktop Figma terv','Design','Backlog','Magas'),
    task('PC-02','Felhasználó profil responsive Figma terv','Design','Backlog','Magas'),
    task('PC-02','Meghívási folyamat UX terve','Design','Backlog','Magas'),
    task('PC-02','User entity létrehozása','Backend','Backlog','Kritikus'),
    task('PC-02','UserProfile entity létrehozása','Backend','Backlog','Magas'),
    task('PC-02','TenantUser kapcsolat MVP szabállyal','Database','Backlog','Kritikus','MVP-ben egy user egy tenanthez tartozik.'),
    task('PC-02','Tenant Admin account elkülönítése','Security','Backlog','Kritikus','TA nem operatív HÖK munkára szolgál.'),
    task('PC-02','Felhasználó aktiválás/deaktiválás API','Backend','Backlog','Magas'),
    task('PC-02','Felhasználó lista frontend oldal','Frontend','Backlog','Magas'),
    task('PC-02','Felhasználó profil frontend oldal','Frontend','Backlog','Magas'),
    task('PC-02','User életciklus tesztek','Testing','Backlog','Magas'),
    task('PC-02','Felhasználókezelési dokumentáció','Documentation','Backlog','Közepes'),

    task('PC-03','Login mobil Figma terv','Design','Backlog','Kritikus'),
    task('PC-03','Login tablet/desktop Figma terv','Design','Backlog','Kritikus'),
    task('PC-03','Elfelejtett jelszó UX terv','Design','Backlog','Magas'),
    task('PC-03','Session lejárati állapotok megtervezése','Design','Backlog','Magas'),
    task('PC-03','Password hash stratégia','Security','Backlog','Kritikus'),
    task('PC-03','Login API','Backend','Backlog','Kritikus'),
    task('PC-03','Logout API','Backend','Backlog','Magas'),
    task('PC-03','JWT vagy cookie session döntés ADR','Documentation','Backlog','Kritikus'),
    task('PC-03','Refresh token előkészítés','Backend','Backlog','Magas'),
    task('PC-03','Login oldal frontend implementáció','Frontend','Backlog','Kritikus'),
    task('PC-03','Session kezelés frontend oldalon','Frontend','Backlog','Kritikus'),
    task('PC-03','Auth guard routing','Frontend','Backlog','Magas'),
    task('PC-03','Brute force / rate limit alap','Security','Backlog','Magas'),
    task('PC-03','Login audit esemény','Backend','Backlog','Magas'),
    task('PC-03','Auth tesztek','Testing','Backlog','Kritikus'),
    task('PC-03','Login responsive tesztelés','Testing','Backlog','Magas'),

    task('PC-04','Role lista mobil Figma terv','Design','Backlog','Magas'),
    task('PC-04','Jogosultság szerkesztő desktop Figma terv','Design','Backlog','Magas'),
    task('PC-04','Jogosultságmátrix dokumentálása','Documentation','Backlog','Kritikus'),
    task('PC-04','Role entity','Backend','Backlog','Kritikus'),
    task('PC-04','Permission entity','Backend','Backlog','Kritikus'),
    task('PC-04','RolePermission kapcsolat','Database','Backlog','Magas'),
    task('PC-04','UserRole kapcsolat','Database','Backlog','Magas'),
    task('PC-04','Backend authorization policy-k','Security','Backlog','Kritikus'),
    task('PC-04','Alap szerepkörök seedelése','Backend','Backlog','Magas'),
    task('PC-04','Role kezelés frontend oldal','Frontend','Backlog','Magas'),
    task('PC-04','Permission UI implementáció','Frontend','Backlog','Magas'),
    task('PC-04','Jogosultsági tesztek','Testing','Backlog','Kritikus'),

    task('PC-05','Settings oldal mobil Figma terv','Design','Backlog','Magas'),
    task('PC-05','Settings oldal tablet/desktop Figma terv','Design','Backlog','Magas'),
    task('PC-05','Mentési visszajelzések UX terve','Design','Backlog','Közepes'),
    task('PC-05','Tenant settings modell','Backend','Backlog','Kritikus'),
    task('PC-05','Feature flag alapok','Backend','Backlog','Magas'),
    task('PC-05','Modul engedélyezés/tiltás előkészítése','Backend','Backlog','Magas'),
    task('PC-05','Settings API validáció','Backend','Backlog','Magas'),
    task('PC-05','Settings frontend oldal','Frontend','Backlog','Magas'),
    task('PC-05','Settings responsive tesztelés','Testing','Backlog','Magas'),
    task('PC-05','Konfigurációs dokumentáció','Documentation','Backlog','Közepes'),

    task('PC-06','Audit lista mobil Figma terv','Design','Backlog','Magas'),
    task('PC-06','Audit lista desktop Figma terv','Design','Backlog','Magas'),
    task('PC-06','Audit részletező UX terv','Design','Backlog','Magas'),
    task('PC-06','AuditLog entity','Backend','Backlog','Kritikus'),
    task('PC-06','Audit service','Backend','Backlog','Kritikus'),
    task('PC-06','Automatikus audit middleware','Backend','Backlog','Magas'),
    task('PC-06','Kézi audit események','Backend','Backlog','Magas'),
    task('PC-06','Audit keresés és szűrés API','Backend','Backlog','Magas'),
    task('PC-06','Audit hozzáférés csak fejlesztői/admin rétegből','Security','Backlog','Kritikus'),
    task('PC-06','Audit tábla frontend','Frontend','Backlog','Magas'),
    task('PC-06','Audit dátum és actor szűrők','Frontend','Backlog','Közepes'),
    task('PC-06','Audit export előkészítése','Frontend','Backlog','Közepes'),
    task('PC-06','Audit tesztek','Testing','Backlog','Magas'),

    task('PC-07','Modulkezelés mobil Figma terv','Design','Backlog','Magas'),
    task('PC-07','Modulkezelés desktop Figma terv','Design','Backlog','Magas'),
    task('PC-07','Module entity','Backend','Backlog','Kritikus'),
    task('PC-07','TenantModule kapcsolat','Database','Backlog','Kritikus'),
    task('PC-07','ModuleKey standardizálás','Backend','Backlog','Magas'),
    task('PC-07','Modul aktiválás/deaktiválás API','Backend','Backlog','Magas'),
    task('PC-07','Publikus modul láthatóság modell','Backend','Backlog','Magas'),
    task('PC-07','Admin menü generálás előkészítése','Frontend','Backlog','Magas'),
    task('PC-07','Modulkezelő oldal frontend','Frontend','Backlog','Magas'),
    task('PC-07','HIP tartalom-slotok előkészítése','Planning','Backlog','Magas'),
    task('PC-07','Module registry tesztek','Testing','Backlog','Magas'),

    task('PC-08','Publikus tenant profil előnézet mobil Figma terv','Design','Backlog','Magas'),
    task('PC-08','Publikus tenant profil előnézet desktop Figma terv','Design','Backlog','Magas'),
    task('PC-08','Publikus tenant API szerződés','Backend','Backlog','Kritikus'),
    task('PC-08','HÖK név, logó, bemutatkozás endpoint','Backend','Backlog','Kritikus'),
    task('PC-08','Elérhetőségek és social linkek endpoint','Backend','Backlog','Magas'),
    task('PC-08','Publikus státusz és üres állapotok','Backend','Backlog','Magas'),
    task('PC-08','HIP alapváz adatforrás tesztoldal','Frontend','Backlog','Magas'),
    task('PC-08','Publikus API rate limit áttekintés','Security','Backlog','Magas'),
    task('PC-08','Publikus API tesztek','Testing','Backlog','Kritikus'),
    task('PC-08','HIP integrációs jegyzet','Documentation','Backlog','Közepes'),

    task('PC-09','UI regressziós ellenőrzés mobilon','Testing','Backlog','Kritikus'),
    task('PC-09','UI regressziós ellenőrzés tableten','Testing','Backlog','Magas'),
    task('PC-09','UI regressziós ellenőrzés desktopon','Testing','Backlog','Magas'),
    task('PC-09','API response formátum egységesítése','Backend','Backlog','Magas'),
    task('PC-09','Globális hibakezelés egységesítése','Backend','Backlog','Magas'),
    task('PC-09','Frontend loading/empty/error állapotok finomítása','Frontend','Backlog','Magas'),
    task('PC-09','Logging áttekintés','DevOps','Backlog','Magas'),
    task('PC-09','Seed adatok ellenőrzése','Database','Backlog','Közepes'),
    task('PC-09','Tenant izoláció tesztelése','Testing','Backlog','Kritikus'),
    task('PC-09','Security checklist','Security','Backlog','Kritikus'),
    task('PC-09','Platform Core dokumentáció frissítése','Documentation','Backlog','Magas'),
    task('PC-09','Platform Core MVP release jegyzet','Documentation','Backlog','Magas')
  ];
  return {
    sprints,
    tasks,
    milestones:[
      milestone('M1 – Fejlesztői alapok elkészültek','2026-07-03','Folyamatban','Repo, lokális környezet, alap backend/frontend shell.'),
      milestone('M2 – Platform Core alap működik','2026-07-31','Tervezett','Tenant, user, auth és jogosultsági alapok.'),
      milestone('M3 – Admin alapfelület használható','2026-08-14','Tervezett','Login, layout, tenant/user/settings/audit alapképernyők.'),
      milestone('M4 – HIP alapadat API készen áll','2026-08-28','Tervezett','Publikus tenant API, amelyre a HIP váz épülhet.'),
      milestone('M5 – Platform Core MVP kész','2026-09-04','Tervezett','Stabilizált, tesztelt, dokumentált core.')
    ],
    notes:[
      {id:uid(), title:'Responsive szabály', body:'Minden Platform Core képernyőt mobil-first módon, de tablet és desktop nézetre is meg kell tervezni Figma-ban, mielőtt frontend implementáció indul.', created:new Date().toLocaleDateString('hu-HU')},
      {id:uid(), title:'Tenant Admin elv', body:'A Tenant Admin dedikált platform-adminisztrációs account. Nem operatív HÖK munkára szolgál.', created:new Date().toLocaleDateString('hu-HU')}
    ]
  };
}

let state = load();
function load(){
  try { const raw = localStorage.getItem(STORE_KEY); return raw ? JSON.parse(raw) : buildDefaultState(); }
  catch { return buildDefaultState(); }
}
function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); renderAll(); }
function sprintByCode(code){ return state.sprints.find(s => s.code === code); }
function badgeClass(v=''){
  const x = String(v).toLowerCase();
  if(x.includes('done') || x.includes('kész')) return 'status-done';
  if(x.includes('blocked') || x.includes('blokkol')) return 'status-blocked';
  if(x.includes('progress') || x.includes('folyamat')) return 'status-progress';
  if(x.includes('review')) return 'status-review';
  if(x.includes('kritikus')) return 'priority-kritikus';
  if(x.includes('magas')) return 'priority-magas';
  if(x.includes('alacsony')) return 'priority-alacsony';
  return '';
}
function dateRange(s){
  const start = s.startDate || 'nincs kezdés';
  const end = s.endDate || 'nincs zárás';
  return `${start} → ${end}`;
}
function taskPercent(list){
  if(!list.length) return 0;
  return Math.round(list.filter(t=>t.status === 'Done').length / list.length * 100);
}
function setOptions(select, values, selected='', first=''){
  select.innerHTML = (first ? `<option value="">${first}</option>` : '') + values.map(v=>`<option value="${esc(v)}" ${v===selected?'selected':''}>${esc(v)}</option>`).join('');
}
function updateControls(){
  setOptions($('#sprintSelect'), state.sprints.map(s=>s.code), '', 'Nincs sprint');
  setOptions($('#areaSelect'), AREAS);
  setOptions($('#statusSelect'), STATUSES, 'To Do');
  setOptions($('#prioritySelect'), PRIORITIES, 'Közepes');
  setOptions($('#taskAreaFilter'), AREAS, '', 'Minden terület');
  setOptions($('#taskSprintFilter'), state.sprints.map(s=>s.code), '', 'Minden sprint');
  setOptions($('#taskStatusFilter'), STATUSES, '', 'Minden állapot');
}
function renderDashboard(){
  const total = state.tasks.length;
  const done = state.tasks.filter(t=>t.status==='Done').length;
  const blocked = state.tasks.filter(t=>t.status==='Blocked').length;
  $('#totalSprints').textContent = state.sprints.length;
  $('#totalTasks').textContent = total;
  $('#doneTasks').textContent = done;
  $('#blockedTasks').textContent = blocked;
  const percent = total ? Math.round(done/total*100) : 0;
  $('#overallPercent').textContent = percent + '%';
  $('#overallBar').style.width = percent + '%';
  $('#areaProgress').innerHTML = AREAS.map(area=>{
    const list = state.tasks.filter(t=>t.area===area);
    const p = taskPercent(list);
    return `<div class="area-row"><span>${area}</span><div class="mini-progress"><div style="width:${p}%"></div></div><b>${list.filter(t=>t.status==='Done').length}/${list.length}</b></div>`;
  }).join('');
  const active = state.sprints.find(s=>s.status==='Folyamatban') || state.sprints.find(s=>s.status !== 'Kész') || state.sprints[0];
  if(active){
    const list = state.tasks.filter(t=>t.sprintCode===active.code);
    const p = taskPercent(list);
    $('#activeSprintCard').innerHTML = `<div class="item-card"><div class="item-title">${esc(active.name)}</div><div class="meta">${esc(dateRange(active))}</div><p>${esc(active.goal||'')}</p><div class="progress" style="margin-top:14px"><div style="width:${p}%"></div></div><div class="actions"><span class="badge ${badgeClass(active.status)}">${active.status}</span><span class="badge">${list.filter(t=>t.status==='Done').length}/${list.length} feladat</span></div></div>`;
  }
  const upcoming = state.tasks.filter(t=>!['Done','Blocked'].includes(t.status)).slice(0,6);
  $('#upcomingTasks').innerHTML = upcoming.length ? upcoming.map(t=>`<div class="item-card"><div class="item-title">${esc(t.title)}</div><div class="meta">${esc(t.sprintCode)} · ${esc(t.area)} · ${esc(t.status)}</div></div>`).join('') : '<div class="empty">Nincs nyitott feladat.</div>';
  const ms = [...state.milestones].sort((a,b)=>(a.targetDate||'9999').localeCompare(b.targetDate||'9999')).slice(0,5);
  $('#dashboardMilestones').innerHTML = ms.map(m=>`<div class="item-card"><div class="item-top"><div><div class="item-title">${esc(m.title)}</div><div class="meta">${esc(m.targetDate || 'Nincs céldátum')}</div></div><span class="badge ${badgeClass(m.status)}">${esc(m.status)}</span></div></div>`).join('') || '<div class="empty">Nincs mérföldkő.</div>';
}
function renderSprints(){
  $('#sprintList').innerHTML = state.sprints.map(s=>{
    const tasks = state.tasks.filter(t=>t.sprintCode===s.code);
    const done = tasks.filter(t=>t.status==='Done').length;
    const p = taskPercent(tasks);
    const groups = AREAS.map(area=>{
      const items = tasks.filter(t=>t.area===area);
      if(!items.length) return '';
      return `<section class="task-group"><h3>${area}</h3>${items.map(t=>`<div class="group-task"><div><div class="item-title">${esc(t.title)}</div>${t.description?`<p>${esc(t.description)}</p>`:''}<div class="task-meta"><span class="badge badge-small ${badgeClass(t.status)}">${esc(t.status)}</span><span class="badge badge-small ${badgeClass(t.priority)}">${esc(t.priority)}</span>${t.estimate?`<span class="badge badge-small">${esc(t.estimate)}</span>`:''}</div></div><div class="group-actions"><select onchange="changeTaskStatus('${t.id}',this.value)">${STATUSES.map(st=>`<option ${st===t.status?'selected':''}>${st}</option>`).join('')}</select><button onclick="openEdit('task','${t.id}')">Szerk.</button></div></div>`).join('')}</section>`;
    }).join('');
    return `<article class="sprint-card" id="sprint-${esc(s.code)}"><button class="sprint-summary" onclick="toggleSprint('${s.id}')"><div><div class="sprint-title-line"><span class="chevron">›</span><div class="item-title">${esc(s.name)}</div></div><div class="meta">${esc(dateRange(s))}</div><p>${esc(s.goal||'')}</p></div><div class="sprint-kpis"><span class="badge ${badgeClass(s.status)}">${esc(s.status)}</span><span class="badge">${done}/${tasks.length} kész</span><span class="badge">${p}%</span></div></button><div class="sprint-progress"><div class="progress"><div style="width:${p}%"></div></div></div><div class="sprint-detail"><div class="actions" style="margin-top:0;margin-bottom:12px"><button onclick="prefillTaskSprint('${s.code}')">Új feladat ehhez</button><button onclick="openEdit('sprint','${s.id}')">Sprint szerkesztése</button><button class="delete" onclick="deleteSprint('${s.id}')">Sprint törlése</button></div><div class="group-list">${groups || '<div class="empty">Nincs feladat ebben a sprintben.</div>'}</div></div></article>`;
  }).join('') || '<div class="empty">Még nincs sprint.</div>';
}
function renderTasks(){
  const q = ($('#taskSearch')?.value || '').toLowerCase();
  const area = $('#taskAreaFilter')?.value || '';
  const sprint = $('#taskSprintFilter')?.value || '';
  const status = $('#taskStatusFilter')?.value || '';
  const list = state.tasks.filter(t=>{
    const matchQ = [t.title,t.area,t.status,t.priority,t.sprintCode,t.description].some(v=>String(v||'').toLowerCase().includes(q));
    return matchQ && (!area || t.area===area) && (!sprint || t.sprintCode===sprint) && (!status || t.status===status);
  });
  $('#taskList').innerHTML = list.map(t=>`<article class="task-card"><div><div class="item-title">${esc(t.title)}</div>${t.description?`<p>${esc(t.description)}</p>`:''}<div class="task-meta"><span class="badge">${esc(t.sprintCode||'Nincs sprint')}</span><span class="badge">${esc(t.area||'Nincs terület')}</span><span class="badge ${badgeClass(t.status)}">${esc(t.status)}</span><span class="badge ${badgeClass(t.priority)}">${esc(t.priority)}</span>${t.estimate?`<span class="badge">${esc(t.estimate)}</span>`:''}</div></div><div class="actions"><select onchange="changeTaskStatus('${t.id}',this.value)">${STATUSES.map(s=>`<option ${s===t.status?'selected':''}>${s}</option>`).join('')}</select><button onclick="openEdit('task','${t.id}')">Szerkesztés</button><button class="delete" onclick="deleteTask('${t.id}')">Törlés</button></div></article>`).join('') || '<div class="empty">Nincs találat.</div>';
}
function renderMilestones(){
  $('#milestoneList').innerHTML = state.milestones.map(m=>`<article class="timeline-item"><div class="item-top"><div><div class="item-title">${esc(m.title)}</div><div class="meta">${esc(m.targetDate || 'Nincs céldátum')}</div>${m.description?`<p>${esc(m.description)}</p>`:''}</div><span class="badge ${badgeClass(m.status)}">${esc(m.status)}</span></div><div class="actions"><button onclick="openEdit('milestone','${m.id}')">Szerkesztés</button><button class="delete" onclick="deleteMilestone('${m.id}')">Törlés</button></div></article>`).join('') || '<div class="empty">Nincs mérföldkő.</div>';
}
function renderNotes(){
  $('#noteList').innerHTML = state.notes.map(n=>`<article class="item-card"><div class="item-top"><div><div class="item-title">${esc(n.title)}</div><div class="meta">${esc(n.created)}</div></div></div><p>${esc(n.body)}</p><div class="actions"><button onclick="openEdit('note','${n.id}')">Szerkesztés</button><button class="delete" onclick="deleteNote('${n.id}')">Törlés</button></div></article>`).join('') || '<div class="empty">Még nincs jegyzet.</div>';
}
function renderAll(){ updateControls(); renderDashboard(); renderSprints(); renderTasks(); renderMilestones(); renderNotes(); }

function toggleSprint(id){ document.querySelector(`#sprintList article:nth-child(${state.sprints.findIndex(s=>s.id===id)+1})`)?.classList.toggle('open'); }
function changeTaskStatus(id,status){ state.tasks = state.tasks.map(t=>t.id===id ? {...t,status} : t); save(); }
function deleteTask(id){ if(confirm('Törlöd a feladatot?')){ state.tasks = state.tasks.filter(t=>t.id!==id); save(); } }
function deleteSprint(id){ if(confirm('Törlöd a sprintet? A feladatok nem törlődnek, csak sprint nélkül maradnak.')){ const s = state.sprints.find(x=>x.id===id); state.sprints = state.sprints.filter(x=>x.id!==id); state.tasks = state.tasks.map(t=>t.sprintCode===s.code ? {...t,sprintCode:''} : t); save(); } }
function deleteMilestone(id){ if(confirm('Törlöd a mérföldkövet?')){ state.milestones = state.milestones.filter(m=>m.id!==id); save(); } }
function deleteNote(id){ if(confirm('Törlöd a jegyzetet?')){ state.notes = state.notes.filter(n=>n.id!==id); save(); } }
function prefillTaskSprint(code){ showView('tasks'); $('#sprintSelect').value = code; $('#taskForm input[name="title"]').focus(); }
function showView(view){
  $$('.nav-item').forEach(b=>b.classList.toggle('active', b.dataset.view===view));
  $$('.view').forEach(v=>v.classList.toggle('active-view', v.id===view));
  $('#pageTitle').textContent = $(`.nav-item[data-view="${view}"]`)?.textContent || 'Dashboard';
  window.scrollTo({top:0,behavior:'smooth'});
}

$$('.nav-item').forEach(btn=>btn.addEventListener('click',()=>showView(btn.dataset.view)));
$$('[data-jump]').forEach(btn=>btn.addEventListener('click',()=>showView(btn.dataset.jump)));
$('#quickTaskBtn').addEventListener('click',()=>{showView('tasks'); $('#taskForm input[name="title"]').focus();});
$('#quickMilestoneBtn').addEventListener('click',()=>{showView('milestones'); $('#milestoneForm input[name="title"]').focus();});

$('#sprintForm').addEventListener('submit',e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));const code=(f.name.match(/PC-\d+/)?.[0]) || `SP-${String(state.sprints.length+1).padStart(2,'0')}`;state.sprints.push({id:uid(),code,name:f.name,goal:f.goal,startDate:f.startDate,endDate:f.endDate,status:f.status});e.target.reset();save();});
$('#taskForm').addEventListener('submit',e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));state.tasks.unshift({id:uid(),title:f.title,sprintCode:f.sprint,area:f.area,status:f.status,priority:f.priority,estimate:f.estimate,description:f.description});e.target.reset();$('#statusSelect').value='To Do';$('#prioritySelect').value='Közepes';save();});
$('#milestoneForm').addEventListener('submit',e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));state.milestones.push({id:uid(),...f});e.target.reset();save();});
$('#noteForm').addEventListener('submit',e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));state.notes.unshift({id:uid(),title:f.title,body:f.body,created:new Date().toLocaleDateString('hu-HU')});e.target.reset();save();});
['taskSearch','taskAreaFilter','taskSprintFilter','taskStatusFilter'].forEach(id=>$('#'+id).addEventListener('input',renderTasks));

let editContext = null;
function openEdit(type,id){
  editContext = {type,id};
  const dialog = $('#editDialog'), fields = $('#editFields');
  let item;
  if(type==='task') item = state.tasks.find(x=>x.id===id);
  if(type==='sprint') item = state.sprints.find(x=>x.id===id);
  if(type==='milestone') item = state.milestones.find(x=>x.id===id);
  if(type==='note') item = state.notes.find(x=>x.id===id);
  if(!item) return;
  $('#editTitle').textContent = type==='task'?'Feladat szerkesztése':type==='sprint'?'Sprint szerkesztése':type==='milestone'?'Mérföldkő szerkesztése':'Jegyzet szerkesztése';
  if(type==='task') fields.innerHTML = `<label>Cím<input name="title" value="${esc(item.title)}" required></label><label>Sprint<select name="sprintCode"><option value="">Nincs sprint</option>${state.sprints.map(s=>`<option value="${esc(s.code)}" ${s.code===item.sprintCode?'selected':''}>${esc(s.code)}</option>`).join('')}</select></label><label>Terület<select name="area">${AREAS.map(a=>`<option ${a===item.area?'selected':''}>${a}</option>`).join('')}</select></label><label>Állapot<select name="status">${STATUSES.map(s=>`<option ${s===item.status?'selected':''}>${s}</option>`).join('')}</select></label><label>Prioritás<select name="priority">${PRIORITIES.map(p=>`<option ${p===item.priority?'selected':''}>${p}</option>`).join('')}</select></label><label>Becsült idő<input name="estimate" value="${esc(item.estimate||'')}"></label><label>Leírás<textarea name="description">${esc(item.description||'')}</textarea></label>`;
  if(type==='sprint') fields.innerHTML = `<label>Kód<input name="code" value="${esc(item.code)}" required></label><label>Név<input name="name" value="${esc(item.name)}" required></label><label>Cél<textarea name="goal">${esc(item.goal||'')}</textarea></label><label>Kezdés<input type="date" name="startDate" value="${esc(item.startDate||'')}"></label><label>Zárás<input type="date" name="endDate" value="${esc(item.endDate||'')}"></label><label>Állapot<select name="status">${SPRINT_STATUSES.map(s=>`<option ${s===item.status?'selected':''}>${s}</option>`).join('')}</select></label>`;
  if(type==='milestone') fields.innerHTML = `<label>Cím<input name="title" value="${esc(item.title)}" required></label><label>Céldátum<input type="date" name="targetDate" value="${esc(item.targetDate||'')}"></label><label>Állapot<select name="status">${SPRINT_STATUSES.map(s=>`<option ${s===item.status?'selected':''}>${s}</option>`).join('')}</select></label><label>Leírás<textarea name="description">${esc(item.description||'')}</textarea></label>`;
  if(type==='note') fields.innerHTML = `<label>Cím<input name="title" value="${esc(item.title)}" required></label><label>Szöveg<textarea name="body">${esc(item.body||'')}</textarea></label>`;
  dialog.showModal();
}
$('#closeEditBtn').addEventListener('click',()=>$('#editDialog').close());
$('#cancelEditBtn').addEventListener('click',()=>$('#editDialog').close());
$('#editForm').addEventListener('submit',e=>{
  e.preventDefault(); if(!editContext) return;
  const f = Object.fromEntries(new FormData(e.target));
  const {type,id} = editContext;
  if(type==='task') state.tasks = state.tasks.map(x=>x.id===id?{...x,...f}:x);
  if(type==='sprint') {
    const old = state.sprints.find(x=>x.id===id);
    state.sprints = state.sprints.map(x=>x.id===id?{...x,...f}:x);
    if(old && old.code !== f.code) state.tasks = state.tasks.map(t=>t.sprintCode===old.code?{...t,sprintCode:f.code}:t);
  }
  if(type==='milestone') state.milestones = state.milestones.map(x=>x.id===id?{...x,...f}:x);
  if(type==='note') state.notes = state.notes.map(x=>x.id===id?{...x,...f}:x);
  $('#editDialog').close(); save();
});

function csvEscape(v=''){v=String(v??'').replace(/\r?\n/g,' ');return /[",;]/.test(v)?`"${v.replace(/"/g,'""')}"`:v;}
function toCsv(){
  const rows=[['type','id','code','name','title','goal','startDate','endDate','targetDate','status','priority','area','sprintCode','estimate','description','body','created']];
  state.sprints.forEach(x=>rows.push(['sprint',x.id,x.code,x.name,'',x.goal,x.startDate,x.endDate,'',x.status,'','','','','','','']));
  state.tasks.forEach(x=>rows.push(['task',x.id,'','',x.title,'','','','',x.status,x.priority,x.area,x.sprintCode,x.estimate,x.description,'','']));
  state.milestones.forEach(x=>rows.push(['milestone',x.id,'','',x.title,'','','',x.targetDate,x.status,'','','','',x.description,'','']));
  state.notes.forEach(x=>rows.push(['note',x.id,'','',x.title,'','','','','','','','','','',x.body,x.created]));
  return rows.map(r=>r.map(csvEscape).join(';')).join('\n');
}
function parseCsv(text){
  const rows=[]; let row=[], cell='', q=false;
  for(let i=0;i<text.length;i++){ const c=text[i], n=text[i+1];
    if(q&&c==='"'&&n==='"'){cell+='"';i++;continue}
    if(c==='"'){q=!q;continue}
    if(!q&&(c===';'||c===',')){row.push(cell);cell='';continue}
    if(!q&&(c==='\n'||c==='\r')){if(c==='\r'&&n==='\n')i++;row.push(cell);rows.push(row);row=[];cell='';continue}
    cell+=c;
  }
  row.push(cell); rows.push(row); return rows.filter(r=>r.some(x=>String(x).trim()!==''));
}
function fromCsv(text){
  const rows=parseCsv(text); const head=rows.shift(); const idx=k=>head.indexOf(k); const next={sprints:[],tasks:[],milestones:[],notes:[]};
  rows.forEach(r=>{const type=r[idx('type')];
    if(type==='sprint') next.sprints.push({id:r[idx('id')]||uid(),code:r[idx('code')],name:r[idx('name')],goal:r[idx('goal')],startDate:r[idx('startDate')],endDate:r[idx('endDate')],status:r[idx('status')]});
    if(type==='task') next.tasks.push({id:r[idx('id')]||uid(),title:r[idx('title')],area:r[idx('area')],sprintCode:r[idx('sprintCode')],status:r[idx('status')],priority:r[idx('priority')],estimate:r[idx('estimate')],description:r[idx('description')]});
    if(type==='milestone') next.milestones.push({id:r[idx('id')]||uid(),title:r[idx('title')],targetDate:r[idx('targetDate')],status:r[idx('status')],description:r[idx('description')]});
    if(type==='note') next.notes.push({id:r[idx('id')]||uid(),title:r[idx('title')],body:r[idx('body')],created:r[idx('created')]});
  });
  return next;
}
$('#exportBtn').addEventListener('click',()=>{const blob=new Blob([toCsv()],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ehok-dev-tracker.csv';a.click();URL.revokeObjectURL(a.href);});
$('#importInput').addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{state=fromCsv(reader.result);save();alert('CSV import sikeres.')}catch(err){alert('Hibás CSV fájl.')}};reader.readAsText(file);e.target.value='';});
$('#resetDemoBtn').addEventListener('click',()=>{if(confirm('Biztosan visszaállítod az előre kitöltött Platform Core alapadatokat?')){state=buildDefaultState();save();}});

renderAll();
