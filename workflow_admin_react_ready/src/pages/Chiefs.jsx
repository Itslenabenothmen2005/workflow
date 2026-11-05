import {useState} from "react";
import {Icon} from "../components/Icon";
import {DB,team,project,saveDb} from "../data/mockData";
import {avatarStyle,initials,statusClass} from "../utils";

function Avatar({name}){return <span className="avatar" style={{"--size":"36px",...avatarStyle(name)}}>{initials(name)}</span>}

export default function Chiefs(){
 const [q,setQ]=useState(""),[status,setStatus]=useState("all"),[edit,setEdit]=useState(null),[,refresh]=useState(0);
 const list=DB.chefs.filter(c=>(!q||`${c.name} ${c.email}`.toLowerCase().includes(q.toLowerCase()))&&(status==="all"||c.status===(status==="active"?"Actif":"Inactif")));
 const remove=id=>{if(confirm("Supprimer ce chef ?")){DB.chefs=DB.chefs.filter(c=>c.id!==id);saveDb();refresh(x=>x+1)}};
 const save=e=>{e.preventDefault();const f=new FormData(e.currentTarget),obj={name:f.get("name"),email:f.get("email"),phone:f.get("phone"),team:f.get("team"),status:f.get("status")};if(edit?.id)Object.assign(DB.chefs.find(c=>c.id===edit.id),obj);else DB.chefs.push({id:`c${Date.now()}`,...obj,since:new Date().toISOString()});saveDb();setEdit(null);refresh(x=>x+1)};
 return <>
  <div className="stat-pills"><button className={`stat-pill ${status==="all"?"active":""}`} onClick={()=>setStatus("all")}><strong>{DB.chefs.length}</strong> chefs</button><button className={`stat-pill ${status==="active"?"active":""}`} onClick={()=>setStatus("active")}><strong>{DB.chefs.filter(c=>c.status==="Actif").length}</strong> actifs</button><button className={`stat-pill ${status==="inactive"?"active":""}`} onClick={()=>setStatus("inactive")}><strong>{DB.chefs.filter(c=>c.status==="Inactif").length}</strong> inactifs</button></div>
  <div className="toolbar"><div className="filters"><div className="field"><div className="input-icon"><Icon name="search"/><input className="input search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher un chef..."/></div></div><button className="btn btn-primary" onClick={()=>setEdit({})}><Icon name="plus" size={18}/> Ajouter un chef</button></div></div>
  <div className="card card-body flush"><div className="table-wrap"><table className="table responsive"><thead><tr><th>Nom</th><th>Équipe</th><th>Projets</th><th>Téléphone</th><th>Statut</th><th>Actions</th></tr></thead><tbody>
   {list.map(c=><tr key={c.id}><td className="cell-main"><div className="person"><Avatar name={c.name}/><div><strong>{c.name}</strong><small>{c.email}</small></div></div></td><td><span className="team-tag" style={{"--c":team(c.team).color}}>{team(c.team).name}</span></td><td>{DB.projects.filter(p=>p.chef===c.id).length}</td><td>{c.phone}</td><td><span className={statusClass(c.status)}>{c.status}</span></td><td className="actions"><button className="btn-icon" onClick={()=>setEdit(c)}><Icon name="edit" size={18}/></button><button className="btn-icon danger" onClick={()=>remove(c.id)}><Icon name="trash" size={18}/></button></td></tr>)}
  </tbody></table></div></div>
  {edit!==null&&<div className="modal-backdrop"><form className="modal-box" onSubmit={save}><div className="modal-head"><h2>{edit.id?"Modifier le chef":"Ajouter un chef"}</h2><button type="button" className="btn-icon" onClick={()=>setEdit(null)}><Icon name="x"/></button></div><div className="form-grid">
   <div className="field"><label>Nom complet</label><input className="input" name="name" defaultValue={edit.name||""} required/></div><div className="field"><label>Email</label><input className="input" name="email" defaultValue={edit.email||""} required/></div><div className="field"><label>Téléphone</label><input className="input" name="phone" defaultValue={edit.phone||""}/></div>
   <div className="field"><label>Équipe</label><select className="select" name="team" defaultValue={edit.team||DB.teams[0].id}>{DB.teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div><div className="field"><label>Statut</label><select className="select" name="status" defaultValue={edit.status||"Actif"}><option>Actif</option><option>Inactif</option></select></div>
  </div><div className="modal-foot"><button type="button" className="btn btn-ghost" onClick={()=>setEdit(null)}>Annuler</button><button className="btn btn-primary">Enregistrer</button></div></form></div>}
 </>
}
