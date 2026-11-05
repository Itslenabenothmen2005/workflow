import {useState} from "react";
import {Icon} from "../components/Icon";
import {DonutChart,HealthGauge,Sparkline,BarChart} from "../components/Charts";
import {DB,client,chef,metrics,riskScore,delayDays} from "../data/mockData";
import {ago,avatarStyle,initials,formatDate,riskClass,statusClass} from "../utils";

function Avatar({name,size=24}){return <span className="avatar" style={{"--size":`${size}px`,...avatarStyle(name)}}>{initials(name)}</span>}

export default function Dashboard(){
  const [collapsed,setCollapsed]=useState(false);
  const projects=DB.projects;
  const enCours=projects.filter(p=>p.status==="En cours");
  const termines=projects.filter(p=>p.status==="Terminé");
  const enRetard=projects.filter(p=>p.status==="En retard");
  const m=metrics();

  const risky=[...projects].filter(p=>p.status!=="Terminé").sort((a,b)=>riskScore(b)-riskScore(a));

  return <>
    <div className="grid grid-kpi stack-gap">
      {[
        ["folder","Total projets",projects.length,"var(--accent)",DB.stats.total],
        ["clock","Projets en cours",enCours.length,"var(--info)",DB.stats.active],
        ["check-circle","Projets terminés",termines.length,"var(--ok)",DB.stats.done],
        ["alert","Projets en retard",enRetard.length,"var(--danger)",DB.stats.late]
      ].map(([icon,label,value,color,data])=><div className="card kpi" key={label}>
        <div className="kpi-top"><div className="kpi-ico" style={{color}}><Icon name={icon} size={24}/></div><div>{label}</div></div>
        <div className="kpi-value">{value}</div>
        <div className="kpi-foot"><div className="trend flat">--</div><Sparkline data={data} color={color} labels={DB.stats.months} name={label}/></div>
      </div>)}
      <div className="card kpi"><div className="kpi-top"><div className="kpi-ico tone-accent"><Icon name="briefcase" size={24}/></div><div>Nombre de chefs</div></div><div className="kpi-value">{DB.chefs.filter(c=>c.status==="Actif").length}</div><div className="kpi-foot"><div className="trend flat">Actifs</div></div></div>
      <div className="card kpi"><div className="kpi-top"><div className="kpi-ico tone-info"><Icon name="users" size={24}/></div><div>Nombre d'employees</div></div><div className="kpi-value">{DB.employees.filter(e=>e.status==="Actif").length}</div><div className="kpi-foot"><div className="trend flat">Actifs</div></div></div>
    </div>

    <div className="dashboard-preview-wrap">
      <button className="btn btn-sm btn-ghost preview-collapse" onClick={()=>setCollapsed(v=>!v)}>
        <Icon name={collapsed?"chevron-down":"chevron-up"} size={16}/>
        {collapsed?"Afficher l'aperçu":"Réduire l'aperçu"}
      </button>

      {!collapsed&&<div className="dashboard-preview">
        <div className="grid cols-2-1 stack-gap" style={{marginTop:"1.5rem"}}>
          <div className="card"><div className="card-head"><h3>Évolution des projets</h3></div><div className="card-body chart-box"><BarChart labels={DB.stats.months} series={[
            {name:"Total",data:DB.stats.total,color:"var(--accent)"},
            {name:"Terminés",data:DB.stats.done,color:"var(--ok)"}
          ]}/></div></div>
          <div className="card"><div className="card-head"><h3>Santé globale</h3></div><div className="card-body">
            <div className="health-center"><HealthGauge value={m.health}/></div>
            <div className="list-main">
              <div className="list-item"><span>Respect des délais</span><strong>{m.onTime}%</strong></div>
              <div className="list-item"><span>Projets achevés</span><strong>{termines.length} / {projects.length}</strong></div>
              <div className="list-item"><span>Productivité</span><strong>{m.productivity}%</strong></div>
            </div>
          </div></div>
        </div>

        <div className="grid cols-2-1 stack-gap" style={{marginTop:"1.5rem"}}>
          <div className="card"><div className="card-head"><h3>Activités récentes</h3></div><div className="card-body flush"><div className="feed"><ul>
            {DB.activities.map(a=><li key={a.text}><span className={`tone-ico tone-${a.tone}`}><Icon name={a.icon} size={16}/></span><div className="list-main"><p>{a.text}</p><small>{a.meta} · {ago(a.ago)}</small></div></li>)}
          </ul></div></div></div>
          <div className="card"><div className="card-head"><h3>Alertes récentes</h3></div><div className="card-body flush"><div className="list-main">
            {DB.alerts.filter(a=>!a.archived).slice(0,5).map(a=><div className="list-item" key={a.id}><span className={`tone-ico tone-${a.level==="urgent"?"danger":a.level==="warning"?"warn":"info"}`}><Icon name={a.level==="urgent"?"zap":a.level==="warning"?"alert":"info"} size={18}/></span><div className="list-main"><strong>{a.title}</strong><small>{ago(a.ago)}</small></div></div>)}
          </div></div><div className="card-foot" style={{textAlign:"center"}}><a className="link" href="/alertes">Voir toutes les alertes</a></div></div>
        </div>

        <div className="card" style={{marginTop:"1.5rem"}}><div className="card-head"><h3>Risques de retard</h3></div><div className="table-wrap">
          <table className="table responsive"><thead><tr><th>Projet</th><th>Client</th><th>Chef</th><th>Échéance</th><th>Retard</th><th>Risque</th><th>Progression</th></tr></thead>
          <tbody>{risky.slice(0,5).map(p=>{const c=client(p.client), ch=chef(p.chef), delay=delayDays(p), score=riskScore(p); const risk=score>60?"élevé":score>30?"moyen":"faible"; return <tr key={p.id}>
            <td data-label="Projet" className="cell-main"><strong>{p.name}</strong><div><span className={statusClass(p.status)}>{p.status}</span></div></td>
            <td data-label="Client">{c?.name||"-"}</td>
            <td data-label="Chef">{ch?<div className="person"><Avatar name={ch.name}/><span>{ch.name}</span></div>:"-"}</td>
            <td data-label="Échéance">{formatDate(p.end)}</td>
            <td data-label="Retard">{delay>0?<span className="tone-danger">{delay} j</span>:"-"}</td>
            <td data-label="Risque"><span className={riskClass(risk)}>{risk}</span></td>
            <td data-label="Progression"><div className="prog-cell"><div className="progress"><i style={{"--v":`${p.progress}%`}}/></div><span>{p.progress}%</span></div></td>
          </tr>})}</tbody></table>
        </div></div>
      </div>}
    </div>
  </>
}
