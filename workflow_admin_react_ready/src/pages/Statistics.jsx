import {DonutChart,LineChart,BarChart,SimpleBars} from "../components/Charts";
import {Icon} from "../components/Icon";
import {DB,metrics} from "../data/mockData";

export default function Statistics(){
  const m=metrics();
  const teamItems=DB.teams.map(t=>{
    const ps=DB.projects.filter(p=>p.team===t.id);
    return {label:t.name,value:ps.length?Math.round(ps.reduce((s,p)=>s+p.progress,0)/ps.length):0,color:t.color};
  });
  const counts={
    doing:DB.projects.filter(p=>p.status==="En cours").length,
    done:DB.projects.filter(p=>p.status==="Terminé").length,
    late:DB.projects.filter(p=>p.status==="En retard").length
  };
  const donut=[
    {label:"En cours",value:counts.doing,color:"#3b82f6"},
    {label:"Terminé",value:counts.done,color:"#22c55e"},
    {label:"En retard",value:counts.late,color:"#ef4444"}
  ];
  const punctuality=DB.stats.total.map((t,i)=>Math.round(((t-DB.stats.late[i])/t)*100));
  return <>
    <div className="grid grid-kpi">
      {[
        ["check-circle",`${m.onTime}%`,"Taux de ponctualité","tone-ok"],
        ["trend-up",`${m.productivity}%`,"Productivité","tone-accent"],
        ["folder",DB.projects.length,"Projets suivis","tone-warn"],
        ["shield",`${m.health}%`,"Santé globale","tone-info"]
      ].map(([ic,val,label,tone])=><div className="card card-pad kpi" key={label}><div className="kpi-top"><div className={`kpi-ico ${tone}`}><Icon name={ic}/></div></div><div className="kpi-value">{val}</div><div className="kpi-foot">{label}</div></div>)}
    </div>

    <h3 className="section-title">Évolution des projets</h3>
    <div className="grid cols-2">
      <div className="card card-pad"><div className="chart-container"><LineChart labels={DB.stats.months} series={[
        {name:"Total",data:DB.stats.total,color:"var(--accent)"},{name:"Terminés",data:DB.stats.done,color:"var(--ok)"},{name:"En retard",data:DB.stats.late,color:"var(--danger)"}
      ]}/></div><div className="legend-inline"><span><i style={{background:"var(--accent)"}}/>Total</span><span><i style={{background:"var(--ok)"}}/>Terminés</span><span><i style={{background:"var(--danger)"}}/>En retard</span></div></div>
      <div className="card card-pad"><div className="chart-container"><BarChart labels={DB.stats.months} series={[
        {name:"Actifs",data:DB.stats.active,color:"var(--info)"},{name:"Retards",data:DB.stats.late,color:"var(--danger)"}
      ]}/></div><div className="legend-inline"><span><i style={{background:"var(--info)"}}/>Actifs</span><span><i style={{background:"var(--danger)"}}/>Retards</span></div></div>
    </div>

    <h3 className="section-title">Productivité et respect des délais</h3>
    <div className="grid cols-2">
      <div className="card card-pad"><div className="chart-container"><LineChart labels={DB.stats.months} series={[{name:"Productivité",data:DB.stats.productivity,color:"var(--accent)"}]} unit="%"/></div><div className="legend-inline"><span><i style={{background:"var(--accent)"}}/>Productivité (%)</span></div></div>
      <div className="card card-pad"><div className="chart-container"><LineChart labels={DB.stats.months} series={[{name:"Ponctualité",data:punctuality,color:"var(--warn)"}]} unit="%"/></div><div className="legend-inline"><span><i style={{background:"var(--warn)"}}/>Ponctualité (%)</span></div></div>
    </div>

    <h3 className="section-title">Activité par équipe</h3>
    <div className="grid cols-2-1">
      <div className="card card-pad"><h4>Avancement moyen des projets (%)</h4><div style={{marginTop:16}}><SimpleBars items={teamItems}/></div></div>
      <div className="card card-pad">
        {/* Correction : le donut et sa légende sont empilés verticalement. */}
        <DonutChart items={donut} centerLabel="Projets" size={160}/>
      </div>
    </div>
  </>
}
