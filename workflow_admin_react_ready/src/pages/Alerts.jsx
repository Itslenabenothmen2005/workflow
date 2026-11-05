import {useMemo,useState} from "react";
import {Icon} from "../components/Icon";
import {DB,project,saveDb} from "../data/mockData";
import {ago} from "../utils";

export default function Alerts(){
  const [level,setLevel]=useState("all"),[search,setSearch]=useState(""),[type,setType]=useState("all"),[,refresh]=useState(0);
  const all=DB.alerts.filter(a=>!a.archived);
  const filtered=useMemo(()=>all.filter(a=>
    (level==="all"||a.level===level)&&(type==="all"||a.type===type)&&
    (!search||`${a.title} ${a.desc}`.toLowerCase().includes(search.toLowerCase()))
  ).sort((a,b)=>(a.level==="urgent"?0:a.level==="warning"?1:2)-(b.level==="urgent"?0:b.level==="warning"?1:2)||a.ago-b.ago),[all,level,type,search]);

  const markAll=()=>{DB.alerts.forEach(a=>{if(!a.archived)a.read=true});saveDb();refresh(x=>x+1)};
  const action=(id,kind)=>{const a=DB.alerts.find(x=>x.id===id);if(a){a[kind]=true;saveDb();refresh(x=>x+1)}};

  return <>
    <div className="toolbar alerts-toolbar">
      <div className="stat-pills">
        {[
          ["all",`Toutes (${all.length})`],["urgent",`Urgentes (${all.filter(a=>a.level==="urgent").length})`],
          ["warning",`Avertissements (${all.filter(a=>a.level==="warning").length})`],["info",`Informations (${all.filter(a=>a.level==="info").length})`]
        ].map(([v,l])=><button key={v} className={`stat-pill ${level===v?"active":""}`} onClick={()=>setLevel(v)}>{l}</button>)}
      </div>
      <div className="filters alerts-filters">
        <div className="field compact-field"><div className="input-icon"><Icon name="search" size={18}/><input className="input alerts-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher une alerte..."/></div></div>
        <div className="field compact-field"><select className="select" value={type} onChange={e=>setType(e.target.value)}><option value="all">Tous les types</option><option value="retard">Retard</option><option value="demande">Demande</option><option value="projet">Projet</option><option value="systeme">Système</option></select></div>
        <button className="btn btn-primary" onClick={markAll}>Marquer tout comme lu</button>
      </div>
    </div>

    <div className="stack-gap">{filtered.length===0?<div className="card card-pad"><strong>Aucune alerte</strong><p className="muted-p">Il n'y a aucune notification correspondant à vos critères.</p></div>:
      filtered.map(a=>{const tone=a.level==="urgent"?"danger":a.level==="warning"?"warn":"info";return <div className={`card card-pad ${!a.read?"unread":""}`} key={a.id}>
        <div className="alert-row"><div className={`tone-ico tone-${tone}`}><Icon name={a.level==="urgent"?"zap":a.level==="warning"?"alert":"info"}/></div>
          <div className="alert-content"><strong>{a.title}</strong><p>{a.desc}</p>{a.project&&<small>Projet : {project(a.project)?.name}</small>}<small>{ago(a.ago)}</small></div>
          <div className="alert-actions">{!a.read&&<button className="btn btn-sm btn-ghost" onClick={()=>action(a.id,"read")}>Marquer comme lu</button>}<button className="btn btn-sm btn-ghost" onClick={()=>action(a.id,"archived")}>Archiver</button></div>
        </div>
      </div>})}
    </div>
  </>
}
