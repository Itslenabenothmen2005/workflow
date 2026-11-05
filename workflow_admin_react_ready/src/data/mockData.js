const teams = [
  { id: "alpha", name: "Alpha", color: "#8b6cff" },
  { id: "atlas", name: "Atlas", color: "#4cc9f0" },
  { id: "nova", name: "Nova", color: "#3ddc97" },
  { id: "orion", name: "Orion", color: "#ffb84d" },
  { id: "vega", name: "Vega", color: "#ff7ab6" },
];

const clients = [
  ["cl1","Groupe Médina Foods","Agroalimentaire","Tunis"],
  ["cl2","Sahel Logistique","Logistique","Sousse"],
  ["cl3","École Supérieure de Nabeul","Éducation","Nabeul"],
  ["cl4","Assurances Horizon","Assurance","Tunis"],
  ["cl5","Hôtel Bahia Resort","Hôtellerie","Hammamet"],
  ["cl6","Banque Nord-Sud","Banque","Tunis"],
  ["cl7","Manufacture Textile Cap Bon","Industrie","Bizerte"],
  ["cl8","Clinique Les Oliviers","Santé","Sfax"],
  ["cl9","Transports Carthage","Transport","Tunis"],
  ["cl10","Boulangeries Zaghouan","Commerce","Zaghouan"],
].map(([id,name,sector,city]) => ({id,name,sector,city}));

const names = (name) =>
  name.normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .toLowerCase().replace(/[^a-z]+/g,".")
      .replace(/^\.|\.$/g,"");

const chefs = [
  ["Amine Trabelsi","alpha","Actif","2021-03-15","+216 98 120 344"],
  ["Sarra Ben Youssef","atlas","Actif","2020-09-01","+216 22 458 190"],
  ["Karim Mezghani","nova","Actif","2022-01-10","+216 55 302 716"],
  ["Inès Chaabane","alpha","Actif","2022-06-20","+216 97 611 428"],
  ["Walid Jlassi","orion","Actif","2019-11-04","+216 50 874 265"],
  ["Nour Haddad","vega","Actif","2023-02-13","+216 29 543 087"],
  ["Rania Gharbi","atlas","Inactif","2021-08-23","+216 24 917 350"],
  ["Mehdi Bouazizi","orion","Inactif","2020-05-18","+216 93 265 741"],
].map(([name,team,status,since,phone],i)=>({
  id:`c${i+1}`, name, email:`${names(name)}@atlas-numerique.tn`, team,status,since,phone
}));

const workers = [
  ["Yasmine Kefi","Salarié","alpha","p1","Actif"],
  ["Oussama Ben Amor","Salarié","alpha","p7","Actif"],
  ["Mariem Dridi","Freelance","atlas","p2","Actif"],
  ["Hedi Sassi","Salarié","atlas","p14","Actif"],
  ["Salma Ferchichi","Stagiaire","nova","p3","Actif"],
  ["Bilel Mansouri","Salarié","nova","p9","Actif"],
  ["Emna Zouari","Salarié","orion","","Actif"],
  ["Fares Tlili","Freelance","vega","p6","Actif"],
  ["Ghofrane Ayari","Salarié","vega","p11","Actif"],
  ["Aymen Khelifi","Stagiaire","alpha","p4","Actif"],
  ["Lina Baccouche","Salarié","alpha","p12","Actif"],
  ["Skander Hamdi","Freelance","atlas","p2","Actif"],
  ["Rym Jebali","Salarié","nova","p3","Actif"],
  ["Marwen Nasri","Salarié","orion","","Inactif"],
  ["Sonia Cherif","Stagiaire","vega","p6","Actif"],
  ["Anis Belaïd","Salarié","alpha","p1","Actif"],
  ["Molka Oueslati","Freelance","orion","","Actif"],
  ["Taha Rekik","Salarié","atlas","p14","Inactif"],
  ["Chaima Souissi","Salarié","nova","p9","Actif"],
  ["Nizar Gharsalli","Stagiaire","vega","p11","Actif"],
].map(([name,profile,team,project,status],i)=>({
  id:`w${i+1}`, name, email:`${names(name)}@atlas-numerique.tn`, team,profile,project,status,
  phone:"", since:`2024-0${(i%9)+1}-15`
}));

