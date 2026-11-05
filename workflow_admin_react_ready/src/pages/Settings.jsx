import {useState} from "react";
import {useAppSettings} from "../components/Layout";

export default function Settings(){
 const [settings,setSettings]=useAppSettings();
 const [profile,setProfile]=useState(settings.profile);
 const [app,setApp]=useState(settings.app);
 const saveProfile=()=>setSettings(s=>({...s,profile}));
 const saveApp=()=>setSettings(s=>({...s,app}));
 const reset=()=>{if(confirm("Réinitialiser les données locales ?")){localStorage.clear();location.reload()}};
 return <div className="grid cols-1 stack-gap">
  <div className="card card-pad"><h3>Profil</h3><div className="grid cols-2">
   <div className="field"><label>Nom complet</label><input className="input" value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})}/></div>
   <div className="field"><label>E-mail</label><input className="input" value={profile.email} disabled/></div>
   <div className="field"><label>Téléphone</label><input className="input" value={profile.phone} onChange={e=>setProfile({...profile,phone:e.target.value})}/></div>
   <div className="field"><label>Rôle</label><input className="input" value={profile.role} disabled/></div></div>
   <button className="btn btn-primary" style={{marginTop:16}} onClick={saveProfile}>Enregistrer le profil</button>
  </div>
    <div className="card card-pad" id="affichage"><h3>Affichage</h3><div className="display-options">
     <div className="display-option"><label>Thème</label><div className="segmented"><button className={settings.theme==="dark"?"active":""} onClick={()=>setSettings(s=>({...s,theme:"dark"}))}>Sombre</button><button className={settings.theme==="light"?"active":""} onClick={()=>setSettings(s=>({...s,theme:"light"}))}>Clair</button></div></div>
     <div className="display-option"><label>Densité</label><div className="segmented"><button className={settings.density==="comfortable"?"active":""} onClick={()=>setSettings(s=>({...s,density:"comfortable"}))}>Confortable</button><button className={settings.density==="compact"?"active":""} onClick={()=>setSettings(s=>({...s,density:"compact"}))}>Compact</button></div></div>
   </div><div style={{marginTop:24}}><label>Couleur d'accent</label><div className="accent-list">{["#7c5cff","#3b82f6","#10b981","#f59e0b","#ef4444","#ec4899"].map(c=><button key={c} className="accent-circle" style={{background:c,borderColor:settings.accent===c?"var(--text-main)":"transparent"}} onClick={()=>setSettings(s=>({...s,accent:c}))}/>)}</div></div>
  </div>
  <div className="card card-pad"><h3>Application</h3><div className="grid cols-2">
   <div className="field"><label>Nom de l'entreprise</label><input className="input" value={app.company} onChange={e=>setApp({...app,company:e.target.value})}/></div>
   <div className="field"><label>Fuseau horaire</label><select className="select" value={app.timezone} onChange={e=>setApp({...app,timezone:e.target.value})}><option>Africa/Tunis</option><option>Europe/Paris</option><option>Europe/London</option></select></div>
   <div className="field"><label>Seuil de retard en jours</label><input className="input" type="number" value={app.lateThreshold} onChange={e=>setApp({...app,lateThreshold:e.target.value})}/></div></div>
   <button className="btn btn-primary" style={{marginTop:16}} onClick={saveApp}>Enregistrer les paramètres</button>
  </div>
  <div className="card card-pad danger-zone"><h3>Zone de danger</h3><p>Cette action réinitialise les données locales de démonstration.</p><button className="btn btn-danger" onClick={reset}>Réinitialiser les données</button></div>
 </div>
}
