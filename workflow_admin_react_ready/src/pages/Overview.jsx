import {DonutChart,SimpleBars} from "../components/Charts";
import {DB} from "../data/mockData";

export default function Overview(){
 const task=DB.projects.reduce((a,p)=>({done:a.done+p.tasks.done,doing:a.doing+p.tasks.doing,todo:a.todo+p.tasks.todo,late:a.late+p.tasks.late}),{done:0,doing:0,todo:0,late:0});
 const teams=DB.teams.map(t=>{const ps=DB.projects.filter(p=>p.team===t.id);return {...t,avg:ps.length?Math.round(ps.reduce((s,p)=>s+p.progress,0)/ps.length):0,employees:DB.employees.filter(e=>e.team===t.id).length}});
 return <>
  <div className="stat-pills"><span className="stat-pill"><strong>{DB.projects.length}</strong> projets</span><span className="stat-pill"><strong>{DB.teams.length}</strong> équipes</span><span className="stat-pill"><strong>{DB.chefs.length}</strong> chefs</span><span className="stat-pill"><strong>{DB.employees.length}</strong> employees</span><span className="stat-pill"><strong>{DB.clients.length}</strong> clients</span></div>
  <div className="grid cols-2-1"><div className="card"><div className="card-head"><h2>Avancement par équipe</h2></div><div className="card-body"><SimpleBars items={teams.map(t=>({label:t.name,value:t.avg,color:t.color}))}/></div></div>
  <div className="card card-pad"><h2>Répartition des tâches</h2><DonutChart centerLabel="Tâches" items={[{label:"Terminées",value:task.done,color:"var(--ok)"},{label:"En cours",value:task.doing,color:"var(--info)"},{label:"À faire",value:task.todo,color:"var(--text-3)"},{label:"En retard",value:task.late,color:"var(--danger)"}]} /></div></div>
    <div className="card"><div className="card-head table-section-head"><h2>Détail par équipe</h2></div><div className="table-wrap"><table className="table responsive"><thead><tr><th>Équipe</th><th>Chefs</th><th>Employees</th><th>Projets</th><th>Avancement moyen</th></tr></thead><tbody>
  {teams.map(t=><tr key={t.id}><td><span className="team-tag" style={{"--c":t.color}}>{t.name}</span></td><td>{DB.chefs.filter(c=>c.team===t.id).length}</td><td>{t.employees}</td><td>{DB.projects.filter(p=>p.team===t.id).length}</td><td><div className="prog-cell"><div className="progress"><i style={{"--v":`${t.avg}%`,background:t.color}}/></div><span>{t.avg}%</span></div></td></tr>)}
  </tbody></table></div></div>
 </>
}