const projects = [
  ["p1","Refonte du portail RH","cl1","c1","alpha",64,"2026-05-04","2026-10-30","En cours","moyen",[48,14,12,3]],
  ["p2","Application Livraison Express","cl2","c2","atlas",38,"2026-06-15","2026-09-08","En retard","élevé",[22,15,21,9]],
  ["p3","Plateforme e-learning","cl3","c3","nova",82,"2026-03-02","2026-10-02","En cours","faible",[61,8,5,0]],
  ["p4","ERP Comptabilité","cl4","c4","alpha",55,"2026-04-20","2026-11-20","En cours","moyen",[37,15,16,5]],
  ["p5","Site vitrine Bahia","cl5","c5","orion",100,"2026-02-09","2026-06-30","Terminé","faible",[40,0,0,0]],
  ["p6","Migration cloud","cl6","c6","vega",47,"2026-05-18","2026-09-04","En retard","élevé",[31,12,20,8]],
  ["p7","Tableau de bord IoT usine","cl7","c1","alpha",71,"2026-04-06","2026-11-06","En cours","faible",[52,10,11,1]],
  ["p8","Prise de rendez-vous en ligne","cl8","c2","atlas",100,"2026-01-12","2026-05-29","Terminé","faible",[36,0,0,0]],
  ["p9","Portail client Carthage","cl9","c3","nova",29,"2026-07-06","2026-12-18","En cours","moyen",[14,10,24,2]],
  ["p10","Identité digitale Zaghouan","cl10","c5","orion",100,"2026-03-16","2026-07-31","Terminé","faible",[28,0,0,0]],
  ["p11","CRM sur mesure","cl1","c6","vega",58,"2026-05-25","2026-11-13","En cours","moyen",[33,14,10,3]],
  ["p12","Marketplace des artisans","cl10","c4","alpha",33,"2026-06-01","2026-09-15","En retard","élevé",[19,9,16,6]],
  ["p13","Réservation en ligne Bahia","cl5","c1","alpha",100,"2026-04-27","2026-08-28","Terminé","faible",[44,0,0,0]],
  ["p14","Reporting BI","cl4","c2","atlas",88,"2026-03-23","2026-10-09","En cours","faible",[58,6,2,0]],
].map(([id,name,client,chef,team,progress,start,end,status,risk,t])=>({
  id,name,client,chef,team,progress,start,end,status,risk,
  tasks:{done:t[0],doing:t[1],todo:t[2],late:t[3]}
}));

const alerts = [
  ["a1","urgent","demande","Demande de retrait : Karim Mezghani","Karim Mezghani demande à se retirer du projet Portail client Carthage. Une décision est attendue avant vendredi.",18,"p9"],
  ["a2","urgent","retard","Migration cloud : 14 jours de retard","Le projet de la Banque Nord-Sud a dépassé son échéance du 4 septembre et aucun plan de rattrapage n'a été validé.",55,"p6"],
  ["a3","urgent","retard","Application Livraison Express en retard","Échéance dépassée depuis 10 jours, 9 tâches en retard. Action requise pour le client Sahel Logistique.",190,"p2"],
  ["a4","warning","projet","ERP Comptabilité : budget consommé à 92 %","Le budget est presque épuisé alors que l'avancement n'atteint que 55 %. Une revue budgétaire est recommandée.",320,"p4"],
  ["a5","warning","retard","Marketplace des artisans : échéance dépassée","Le projet a 3 jours de retard et 6 tâches non terminées. Risque de dérive sur la prochaine livraison.",640,"p12"],
  ["a6","warning","projet","Point d’étape client requis","Sahel Logistique signale un manque de visibilité sur l'avancement. Une réunion de cadrage est demandée.",1500,"p2"],
  ["a7","warning","projet","Surcharge détectée dans l'équipe Vega","4 tâches en retard sur 2 projets actifs. Envisagez de réaffecter une partie de la charge.",1900,"p11"],
  ["a8","info","systeme","Sauvegarde nocturne terminée","La sauvegarde complète de la plateforme s'est terminée sans erreur à 02:14.",720,""],
  ["a9","info","systeme","Maintenance prévue samedi à 02:00","La plateforme sera indisponible environ 20 minutes pour une mise à jour de sécurité.",2900,""],
  ["a10","info","projet","Bilan trimestriel disponible","Le récapitulatif du troisième trimestre est prêt dans la page Statistiques.",4300,""],
  ["a11","info","demande","Compte de Rania Gharbi désactivé","Le compte est inactif depuis 30 jours. Vous pouvez le réactiver ou le supprimer depuis la page Chefs.",5000,""],
].map(([id,level,type,title,desc,ago,project])=>({id,level,type,title,desc,ago,project,read:false,archived:false}));

const activities = [
  ["zap","danger","Migration cloud dépasse son échéance","Banque Nord-Sud",55],
  ["check-circle","ok","Sarra Ben Youssef a livré le lot 3","Reporting BI",95],
  ["check-circle","ok","Validation du lot 1 par le client","Groupe Médina Foods",220],
  ["user","info","Hedi Sassi rejoint le projet","Reporting BI",380],
  ["briefcase","accent","Compte de Nour Haddad mis à jour","Équipe Vega",560],
  ["trend-up","ok","Avancement à 82 %","Plateforme e-learning",1300],
].map(([icon,tone,text,meta,ago])=>({icon,tone,text,meta,ago}));

