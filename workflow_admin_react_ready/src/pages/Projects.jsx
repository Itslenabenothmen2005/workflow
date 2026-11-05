import {useMemo,useState} from "react";
import {Icon} from "../components/Icon";
import {DB,client,chef,team} from "../data/mockData";
import {formatDate,riskClass,statusClass} from "../utils";

export default function Projects(){
 const [q,setQ]=useState(""),[status,setStatus]=useState("Tous"),[teamId,setTeamId]=useState(""),[risk,setRisk]=useState("Tous");
 const list=useMemo(()=>DB.projects.filter(p=>
  (!q||`${p.name} ${client(p.client)?.name||""}`.toLowerCase().includes(q.toLowerCase())) &&
  (status==="Tous"||p.status===status)&&(teamId===""||p.team===teamId)&&(risk==="Tous"||p.risk===risk)
 ),[q,status,teamId,risk]);
 return <>
  <div className="toolbar"><div className="stat-pills"><button className={`stat-pill ${status==="Tous"?"active":""}`} onClick={()=>setStatus("Tous")}>Tous ({DB.projects.length})</button>{["En cours","Terminé","En retard"].map(s=><button key={s} className={`stat-pill ${status===s?"active":""}`} onClick={()=>setStatus(s)}>{s} ({DB.projects.filter(p=>p.status===s).length})</button>)}</div>
   <div className="filters"><div className="field"><div className="input-icon"><Icon name="search"/><input className="input search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher..."/></div></div>
    <select className="select" value={teamId} onChange={e=>setTeamId(e.target.value)}><option value="">Toutes les équipes</option>{DB.teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>
    <select className="select" value={risk} onChange={e=>setRisk(e.target.value)}><option value="Tous">Tous les risques</option><option value="faible">Faible</option><option value="moyen">Moyen</option><option value="élevé">Élevé</option></select>
   </div>
  </div>
  <div className="card card-body flush"><div className="table-wrap"><table className="table responsive"><thead><tr><th>Projet</th><th>Client</th><th>Chef</th><th>Équipe</th><th>Échéance</th><th>Statut</th><th>Risque</th><th>Progression</th></tr></thead><tbody>
  {list.map(p=><tr key={p.id}><td className="cell-main"><strong>{p.name}</strong></td><td>{client(p.client)?.name}</td><td>{chef(p.chef)?.name}</td><td><span className="team-tag" style={{"--c":team(p.team).color}}>{team(p.team).name}</span></td><td>{formatDate(p.end)}</td><td><span className={statusClass(p.status)}>{p.status}</span></td><td><span className={riskClass(p.risk)}>{p.risk}</span></td><td><div className="prog-cell"><div className="progress"><i style={{"--v":`${p.progress}%`}}/></div><span>{p.progress}%</span></div></td></tr>)}
  </tbody></table></div></div>
 </>
}
