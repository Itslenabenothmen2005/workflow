import {useMemo,useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {Icon} from "../components/Icon";
import {DB,project,saveDb,team} from "../data/mockData";
import {ago,avatarStyle,formatDate,initials,riskClass,statusClass} from "../utils";

function Avatar({name,size=32}) {
  return <span className="avatar" style={{"--size":`${size}px`,...avatarStyle(name)}}>{initials(name)}</span>;
}

function useToast() {
  const [toasts,setToasts]=useState([]);
  const push=(message,type="info")=>{
    const id=Date.now()+Math.random();
    setToasts(list=>[...list,{id,message,type}]);
    window.setTimeout(()=>setToasts(list=>list.filter(t=>t.id!==id)),2600);
  };
  return {toasts,push};
}

function getChefSession() {
  try {
    const raw = localStorage.getItem("workflow_admin_session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getChefTeamId() {
  const session = getChefSession();
  const chef = DB.chefs.find(c => c.email === session?.email);
  return chef?.team || "alpha";
}

function sanitizeText(value) {
  return (value || "").toString().trim();
}

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

export function ChefDashboard() {
  const teamId = getChefTeamId();
  const teamMembers = DB.employees.filter(e => e.team === teamId);
  const activeProjects = DB.projects.filter(p => p.team === teamId && p.status !== "Terminé");
  const urgentTasks = DB.tasks.filter(t => t.teamId === teamId && (t.status === "En retard" || t.priority === "Urgent" || t.status === "À faire"));
  const reportsToValidate = DB.reports.filter(r => r.status === "À valider");
  const pendingLeaves = DB.leaveRequests.filter(l => l.status === "En attente");
  const upcomingMeetings = DB.meetings.filter(m => new Date(m.date) >= new Date());

  const kpis = [
    {icon:"users",label:"Membres",value:teamMembers.length,color:"var(--accent)"},
    {icon:"folder",label:"Projets actifs",value:activeProjects.length,color:"var(--info)"},
    {icon:"check-circle",label:"Tâches en cours",value:DB.tasks.filter(t => t.teamId === teamId && t.status !== "Terminée" && t.status !== "En retard").length,color:"var(--ok)"},
    {icon:"alert",label:"Retards",value:DB.tasks.filter(t => t.teamId === teamId && t.status === "En retard").length,color:"var(--danger)"},
    {icon:"list",label:"Rapports à valider",value:reportsToValidate.length,color:"var(--warn)"},
    {icon:"calendar",label:"Réunions",value:upcomingMeetings.length,color:"var(--accent)"}
  ];

  return <>
    <div className="grid grid-kpi stack-gap">
      {kpis.map(item => <div className="card kpi" key={item.label}>
        <div className="kpi-top"><div className="kpi-ico" style={{"--t": item.color}}><Icon name={item.icon} size={24}/></div><div>{item.label}</div></div>
        <div className="kpi-value">{item.value}</div>
        <div className="kpi-foot"><div className="trend flat">Aujourd'hui</div></div>
      </div>)}
    </div>

    <div className="grid cols-2-1 stack-gap">
      <div className="card">
        <div className="card-head"><h3>Projets à surveiller</h3></div>
        <div className="card-body flush">
          {activeProjects.slice(0,4).map(projectItem => <div className="list-item" key={projectItem.id}>
            <div className="list-main">
              <strong>{projectItem.name}</strong>
              <small>{projectItem.status} · {formatDate(projectItem.end)}</small>
            </div>
            <div className="list-side"><span className={riskClass(projectItem.risk)}>{projectItem.risk}</span></div>
          </div>)}
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3>Tâches urgentes</h3></div>
        <div className="card-body flush">
          {urgentTasks.slice(0,4).map(task => <div className="list-item" key={task.id}>
            <div className="list-main">
              <strong>{task.title}</strong>
              <small>{task.assigneeName} · {task.status}</small>
            </div>
            <div className="list-side"><span className={statusClass(task.status)}>{task.priority}</span></div>
          </div>)}
        </div>
      </div>
    </div>

    <div className="grid cols-2-1 stack-gap">
      <div className="card">
        <div className="card-head"><h3>Activité de l'équipe</h3></div>
        <div className="card-body flush"><div className="feed"><ul>
          {DB.activities.slice(0,5).map(a => <li key={a.text + a.ago}><span className={`tone-ico tone-${a.tone}`}><Icon name={a.icon} size={16}/></span><div className="list-main"><p>{a.text}</p><small>{a.meta} · {ago(a.ago)}</small></div></li>)}
        </ul></div></div>
      </div>

      <div className="card">
        <div className="card-head"><h3>Actions rapides</h3></div>
        <div className="card-body flush">
          <div className="list-item"><Link className="menu-item" to="/chef/projets"><Icon name="plus" size={18}/>Nouveau projet</Link></div>
          <div className="list-item"><Link className="menu-item" to="/chef/taches"><Icon name="check" size={18}/>Assigner une tâche</Link></div>
          <div className="list-item"><Link className="menu-item" to="/chef/rapports"><Icon name="chart" size={18}/>Voir les rapports</Link></div>
          <div className="list-item"><Link className="menu-item" to="/chef/conges"><Icon name="calendar" size={18}/>Voir les congés</Link></div>
          <div className="list-item"><Link className="menu-item" to="/chef/reunions"><Icon name="calendar" size={18}/>Planifier une réunion</Link></div>
        </div>
      </div>
    </div>
  </>;
}

export function ChefTeam() {
  const teamId = getChefTeamId();
  const [q,setQ]=useState("");
  const [status,setStatus]=useState("all");
  const [edit,setEdit]=useState(null);
  const [refresh,setRefresh]=useState(0);
  const {toasts,push}=useToast();

  const filtered = useMemo(()=>DB.employees.filter(e => e.team === teamId && (
    !q || `${e.name} ${e.email}`.toLowerCase().includes(q.toLowerCase())
  ) && (status === "all" || e.status === (status === "active" ? "Actif" : "Inactif"))),[q,status,teamId,refresh]);

  function save(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const record = {
      name: sanitizeText(form.get("name")),
      email: sanitizeText(form.get("email")),
      phone: sanitizeText(form.get("phone")),
      team: sanitizeText(form.get("team")),
      profile: sanitizeText(form.get("profile")),
      project: sanitizeText(form.get("project")),
      status: sanitizeText(form.get("status")) || "Actif",
      since: new Date().toISOString().slice(0,10)
    };
    if (!record.name || !record.email) return;
    if (edit && edit.id) {
      Object.assign(DB.employees.find(item => item.id === edit.id), record);
    } else {
      const next = {id:`w${Date.now()}`, ...record};
      DB.employees.push(next);
    }
    saveDb();
    setEdit(null);
    setRefresh(v => v + 1);
    push("Membre enregistré avec succès", "success");
  }

  return <>
    <div className="toolbar">
      <div className="stat-pills">
        <button className={`stat-pill ${status === "all" ? "active" : ""}`} type="button" aria-pressed={status === "all"} onClick={()=>setStatus("all")}>Tous ({DB.employees.filter(e=>e.team===teamId).length})</button>
        <button className={`stat-pill ${status === "active" ? "active" : ""}`} type="button" aria-pressed={status === "active"} onClick={()=>setStatus("active")}>Actifs ({DB.employees.filter(e=>e.team===teamId && e.status === "Actif").length})</button>
        <button className={`stat-pill ${status === "inactive" ? "active" : ""}`} type="button" aria-pressed={status === "inactive"} onClick={()=>setStatus("inactive")}>Inactifs ({DB.employees.filter(e=>e.team===teamId && e.status === "Inactif").length})</button>
      </div>
      <div className="filters">
        <div className="field"><div className="input-icon"><Icon name="search" size={18}/><input className="input search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher un membre..."/></div></div>
        <button className="btn btn-primary" type="button" onClick={()=>setEdit({})}><Icon name="plus" size={18}/>Ajouter</button>
      </div>
    </div>

    <div className="card card-body flush">
      <div className="table-wrap">
        <table className="table responsive">
          <thead><tr><th>Nom</th><th>Poste</th><th>Charge</th><th>Projets</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(member => <tr key={member.id}>
              <td className="cell-main"><div className="person"><Avatar name={member.name}/><div><strong>{member.name}</strong><small>{member.email}</small></div></div></td>
              <td data-label="Poste"><span className="badge badge-info">{member.profile}</span></td>
              <td data-label="Charge">{Math.min(100, 35 + (member.name.length % 40))}%</td>
              <td data-label="Projets">{member.project ? project(member.project)?.name || "—" : "—"}</td>
              <td data-label="Statut"><span className={statusClass(member.status)}>{member.status}</span></td>
              <td data-label="Actions" className="actions"><button className="btn-icon" type="button" onClick={()=>setEdit(member)}><Icon name="edit" size={18}/></button></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>

    {edit !== null && <div className="modal-backdrop"><form className="modal-box" onSubmit={save}>
      <div className="modal-head"><h2>{edit.id ? "Modifier le membre" : "Ajouter un membre"}</h2><button type="button" className="btn-icon" onClick={()=>setEdit(null)}><Icon name="x" size={18}/></button></div>
      <div className="form-grid">
        <div className="field"><label>Nom</label><input className="input" name="name" defaultValue={edit.name || ""} required/></div>
        <div className="field"><label>Email</label><input className="input" name="email" type="email" defaultValue={edit.email || ""} required/></div>
        <div className="field"><label>Téléphone</label><input className="input" name="phone" defaultValue={edit.phone || ""}/></div>
        <div className="field"><label>Poste</label><select className="select" name="profile" defaultValue={edit.profile || "Salarié"}><option>Salarié</option><option>Freelance</option><option>Stagiaire</option></select></div>
        <div className="field"><label>Équipe</label><select className="select" name="team" defaultValue={edit.team || teamId}>{DB.teams.map(teamItem => <option key={teamItem.id} value={teamItem.id}>{teamItem.name}</option>)}</select></div>
        <div className="field"><label>Projet</label><select className="select" name="project" defaultValue={edit.project || ""}><option value="">Aucun</option>{DB.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
        <div className="field full"><label>Statut</label><select className="select" name="status" defaultValue={edit.status || "Actif"}><option>Actif</option><option>Inactif</option></select></div>
      </div>
      <div className="modal-foot"><button type="button" className="btn btn-ghost" onClick={()=>setEdit(null)}>Annuler</button><button className="btn btn-primary">Enregistrer</button></div>
    </form></div>}

    {toasts.length > 0 && <div className="toasts">{toasts.map(t => <div key={t.id} className={`toast toast-${t.type}`}><Icon name={t.type === "success" ? "check-circle" : t.type === "danger" ? "alert" : "info"} size={18}/><span>{t.message}</span></div>)}</div>}
  </>;
}

export function ChefProjects() {
  const teamId = getChefTeamId();
  const [q,setQ]=useState("");
  const [status,setStatus]=useState("Tous");
  const [risk,setRisk]=useState("Tous");
  const [open,setOpen]=useState(false);
  const {toasts,push}=useToast();

  const list = useMemo(() => {
    return DB.projects.filter(p => p.team === teamId && (
      !q || `${p.name} ${p.description || ""}`.toLowerCase().includes(q.toLowerCase())
    ) && (status === "Tous" || p.status === status) && (risk === "Tous" || p.risk === risk));
  }, [q,status,risk,teamId]);

  function submit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const next = {
      id: `p${Date.now()}`,
      name: sanitizeText(form.get("name")),
      description: sanitizeText(form.get("description")) || "Projet de l'équipe",
      client: "cl1",
      chef: "c1",
      team: teamId,
      progress: Number(form.get("progress") || 20),
      start: sanitizeText(form.get("start")) || new Date().toISOString().slice(0,10),
      end: sanitizeText(form.get("end")) || new Date(Date.now()+86400000*14).toISOString().slice(0,10),
      status: sanitizeText(form.get("status")) || "En cours",
      risk: sanitizeText(form.get("risk")) || "moyen",
      tasks: {done:0,doing:1,todo:2,late:0}
    };
    DB.projects.unshift(next);
    saveDb();
    setOpen(false);
    push("Projet ajouté", "success");
  }

  return <>
    <div className="toolbar">
      <div className="stat-pills">
        <button className={`stat-pill ${status === "Tous" ? "active" : ""}`} type="button" aria-pressed={status === "Tous"} onClick={()=>setStatus("Tous")}>Tous ({DB.projects.filter(p => p.team === teamId).length})</button>
        <button className={`stat-pill ${status === "En cours" ? "active" : ""}`} type="button" aria-pressed={status === "En cours"} onClick={()=>setStatus("En cours")}>En cours</button>
        <button className={`stat-pill ${status === "En retard" ? "active" : ""}`} type="button" aria-pressed={status === "En retard"} onClick={()=>setStatus("En retard")}>En retard</button>
      </div>
      <div className="filters">
        <div className="field"><div className="input-icon"><Icon name="search" size={18}/><input className="input search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher un projet..."/></div></div>
        <select className="select" value={risk} onChange={e=>setRisk(e.target.value)}><option value="Tous">Tous risques</option><option value="faible">Faible</option><option value="moyen">Moyen</option><option value="élevé">Élevé</option></select>
        <button className="btn btn-primary" type="button" onClick={()=>setOpen(true)}><Icon name="plus" size={18}/>Nouveau projet</button>
      </div>
    </div>

    <div className="card card-body flush">
      <div className="table-wrap">
        <table className="table responsive">
          <thead><tr><th>Projet</th><th>Client</th><th>Échéance</th><th>Statut</th><th>Risque</th><th>Progression</th></tr></thead>
          <tbody>
            {list.map(p => <tr key={p.id} className="is-clickable"><td data-label="Projet" className="cell-main"><Link to={`/chef/projets/${p.id}`}><strong>{p.name}</strong></Link></td><td data-label="Client">{DB.clients.find(c => c.id === p.client)?.name || "—"}</td><td data-label="Échéance">{formatDate(p.end)}</td><td data-label="Statut"><span className={statusClass(p.status)}>{p.status}</span></td><td data-label="Risque"><span className={riskClass(p.risk)}>{p.risk}</span></td><td data-label="Progression"><div className="prog-cell"><div className="progress"><i style={{"--v":`${p.progress}%`}}/></div><span>{p.progress}%</span></div></td></tr>)}
          </tbody>
        </table>
      </div>
    </div>

    {open && <div className="modal-backdrop"><form className="modal-box" onSubmit={submit}>
      <div className="modal-head"><h2>Nouveau projet</h2><button type="button" className="btn-icon" onClick={()=>setOpen(false)}><Icon name="x" size={18}/></button></div>
      <div className="form-grid">
        <div className="field full"><label>Nom</label><input className="input" name="name" required/></div>
        <div className="field full"><label>Description</label><textarea className="textarea" name="description" rows={4}/></div>
        <div className="field"><label>Début</label><input className="input" type="date" name="start" defaultValue={new Date().toISOString().slice(0,10)}/></div>
        <div className="field"><label>Fin</label><input className="input" type="date" name="end"/></div>
        <div className="field"><label>Progression</label><input className="input" type="number" min="0" max="100" name="progress" defaultValue={20}/></div>
        <div className="field"><label>Priorité</label><select className="select" name="risk" defaultValue="moyen"><option value="faible">Faible</option><option value="moyen">Moyen</option><option value="élevé">Élevé</option></select></div>
        <div className="field full"><label>Statut</label><select className="select" name="status" defaultValue="En cours"><option>En cours</option><option>En retard</option><option>Terminé</option></select></div>
      </div>
      <div className="modal-foot"><button type="button" className="btn btn-ghost" onClick={()=>setOpen(false)}>Annuler</button><button className="btn btn-primary">Créer</button></div>
    </form></div>}

    {toasts.length > 0 && <div className="toasts">{toasts.map(t => <div key={t.id} className={`toast toast-${t.type}`}><Icon name={t.type === "success" ? "check-circle" : "info"} size={18}/><span>{t.message}</span></div>)}</div>}
  </>;
}

export function ChefProjectDetail() {
  const {id} = useParams();
  const projectItem = DB.projects.find(p => p.id === id);
  const teamMembers = DB.employees.filter(e => e.team === projectItem?.team);
  const relatedTasks = DB.tasks.filter(t => t.projectId === id);

  if (!projectItem) {
    return <div className="empty"><div className="empty-ico"><Icon name="folder" size={24}/></div><div><strong>Projet introuvable</strong><p>Le projet demandé n'est pas disponible.</p></div><Link className="btn btn-primary" to="/chef/projets">Retour</Link></div>;
  }

  return <div className="grid cols-2-1 stack-gap">
    <div className="card card-pad">
      <h2>{projectItem.name}</h2>
      <p style={{marginTop:8,color:"var(--text-2)"}}>{projectItem.description}</p>
      <div className="detail-grid" style={{marginTop:20}}>
        <div><dt>Statut</dt><dd><span className={statusClass(projectItem.status)}>{projectItem.status}</span></dd></div>
        <div><dt>Progression</dt><dd>{projectItem.progress}%</dd></div>
        <div><dt>Échéance</dt><dd>{formatDate(projectItem.end)}</dd></div>
        <div><dt>Risque</dt><dd><span className={riskClass(projectItem.risk)}>{projectItem.risk}</span></dd></div>
      </div>
    </div>

    <div className="card card-pad">
      <h3>Membres</h3>
      <div className="feed" style={{padding:0,marginTop:16}}>
        {teamMembers.map(member => <div className="list-item" key={member.id}><Avatar name={member.name}/><div className="list-main"><strong>{member.name}</strong><small>{member.profile}</small></div></div>)}
      </div>
    </div>

    <div className="card" style={{gridColumn:"1 / -1"}}>
      <div className="card-head"><h3>Tâches du projet</h3><Link className="btn btn-ghost btn-sm" to="/chef/taches">Voir toutes</Link></div>
      <div className="card-body flush">
        {relatedTasks.length ? relatedTasks.map(task => <div className="list-item" key={task.id}><div className="list-main"><strong>{task.title}</strong><small>{task.assigneeName} · {task.dueDate}</small></div><div className="list-side"><span className={statusClass(task.status)}>{task.status}</span></div></div>) : <div className="empty"><strong>Aucune tâche pour ce projet.</strong></div>}
      </div>
    </div>
  </div>;
}

export function ChefTasks() {
  const teamId = getChefTeamId();
  const [q,setQ]=useState("");
  const [projectId,setProjectId]=useState("all");
  const [priority,setPriority]=useState("all");
  const [open,setOpen]=useState(false);
  const {toasts,push}=useToast();

  const filtered = useMemo(() => DB.tasks.filter(task => 
    task.teamId === teamId &&
    (!q || `${task.title} ${task.assigneeName}`.toLowerCase().includes(q.toLowerCase())) &&
    (projectId === "all" || task.projectId === projectId) &&
    (priority === "all" || task.priority === priority)
  ), [q,projectId,priority,teamId]);

  function saveTask(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const item = {
      id: `t${Date.now()}`,
      title: sanitizeText(form.get("title")),
      projectId: sanitizeText(form.get("projectId")) || "p1",
      projectName: DB.projects.find(p => p.id === sanitizeText(form.get("projectId")))?.name || "Projet",
      assigneeId: sanitizeText(form.get("assigneeId")) || "w1",
      assigneeName: DB.employees.find(e => e.id === sanitizeText(form.get("assigneeId")))?.name || "Yasmine Kefi",
      teamId,
      status: sanitizeText(form.get("status")) || "À faire",
      priority: sanitizeText(form.get("priority")) || "Moyenne",
      dueDate: sanitizeText(form.get("dueDate")) || new Date(Date.now()+86400000*5).toISOString().slice(0,10),
      owner: "Amine Trabelsi"
    };
    if (!item.title) return;
    DB.tasks.unshift(item);
    saveDb();
    setOpen(false);
    push("Tâche ajoutée", "success");
  }

  return <>
    <div className="toolbar">
      <div className="filters">
        <div className="field"><div className="input-icon"><Icon name="search" size={18}/><input className="input search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher une tâche..."/></div></div>
        <select className="select" value={projectId} onChange={e=>setProjectId(e.target.value)}><option value="all">Tous projets</option>{DB.projects.filter(p => p.team === teamId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <select className="select" value={priority} onChange={e=>setPriority(e.target.value)}><option value="all">Toutes priorités</option><option value="Urgent">Urgent</option><option value="Haute">Haute</option><option value="Moyenne">Moyenne</option><option value="Faible">Faible</option></select>
        <button className="btn btn-primary" type="button" onClick={()=>setOpen(true)}><Icon name="plus" size={18}/>Nouvelle tâche</button>
      </div>
    </div>

    <div className="kanban-grid">
      {['À faire','En cours','En révision','Terminée','En retard'].map(statusKey => <div className="kanban-column" key={statusKey}>
        <div className="kanban-head"><strong>{statusKey}</strong><span>{filtered.filter(task => task.status === statusKey).length}</span></div>
        <div className="kanban-body">
          {filtered.filter(task => task.status === statusKey).map(task => <div className="task-card" key={task.id}>
            <div className="task-top"><span className={statusClass(task.status)}>{task.priority}</span><select className="small-select" value={task.status} onChange={e=>{task.status = e.target.value; saveDb();}}>
              {['À faire','En cours','En révision','Terminée','En retard'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select></div>
            <strong>{task.title}</strong>
            <small>{task.projectName}</small>
            <div className="task-meta"><span>{task.assigneeName}</span><span>{task.dueDate}</span></div>
          </div>)}
        </div>
      </div>)}
    </div>

    {open && <div className="modal-backdrop"><form className="modal-box" onSubmit={saveTask}>
      <div className="modal-head"><h2>Créer une tâche</h2><button type="button" className="btn-icon" onClick={()=>setOpen(false)}><Icon name="x" size={18}/></button></div>
      <div className="form-grid">
        <div className="field full"><label>Intitulé</label><input className="input" name="title" required/></div>
        <div className="field"><label>Projet</label><select className="select" name="projectId" defaultValue={DB.projects.filter(p => p.team === teamId)[0]?.id || "p1"}>{DB.projects.filter(p => p.team === teamId).map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
        <div className="field"><label>Assigné à</label><select className="select" name="assigneeId" defaultValue={DB.employees.filter(e => e.team === teamId)[0]?.id || "w1"}>{DB.employees.filter(e => e.team === teamId).map(e=> <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
        <div className="field"><label>Priorité</label><select className="select" name="priority" defaultValue="Moyenne"><option>Urgent</option><option>Haute</option><option>Moyenne</option><option>Faible</option></select></div>
        <div className="field"><label>Statut</label><select className="select" name="status" defaultValue="À faire"><option>À faire</option><option>En cours</option><option>En révision</option><option>Terminée</option><option>En retard</option></select></div>
        <div className="field"><label>Échéance</label><input className="input" type="date" name="dueDate"/></div>
      </div>
      <div className="modal-foot"><button type="button" className="btn btn-ghost" onClick={()=>setOpen(false)}>Annuler</button><button className="btn btn-primary">Créer</button></div>
    </form></div>}

    {toasts.length > 0 && <div className="toasts">{toasts.map(t => <div key={t.id} className={`toast toast-${t.type}`}><Icon name={t.type === "success" ? "check-circle" : "info"} size={18}/><span>{t.message}</span></div>)}</div>}
  </>;
}

export function ChefAttendance() {
  const teamId = getChefTeamId();
  const [search,setSearch]=useState("");
  const rows = DB.attendance.filter(row => row.teamId === teamId && (!search || row.employeeName.toLowerCase().includes(search.toLowerCase())));

  return <>
    <div className="toolbar"><div className="filters"><div className="field"><div className="input-icon"><Icon name="search" size={18}/><input className="input search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un employé..."/></div></div></div></div>
    <div className="grid cols-3 stack-gap">
      <div className="card card-pad"><h3>Présent</h3><div className="kpi-value">{rows.filter(r => r.status === "Présent").length}</div></div>
      <div className="card card-pad"><h3>Absent</h3><div className="kpi-value">{rows.filter(r => r.status === "Absent").length}</div></div>
      <div className="card card-pad"><h3>Retards</h3><div className="kpi-value">{rows.filter(r => r.status === "Retard").length}</div></div>
    </div>
    <div className="card card-body flush"><div className="table-wrap"><table className="table responsive"><thead><tr><th>Employé</th><th>Date</th><th>Heure</th><th>Statut</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td data-label="Employé" className="cell-main"><div className="person"><Avatar name={row.employeeName}/><strong>{row.employeeName}</strong></div></td><td data-label="Date">{row.date}</td><td data-label="Heure">{row.time}</td><td data-label="Statut"><span className={row.status === "Présent" ? "badge badge-ok" : row.status === "Retard" ? "badge badge-warn" : "badge badge-danger"}>{row.status}</span></td></tr>)}</tbody></table></div></div>
  </>;
}

function getStatusBadge(status, type = "task") {
  if (type === "report") {
    if (status === "À valider") return "badge badge-warn";
    if (status === "Validé") return "badge badge-ok";
    if (status === "Refusé") return "badge badge-danger";
    return "badge badge-info";
  }
  if (status === "Validé") return "badge badge-ok";
  if (status === "Refusé") return "badge badge-danger";
  if (status === "En attente") return "badge badge-warn";
  return "badge badge-info";
}

export function ChefLeave() {
  const [filter, setFilter] = useState("all");
  const [month, setMonth] = useState(() => new Date(2026, 9, 1));
  const {toasts,push}=useToast();
  const rows = DB.leaveRequests.filter(item => filter === "all" || item.status === filter);

  const dateList = useMemo(() => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const mondayOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const cellCount = Math.ceil((mondayOffset + daysInMonth) / 7) * 7;

    return Array.from({length: cellCount}, (_, index) => {
      const day = index - mondayOffset + 1;
      return day < 1 || day > daysInMonth ? null : new Date(year, monthIndex, day);
    });
  }, [month]);

  function changeMonth(offset) {
    setMonth(current => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function respond(id, status) {
    const item = DB.leaveRequests.find(r => r.id === id);
    if (!item) return;
    if (status === "Refusé") {
      const reason = window.prompt("Motif du refus :");
      if (reason === null) return;
      item.reason = `${item.reason} — Refus: ${reason}`;
    }
    item.status = status;
    saveDb();
    push(status === "Validé" ? "Demande validée" : "Demande refusée", status === "Validé" ? "success" : "danger");
  }

  return <>
    <div className="toolbar">
      <div className="stat-pills">
        <button className={`stat-pill ${filter === "all" ? "active" : ""}`} type="button" onClick={()=>setFilter("all")}>Toutes ({DB.leaveRequests.length})</button>
        <button className={`stat-pill ${filter === "En attente" ? "active" : ""}`} type="button" onClick={()=>setFilter("En attente")}>En attente</button>
        <button className={`stat-pill ${filter === "Validé" ? "active" : ""}`} type="button" onClick={()=>setFilter("Validé")}>Validés</button>
        <button className={`stat-pill ${filter === "Refusé" ? "active" : ""}`} type="button" onClick={()=>setFilter("Refusé")}>Refusés</button>
      </div>
    </div>

    <div className="card card-pad">
      <div className="calendar-shell calendar-shell-month">
        <div className="calendar-month-toolbar">
          <button className="btn btn-ghost btn-sm" type="button" onClick={()=>changeMonth(-1)} aria-label="Mois précédent"><Icon name="chevron-left" size={18}/></button>
          <h3>{month.toLocaleDateString("fr-FR", {month:"long", year:"numeric"})}</h3>
          <button className="btn btn-ghost btn-sm" type="button" onClick={()=>changeMonth(1)} aria-label="Mois suivant"><Icon name="chevron-right" size={18}/></button>
        </div>
        <div className="calendar-header-row calendar-header-month">
          {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(day => <div className="calendar-day-label" key={day}>{day}</div>)}
        </div>
        <div className="calendar-grid-month">
          {dateList.map((date, index) => {
            if (!date) return <div className="calendar-date-cell calendar-date-empty" key={`empty-${index}`} aria-hidden="true"/>;
            const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
            const leaveEvents = DB.leaveRequests.filter(item => iso >= item.start && iso <= item.end);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            return <div className={`calendar-date-cell${isWeekend ? " calendar-weekend" : ""}`} key={iso}>
              <div className="calendar-date-head">{date.getDate()}</div>
              <div className="calendar-date-events">
                {leaveEvents.map(item => <div key={item.id} className={`leave-chip ${item.status === "Validé" ? "valid" : item.status === "Refusé" ? "refused" : "pending"}`}>
                  <strong>{item.employeeName}</strong>
                  <span>{item.type}</span>
                </div>)}
              </div>
            </div>;
          })}
        </div>
      </div>
    </div>

    <div className="card card-body flush">
      <div className="table-wrap">
        <table className="table responsive table-actions">
          <thead><tr><th>Employé</th><th>Type</th><th>Début</th><th>Fin</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>{rows.map(r => <tr key={r.id}><td data-label="Employé" className="cell-main"><div className="person"><Avatar name={r.employeeName}/><strong>{r.employeeName}</strong></div></td><td data-label="Type"><span className="badge badge-info">{r.type}</span></td><td data-label="Début">{r.start}</td><td data-label="Fin">{r.end}</td><td data-label="Statut"><span className={getStatusBadge(r.status, "leave")}>{r.status}</span></td><td data-label="Actions" className="actions"><div className="inline-actions">{r.status === "En attente" ? <><button className="btn btn-primary btn-sm" type="button" onClick={()=>respond(r.id,"Validé")}>Valider</button><button className="btn btn-ghost btn-sm" type="button" onClick={()=>respond(r.id,"Refusé")}>Refuser</button></> : <button className="btn btn-ghost btn-sm" type="button" disabled>{r.status}</button>}</div></td></tr>)}</tbody>
        </table>
      </div>
    </div>

    {toasts.length > 0 && <div className="toasts">{toasts.map(t => <div key={t.id} className={`toast toast-${t.type}`}><Icon name={t.type === "success" ? "check-circle" : "alert"} size={18}/><span>{t.message}</span></div>)}</div>}
  </>;
}

export function ChefReports() {
  const teamId = getChefTeamId();
  const [filter,setFilter]=useState("all");
  const [selectedReport,setSelectedReport]=useState(null);
  const {toasts,push}=useToast();
  const rows = DB.reports.filter(report => {
    const employee = DB.employees.find(member=>member.id===report.employeeId);
    return employee?.team===teamId && (filter === "all" || report.status === filter);
  });

  const reportTasks = Array.isArray(selectedReport?.tasks) ? selectedReport.tasks : [];
  const reportProblems = Array.isArray(selectedReport?.problems) ? selectedReport.problems : [];

  function viewReport(id) {
    const report = DB.reports.find(item=>item.id===id);
    const employee = DB.employees.find(member=>member.id===report?.employeeId);
    if (!report || employee?.team!==teamId) return;
    setSelectedReport(report);
  }

  function respond(id,status) {
    const item = DB.reports.find(r => r.id === id);
    const employee = DB.employees.find(member=>member.id===item?.employeeId);
    if (!item || employee?.team!==teamId) return;
    if (status === "Validé" && item.status === "Validé") return;
    if (status === "Refusé" && item.status === "Refusé") return;
    if (status === "Refusé") {
      const reason = window.prompt("Motif du refus :");
      if (reason === null) return;
      item.reason = reason;
    }
    item.status = status;
    saveDb();
    push(status === "Validé" ? "Rapport validé" : "Rapport refusé", status === "Validé" ? "success" : "danger");
  }

  return <>
    <div className="toolbar">
      <div className="stat-pills">
        <button className={`stat-pill ${filter === "all" ? "active" : ""}`} type="button" onClick={()=>setFilter("all")}>Tous ({DB.reports.length})</button>
        <button className={`stat-pill ${filter === "À valider" ? "active" : ""}`} type="button" onClick={()=>setFilter("À valider")}>À valider</button>
        <button className={`stat-pill ${filter === "Validé" ? "active" : ""}`} type="button" onClick={()=>setFilter("Validé")}>Validés</button>
        <button className={`stat-pill ${filter === "Refusé" ? "active" : ""}`} type="button" onClick={()=>setFilter("Refusé")}>Refusés</button>
      </div>
    </div>

    <div className="card card-body flush">
      <div className="table-wrap">
        <table className="table responsive table-actions reports-table">
          <thead><tr><th>Employé</th><th>Projet</th><th>Date</th><th>Compte rendu</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>{rows.map(r => <tr key={r.id}><td data-label="Employé" className="cell-main"><div className="person"><Avatar name={r.employeeName}/><strong>{r.employeeName}</strong></div></td><td data-label="Projet">{r.projectName}</td><td data-label="Date">{r.date}</td><td data-label="Compte rendu"><button className="btn btn-ghost btn-sm report-view-button" type="button" onClick={()=>viewReport(r.id)}><Icon name="file-text" size={16}/>Consulter</button></td><td data-label="Statut"><span className={getStatusBadge(r.status, "report")}>{r.status}</span></td><td data-label="Actions" className="actions"><div className="inline-actions">{r.status === "À valider" ? <><button className="btn btn-primary btn-sm" type="button" onClick={()=>respond(r.id,"Validé")}>Valider</button><button className="btn btn-ghost btn-sm" type="button" onClick={()=>respond(r.id,"Refusé")}>Refuser</button></> : <button className="btn btn-ghost btn-sm" type="button" disabled>{r.status === "Validé" ? "Validé" : "Refusé"}</button>}</div></td></tr>)}</tbody>
        </table>
      </div>
    </div>

    {selectedReport && <div className="modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setSelectedReport(null);}}>
      <section className="modal-box report-viewer" role="dialog" aria-modal="true" aria-labelledby="report-viewer-title">
        <div className="modal-head"><div><h2 id="report-viewer-title">Compte rendu</h2><p>{selectedReport.employeeName} · {selectedReport.projectName} · {selectedReport.date}</p></div><button type="button" className="btn-icon" aria-label="Fermer" onClick={()=>setSelectedReport(null)}><Icon name="x" size={18}/></button></div>
        <div className="report-viewer-content">
          {reportTasks.length || reportProblems.length ? <>
            {reportTasks.length > 0 && <section className="report-detail-section"><h3>Travaux réalisés</h3><ul>{reportTasks.map((task,index)=><li key={`${selectedReport.id}-task-${index}`}>{task}</li>)}</ul></section>}
            {reportProblems.length > 0 && <section className="report-detail-section"><h3>Points de vigilance</h3><ul>{reportProblems.map((problem,index)=><li key={`${selectedReport.id}-problem-${index}`}>{problem}</li>)}</ul></section>}
          </> : <p className="report-empty-state">Aucun compte rendu disponible.</p>}
          <section className="report-document-state"><Icon name="file-text" size={20}/><div><strong>Document joint</strong><p>Aucun compte rendu disponible au format PDF ou Word.</p></div></section>
        </div>
        <div className="modal-foot"><button type="button" className="btn btn-ghost" onClick={()=>setSelectedReport(null)}>Fermer</button></div>
      </section>
    </div>}

    {toasts.length > 0 && <div className="toasts">{toasts.map(t => <div key={t.id} className={`toast toast-${t.type}`}><Icon name={t.type === "success" ? "check-circle" : "alert"} size={18}/><span>{t.message}</span></div>)}</div>}
  </>;
}

export function ChefMeetings() {
  const teamId = getChefTeamId();
  const [open,setOpen]=useState(false);
  const [selectedSlot,setSelectedSlot]=useState({date:"",time:"09:00"});
  const [editingMeeting,setEditingMeeting]=useState(null);
  const [meetingsVersion,setMeetingsVersion]=useState(0);
  const [weekStart,setWeekStart]=useState(()=>{
    const today = new Date();
    today.setDate(today.getDate() - (today.getDay()+6)%7);
    today.setHours(0,0,0,0);
    return today;
  });
  const {toasts,push}=useToast();
  const teamProjects = DB.projects.filter(projectItem=>projectItem.team===teamId);
  const existingProject = editingMeeting && DB.projects.find(projectItem=>projectItem.id===editingMeeting.projectId);
  const meetingProjects = existingProject && !teamProjects.some(projectItem=>projectItem.id===existingProject.id)
    ? [existingProject,...teamProjects]
    : teamProjects;
  const meetingEmployees = DB.employees.filter(member=>
    member.team===teamId || editingMeeting?.participants?.includes(member.name)
  );

  const days = useMemo(()=>Array.from({length:7},(_,index)=>{
    const date = new Date(weekStart.getFullYear(),weekStart.getMonth(),weekStart.getDate()+index);
    return {key:toDateKey(date),label:date.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric"}),date};
  }),[weekStart]);
  const sortedMeetings = useMemo(()=>[...DB.meetings].sort((a,b)=>
    a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || "") || a.id.localeCompare(b.id)
  ),[meetingsVersion]);
  const visibleMeetingHours = sortedMeetings
    .filter(meeting=>meeting.date >= days[0].key && meeting.date <= days[6].key)
    .map(meeting=>Number(meeting.time?.slice(0,2)))
    .filter(hour=>Number.isInteger(hour) && hour >= 0 && hour <= 23);
  const firstHour = Math.min(8,...visibleMeetingHours);
  const lastHour = Math.max(18,...visibleMeetingHours);
  const timeSlots = Array.from({length:lastHour-firstHour+1},(_,index)=>firstHour+index);
  const weekEnd = days[6].date;
  const weekLabel = `Semaine du ${weekStart.toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})} au ${weekEnd.toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}`;

  function openSlot(date, time) {
    setEditingMeeting(null);
    setSelectedSlot({date, time});
    setOpen(true);
  }

  function openMeeting(meeting) {
    setEditingMeeting(meeting);
    setSelectedSlot({date:meeting.date,time:meeting.time});
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setEditingMeeting(null);
  }

  function changeWeek(offset) {
    setWeekStart(current=>new Date(current.getFullYear(),current.getMonth(),current.getDate()+offset*7));
  }

  function submit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const selected = form.getAll("participants");
    const item = {
      id: editingMeeting?.id || `m${Date.now()}`,
      title: sanitizeText(form.get("title")),
      date: sanitizeText(form.get("date")) || selectedSlot.date,
      time: sanitizeText(form.get("time")) || selectedSlot.time,
      duration: Number(form.get("duration") || 60),
      participants: selected.length ? selected : editingMeeting ? [] : ["Amine Trabelsi"],
      projectId: sanitizeText(form.get("projectId")) || "p1",
      location: sanitizeText(form.get("location")) || "Salle de réunion",
      description: sanitizeText(form.get("description")) || "Réunion de suivi"
    };
    if (!item.title) return;
    if (editingMeeting) {
      const index = DB.meetings.findIndex(meeting=>meeting.id===editingMeeting.id);
      if (index === -1) return;
      DB.meetings[index] = item;
    } else {
      DB.meetings.push(item);
    }
    saveDb();
    setMeetingsVersion(version=>version+1);
    closeModal();
    push(editingMeeting ? "Réunion modifiée" : "Réunion planifiée", "success");
  }

  return <>
    <div className="toolbar">
      <div className="page-heading-inline"><h3 className="section-title">Calendrier des réunions</h3></div>
      <button className="btn btn-primary" type="button" onClick={()=>openSlot(toDateKey(new Date()),"09:00")}><Icon name="plus" size={18}/>Créer une réunion</button>
    </div>

    <div className="card card-pad">
      <div className="calendar-shell calendar-shell-meetings">
        <div className="calendar-period-toolbar">
          <button className="btn btn-ghost btn-sm" type="button" onClick={()=>changeWeek(-1)} aria-label="Semaine précédente"><Icon name="chevron-left" size={18}/></button>
          <h3>{weekLabel}</h3>
          <button className="btn btn-ghost btn-sm" type="button" onClick={()=>changeWeek(1)} aria-label="Semaine suivante"><Icon name="chevron-right" size={18}/></button>
        </div>
        <div className="calendar-header-row calendar-header-meetings">
          <div className="calendar-time-header">Heure</div>
          {days.map((day,index) => <div className={`calendar-day-label${index>4?" calendar-weekend-label":""}`} key={day.key}>{day.label}</div>)}
        </div>
        <div className="calendar-grid-week calendar-grid-meetings">
          {timeSlots.map(hour => <div className="calendar-row" key={hour}>
            <div className="calendar-hour-label">{String(hour).padStart(2,"0")}:00</div>
            {days.map(day => {
              const slotDate = day.key;
              const slotTime = `${String(hour).padStart(2,"0")}:00`;
              const meetingsForSlot = sortedMeetings.filter(meeting => meeting.date === slotDate && meeting.time.startsWith(`${String(hour).padStart(2,"0")}:`));
              const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
              return <div className={`calendar-slot${isWeekend?" calendar-weekend-slot":""}`} key={`${slotDate}-${slotTime}`} onClick={()=>openSlot(slotDate, slotTime)}>
                {meetingsForSlot.length ? meetingsForSlot.map(meeting => <button className="calendar-event" type="button" key={meeting.id} title={`${meeting.title} • ${meeting.time}`} onClick={event=>{event.stopPropagation();openMeeting(meeting);}}>
                  <strong>{meeting.title}</strong>
                  <span>{meeting.time}</span>
                </button>) : <button type="button" className="calendar-add" aria-label={`Ajouter une réunion le ${slotDate} à ${slotTime}`}>
                  <Icon name="plus" size={16}/>
                </button>}
              </div>;
            })}
          </div>)}
        </div>
      </div>
    </div>

    <div className="card card-body flush">
      <div className="card-head table-section-head"><h3>Réunions à venir</h3></div>
      <div className="table-wrap">
        <table className="table responsive">
          <thead><tr><th>Titre</th><th>Date</th><th>Heure</th><th>Durée</th><th>Projet</th><th>Lieu</th></tr></thead>
          <tbody>{sortedMeetings.map(meeting => <tr key={meeting.id}><td data-label="Titre" className="cell-main"><strong>{meeting.title}</strong><small>{meeting.description}</small></td><td data-label="Date">{meeting.date}</td><td data-label="Heure">{meeting.time}</td><td data-label="Durée">{meeting.duration} min</td><td data-label="Projet">{DB.projects.find(p => p.id === meeting.projectId)?.name || "—"}</td><td data-label="Lieu">{meeting.location || "Salle de réunion"}</td></tr>)}</tbody>
        </table>
      </div>
    </div>

    {open && <div className="modal-backdrop"><form className="modal-box" key={editingMeeting?.id || "new"} onSubmit={submit}>
      <div className="modal-head"><h2>{editingMeeting ? "Modifier une réunion" : "Créer une réunion"}</h2><button type="button" className="btn-icon" aria-label="Fermer" onClick={closeModal}><Icon name="x" size={18}/></button></div>
      <div className="form-grid">
        <div className="field full"><label>Objet</label><input className="input" name="title" defaultValue={editingMeeting?.title || ""} required/></div>
        <div className="field"><label>Jour</label><input className="input" type="date" name="date" defaultValue={editingMeeting?.date || selectedSlot.date} required/></div>
        <div className="field"><label>Heure</label><input className="input" type="time" name="time" defaultValue={editingMeeting?.time || selectedSlot.time} required/></div>
        <div className="field"><label>Durée (min)</label><input className="input" type="number" name="duration" min="1" defaultValue={editingMeeting?.duration || 60}/></div>
        <div className="field"><label>Projet</label><select className="select" name="projectId" defaultValue={editingMeeting?.projectId || teamProjects[0]?.id || ""}>{meetingProjects.map(projectItem => <option key={projectItem.id} value={projectItem.id}>{projectItem.name}</option>)}</select></div>
        <div className="field"><label>Lieu</label><input className="input" name="location" defaultValue={editingMeeting?.location || "Salle de réunion"}/></div>
        <div className="field full"><label>Participants</label><div className="checkbox-group">{meetingEmployees.map(member => <label key={member.id} className="check check-inline"><input type="checkbox" name="participants" value={member.name} defaultChecked={editingMeeting ? editingMeeting.participants?.includes(member.name) : member.id === "w1" || member.id === "w10"}/><span>{member.name}</span></label>)}</div></div>
        <div className="field full"><label>Description</label><textarea className="textarea" name="description" rows={4} defaultValue={editingMeeting?.description || ""}/></div>
      </div>
      <div className="modal-foot"><button type="button" className="btn btn-ghost" onClick={closeModal}>Annuler</button><button className="btn btn-primary">{editingMeeting ? "Modifier" : "Créer"}</button></div>
    </form></div>}

    {toasts.length > 0 && <div className="toasts">{toasts.map(t => <div key={t.id} className={`toast toast-${t.type}`}><Icon name={t.type === "success" ? "check-circle" : "info"} size={18}/><span>{t.message}</span></div>)}</div>}
  </>;
}

export function ChefMessages() {
  const [activeId,setActiveId]=useState(DB.messages[0]?.id || "");
  const [draft,setDraft]=useState("");
  const active = DB.messages.find(m => m.id === activeId) || DB.messages[0];

  function send() {
    if (!active || !draft.trim()) return;
    active.messages.push({id:`msg${Date.now()}`, sender:"Amine Trabelsi", me:true, text:draft.trim(), time:new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})});
    saveDb();
    setDraft("");
  }

  return <div className="chat-shell">
    <aside className="chat-list card">
      {DB.messages.map(conversation => <button key={conversation.id} className={`chat-row ${activeId === conversation.id ? "active" : ""}`} type="button" onClick={()=>setActiveId(conversation.id)}>
        <div className="chat-row-main"><strong>{conversation.title}</strong><small>{conversation.preview}</small></div>
        <span className="chat-badge">{conversation.unread}</span>
      </button>)}
    </aside>
    <div className="chat-panel card">
      <div className="chat-header"><div><strong>{active?.title}</strong><small>{active?.participants.join(" · ")}</small></div></div>
      <div className="chat-body">
        {active?.messages.map(msg => <div key={msg.id} className={`chat-bubble ${msg.me ? "mine" : ""}`}>
          <strong>{msg.sender}</strong>
          <p>{msg.text}</p>
          <small>{msg.time}</small>
        </div>)}
      </div>
      <div className="chat-composer">
        <input className="input" value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Écrire un message..." />
        <button className="btn btn-primary" type="button" onClick={send}>Envoyer</button>
      </div>
    </div>
  </div>;
}

export function ChefNotifications() {
  const [refresh,setRefresh]=useState(0);
  const unreadCount = DB.notifications.filter(n => !n.read).length;

  function markRead(id) {
    const note = DB.notifications.find(n => n.id === id);
    if (!note) return;
    note.read = true;
    saveDb();
    setRefresh(v => v + 1);
  }

  return <div className="card card-body flush">
    <div className="toolbar compact-toolbar">
      <div className="stat-pills"><button className="stat-pill active" type="button">Toutes ({DB.notifications.length})</button><button className="stat-pill" type="button">Non lues ({unreadCount})</button></div>
    </div>
    <div className="table-wrap">
      <table className="table responsive table-actions">
        <thead><tr><th>Type</th><th>Libellé</th><th>Date</th><th>Statut</th><th>Action</th></tr></thead>
        <tbody>{DB.notifications.map(note => <tr key={note.id}><td data-label="Type"><span className={`badge ${note.level === "urgent" ? "badge-danger" : note.level === "warning" ? "badge-warn" : "badge-info"}`}>{note.type}</span></td><td data-label="Libellé" className="cell-main"><strong>{note.title}</strong><small>{note.message}</small></td><td data-label="Date">{note.date}</td><td data-label="Statut"><span className={note.read ? "badge badge-ok" : "badge badge-warn"}>{note.read ? "Lue" : "À traiter"}</span></td><td data-label="Action" className="actions"><div className="inline-actions"><button className="btn btn-ghost btn-sm" type="button" disabled={note.read} onClick={()=>markRead(note.id)}>{note.read ? "Lue" : "Marquer comme lue"}</button></div></td></tr>)}</tbody>
      </table>
    </div>
  </div>;
}
