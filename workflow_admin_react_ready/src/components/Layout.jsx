import {useEffect,useMemo,useState} from "react";
import {Link,useLocation,useNavigate} from "react-router-dom";
import {Icon} from "./Icon";
import {DB,saveDb} from "../data/mockData";
import {ago,avatarStyle,initials} from "../utils";

function getSession() {
  try {
    const raw = localStorage.getItem("workflow_admin_session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getSessionRole() {
  const role = getSession()?.role;
  return role === "chef" || role === "employee" ? role : "admin";
}

function getEmployeeNotifications(employee) {
  if (!employee) return [];
  const employeeTasks = DB.tasks.filter(task=>task.assigneeId===employee.id);
  const taskTitles = employeeTasks.map(task=>task.title);
  const projectIds = new Set([...employeeTasks.map(task=>task.projectId),employee.project].filter(Boolean));
  const projectNames = DB.projects.filter(project=>projectIds.has(project.id)).map(project=>project.name);
  const meetingTitles = DB.meetings.filter(meeting=>meeting.participants?.includes(employee.name)).map(meeting=>meeting.title);
  return DB.notifications.filter(notification=>notification.employeeId===employee.id ||
    [notification.title,notification.message].some(text=>typeof text==="string"&&[employee.name,...taskTitles,...projectNames,...meetingTitles].some(term=>term&&text.includes(term)))
  );
}

const ADMIN_NAV = [
  {title:"Pilotage",items:[
    ["dashboard","Dashboard","/dashboard"],
    ["globe","Vue globale","/vue-globale"],
    ["chart","Statistiques","/statistiques"]
  ]},
  {title:"Organisation",items:[
    ["briefcase","Chefs","/chefs"],
    ["users","Employees","/employees"],
    ["folder","Projets","/projets"]
  ]},
  {title:"Suivi",items:[["bell","Alertes","/alertes"]]},
  {title:"Compte",items:[["settings","Paramètres","/parametres"]]}
];

const CHEF_NAV = [
  {title:"Pilotage",items:[
    ["dashboard","Dashboard","/chef"],
    ["chart","Présences","/chef/presences"],
    ["folder","Projets","/chef/projets"]
  ]},
  {title:"Opérations",items:[
    ["users","Mon équipe","/chef/equipe"],
    ["check","Tâches","/chef/taches"],
    ["calendar","Réunions","/chef/reunions"],
    ["calendar","Congés","/chef/conges"]
  ]},
  {title:"Suivi",items:[
    ["bell","Notifications","/chef/notifications"],
    ["message","Messages","/chef/messages"],
    ["shield","Rapports","/chef/rapports"]
  ]},
  {title:"Paramètres",items:[["settings","Paramètres","/chef/parametres"]]}
];

const EMPLOYEE_NAV = [
  {title:"Mon activité",items:[
    ["dashboard","Dashboard","/employee"],
    ["folder","Mes projets","/employee/projets"],
    ["check","Mes tâches","/employee/taches"],
    ["calendar","Calendrier","/employee/calendrier"]
  ]},
  {title:"Vie d'équipe",items:[
    ["clock","Mes présences","/employee/presences"],
    ["calendar","Mes congés","/employee/conges"],
    ["calendar","Mes réunions","/employee/reunions"],
    ["message","Messages","/employee/messages"]
  ]},
  {title:"Suivi",items:[
    ["bell","Notifications","/employee/notifications"]
  ]},
  {title:"Compte",items:[
    ["settings","Paramètres","/employee/parametres"]
  ]}
];

function Avatar({name,size=36}) {
  return <span className="avatar" style={{"--size":`${size}px`,...avatarStyle(name)}} aria-hidden="true">{initials(name)}</span>;
}

export function useAppSettings() {
  const sessionRole = getSessionRole();
  const session = getSession();
  const employee = sessionRole === "employee" ? DB.employees.find(item=>item.email===session?.email) : null;
  const fallbackProfile = sessionRole === "chef" ? {
    name:"Amine Trabelsi",
    email:"chef@atlas-numerique.tn",
    phone:"+216 98 120 344",
    role:"Chef d'équipe"
  } : sessionRole === "employee" ? {
    name:employee?.name || "Employé",
    email:employee?.email || session?.email || "",
    phone:employee?.phone || "",
    role:employee?.profile || "Employé"
  } : {
    name:"Yassine Belhadj",
    email:"admin@atlas-numerique.tn",
    phone:"+216 71 234 567",
    role:"Directeur général (CEO)"
  };

  const [settings,setSettings]=useState(()=>{
    const saved = JSON.parse(localStorage.getItem("workflow_admin_settings")||"null");
    return saved || {
      theme:"dark",accent:"#7c5cff",density:"comfortable",
      profile:fallbackProfile,
      app:{company:"Atlas Numérique",timezone:"Africa/Tunis",lateThreshold:3}
    };
  });

  useEffect(()=>{
    setSettings(current => ({
      ...current,
      profile: {...current.profile, ...fallbackProfile}
    }));
  }, [sessionRole]);

  useEffect(()=>{
    localStorage.setItem("workflow_admin_settings",JSON.stringify(settings));
    document.documentElement.dataset.theme=settings.theme==="light"?"light":"dark";
    document.documentElement.dataset.density=settings.density;
    document.documentElement.style.setProperty("--accent",settings.accent);
  },[settings]);

  return [settings,setSettings];
}

export default function Layout({title,subtitle,actions,children}) {
  const location=useLocation();
  const navigate=useNavigate();
  const [settings,setSettings]=useAppSettings();
  const [drawer,setDrawer]=useState(false);
  const [query,setQuery]=useState("");
  const [notifOpen,setNotifOpen]=useState(false);
  const [profileOpen,setProfileOpen]=useState(false);
  const role = getSessionRole();
  const employee = role === "employee" ? DB.employees.find(item=>item.email===getSession()?.email) : null;
  const employeeNotifications = getEmployeeNotifications(employee);

  useEffect(()=>{
    document.title = role === "employee" ? "Workflow Employé" : role === "chef" ? "Workflow Chef" : "Workflow Admin";
  },[role,location.pathname]);

  const NAV = role === "chef" ? CHEF_NAV : role === "employee" ? EMPLOYEE_NAV : ADMIN_NAV;

  const unread = role === "chef"
    ? DB.notifications.filter(n => !n.read).length
    : role === "employee"
      ? getEmployeeNotifications(DB.employees.find(item=>item.email===getSession()?.email)).filter(notification=>!notification.read).length
      : DB.alerts.filter(a => !a.read && !a.archived).length;

  const results=useMemo(()=>{
    const q=query.trim().toLowerCase();
    if(!q) return [];
    const prefix = role === "chef" ? "/chef" : "";
    const employeeTasks = DB.tasks.filter(task=>task.assigneeId===employee?.id);
    const employeeProjectIds = new Set([...employeeTasks.map(task=>task.projectId),employee?.project].filter(Boolean));
    const index = role === "chef" ? [
      ...DB.employees.filter(e=>e.team==="alpha").map(e=>({name:e.name,sub:`Employé · ${DB.teams.find(t=>t.id===e.team)?.name}`,to:`${prefix}/equipe?q=${encodeURIComponent(e.name)}`,icon:"user"})),
      ...DB.projects.filter(p=>p.team==="alpha").map(p=>({name:p.name,sub:`Projet · ${p.status.toLowerCase()}`,to:`${prefix}/projets?q=${encodeURIComponent(p.name)}`,icon:"folder"})),
      ...DB.meetings.map(m=>({name:m.title,sub:`Réunion · ${m.date}`,to:`${prefix}/reunions?q=${encodeURIComponent(m.title)}`,icon:"calendar"}))
    ] : role === "employee" ? [
      ...DB.projects.filter(project=>employeeProjectIds.has(project.id)).map(project=>({name:project.name,sub:`Projet · ${project.status.toLowerCase()}`,to:`/employee/projets/${project.id}`,icon:"folder"})),
      ...employeeTasks.map(task=>({name:task.title,sub:`Tâche · ${task.status}`,to:"/employee/taches",icon:"check"})),
      ...DB.meetings.filter(meeting=>meeting.participants?.includes(employee?.name)).map(meeting=>({name:meeting.title,sub:`Réunion · ${meeting.date}`,to:"/employee/reunions",icon:"calendar"}))
    ] : [
      ...DB.chefs.map(c=>({name:c.name,sub:`Chef · équipe ${DB.teams.find(t=>t.id===c.team)?.name}`,to:`/chefs?q=${encodeURIComponent(c.name)}`,icon:"briefcase"})),
      ...DB.employees.map(e=>({name:e.name,sub:`Employee · équipe ${DB.teams.find(t=>t.id===e.team)?.name}`,to:`/employees?q=${encodeURIComponent(e.name)}`,icon:"user"})),
      ...DB.projects.map(p=>({name:p.name,sub:`Projet · ${p.status.toLowerCase()}`,to:`/projets?q=${encodeURIComponent(p.name)}`,icon:"folder"}))
    ];
    return index.filter(x=>x.name.toLowerCase().includes(q)).slice(0,7);
  },[query,role,employee?.id]);

  function logout(){
    localStorage.removeItem("workflow_admin_session");
    navigate("/login");
  }

  function markAllRead(){
    if (role === "chef") {
      DB.notifications.forEach(n => n.read = true);
    } else if (role === "employee") {
      employeeNotifications.forEach(notification=>notification.read=true);
    } else {
      DB.alerts.forEach(a => a.read = true);
    }
    saveDb();
    setNotifOpen(false);
  }

  const dashboardHome = role === "employee" ? "/employee" : role === "chef" ? "/chef" : "/dashboard";
  const profileRoute = role === "employee" ? "/employee/parametres" : role === "chef" ? "/chef/parametres" : "/parametres";
  const alertsRoute = role === "employee" ? "/employee/notifications" : role === "chef" ? "/chef/notifications" : "/alertes";
  const notificationItems = role === "employee" ? employeeNotifications : role === "chef" ? DB.notifications : DB.alerts.filter(alert=>!alert.archived);

  return <div className="app">
    <a className="skip-link" href="#main">Aller au contenu</a>

    <aside className={`sidebar ${drawer?"open":""}`}>
      <Link className="brand" to={dashboardHome} onClick={()=>setDrawer(false)}>
        <span className="brand-mark"><Icon name="target" size={24}/></span>
        <span className="brand-text"><strong>Cadran</strong><small>{role === "chef" ? "Espace chef" : role === "employee" ? "Espace employé" : "Espace administrateur"}</small></span>
      </Link>
      <nav className="nav" aria-label="Navigation principale">
        {NAV.map(group=><div key={group.title}>
          <p className="nav-title">{group.title}</p>
          {group.items.map(([icon,label,to])=><Link
            key={to} to={to} onClick={()=>setDrawer(false)}
            className="nav-link" aria-current={location.pathname===to?"page":undefined}>
            <Icon name={icon} size={20}/><span>{label}</span>
            {to === alertsRoute && unread>0 && <span className="nav-badge">{unread}</span>}
          </Link>)}
        </div>)}
      </nav>
      <div className="sidebar-foot">
        <div className="me"><Avatar name={settings.profile.name} size={38}/><div>
          <strong>{settings.profile.name}</strong><small>{settings.profile.role}</small>
        </div></div>
        <button className="nav-link nav-logout" onClick={logout}><Icon name="logout" size={20}/><span>Déconnexion</span></button>
      </div>
    </aside>

    {drawer && <div className="backdrop show" onClick={()=>setDrawer(false)}/>} 
    <div className="main">
      <header className="topbar">
        <button className="btn-icon menu-btn" onClick={()=>setDrawer(v=>!v)} aria-label="Ouvrir le menu"><Icon name="menu" size={22}/></button>
        <div className="gsearch">
          <label className="search"><span className="sr-only">Recherche globale</span><Icon name="search" size={18}/>
            <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Escape"&&setQuery("")}
              type="search" placeholder={role === "chef" ? "Rechercher un membre, un projet, une réunion…" : role === "employee" ? "Rechercher un projet, une tâche, une réunion…" : "Rechercher un chef, un projet, un employee…"} autoComplete="off"/>
          </label>
          <kbd>/</kbd>
          {query && <div className="gsearch-panel">
            {results.length ? results.map(r=><Link key={r.to+r.name} className="gsearch-item" to={r.to} onClick={()=>setQuery("")}>
              <span className="g-ico"><Icon name={r.icon} size={18}/></span><div><strong>{r.name}</strong><small>{r.sub}</small></div>
            </Link>) : <div className="gsearch-empty">Aucun résultat pour « {query} »</div>}
          </div>}
        </div>

        <div className="topbar-right">
          <div className="clock">{new Date().toLocaleString("fr-FR",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
          <div className="pop-wrap">
            <button className="btn-icon has-dot" onClick={()=>setNotifOpen(v=>!v)} aria-label="Notifications">
              <Icon name="bell" size={21}/>{unread>0&&<span className="dot"/>}
            </button>
            {notifOpen&&<div className="popover notif-panel">
              <div className="notif-head"><strong>Notifications</strong><button className="link" onClick={markAllRead}>Tout marquer comme lu</button></div>
              <div className="notif-list">{notificationItems.slice(0,5).map(item => {
                const isAlert = role === "admin";
                const title = isAlert ? item.title : item.title;
                const meta = isAlert ? ago(item.ago) : item.date;
                const tone = isAlert ? (item.level === "urgent" ? "danger" : item.level === "warning" ? "warn" : "info") : (item.level === "urgent" ? "danger" : item.level === "warning" ? "warn" : "info");
                return <Link className="notif-item" to={alertsRoute} key={item.id}>
                  <span className={`tone-ico tone-${tone}`}><Icon name={isAlert ? (item.level === "urgent" ? "zap" : item.level === "warning" ? "alert" : "info") : (item.level === "urgent" ? "zap" : item.level === "warning" ? "alert" : "info")} size={18}/></span>
                  <div><p>{title}</p><small>{meta}</small></div>
                </Link>;
              })}</div>
              <div className="notif-foot"><Link className="link" to={alertsRoute}>{role === "employee" ? "Voir toutes les notifications" : "Voir toutes les alertes"}</Link></div>
            </div>}
          </div>

          <div className="pop-wrap">
            <button className="profile-btn" onClick={()=>setProfileOpen(v=>!v)}>
              <Avatar name={settings.profile.name} size={32}/><span className="pname">{settings.profile.name}</span><Icon name="chevron-down" size={16}/>
            </button>
            {profileOpen&&<div className="popover">
              <Link className="menu-item" to={profileRoute}><Icon name="user" size={18}/>Mon profil</Link>
              <Link className="menu-item" to={`${profileRoute}#affichage`}><Icon name="sun" size={18}/>Préférences d'affichage</Link>
              <Link className="menu-item" to={alertsRoute}><Icon name="bell" size={18}/>{role === "employee" ? "Notifications" : "Alertes"}</Link>
              <div className="menu-sep"/>
              <button className="menu-item danger" onClick={logout}><Icon name="logout" size={18}/>Se déconnecter</button>
            </div>}
          </div>
        </div>
      </header>

      <main className="content" id="main" tabIndex="-1">
        <div className="page-head"><div><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div><div className="page-actions">{actions}</div></div>
        {children}
      </main>
    </div>
  </div>
}