const tasks = [
  {id:"t1", title:"Préparer le briefing sprint", projectId:"p1", projectName:"Refonte du portail RH", assigneeId:"w1", assigneeName:"Yasmine Kefi", teamId:"alpha", status:"En cours", priority:"Moyenne", dueDate:"2026-10-02", owner:"Amine Trabelsi"},
  {id:"t2", title:"Valider l'intégration du back-office", projectId:"p1", projectName:"Refonte du portail RH", assigneeId:"w10", assigneeName:"Aymen Khelifi", teamId:"alpha", status:"À faire", priority:"Urgent", dueDate:"2026-10-01", owner:"Amine Trabelsi"},
  {id:"t3", title:"Suivre le plan de recette", projectId:"p4", projectName:"ERP Comptabilité", assigneeId:"w11", assigneeName:"Lina Baccouche", teamId:"alpha", status:"En retard", priority:"Haute", dueDate:"2026-09-28", owner:"Amine Trabelsi"},
  {id:"t4", title:"Rédiger le rapport d'avancement", projectId:"p7", projectName:"Tableau de bord IoT usine", assigneeId:"w16", assigneeName:"Anis Belaïd", teamId:"alpha", status:"En révision", priority:"Moyenne", dueDate:"2026-10-03", owner:"Amine Trabelsi"},
  {id:"t5", title:"Mettre à jour les livrables clients", projectId:"p12", projectName:"Marketplace des artisans", assigneeId:"w2", assigneeName:"Oussama Ben Amor", teamId:"alpha", status:"À faire", priority:"Haute", dueDate:"2026-10-04", owner:"Amine Trabelsi"}
];

const leaveRequests = [
  {id:"lv1", employeeId:"w1", employeeName:"Yasmine Kefi", type:"Congé annuel", start:"2026-10-04", end:"2026-10-08", duration:5, reason:"Vacances familiales", status:"En attente"},
  {id:"lv2", employeeId:"w10", employeeName:"Aymen Khelifi", type:"Congé maladie", start:"2026-10-10", end:"2026-10-12", duration:3, reason:"Consultation médicale", status:"Validé"},
  {id:"lv3", employeeId:"w11", employeeName:"Lina Baccouche", type:"Congé sans solde", start:"2026-10-15", end:"2026-10-18", duration:4, reason:"Déménagement", status:"En attente"},
  {id:"lv4", employeeId:"w16", employeeName:"Anis Belaïd", type:"Congé personnel", start:"2026-10-19", end:"2026-10-20", duration:2, reason:"Raison personnelle", status:"Refusé"}
];

const reports = [
  {id:"r1", employeeId:"w1", employeeName:"Yasmine Kefi", projectId:"p1", projectName:"Refonte du portail RH", date:"2026-09-30", tasks:["Mise à jour du backlog","Validation des écrans RH"], problems:["2 dépendances bloquées"], status:"À valider"},
  {id:"r2", employeeId:"w10", employeeName:"Aymen Khelifi", projectId:"p4", projectName:"ERP Comptabilité", date:"2026-09-29", tasks:["Mise en place des workflows","Tests unitaires"], problems:["Couverture partielle"], status:"Validé"},
  {id:"r3", employeeId:"w16", employeeName:"Anis Belaïd", projectId:"p7", projectName:"Tableau de bord IoT usine", date:"2026-09-28", tasks:["Livraison du lot 2","Validation sur maquette"], problems:["API non stable"], status:"À valider"},
  {id:"r4", employeeId:"w11", employeeName:"Lina Baccouche", projectId:"p12", projectName:"Marketplace des artisans", date:"2026-09-27", tasks:["Suivi des livrables","Mise à jour planning"], problems:["Risque de retard client"], status:"Refusé"}
];

const attendance = [
  {id:"a10", employeeName:"Yasmine Kefi", teamId:"alpha", date:"2026-10-01", time:"08:57", status:"Présent"},
  {id:"a11", employeeName:"Oussama Ben Amor", teamId:"alpha", date:"2026-10-01", time:"09:13", status:"Retard"},
  {id:"a12", employeeName:"Aymen Khelifi", teamId:"alpha", date:"2026-10-01", time:"09:02", status:"Présent"},
  {id:"a13", employeeName:"Lina Baccouche", teamId:"alpha", date:"2026-10-01", time:"08:49", status:"Présent"},
  {id:"a14", employeeName:"Anis Belaïd", teamId:"alpha", date:"2026-10-01", time:"Absent", status:"Absent"}
];

