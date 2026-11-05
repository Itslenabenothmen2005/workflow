export function initials(name="") {
  return name.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase();
}

export function hue(name="") {
  let h=0;
  for (const c of name) h=(h*31+c.charCodeAt(0))%360;
  return h;
}

export function avatarStyle(name) {
  return {"--h": hue(name)};
}

export function ago(min) {
  if (min<1) return "à l'instant";
  if (min<60) return `il y a ${Math.round(min)} min`;
  const h=min/60;
  if (h<24) return `il y a ${Math.round(h)} h`;
  const d=Math.round(h/24);
  return d===1 ? "hier" : `il y a ${d} j`;
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"});
}

export function statusClass(status) {
  return status==="Terminé" ? "badge badge-ok" :
    status==="En retard" ? "badge badge-danger" :
    status==="En cours" ? "badge badge-info" :
    status==="Actif" ? "badge badge-ok" : "badge";
}

export function riskClass(risk) {
  return risk==="élevé" ? "badge badge-danger" :
    risk==="moyen" ? "badge badge-warn" : "badge badge-ok";
}
