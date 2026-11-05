import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Icon} from "../components/Icon";

const DEMO_USERS = {
  admin: {label:"CEO / Administrateur", email:"admin@atlas-numerique.tn", password:"Admin@2026", route:"/dashboard"},
  chef: {label:"Chef d'équipe", email:"chef@atlas-numerique.tn", password:"Chef@2026", route:"/chef"},
  employee: {label:"Employé", email:"yasmine.kefi@atlas-numerique.tn", password:"Employe@2026", route:"/employee"}
};

export default function Login() {
  const navigate=useNavigate();
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [role,setRole]=useState("admin");
  const [show,setShow]=useState(false);
  const [errors,setErrors]=useState({});

  const submit=e=>{
    e.preventDefault();
    const next={};
    const user = DEMO_USERS[role];
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email="Entrez une adresse e-mail valide.";
    if(password.length<6) next.password="Le mot de passe doit contenir au moins 6 caractères.";
    if(Object.keys(next).length) {setErrors(next);return;}
    if(email.trim().toLowerCase() !== user.email || password !== user.password) {
      setErrors({password:"Adresse e-mail ou mot de passe incorrect pour ce rôle."}); return;
    }

    const existingSettings = JSON.parse(localStorage.getItem("workflow_admin_settings") || "null") || {};
    const profile = role === "chef" ? {
      name:"Amine Trabelsi",
      email:user.email,
      phone:"+216 98 120 344",
      role:"Chef d'équipe"
    } : role === "employee" ? {
      name:"Yasmine Kefi",
      email:user.email,
      phone:"",
      role:"Employé"
    } : {
      name:"Yassine Belhadj",
      email:user.email,
      phone:"+216 71 234 567",
      role:"Directeur général (CEO)"
    };

    localStorage.setItem("workflow_admin_session",JSON.stringify({email:user.email,role}));
    localStorage.setItem("workflow_admin_settings", JSON.stringify({...existingSettings, profile, theme: existingSettings.theme || "dark", accent: existingSettings.accent || "#7c5cff", density: existingSettings.density || "comfortable", app: existingSettings.app || {company:"Atlas Numérique",timezone:"Africa/Tunis",lateThreshold:3}}));
    navigate(user.route);
  };

  return <div className="auth-page">
    <aside className="auth-side" aria-hidden="true">
      <div className="auth-rings"><i/><i/><i/></div>
      <div className="auth-side-top"><span className="brand-mark"><Icon name="target" size={24}/></span><strong>Cadran</strong></div>
      <div className="auth-side-mid"><h2>Toute votre entreprise, en un seul écran.</h2>
        <p>Projets, équipes et performance : pilotez Atlas Numérique avec une vue claire sur ce qui compte vraiment aujourd'hui.</p>
      </div>
      <div className="auth-stats"><div><strong>14</strong><span>Projets suivis</span></div><div><strong>28</strong><span>Collaborateurs</span></div><div><strong>96%</strong><span>Taux de livraison</span></div></div>
    </aside>
    <main className="auth-main"><div className="auth-card">
      <div className="auth-brand-mobile"><span className="brand-mark"><Icon name="target" size={22}/></span><strong>Cadran</strong></div>
      <h1>Bon retour</h1><p>Connectez-vous à votre espace.</p>
      <form onSubmit={submit} noValidate>
        <div className="field"><label>Rôle</label><div className="segmented" aria-label="Choix du rôle">
          <button type="button" aria-pressed={role === "admin"} className={role === "admin" ? "active" : ""} onClick={()=>setRole("admin")}>CEO</button>
          <button type="button" aria-pressed={role === "chef"} className={role === "chef" ? "active" : ""} onClick={()=>setRole("chef")}>Chef</button>
          <button type="button" aria-pressed={role === "employee"} className={role === "employee" ? "active" : ""} onClick={()=>setRole("employee")}>Employé</button>
        </div></div>
        <div className={`field ${errors.email?"has-error":""}`}><label>Adresse e-mail</label><div className="input-icon"><Icon name="mail" size={18}/><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@entreprise.tn"/></div>{errors.email&&<p className="field-error">{errors.email}</p>}</div>
        <div className={`field ${errors.password?"has-error":""}`}><label>Mot de passe</label><div className="input-icon"><Icon name="lock" size={18}/><input className="input" type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/><button type="button" className="btn-icon eye" onClick={()=>setShow(v=>!v)}><Icon name={show?"eye-off":"eye"} size={18}/></button></div>{errors.password&&<p className="field-error">{errors.password}</p>}</div>
        <div className="auth-row"><label className="check"><input type="checkbox" defaultChecked/><span>Se souvenir de moi</span></label><button type="button" className="link" onClick={()=>alert("Fonction de démonstration")}>Mot de passe oublié ?</button></div>
        <button type="submit" className="btn btn-primary btn-block">Se connecter</button>
        <p className="auth-hint">Démo : <strong>{DEMO_USERS[role].email}</strong> / <strong>{DEMO_USERS[role].password}</strong></p>
      </form>
      <p className="auth-foot">© 2026 Atlas Numérique — Espace {role === "chef" ? "Chef" : "Administrateur"}</p>
    </div></main>
  </div>
}