const meetings = [
  {id:"m1", title:"Point équipe Alpha", date:"2026-10-02", time:"09:30", duration:45, participants:["Amine Trabelsi","Yasmine Kefi","Aymen Khelifi"], projectId:"p1", description:"Suivi sprint et blocages"},
  {id:"m2", title:"Synthèse projet ERP", date:"2026-10-03", time:"14:00", duration:60, participants:["Amine Trabelsi","Lina Baccouche"], projectId:"p4", description:"Validation des livrables"},
  {id:"m3", title:"Réunion de synthèse", date:"2026-10-04", time:"11:00", duration:30, participants:["Amine Trabelsi","Yasmine Kefi","Anis Belaïd"], projectId:"p7", description:"Suivi des points d'avancement"}
];

const messages = [
  {
    id:"conv1",
    title:"Équipe Alpha",
    preview:"Préparation du sprint suivant",
    unread:2,
    participants:["Amine Trabelsi","Yasmine Kefi","Aymen Khelifi","Lina Baccouche"],
    messages:[
      {id:"msg1", sender:"Yasmine Kefi", me:false, text:"J'ai finalisé les maquettes RH. Il reste un point de validation côté équipe.", time:"09:12"},
      {id:"msg2", sender:"Amine Trabelsi", me:true, text:"Merci. On validera ce matin avant 11h.", time:"09:18"},
      {id:"msg3", sender:"Aymen Khelifi", me:false, text:"Je mets à jour le backlog pour ce sprint."
      , time:"09:24"}
    ]
  }
];

const notifications = [
  {id:"n1", type:"Congé", level:"warning", title:"Nouvelle demande de congé", message:"Aymen Khelifi a soumis une demande de congé.", date:"2026-10-01", read:false},
  {id:"n2", type:"Rapport", level:"info", title:"Rapport à valider", message:"Yasmine Kefi a soumis un compte rendu de sprint.", date:"2026-10-01", read:false},
  {id:"n3", type:"Retard", level:"urgent", title:"Tâche en retard", message:"ERP Comptabilité dépasse son plan de recette.", date:"2026-09-30", read:true},
  {id:"n4", type:"Réunion", level:"info", title:"Réunion planifiée", message:"Point équipe Alpha est programmé demain à 09:30.", date:"2026-09-30", read:true}
];

const stats = {
  months:["oct.","nov.","déc.","janv.","févr.","mars","avr.","mai","juin","juil.","août","sept."],
  total:[5,6,6,7,8,9,9,10,11,12,13,14],
  done:[1,1,2,2,2,3,3,3,4,4,4,4],
  active:[4,5,4,5,6,6,6,7,7,8,9,10],
  late:[1,0,2,1,1,2,1,2,3,2,3,3],
  productivity:[72,74,71,76,78,77,80,79,82,81,84,85],
};

const STORAGE_KEY = "workflow_admin_db_v1";

function loadDb() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  return {
    teams, clients, projects, activities, stats,
    chefs: saved?.chefs || chefs,
    employees: saved?.employees || workers,
    alerts: alerts.map(a => ({...a, ...(saved?.alertState?.[a.id] || {})})),
    tasks: saved?.tasks || tasks,
    leaveRequests: saved?.leaveRequests || leaveRequests,
    reports: saved?.reports || reports,
    attendance: saved?.attendance || attendance,
    meetings: saved?.meetings || meetings,
    messages: saved?.messages || messages,
    notifications: saved?.notifications || notifications
  };
}

export const DB = loadDb();

export function saveDb() {
  const alertState = Object.fromEntries(DB.alerts.map(a => [a.id,{read:a.read,archived:a.archived}]));
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    chefs: DB.chefs,
    employees: DB.employees,
    alertState,
    tasks: DB.tasks,
    leaveRequests: DB.leaveRequests,
    reports: DB.reports,
    attendance: DB.attendance,
    meetings: DB.meetings,
    messages: DB.messages,
    notifications: DB.notifications
  }));
}

export function team(id) { return DB.teams.find(t=>t.id===id) || {name:"—",color:"#71717f"}; }
export function chef(id) { return DB.chefs.find(c=>c.id===id); }
export function client(id) { return DB.clients.find(c=>c.id===id); }
export function project(id) { return DB.projects.find(p=>p.id===id); }
export function employeesOf(teamId) { return DB.employees.filter(e=>e.team===teamId); }
export function delayDays(p) {
  if (p.status !== "En retard") return 0;
  return Math.max(0, Math.round((new Date("2026-09-18") - new Date(p.end))/86400000));
}
export function riskScore(p) {
  if (p.status==="Terminé") return -1;
  if (p.status==="En retard") return 100 + delayDays(p);
  return {faible:15,moyen:55,"élevé":85}[p.risk] || 0;
}
export function metrics() {
  const onTime=Math.round((DB.projects.length-DB.projects.filter(p=>p.status==="En retard").length)/DB.projects.length*100);
  const productivity=DB.stats.productivity.at(-1);
  return {onTime,productivity,health:Math.round((onTime+productivity)/2)};
}
