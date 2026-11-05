import {useEffect,useMemo,useState} from "react";
import {Link,useParams} from "react-router-dom";
import {Icon} from "../components/Icon";
import {useAppSettings} from "../components/Layout";
import {DB,saveDb} from "../data/mockData";
import {ago,avatarStyle,formatDate,initials,statusClass} from "../utils";

const TASK_STATUSES = ["À faire","En cours","En révision","Terminée"];

function getSession() {
  try {
    return JSON.parse(localStorage.getItem("workflow_admin_session") || "null");
  } catch {
    return null;
  }
}

function getEmployee() {
  const session = getSession();
  return DB.employees.find(employee=>employee.email===session?.email) || null;
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

function todayKey() {
  return dateKey(new Date());
}

function employeeTasks(employee) {
  return employee ? DB.tasks.filter(task=>task.assigneeId===employee.id) : [];
}

function employeeProjects(employee) {
  if (!employee) return [];
  const projectIds = new Set(employeeTasks(employee).map(task=>task.projectId));
  if (employee.project) projectIds.add(employee.project);
  return DB.projects.filter(project=>projectIds.has(project.id));
}

function employeeMeetings(employee) {
  return employee ? DB.meetings.filter(meeting=>meeting.participants?.includes(employee.name)).sort((a,b)=>
    a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
  ) : [];
}

function employeeNotifications(employee) {
  if (!employee) return [];
  const projectNames = employeeProjects(employee).map(project=>project.name);
  const taskTitles = employeeTasks(employee).map(task=>task.title);
  const meetingTitles = employeeMeetings(employee).map(meeting=>meeting.title);
  return DB.notifications.filter(notification=>
    notification.employeeId===employee.id ||
    [notification.title,notification.message].some(text=>
      typeof text==="string" && [employee.name,...projectNames,...taskTitles,...meetingTitles].some(term=>term && text.includes(term))
    )
  ).sort((a,b)=>b.date.localeCompare(a.date));
}

function Avatar({name,size=36}) {
  return <span className="avatar" style={{"--size":`${size}px`,...avatarStyle(name)}} aria-hidden="true">{initials(name)}</span>;
}

function Empty({message}) {
  return <div className="empty"><div className="empty-ico"><Icon name="info" size={24}/></div><strong>{message}</strong></div>;
}

function TaskStatus({status}) {
  const className = status==="Terminée" || status==="Terminé" ? "badge badge-ok" :
    status==="En retard" ? "badge badge-danger" :
    status==="Retard" ? "badge badge-warn" :
    status==="Absent" ? "badge badge-danger" :
    status==="Présent" ? "badge badge-ok" :
    status==="En cours" ? "badge badge-info" :
    status==="En révision" ? "badge badge-warn" : "badge";
  return <span className={className}>{status}</span>;
}

function taskIsOverdue(task) {
  return task.status==="En retard" || (task.dueDate<todayKey() && task.status!=="Terminée" && task.status!=="Terminé");
}

export function EmployeeDashboard() {
  const employee = getEmployee();
  const tasks = employeeTasks(employee);
  const projects = employeeProjects(employee).filter(project=>project.status==="En cours");
  const meetings = employeeMeetings(employee).filter(meeting=>meeting.date>=todayKey()).slice(0,3);
  const notifications = employeeNotifications(employee).slice(0,4);
  const attendance = DB.attendance.filter(row=>row.employeeName===employee?.name).sort((a,b)=>b.date.localeCompare(a.date));
  const lastAttendance = attendance[0];
  const todayAttendance = attendance.find(row=>row.date===todayKey());
  const leaves = DB.leaveRequests.filter(request=>request.employeeId===employee?.id).sort((a,b)=>b.start.localeCompare(a.start));
  const urgentTasks = tasks.filter(task=>task.priority==="Urgent" || taskIsOverdue(task));
  const upcomingTasks = tasks.filter(task=>task.dueDate>=todayKey() && task.status!=="Terminée" && task.status!=="Terminé").sort((a,b)=>a.dueDate.localeCompare(b.dueDate)).slice(0,4);

  if (!employee) return <Empty message="Aucun profil employé associé à cette session."/>;

  const indicators = [
    {icon:"list",label:"À faire",value:tasks.filter(task=>task.status==="À faire").length,color:"var(--accent)"},
    {icon:"clock",label:"En cours",value:tasks.filter(task=>task.status==="En cours").length,color:"var(--info)"},
    {icon:"check-circle",label:"Terminées",value:tasks.filter(task=>task.status==="Terminée" || task.status==="Terminé").length,color:"var(--ok)"},
    {icon:"alert",label:"Urgentes ou en retard",value:urgentTasks.length,color:"var(--danger)"},
    {icon:"folder",label:"Projets en cours",value:projects.length,color:"var(--info)"}
  ];

  return <>
    <div className="card card-pad employee-welcome"><div className="employee-welcome-profile"><Avatar name={employee.name} size={48}/><div><h2>Bonjour, {employee.name.split(" ")[0]}</h2><p>{employee.profile}</p><span className="employee-team-label">Équipe {DB.teams.find(team=>team.id===employee.team)?.name || "—"}</span></div></div><Link className="btn btn-ghost btn-sm" to="/employee/parametres"><Icon name="user" size={16}/>Mon profil</Link></div>
    <div className="grid grid-kpi employee-kpi-grid">
      {indicators.map(item=><div className="card kpi" key={item.label}><div className="kpi-top"><div className="kpi-ico" style={{"--t":item.color}}><Icon name={item.icon} size={22}/></div><div>{item.label}</div></div><div className="kpi-value">{item.value}</div><div className="kpi-foot"><div className="trend flat">Selon vos affectations</div></div></div>)}
    </div>
    <div className="grid cols-2 employee-dashboard-grid">
      <div className="card"><div className="card-head"><h3>Prochaines échéances</h3><Link className="link" to="/employee/taches">Toutes mes tâches</Link></div><div className="card-body flush">{upcomingTasks.length?upcomingTasks.map(task=><div className="list-item" key={task.id}><span className="tone-ico tone-accent"><Icon name="check" size={17}/></span><div className="list-main"><strong>{task.title}</strong><small>{task.projectName} · {formatDate(task.dueDate)}</small></div><TaskStatus status={task.status}/></div>):<Empty message="Aucune échéance à venir."/>}</div></div>
      <div className="card"><div className="card-head"><h3>Prochaines réunions</h3><Link className="link" to="/employee/reunions">Mon planning</Link></div><div className="card-body flush">{meetings.length?meetings.map(meeting=><div className="list-item" key={meeting.id}><span className="tone-ico tone-info"><Icon name="calendar" size={17}/></span><div className="list-main"><strong>{meeting.title}</strong><small>{formatDate(meeting.date)} · {meeting.time}</small></div></div>):<Empty message="Aucune réunion à venir."/>}</div></div>
      <div className="card employee-attendance-card"><div className="card-head"><h3>Présence et congés</h3></div><div className="card-body"><div className="employee-summary-grid"><div><small>Dernière présence</small><strong>{lastAttendance?formatDate(lastAttendance.date):"Aucune présence enregistrée"}</strong><span>{lastAttendance?.time || ""}</span></div><div><small>Statut du jour</small><strong>{todayAttendance?.status || "Aucun pointage aujourd'hui"}</strong></div><div><small>Congés en attente</small><strong>{leaves.filter(request=>request.status==="En attente").length}</strong></div></div><div className="employee-inline-links"><Link className="btn btn-ghost btn-sm" to="/employee/presences">Mes présences</Link><Link className="btn btn-ghost btn-sm" to="/employee/conges">Mes congés</Link></div></div></div>
      <div className="card"><div className="card-head"><h3>Notifications récentes</h3><Link className="link" to="/employee/notifications">Tout voir</Link></div><div className="card-body flush">{notifications.length?notifications.map(notification=><div className="list-item" key={notification.id}><span className={`tone-ico tone-${notification.level==="warning"?"warn":notification.level==="urgent"?"danger":"info"}`}><Icon name={notification.type==="Réunion"?"calendar":"bell"} size={17}/></span><div className="list-main"><strong>{notification.title}</strong><small>{notification.date} · {notification.message}</small></div></div>):<Empty message="Aucune notification personnelle."/>}</div></div>
    </div>
  </>;
}

export function EmployeeProjects() {
  const employee = getEmployee();
  const projects = employeeProjects(employee);
  if (!employee) return <Empty message="Aucun profil employé associé à cette session."/>;
  return <div className="card card-body flush"><div className="table-wrap"><table className="table responsive"><thead><tr><th>Projet</th><th>Statut</th><th>Progression</th><th>Échéance</th><th>Responsable</th></tr></thead><tbody>{projects.map(project=>{const lead=DB.chefs.find(chef=>chef.id===project.chef);return <tr key={project.id}><td data-label="Projet" className="cell-main"><Link className="link" to={`/employee/projets/${project.id}`}><strong>{project.name}</strong></Link></td><td data-label="Statut"><span className={statusClass(project.status)}>{project.status}</span></td><td data-label="Progression"><div className="prog-cell"><div className="progress"><i style={{"--v":`${project.progress}%`}}/></div><span>{project.progress}%</span></div></td><td data-label="Échéance">{formatDate(project.end)}</td><td data-label="Responsable">{lead?.name || "—"}</td></tr>;})}</tbody></table></div>{projects.length===0&&<Empty message="Aucun projet ne vous est associé."/>}</div>;
}

export function EmployeeProjectDetail() {
  const {id} = useParams();
  const employee = getEmployee();
  const project = employeeProjects(employee).find(item=>item.id===id);
  const tasks = employeeTasks(employee).filter(task=>task.projectId===id);
  if (!project) return <div className="empty"><div className="empty-ico"><Icon name="folder" size={24}/></div><div><strong>Projet indisponible</strong><p>Ce projet ne vous est pas associé.</p></div><Link className="btn btn-primary" to="/employee/projets">Mes projets</Link></div>;
  const lead = DB.chefs.find(chef=>chef.id===project.chef);
  return <div className="grid cols-2-1 stack-gap"><div className="card card-pad"><h2>{project.name}</h2><div className="detail-grid" style={{marginTop:20}}><div><dt>Statut</dt><dd><span className={statusClass(project.status)}>{project.status}</span></dd></div><div><dt>Progression</dt><dd>{project.progress}%</dd></div><div><dt>Échéance</dt><dd>{formatDate(project.end)}</dd></div><div><dt>Responsable</dt><dd>{lead?.name || "—"}</dd></div></div></div><div className="card card-pad"><h3>Votre participation</h3><p style={{marginTop:10,color:"var(--text-2)"}}>{tasks.length} tâche{tasks.length===1?"":"s"} associée{tasks.length===1?"":"s"} à ce projet.</p></div><div className="card" style={{gridColumn:"1 / -1"}}><div className="card-head"><h3>Mes tâches dans ce projet</h3><Link className="btn btn-ghost btn-sm" to="/employee/taches">Toutes mes tâches</Link></div><div className="card-body flush">{tasks.length?tasks.map(task=><div className="list-item" key={task.id}><div className="list-main"><strong>{task.title}</strong><small>Échéance · {formatDate(task.dueDate)}</small></div><TaskStatus status={task.status}/></div>):<Empty message="Aucune tâche ne vous est assignée dans ce projet."/>}</div></div></div>;
}

export function EmployeeTasks() {
  const employee = getEmployee();
  const [filter,setFilter] = useState("Toutes");
  const [,setVersion] = useState(0);
  const tasks = employeeTasks(employee).filter(task=>filter==="Toutes" || task.status===filter || (filter==="En retard" && taskIsOverdue(task)));
  function updateStatus(id,status) {
    const task = DB.tasks.find(item=>item.id===id && item.assigneeId===employee?.id);
    if (!task || !TASK_STATUSES.includes(status)) return;
    task.status = status;
    saveDb();
    setVersion(current=>current+1);
  }
  if (!employee) return <Empty message="Aucun profil employé associé à cette session."/>;
  return <div className="card employee-task-board"><div className="toolbar"><div className="stat-pills">{["Toutes",...TASK_STATUSES,"En retard"].map(status=><button key={status} className={`stat-pill ${filter===status?"active":""}`} type="button" aria-pressed={filter===status} onClick={()=>setFilter(status)}>{status}{status==="Toutes"?` (${employeeTasks(employee).length})`:""}</button>)}</div></div><div className="card-body flush"><div className="table-wrap"><table className="table responsive"><thead><tr><th>Tâche</th><th>Projet</th><th>Priorité</th><th>Échéance</th><th>Statut</th><th>Avancement</th></tr></thead><tbody>{tasks.map(task=><tr key={task.id}><td data-label="Tâche" className="cell-main"><strong>{task.title}</strong></td><td data-label="Projet"><Link className="link" to={`/employee/projets/${task.projectId}`}>{task.projectName}</Link></td><td data-label="Priorité"><span className={task.priority==="Urgent"||task.priority==="Haute"?"badge badge-warn":"badge badge-info"}>{task.priority}</span></td><td data-label="Échéance">{formatDate(task.dueDate)}</td><td data-label="Statut"><TaskStatus status={taskIsOverdue(task)?"En retard":task.status}/></td><td data-label="Avancement"><select className="small-select" aria-label={`Avancement de ${task.title}`} value={TASK_STATUSES.includes(task.status)?task.status:"À faire"} onChange={event=>updateStatus(task.id,event.target.value)}>{TASK_STATUSES.map(status=><option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div>{tasks.length===0&&<Empty message="Aucune tâche dans ce filtre."/>}</div></div>;
}

export function EmployeeCalendar() {
  const employee = getEmployee();
  const [weekStart,setWeekStart] = useState(()=>{const today=new Date();today.setDate(today.getDate()-(today.getDay()+6)%7);today.setHours(0,0,0,0);return today;});
  const tasks = employeeTasks(employee);
  const meetings = employeeMeetings(employee);
  const leaves = DB.leaveRequests.filter(request=>request.employeeId===employee?.id);
  const days = useMemo(()=>Array.from({length:7},(_,index)=>{const date=new Date(weekStart.getFullYear(),weekStart.getMonth(),weekStart.getDate()+index);return {date,key:dateKey(date),label:date.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric"})};}),[weekStart]);
  function moveWeek(offset) { setWeekStart(current=>new Date(current.getFullYear(),current.getMonth(),current.getDate()+offset*7)); }
  if (!employee) return <Empty message="Aucun profil employé associé à cette session."/>;
  const lastDay = days[6].date;
  const range = `Semaine du ${weekStart.toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})} au ${lastDay.toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}`;
  return <div className="card card-pad employee-calendar-card">
    <div className="calendar-shell calendar-shell-month employee-calendar-shell">
      <div className="calendar-month-toolbar">
        <button className="btn btn-ghost btn-sm" type="button" aria-label="Semaine précédente" onClick={()=>moveWeek(-1)}><Icon name="chevron-left" size={18}/></button>
        <h3>{range}</h3>
        <button className="btn btn-ghost btn-sm" type="button" aria-label="Semaine suivante" onClick={()=>moveWeek(1)}><Icon name="chevron-right" size={18}/></button>
      </div>
      <div className="employee-calendar-legend" aria-label="Types d'événements">
        <span><i className="task"/>Échéance</span><span><i className="meeting"/>Réunion</span><span><i className="leave"/>Congé</span>
      </div>
      <div className="calendar-header-row calendar-header-month employee-calendar-header">
        {days.map((day,index)=><div className={`calendar-day-label${index>4?" calendar-weekend-label":""}`} key={day.key}>{day.label}</div>)}
      </div>
      <div className="calendar-grid-month employee-calendar-grid">
        {days.map(day=>{
          const dayTasks=tasks.filter(task=>task.dueDate===day.key);
          const dayMeetings=meetings.filter(meeting=>meeting.date===day.key);
          const dayLeaves=leaves.filter(request=>request.start<=day.key&&request.end>=day.key);
          return <div className={`calendar-date-cell employee-calendar-cell${day.date.getDay()===0||day.date.getDay()===6?" calendar-weekend":""}`} key={day.key}>
            <div className="calendar-date-head">{day.date.getDate()}</div>
            <div className="calendar-date-events employee-calendar-events">
              {dayTasks.map(task=><div className="employee-calendar-event task" key={task.id}><strong>{task.title}</strong><small>Échéance · {task.dueDate}</small></div>)}
              {dayMeetings.map(meeting=><div className="employee-calendar-event meeting" key={meeting.id}><strong>{meeting.title}</strong><small>Réunion · {meeting.time}</small></div>)}
              {dayLeaves.map(request=><div className="employee-calendar-event leave" key={request.id}><strong>{request.type}</strong><small>Congé · {request.status}</small></div>)}
            </div>
          </div>;
        })}
      </div>
    </div>
  </div>;
}

export function EmployeeAttendance() {
  const employee = getEmployee();
  const rows = DB.attendance.filter(row=>row.employeeName===employee?.name).sort((a,b)=>b.date.localeCompare(a.date));
  if (!employee) return <Empty message="Aucun profil employé associé à cette session."/>;
  return <div className="grid cols-1 stack-gap"><div className="grid cols-3"><div className="card card-pad"><h3>Présences</h3><div className="kpi-value">{rows.filter(row=>row.status==="Présent").length}</div></div><div className="card card-pad"><h3>Retards</h3><div className="kpi-value">{rows.filter(row=>row.status==="Retard").length}</div></div><div className="card card-pad"><h3>Absences</h3><div className="kpi-value">{rows.filter(row=>row.status==="Absent").length}</div></div></div><div className="card card-body flush"><div className="table-wrap"><table className="table responsive"><thead><tr><th>Date</th><th>Heure</th><th>Statut</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td data-label="Date">{formatDate(row.date)}</td><td data-label="Heure">{row.time}</td><td data-label="Statut"><TaskStatus status={row.status}/></td></tr>)}</tbody></table></div>{rows.length===0&&<Empty message="Aucune présence enregistrée."/>}</div></div>;
}

export function EmployeeLeave() {
  const employee = getEmployee();
  const [open,setOpen] = useState(false);
  const [,setVersion] = useState(0);
  const rows = DB.leaveRequests.filter(request=>request.employeeId===employee?.id).sort((a,b)=>b.start.localeCompare(a.start));
  function submit(event) {
    event.preventDefault();
    if (!employee) return;
    const form = new FormData(event.currentTarget);
    const start = String(form.get("start") || "");
    const end = String(form.get("end") || "");
    if (!start || !end || end<start) return;
    DB.leaveRequests.push({id:`lv${Date.now()}`,employeeId:employee.id,employeeName:employee.name,type:String(form.get("type")),start,end,reason:String(form.get("reason") || "").trim(),status:"En attente"});
    saveDb();
    setOpen(false);
    setVersion(current=>current+1);
  }
  if (!employee) return <Empty message="Aucun profil employé associé à cette session."/>;
  return <>
    <div className="toolbar"><h3 className="section-title">Mes demandes</h3><button className="btn btn-primary" type="button" onClick={()=>setOpen(true)}><Icon name="plus" size={17}/>Nouvelle demande</button></div>
    <div className="card card-body flush"><div className="table-wrap"><table className="table responsive"><thead><tr><th>Type</th><th>Début</th><th>Fin</th><th>Motif</th><th>Statut</th></tr></thead><tbody>{rows.map(request=><tr key={request.id}><td data-label="Type">{request.type}</td><td data-label="Début">{formatDate(request.start)}</td><td data-label="Fin">{formatDate(request.end)}</td><td data-label="Motif">{request.reason}</td><td data-label="Statut"><span className={request.status==="Validé"?"badge badge-ok":request.status==="Refusé"?"badge badge-danger":"badge badge-warn"}>{request.status}</span></td></tr>)}</tbody></table></div>{rows.length===0&&<Empty message="Vous n'avez pas encore de demande de congé."/>}</div>
    {open&&<div className="modal-backdrop"><form className="modal-box" onSubmit={submit}><div className="modal-head"><h2>Nouvelle demande de congé</h2><button className="btn-icon" type="button" aria-label="Fermer" onClick={()=>setOpen(false)}><Icon name="x" size={18}/></button></div><div className="form-grid"><div className="field full"><label>Type</label><select className="select" name="type" required><option>Congé annuel</option><option>Congé maladie</option><option>Congé sans solde</option><option>Congé personnel</option></select></div><div className="field"><label>Début</label><input className="input" type="date" name="start" required/></div><div className="field"><label>Fin</label><input className="input" type="date" name="end" required/></div><div className="field full"><label>Motif</label><textarea className="textarea" name="reason" rows={3} required/></div></div><div className="modal-foot"><button className="btn btn-ghost" type="button" onClick={()=>setOpen(false)}>Annuler</button><button className="btn btn-primary">Envoyer la demande</button></div></form></div>}
  </>;
}

export function EmployeeMeetings() {
  const employee = getEmployee();
  const meetings = employeeMeetings(employee);
  if (!employee) return <Empty message="Aucun profil employé associé à cette session."/>;
  return <div className="card card-body flush"><div className="table-wrap"><table className="table responsive"><thead><tr><th>Réunion</th><th>Date</th><th>Heure</th><th>Durée</th><th>Lieu</th><th>Participants</th></tr></thead><tbody>{meetings.map(meeting=><tr key={meeting.id}><td data-label="Réunion" className="cell-main"><strong>{meeting.title}</strong><small>{meeting.description}</small></td><td data-label="Date">{formatDate(meeting.date)}</td><td data-label="Heure">{meeting.time}</td><td data-label="Durée">{meeting.duration} min</td><td data-label="Lieu">{meeting.location || "—"}</td><td data-label="Participants">{meeting.participants?.join(", ")}</td></tr>)}</tbody></table></div>{meetings.length===0&&<Empty message="Aucune réunion ne vous est attribuée."/>}</div>;
}

export function EmployeeMessages() {
  const employee = getEmployee();
  const [activeId,setActiveId] = useState("");
  const [draft,setDraft] = useState("");
  const [,setVersion] = useState(0);
  const conversations = DB.messages.filter(conversation=>conversation.participants?.includes(employee?.name));
  const active = conversations.find(conversation=>conversation.id===activeId) || conversations[0];
  function send() {
    if (!active || !draft.trim()) return;
    active.messages.push({id:`msg${Date.now()}`,sender:employee.name,me:false,text:draft.trim(),time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})});
    saveDb();
    setDraft("");
    setVersion(version=>version+1);
  }
  if (!employee) return <Empty message="Aucun profil employé associé à cette session."/>;
  return <div className="chat-shell employee-chat-shell"><aside className="chat-list card">{conversations.map(conversation=><button key={conversation.id} className={`chat-row ${active?.id===conversation.id?"active":""}`} type="button" onClick={()=>setActiveId(conversation.id)}><div className="chat-row-main"><strong>{conversation.title}</strong><small>{conversation.preview}</small></div><span className="chat-badge">{conversation.unread || 0}</span></button>)}{conversations.length===0&&<Empty message="Aucune conversation ne vous concerne."/>}</aside>{active&&<div className="chat-panel card"><div className="chat-header"><div><strong>{active.title}</strong><small>{active.participants.join(" · ")}</small></div></div><div className="chat-body">{active.messages.map(message=><div key={message.id} className={`chat-bubble ${message.sender===employee.name?"mine":""}`}><strong>{message.sender}</strong><p>{message.text}</p><small>{message.time}</small></div>)}</div><form className="chat-composer" onSubmit={event=>{event.preventDefault();send();}}><input className="input" value={draft} onChange={event=>setDraft(event.target.value)} placeholder="Écrire un message…" aria-label="Nouveau message"/><button className="btn btn-primary" type="submit" disabled={!draft.trim()}>Envoyer</button></form></div>}</div>;
}

export function EmployeeNotifications() {
  const employee = getEmployee();
  const [,setVersion] = useState(0);
  const notifications = employeeNotifications(employee);
  function markRead(id) {
    const notification = notifications.find(item=>item.id===id);
    if (!notification) return;
    notification.read = true;
    saveDb();
    setVersion(version=>version+1);
  }
  if (!employee) return <Empty message="Aucun profil employé associé à cette session."/>;
  return <div className="card card-body flush"><div className="table-wrap"><table className="table responsive"><thead><tr><th>Notification</th><th>Type</th><th>Date</th><th>État</th><th>Action</th></tr></thead><tbody>{notifications.map(notification=><tr key={notification.id}><td data-label="Notification" className="cell-main"><strong>{notification.title}</strong><small>{notification.message}</small></td><td data-label="Type">{notification.type}</td><td data-label="Date">{formatDate(notification.date)}</td><td data-label="État"><span className={notification.read?"badge badge-ok":"badge badge-warn"}>{notification.read?"Lue":"Non lue"}</span></td><td data-label="Action" className="actions"><button className="btn btn-ghost btn-sm" type="button" disabled={notification.read} onClick={()=>markRead(notification.id)}>{notification.read?"Lue":"Marquer comme lue"}</button></td></tr>)}</tbody></table></div>{notifications.length===0&&<Empty message="Aucune notification personnelle."/>}</div>;
}

export function EmployeeSettings() {
  const [settings,setSettings] = useAppSettings();
  const [profile,setProfile] = useState(settings.profile);
  useEffect(()=>setProfile(settings.profile),[settings.profile]);
  function saveProfile() {
    setSettings(current=>({...current,profile:{...current.profile,...profile}}));
  }
  return <div className="grid cols-1 stack-gap">
    <div className="card card-pad"><h3>Profil personnel</h3><div className="grid cols-2" style={{marginTop:16}}><div className="field"><label>Nom complet</label><input className="input" value={profile.name} onChange={event=>setProfile(current=>({...current,name:event.target.value}))}/></div><div className="field"><label>E-mail</label><input className="input" value={profile.email} disabled/></div><div className="field"><label>Téléphone</label><input className="input" value={profile.phone} onChange={event=>setProfile(current=>({...current,phone:event.target.value}))}/></div><div className="field"><label>Équipe</label><input className="input" value={DB.teams.find(team=>team.id===getEmployee()?.team)?.name || "—"} disabled/></div></div><button className="btn btn-primary" type="button" onClick={saveProfile}>Enregistrer le profil</button></div>
    <div className="card card-pad"><h3>Préférences d'affichage</h3><div className="display-options"><div className="display-option"><label>Thème</label><div className="segmented"><button className={settings.theme==="dark"?"active":""} type="button" onClick={()=>setSettings(current=>({...current,theme:"dark"}))}>Sombre</button><button className={settings.theme==="light"?"active":""} type="button" onClick={()=>setSettings(current=>({...current,theme:"light"}))}>Clair</button></div></div><div className="display-option"><label>Densité</label><div className="segmented"><button className={settings.density==="comfortable"?"active":""} type="button" onClick={()=>setSettings(current=>({...current,density:"comfortable"}))}>Confortable</button><button className={settings.density==="compact"?"active":""} type="button" onClick={()=>setSettings(current=>({...current,density:"compact"}))}>Compact</button></div></div></div><div style={{marginTop:24}}><label>Couleur d'accent</label><div className="accent-list">{["#7c5cff","#3b82f6","#10b981","#f59e0b","#ef4444","#ec4899"].map(color=><button key={color} type="button" className="accent-circle" aria-label={`Choisir la couleur ${color}`} aria-pressed={settings.accent===color} style={{background:color,borderColor:settings.accent===color?"var(--text-main)":"transparent"}} onClick={()=>setSettings(current=>({...current,accent:color}))}/>)}</div></div></div>
  </div>;
}
