import {useMemo,useState} from "react";
import {Icon} from "../components/Icon";
import {DB,project,team,saveDb} from "../data/mockData";
import {avatarStyle,initials,statusClass} from "../utils";

function Avatar({name}){return <span className="avatar" style={{"--size":"36px",...avatarStyle(name)}}>{initials(name)}</span>}

export default function Employees(){
  const [q,setQ]=useState(""),[status,setStatus]=useState("all"),[teamId,setTeamId]=useState(""),[profile,setProfile]=useState(""),[edit,setEdit]=useState(null),[refresh,setRefresh]=useState(0);
  const list=useMemo(()=>DB.employees.filter(e=>
    (!q||`${e.name} ${e.email}`.toLowerCase().includes(q.toLowerCase())) &&
    (!teamId||e.team===teamId)&&(!profile||e.profile===profile)&&
    (status==="all"||e.status===(status==="active"?"Actif":"Inactif"))
  ),[q,status,teamId,profile,refresh]);

  function remove(id){if(window.confirm("Supprimer cet employee ?")){DB.employees=DB.employees.filter(e=>e.id!==id);saveDb();setRefresh(x=>x+1)}}
  function save(e){
    e.preventDefault();
    const f=new FormData(e.currentTarget);
    const obj={name:f.get("name"),email:f.get("email"),phone:f.get("phone"),team:f.get("team"),profile:f.get("profile"),project:f.get("project"),status:f.get("status")};
    if(edit?.id){Object.assign(DB.employees.find(x=>x.id===edit.id),obj)}else DB.employees.push({id:`w${Date.now()}`,...obj,since:new Date().toISOString()});
    saveDb();setEdit(null);setRefresh(x=>x+1);
  }
  return <>
    <div className="stat-pills">
      <button className={`stat-pill ${status==="all"?"active":""}`} onClick={()=>setStatus("all")}><strong>{DB.employees.length}</strong> employees</button>
      <button className={`stat-pill ${status==="active"?"active":""}`} onClick={()=>setStatus("active")}><strong>{DB.employees.filter(e=>e.status==="Actif").length}</strong> actifs</button>
      <button className={`stat-pill ${status==="inactive"?"active":""}`} onClick={()=>setStatus("inactive")}><strong>{DB.employees.filter(e=>e.status==="Inactif").length}</strong> inactifs</button>
    </div>
    <div className="toolbar">
      <div className="filters">
        <div className="field"><div className="input-icon"><Icon name="search"/><input className="input search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher un employee..."/></div></div>
        <select className="select" value={teamId} onChange={e=>setTeamId(e.target.value)}><option value="">Toutes les équipes</option>{DB.teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>
        <select className="select" value={profile} onChange={e=>setProfile(e.target.value)}><option value="">Tous les profils</option><option>Salarié</option><option>Freelance</option><option>Stagiaire</option></select>
        <button className="btn btn-primary" onClick={()=>setEdit({})}><Icon name="plus" size={18}/> Ajouter un employee</button>
      </div>
    </div>
    <div className="card card-body flush"><div className="table-wrap"><table className="table responsive"><thead><tr><th>Nom</th><th>Profil</th><th>Équipe</th><th>Projet actuel</th><th>Statut</th><th>Actions</th></tr></thead>
      <tbody>{list.map(e=><tr key={e.id}><td className="cell-main"><div className="person"><Avatar name={e.name}/><div><strong>{e.name}</strong><small>{e.email}</small></div></div></td><td><span className="badge badge-info">{e.profile}</span></td><td><span className="team-tag" style={{"--c":team(e.team).color}}>{team(e.team).name}</span></td><td>{project(e.project)?.name||"—"}</td><td><span className={statusClass(e.status)}>{e.status}</span></td><td className="actions"><button className="btn-icon" onClick={()=>setEdit(e)}><Icon name="edit" size={18}/></button><button className="btn-icon danger" onClick={()=>remove(e.id)}><Icon name="trash" size={18}/></button></td></tr>)}</tbody>
    </table></div></div>
    {edit!==null&&<div className="modal-backdrop"><form className="modal-box" onSubmit={save}>
      <div className="modal-head"><h2>{edit.id?"Modifier l'employee":"Ajouter un employee"}</h2><button type="button" className="btn-icon" onClick={()=>setEdit(null)}><Icon name="x"/></button></div>
      <div className="form-grid">
        {[
          ["name","Nom complet",edit.name||""],["email","Email",edit.email||""],["phone","Téléphone",edit.phone||""]
        ].map(([n,l,v])=><div className="field" key={n}><label>{l}</label><input className="input" name={n} defaultValue={v} required={n!=="phone"}/></div>)}
        <div className="field"><label>Équipe</label><select className="select" name="team" defaultValue={edit.team||DB.teams[0].id}>{DB.teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
        <div className="field"><label>Profil</label><select className="select" name="profile" defaultValue={edit.profile||"Salarié"}><option>Salarié</option><option>Freelance</option><option>Stagiaire</option></select></div>
        <div className="field"><label>Projet</label><select className="select" name="project" defaultValue={edit.project||""}><option value="">Aucun</option>{DB.projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
        <div className="field"><label>Statut</label><select className="select" name="status" defaultValue={edit.status||"Actif"}><option>Actif</option><option>Inactif</option></select></div>
      </div>
      <div className="modal-foot"><button type="button" className="btn btn-ghost" onClick={()=>setEdit(null)}>Annuler</button><button className="btn btn-primary">Enregistrer</button></div>
    </form></div>}
  </>
}
