# Cadran / Workflow — Documentation complète

> Document de référence fondé sur le code actuellement présent à la racine du dépôt. Il décrit les implémentations observées, sans assimiler les maquettes et données locales à un système métier connecté.
>
> **État de l'audit :** lecture statique des sources et configuration. Les mentions « implémenté » signifient que le chemin de code existe ; elles ne garantissent pas à elles seules un test exhaustif en production. Les limites non confirmées sont signalées « À vérifier ».

## Légende d'état

| État | Sens |
|---|---|
| Implémenté dans le code | Composant, action ou règle présent dans les sources. |
| Partiel | Une partie du parcours existe, mais la relation, la persistance ou les règles ne couvrent pas tout le processus attendu. |
| Absent | Aucun mécanisme correspondant n'a été trouvé dans les sources examinées. |
| À vérifier | La source seule ne permet pas de confirmer le comportement d'exécution, le besoin métier ou les données externes. |

## 1. Présentation générale

Cadran, également nommé Workflow Admin dans le manifeste CRA, est une application React de démonstration de gestion de workflow RH et projets. Le code vise à réunir dans une interface commune le pilotage de projets, équipes, tâches, réunions, congés, présences, rapports, messages, notifications et réglages.

L'identité visuelle présente le nom **Cadran**, un accent violet configurable et des espaces distincts pour Administrateur/CEO, Chef et Employé. Les profils « Freelance » et « Stagiaire » apparaissent dans les données d'employés ; ils ne constituent pas des rôles de connexion distincts.

### Technologies identifiées

| Élément | Version ou usage observé |
|---|---|
| React | `18.3.1` installé à la racine ; le manifeste déclare `^18.3.1`. |
| React DOM | `18.3.1` installé ; le manifeste déclare `^18.3.1`. |
| React Router DOM | `6.30.6` installé ; le manifeste déclare `^6.28.0`. |
| Create React App / `react-scripts` | `5.0.1`, scripts `start`, `build`, `test`, `eject`. |
| Lucide React | `0.468.0`, bibliothèque d'icônes utilisée par `Icon.jsx`. |
| JavaScript | JSX/ES modules ; aucun TypeScript repéré. |
| CSS | Feuilles CSS classiques, variables personnalisées et `color-mix()`. |

Le manifeste racine est la configuration à utiliser pour `npm` depuis la racine. `src/package.json` est un manifeste secondaire incohérent avec le projet actif : il annonce React 19 et React Router 7. `package.react-example.json` reprend également un exemple avec des versions différentes. Leur rôle opérationnel est **à vérifier** ; ils ne sont pas le manifeste utilisé par les scripts exécutés à la racine.

### Mode de fonctionnement

- L'application est un frontend CRA.
- Les données métier sont définies dans `src/data/mockData.js` et modifiées en mémoire dans les pages.
- La persistance de démonstration se fait principalement par `localStorage`.
- Aucun serveur applicatif, route API, client `fetch`/Axios, schéma ORM ou base de données applicative n'a été identifié.
- Les données ne sont donc ni synchronisées entre navigateurs ni protégées par une autorisation serveur.
- `node_modules/` et `build/` sont ignorés par Git selon `.gitignore`; `build/` est un artefact généré, pas la source de vérité.

## 2. Architecture technique

### Arborescence utile

```text
.
├── package.json                 # manifeste et scripts actifs
├── package-lock.json            # résolution npm verrouillée
├── package.react-example.json   # manifeste d'exemple divergent
├── README-MIGRATION.md          # notes de migration, antérieures aux espaces actuels
├── public/
│   ├── index.html               # shell CRA, favicon et titre initial
│   └── icon.png                 # favicon référencé par le shell
├── src/
│   ├── index.js                 # montage React, BrowserRouter et imports CSS
│   ├── App.jsx                  # routes et protection par rôle
│   ├── utils.js                 # formatage, badges, avatars et calculs visuels
│   ├── package.json             # manifeste secondaire incohérent, à vérifier
│   ├── components/
│   │   ├── Layout.jsx           # shell partagé, sidebar, topbar, recherche, session/settings
│   │   ├── Icon.jsx             # correspondance nom logique → icône Lucide
│   │   └── Charts.jsx           # graphiques SVG faits dans le projet
│   ├── data/
│   │   └── mockData.js          # données mock, chargement et sauvegarde locale
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Overview.jsx
│   │   ├── Statistics.jsx
│   │   ├── Chiefs.jsx
│   │   ├── Employees.jsx
│   │   ├── Projects.jsx
│   │   ├── Alerts.jsx
│   │   ├── Settings.jsx
│   │   ├── ChefSpace.jsx        # plusieurs pages Chef exportées depuis un module
│   │   └── EmployeeSpace.jsx    # pages Employé exportées depuis un module
│   └── styles/
│       ├── base.css
│       ├── component.css
│       ├── layout.css
│       ├── auth.css
│       └── app-overrides.css
├── build/                       # sortie générée CRA, ignorée par Git
├── node_modules/                # dépendances installées, ignorées par Git
└── workflow-admin-react/        # ne contient à l'audit que `.git/` et `.gitattributes`
```

`workflow-admin-react/` ne présente pas de sources d'application dans son arborescence visible. Son origine et son utilité sont **à vérifier** ; ne pas le traiter comme le frontend actif sans inspection complémentaire.

### Point d'entrée et imports CSS

`src/index.js` appelle `createRoot(document.getElementById("root"))`, puis monte `<App/>` dans `<BrowserRouter>`. L'ordre des styles est : `base.css`, `component.css`, `layout.css`, `auth.css`, puis `app-overrides.css`. Cet ordre compte pour la cascade : une règle de `layout.css` chargée après `component.css` peut la remplacer à spécificité égale.

`public/index.html` est le shell CRA. Il définit le titre initial `Workflow Admin`, la description, la couleur de thème et une seule balise favicon PNG vers `%PUBLIC_URL%/icon.png`. `Layout.jsx` remplace le titre pour les pages protégées : `Workflow Admin`, `Workflow Chef` ou `Workflow Employé` suivant la session. La page `/login`, qui ne rend pas `Layout`, conserve le titre statique initial.

### Composants, données et styles

- Les composants réutilisables sont le layout global, la fabrique d'icônes et les graphiques SVG.
- `ChefSpace.jsx` regroupe plusieurs pages Chef, leurs helpers privés (`Avatar`, `useToast`, `getChefTeamId`) et leurs interactions.
- `EmployeeSpace.jsx` regroupe les pages Employé et leurs helpers privés de session et de filtrage.
- Les pages Administrateur sont surtout des composants par fichier.
- Il n'y a pas de répertoire `services/`, de couche API, de contexte global métier ni de hook métier séparé observé.
- Les composants lisent les tableaux exportés par `DB`; plusieurs mutations appellent `saveDb()` directement.

### Commandes racine

| Commande | Effet prévu par `package.json` |
|---|---|
| `npm start` | Lance `react-scripts start` (serveur de développement CRA). |
| `npm run build` | Génère une compilation de production dans `build/`. |
| `npm test` | Lance le runner Jest de CRA en mode interactif par défaut. Aucun fichier de test dédié n'a été trouvé lors de l'inventaire. |
| `npm run eject` | Éjecte la configuration CRA ; opération lourde et non réversible par un simple retour arrière. |

Aucune variable d'environnement applicative ou configuration backend n'a été repérée dans le code examiné. `.gitignore` exclut les fichiers `.env*`, mais leur présence éventuelle n'est pas confirmée.

## 3. Acteurs et permissions

### Admin / CEO

- **Objectif :** vue globale et administration des référentiels.
- **Session :** `role: "admin"` ; le rôle affiché dans l'interface est Directeur général (CEO) pour le compte de démonstration.
- **Pages :** dashboard, vue globale, statistiques, chefs, employés, projets, alertes et paramètres, toutes sous les chemins racine décrits à la section 4.
- **Actions présentes :** ajouter/modifier/supprimer un chef ou un employé ; filtrer et consulter les projets ; filtrer, marquer comme lu et archiver des alertes ; modifier le profil et les préférences ; réinitialiser les données locales.
- **Restrictions :** le garde vérifie uniquement la présence d'une entrée de session locale et le rôle. Les informations sont modifiables côté client ; aucune sécurité serveur ne s'applique.
- **Limites :** la page Projets Admin est consultative dans le code observé ; les comptes ajoutés par la page Employés ne reçoivent pas automatiquement de mot de passe ou d'identifiants acceptés par `Login.jsx`.

### Chef

- **Objectif :** suivre son équipe et effectuer certaines validations.
- **Session :** `role: "chef"`; `getChefTeamId()` cherche le chef par email dans `DB.chefs`, avec repli vers l'équipe `alpha` si aucune correspondance n'existe.
- **Pages :** dashboard, équipe, projets et détail, tâches, présences, congés, rapports, réunions, messages, notifications et paramètres.
- **Actions présentes :** éditer des membres de l'équipe ; créer des projets et des tâches ; changer le statut d'une tâche d'équipe ; consulter les présences ; valider/refuser des congés et rapports ; créer et modifier des réunions ; marquer des notifications comme lues.
- **Restrictions effectives :** l'équipe filtre l'équipe, les projets et les tâches dans les pages correspondantes. Les rapports sont filtrés par l'équipe de leur employé. La page de congés et les notifications/messages Chef ne sont pas toutes filtrées par équipe.
- **Limites :** l'identité de démonstration Chef est fixe dans `Login.jsx`; le Chef courant est résolu par email. Le filtrage React n'est pas une autorisation côté serveur.

### Employé

- **Objectif :** consulter ses relations de travail, modifier l'avancement de ses tâches, demander des congés, participer aux conversations.
- **Session :** `role: "employee"`; l'employé est résolu par email parmi `DB.employees`. Le login de démonstration vise Yasmine Kefi (`w1`).
- **Pages :** dashboard, projets/détail, tâches, calendrier, présences, congés, réunions, messages, notifications et paramètres personnels.
- **Actions présentes :** changer uniquement les tâches dont `assigneeId` correspond à son identifiant ; créer une demande de congé avec statut initial « En attente » ; envoyer un message dans une conversation à laquelle son nom appartient ; marquer comme lues ses notifications filtrées ; modifier son profil de paramètres et ses préférences d'affichage.
- **Restrictions effectives :** projets issus de `employee.project` et des projets de ses tâches ; réunions dont `participants` contient son nom ; congés par `employeeId`; présences par nom affiché ; conversations par présence de son nom dans `participants`.
- **Limites :** les données `attendance` ne portent pas `employeeId`; conversations et plusieurs notifications reposent sur des noms/chaînes plutôt que des IDs. Le contrôle est uniquement côté navigateur.

### Freelance et Stagiaire

- **Présence dans les données :** valeurs possibles de `employee.profile` (« Freelance », « Stagiaire ») et filtres de la page Admin Employés.
- **Rôle d'accès :** aucun rôle distinct `freelance` ou `stagiaire` dans `App.jsx`, `Layout.jsx` ou `Login.jsx`.
- **Pages/actions dédiées :** absentes. À ce stade, ces personnes ne peuvent être distinguées que comme profils employés dans les données. Un accès séparé pour ces catégories est **absent**.

### Autres acteurs

Les clients, projets et membres d'équipe sont des entités de données, pas des acteurs qui se connectent. Aucun accès Client, RH séparé ou service backend n'a été identifié.

## 4. Inventaire des pages et routes

Toutes les pages métier ci-dessous sont enveloppées dans `Protected`, sauf `/login`. `Protected` redirige une session absente vers `/login`; une session de mauvais rôle vers la page d'accueil correspondant au rôle reconnu. Le rôle inconnu est traité comme `admin` par `getSessionRole()`.

| Route exacte | Acteur | Composant/fichier | Fonction et actions visibles | Données principales | État / points à vérifier |
|---|---|---|---|---|---|
| `/login` | Public | `Login.jsx` | Choisir CEO/Chef/Employé, saisir les identifiants, afficher/masquer le mot de passe, validation de forme et vérification contre trois comptes codés en dur. | `workflow_admin_session`, `workflow_admin_settings`, `DB.employees` implicitement pour l'identité Employé. | Implémenté en démonstration ; pas d'API ni de vraie authentification. « Mot de passe oublié » est une alerte de démonstration. |
| `/dashboard` | Admin | `Dashboard.jsx` | KPI, aperçu repliable, graphiques, activité/alertes, tableau de risques. | Projets, chefs, employés, alertes, activities, stats. | Implémenté ; séries historiques/statistiques en grande partie mock. |
| `/vue-globale` | Admin | `Overview.jsx` | Agrégats projets/équipes/tâches et avancement moyen. | Projects, teams, employees, chefs, clients, compteurs `project.tasks`. | Implémenté ; compteurs de tâches dérivés des compteurs des projets, pas du tableau `DB.tasks`. |
| `/statistiques` | Admin | `Statistics.jsx` | KPI, courbes, barres, ponctualité et répartition projets/équipes. | `DB.stats`, `DB.projects`, `DB.teams`; helper `metrics()`. | Implémenté visuellement ; séries temporelles saisies en dur. |
| `/chefs` | Admin | `Chiefs.jsx` | Recherche, filtres Actif/Inactif, ajout, modification, suppression. | `DB.chefs`, teams/projects. | CRUD local implémenté ; les comptes créés ne sont pas automatiquement ajoutés aux identifiants fixes de Login. |
| `/employees` | Admin | `Employees.jsx` | Recherche, filtres statut/équipe/profil, ajout, modification, suppression. | `DB.employees`, teams/projects. | CRUD local implémenté ; champ de projet unique `employee.project`; aucune gestion de mot de passe. Charge affichée calculée artificiellement depuis le nom. |
| `/projets` | Admin | `Projects.jsx` | Recherche, filtres statut/équipe/risque et consultation d'un tableau. | `DB.projects`, clients, chefs, teams. | Consultation seulement ; aucun formulaire de création/édition Admin dans cette page. |
| `/alertes` | Admin | `Alerts.jsx` | Filtre niveau/type, recherche, marquage lu, archivage. | `DB.alerts`, projet référencé. | Implémenté en local; aucun moteur qui génère ces alertes à partir des actions n'a été trouvé. |
| `/parametres` | Admin | `Settings.jsx` | Profil, thème, densité, couleur, paramètres d'entreprise, reset local. | `workflow_admin_settings`, `localStorage`, CSS root. | Implémenté côté client ; reset appelle `localStorage.clear()` et touche aussi session et données. |
| `/chef` | Chef | `ChefDashboard` dans `ChefSpace.jsx` | KPI équipe, projets à surveiller, tâches urgentes, activité et liens rapides. | `DB.employees/projects/tasks/reports/leaveRequests/meetings/activities`. | Implémenté ; plusieurs KPI (rapports/congés/réunions) sont calculés globalement, pas nécessairement pour l'équipe. |
| `/chef/equipe` | Chef | `ChefTeam` | Recherche et filtres équipe/statut, édition/ajout d'un membre. | `DB.employees`, équipe résolue depuis session. | Implémenté localement ; pas de suppression depuis cette page. |
| `/chef/projets` | Chef | `ChefProjects` | Filtre nom/statut/risque; création projet; lien vers détail. | `DB.projects`, équipe. | Partiel : `DB.projects.unshift()` est appelé, mais `saveDb()` n'est pas appelé dans la création; la liste mémorisée n'a pas de version de rafraîchissement explicite. Persistance après actualisation à vérifier (a priori absente). |
| `/chef/projets/:id` | Chef | `ChefProjectDetail` | Détails, membres de l'équipe du projet et tâches du projet. | Projet par ID, employees team, tâches `projectId`. | Implémenté en lecture; aucune modification du projet sur cette page. Vérification d'appartenance à l'équipe absente dans le composant. |
| `/chef/taches` | Chef | `ChefTasks` | Kanban 5 statuts, filtre recherche/projet/priorité, création, changement statut. | `DB.tasks`, projects, employees, équipe Chef. | Implémenté localement. La sélection de statut mute la tâche et sauvegarde; aucune validation supplémentaire des transitions. |
| `/chef/presences` | Chef | `ChefAttendance` | KPI présent/absent/retard, recherche et tableau. | `DB.attendance`, filtre `teamId`. | Consultation uniquement; aucun pointage/édition ici. |
| `/chef/conges` | Chef | `ChefLeave` | Filtres Toutes/En attente/Validés/Refusés, calendrier mensuel navigable, tableau, Valider/Refuser avec motif. | `DB.leaveRequests`. | Implémenté. Calendrier initialisé sur octobre 2026; actions ciblent un ID. Liste et actions non filtrées sur l'équipe; aucun calcul métier de durée ouvrée n'est effectué ici. |
| `/chef/rapports` | Chef | `ChefReports` | Filtres, consultation des champs de rapport, validation/refus. | `DB.reports`, `DB.employees` pour filtrage d'équipe. | Consultation des champs `tasks/problems` implémentée; pas de fichier associé dans les données ni de dépôt/visualiseur PDF/Word. |
| `/chef/reunions` | Chef | `ChefMeetings` | Semaine dynamique lundi-dimanche, navigation, créneaux, création depuis bouton/cellule, édition, tableau trié. | `DB.meetings`, projets, employés, `saveDb()`. | Création/édition stable par ID implémentées. Le tableau affiche toutes les réunions, y compris passées, malgré le titre « à venir »; toute réunion avec `participants` est listée dans l'espace Employé concerné. |
| `/chef/messages` | Chef | `ChefMessages` | Conversation active, affichage des messages et envoi. | `DB.messages`. | Partiel : une seule conversation d'exemple; toutes les conversations sont affichées et le sender est codé « Amine Trabelsi ». |
| `/chef/notifications` | Chef | `ChefNotifications` | Liste des notifications, action marquer lue. | `DB.notifications`. | Partiel : boutons « Toutes/Non lues » affichés, mais le filtre ne modifie pas la liste. Notifications globales, non filtrées par équipe. |
| `/chef/parametres` | Chef | `Settings.jsx` via hook partagé | Profil et paramètres d'entreprise/affichage/reset. | `workflow_admin_settings`, localStorage. | Réutilisé, mais comprend des réglages globaux et le reset local, pas seulement des préférences Chef. |
| `/employee` | Employé | `EmployeeDashboard` dans `EmployeeSpace.jsx` | Bienvenue, KPI calculés, échéances, réunions, présence/congés, notifications. | tâches/projets/meetings/attendance/leaveRequests/notifications filtrés par employé. | Implémenté à partir des relations mock; notifications filtrées en partie par correspondance de texte. |
| `/employee/projets` | Employé | `EmployeeProjects` | Projets accessibles via `employee.project` et tâches affectées; progression, échéance, responsable. | Employees, tasks, projects, chefs. | Implémenté; relation projet/membre limitée à un seul `employee.project` plus les `projectId` de tâches. |
| `/employee/projets/:id` | Employé | `EmployeeProjectDetail` | Détail d'un projet associé et tâches de l'employé dans ce projet. | Projet autorisé via le helper de projets Employé, tâches par `assigneeId/projectId`. | Implémenté; page affiche « Projet indisponible » si l'association n'existe pas. |
| `/employee/taches` | Employé | `EmployeeTasks` | Filtres statut, priorité, projet, échéance; mise à jour du statut. | `DB.tasks`, par `assigneeId`. | Implémenté; seuls les statuts À faire/En cours/En révision/Terminée sont modifiables. « En retard » est dérivé de la date ou du statut et n'est pas choisi directement. |
| `/employee/calendrier` | Employé | `EmployeeCalendar` | Semaine lundi-dimanche navigable, tâches échéance, réunions invitées, congés sur leur intervalle. | tasks, meetings, leaveRequests par employé. | Implémenté; l'affichage se limite à la semaine visible et aux trois types ci-dessus. |
| `/employee/presences` | Employé | `EmployeeAttendance` | Totaux présence/retard/absence et historique. | `DB.attendance` filtré par égalité exacte de `employeeName`. | Consultation uniquement; pas de pointage. Relation fragile car pas d'ID employé dans l'entité. |
| `/employee/conges` | Employé | `EmployeeLeave` | Liste de ses demandes, formulaire type/dates/motif. | `DB.leaveRequests` filtré par `employeeId`; `saveDb()`. | Demande locale et statut initial « En attente » implémentés; la décision reste dans l'espace Chef. Pas de calcul de durée ni de décompte ouvré. |
| `/employee/reunions` | Employé | `EmployeeMeetings` | Tableau des réunions où son nom apparaît dans `participants`. | `DB.meetings`. | Consultation filtrée implémentée; aucune création/modification côté Employé. |
| `/employee/messages` | Employé | `EmployeeMessages` | Conversations dont `participants` contient le nom, distinction visuelle des auteurs, envoi. | `DB.messages`, `saveDb()`. | Partiel; envoi persistant localement dans la conversation existante; aucun routage vers un destinataire individuel ou nouvelle conversation. |
| `/employee/notifications` | Employé | `EmployeeNotifications` | Liste filtrée et marquage lu. | `DB.notifications`, relations directes éventuelles ou correspondances texte. | Partiel; le schéma mock ne porte pas de recipientId systématique. |
| `/employee/parametres` | Employé | `EmployeeSettings` | Profil employé et préférences d'affichage. | `workflow_admin_settings`, `useAppSettings()`. | Partiel; le profil de paramètres est distinct de `DB.employees`; une modification du nom ne met pas à jour le référentiel Employés. |
| `/` | Selon session | `Navigate` dans `App.jsx` | Redirige vers `/dashboard`, `/chef` ou `/employee`. | `workflow_admin_session`. | Implémenté. |
| `*` | Selon session | `Navigate` dans `App.jsx` | Toute route inconnue redirige vers l'accueil du rôle reconnu. | `workflow_admin_session`. | Implémenté ; pas de page 404 dédiée. |

## 5. Fonctionnalités détaillées

### Dashboard et statistiques

- **Admin — `Dashboard.jsx` :** totaux de projets en cours/terminés/en retard; nombre de chefs et employés actifs; panneau d'aperçu repliable; graphiques, activité, alertes et risques. Les volumes agrégés des cartes viennent de `DB.projects`; sparklines et séries viennent de `DB.stats`, des tableaux mock.
- **Vue globale — `Overview.jsx` :** additionne les compteurs `projects[].tasks` (`done`, `doing`, `todo`, `late`) et calcule une moyenne arithmétique du `progress` par équipe. Ces compteurs ne sont pas calculés à partir de `DB.tasks`.
- **Statistiques — `Statistics.jsx` :** ponctualité, productivité, santé globale, répartitions et graphiques. `metrics()` calcule le taux à partir du nombre total de projets et de ceux en retard, lit la dernière productivité de `DB.stats`, puis fait la moyenne ponctualité/productivité pour la santé. Les séries mensuelles sont statiques.
- **Chef — `ChefDashboard` :** éléments de l'équipe pour membres/projets/tâches; rapports en attente, congés en attente et réunions futures sont calculés depuis des listes globales, sans filtre cohérent équipe.
- **Employé — `EmployeeDashboard` :** KPI tâches et projets basés sur les relations à l'employé; urgence = priorité `Urgent` ou tâche en retard selon statut/date; échéances triées par date et réunions futures. La présence du jour et les congés en attente sont calculés depuis les tables existantes.

### Comptes, profils et équipes

`Employees.jsx` filtre par texte, équipe, profil et statut. Il propose création/modification et suppression avec confirmation; les champs enregistrés sont nom, email, téléphone, team, profile, project, status et `since`. La charge affichée est une formule artificielle liée à la longueur du nom, pas une métrique métier.

`Chiefs.jsx` filtre par texte/statut et permet CRUD de chefs : nom, email, téléphone, équipe, statut, `since`. Le nombre de projets est calculé par `project.chef`. L'ajout d'un chef n'étend pas la liste des comptes et mots de passe acceptés par `Login.jsx`.

`ChefTeam` ne permet que l'ajout/édition des employés de l'équipe dérivée de l'email Chef; il n'offre pas de suppression sur cette page.

### Projets

- Admin : tableau consultatif avec filtres status/team/risk et recherche par nom/client.
- Chef : création d'un projet avec client/chef codés (`cl1`, `c1`), équipe courante, progression, dates, statut, risque et compteurs de tâches initiaux. La création n'appelle pas `saveDb()` et le `useMemo` de la liste ne dépend pas d'une version; persistance et rafraîchissement après création sont donc incomplets.
- Chef détail : affiche le projet, les membres de son équipe et toutes les tâches ayant le même `projectId`.
- Employé : liste les projets dont l'ID est le projet principal du profil ou apparaît dans ses tâches; détail affiche uniquement les tâches dont il est responsable.

### Tâches et affectations

`DB.tasks` porte `assigneeId`, `assigneeName`, `teamId`, `projectId`, `projectName`, `owner`, `status`, `priority`, `dueDate`.

- Chef filtre les tâches de son équipe, crée une tâche en choisissant projet et employé, puis peut modifier le statut parmi cinq colonnes Kanban. La modification mue l'objet en mémoire et appelle `saveDb()`.
- Employé filtre strictement `assigneeId`, peut modifier uniquement sa tâche, et n'a pas de contrôle d'assignation. La sélection accepte `À faire`, `En cours`, `En révision`, `Terminée`. Le badge « En retard » peut être dérivé de l'échéance passée sans que le champ `status` soit réécrit.
- Admin ne possède pas de page tâche distincte dans les routes observées.
- Aucun workflow de demande de réassignation ou de validation des transitions n'a été trouvé.

### Rapports

Les rapports mock contiennent les tâches/points de vigilance sous forme de chaînes; il n'existe ni formulaire de soumission Employé ni document attaché. `ChefReports` filtre l'équipe via `report.employeeId → DB.employees.team`, consulte les tableaux `tasks/problems` dans une modale, puis peut valider/refuser. Refus ouvre `window.prompt()` pour saisir un motif; statut et motif sont sauvegardés. L'affichage annonce explicitement qu'aucun PDF/Word n'est joint. Aucun upload, stockage privé, route de téléchargement ou autorisation serveur n'existe.

### Présences et retards

`DB.attendance` a `employeeName`, `teamId`, `date`, `time`, `status`, mais pas d'ID employé. Chef consulte son `teamId`; Employé compare son nom exact. Les états observés sont `Présent`, `Retard`, `Absent`. Aucune saisie ou génération de pointage n'est présente. Une entrée d'absence utilise actuellement `time: "Absent"`, ce qui mélange l'heure et le statut dans un exemple.

### Congés

Employé crée un objet avec ID local, `employeeId`, nom, type, dates, motif et `status: "En attente"`; `saveDb()` persiste la demande. Le Chef consulte et décide via Valider/Refuser; un refus demande un motif et le concatène à `reason`. La page Chef comprend filtres et calendrier mensuel, mais son mois initial est codé octobre 2026. Aucun calcul de durée/jours ouvrables n'est exécuté par ces pages; `duration` existe seulement sur les exemples initiaux.

### Calendriers et réunions

Le calendrier des congés affiche des intervalles de demandes. Le calendrier Chef des réunions est une semaine courante lundi-dimanche, avec navigation, colonnes pour les sept jours, créneaux générés à partir de 08 h à 18 h et étendus jusqu'aux heures de réunion du calendrier visible. Une cellule vide ouvre le formulaire prérempli; le bouton principal préremplit la date du jour. Une réunion existante ouvre le même formulaire en mode édition, conserve son ID et peut être déplacée. La liste du tableau est triée date/heure/ID mais contient aussi les réunions passées.

L'espace Employé affiche les réunions de `participants.includes(employee.name)`, triées par date/heure. Son calendrier combine échéances des tâches, réunions invitées et demandes de congé qui couvrent la date.

### Messages

Une conversation mock « Équipe Alpha » contient un titre, preview, unread, participants et une liste de messages (`sender`, `me`, `text`, `time`). Chef voit actuellement toutes les conversations et envoie sous le nom fixe Amine avec `me:true`. Employé ne voit que les conversations contenant son nom dans `participants`; les messages envoyés sont ajoutés avec son nom et `me:false` pour apparaître comme entrants dans l'interface Chef. L'envoi persiste dans `DB.messages`; pas de nouvelle conversation ni de sélection de destinataire.

### Notifications et alertes

- Admin utilise `DB.alerts`, avec `level`, `type`, `read`, `archived`, projet et âge relatif; il peut filtrer/rechercher, tout marquer lu et archiver.
- Chef utilise `DB.notifications`; sa page peut marquer un élément comme lu, mais ses boutons « Toutes/Non lues » ne filtrent pas réellement.
- Employé reçoit les éléments portant un `employeeId` éventuel ou dont texte titre/message contient son nom, les titres de ses tâches/projets/réunions. Cette relation par sous-chaîne est heuristique, pas une affectation robuste par ID.
- Aucune fonction génératrice reliée aux événements métier n'a été trouvée : les notifications présentes sont des exemples statiques.

### Recherche, filtres, modales et actions

Le champ global dans `Layout.jsx` indexe chefs/employés/projets pour Admin, et projets/tâches/réunions attribués pour Employé. Le code Chef recherche seulement les employés/projets d'équipe `alpha` dans l'index, même si le helper Chef sait résoudre d'autres équipes. Plusieurs filtres sont purement locaux au composant.

Les formulaires utilisent `FormData`, contrôles HTML natifs, éléments stylés par `.input`, `.select`, `.textarea` et modales `.modal-backdrop/.modal-box`. Les messages toast du Chef sont temporaires en mémoire. Certaines actions portent un `onClick`, d'autres sont des liens vers les formulaires/pages ; aucun flux externe n'est appelé.

### Favicon et titres

`public/index.html` référence `icon.png` par `%PUBLIC_URL%/icon.png`. `Layout.jsx` définit `document.title` en fonction de la session pour les pages Admin/Chef/Employé. Le titre initial du HTML reste Workflow Admin sur `/login`.

## 6. Relations et workflows entre acteurs

### Projet et équipe

1. Admin peut créer/modifier des profils Chef et Employé, et affecter équipe/projet principal au membre.
2. Admin consulte les projets; dans le code courant il ne les crée pas par cette page.
3. Le Chef voit les projets de l'équipe résolue depuis sa session et peut soumettre le formulaire de création local.
4. Le projet référence `team`, `chef` et `client`; le détail Chef liste les tâches portant son ID.
5. L'Employé voit son projet principal et les projets présents dans ses tâches.

**Lien incomplet :** le projet créé par Chef est lié par défaut à `c1` et `cl1`, et sa sauvegarde persistante n'est pas appelée. Le modèle `employee.project` ne supporte qu'un projet direct ; les autres associations passent indirectement par les tâches.

### Attribution et avancement d'une tâche

1. Le Chef choisit projet, employé, priorité, statut et échéance dans `/chef/taches`.
2. La tâche reçoit `assigneeId`, `assigneeName`, `teamId`, `projectId` et `projectName`; elle est insérée en tête de `DB.tasks`, puis `saveDb()`.
3. L'Employé connecté voit les tâches dont `assigneeId` égale son ID.
4. Il peut changer le statut dans `/employee/taches`; l'implémentation re-vérifie l'ID assigné avant la mutation et sauvegarde.
5. Le Kanban Chef lit le même tableau `DB.tasks`.

**Lien présent en données locales**, sans contrôle serveur. Aucun système d'attribution libre par Employé n'est présent.

### Rapport et validation

1. Les rapports de référence sont préchargés avec `employeeId`, dates, tableau de travaux, problèmes et statut.
2. Aucun envoi de rapport par l'Employé n'est implémenté; `/employee/rapports` n'existe pas.
3. Le Chef consulte le rapport à partir de son ID et de l'équipe de l'employé.
4. Il valide ou refuse; le refus demande un texte et le statut/motif sont sauvegardés.

**Document attaché : absent.** Aucune association fichier, upload, route privée ou viewer PDF/Word n'est présent.

### Demande de congé

1. L'Employé soumet dates, type et motif; la demande est insérée avec son ID et « En attente ».
2. Le Chef voit la demande dans le tableau/calendrier local.
3. Valider modifie le statut en « Validé »; Refuser demande un motif et passe à « Refusé ».
4. Les mêmes `DB.leaveRequests` servent à l'espace Employé et Chef après chargement/persistance.

Aucun calendrier RH/contrainte de chevauchement ni décompte de jours ouvrés n'est codé.

### Réunion

1. Le Chef crée depuis le bouton ou une cellule et choisit date/heure, durée, projet, lieu, participants et description.
2. La réunion a un ID et est persistée dans `DB.meetings`.
3. Le Chef peut la modifier depuis son événement de grille; les données de la même ligne/ID sont remplacées.
4. L'Employé ne voit que les réunions dont son nom figure dans `participants`.

Aucune réponse d'invitation, notification automatique ou calendrier externe n'est implémenté.

### Présence

Les lignes de présence sont uniquement consultées. Aucune action d'enregistrement entrée/sortie n'est disponible; le lien Employé/Chef repose sur `employeeName` ou `teamId`.

### Notifications et messages

- Les notifications mock ne sont pas générées par les workflows ci-dessus. Un élément peut être marqué lu par les pages concernées.
- L'envoi de message ajoute une entrée à une conversation existante; aucune création de conversation, sélection de Chef destinataire ou service de livraison n'est présent.
- Les données de conversation sont communes à la démonstration, avec filtrage employé limité au nom dans `participants`.

### Freelance et Stagiaire

Aucun parcours spécifique. Ces valeurs de profil n'entraînent ni route ni permission propre. Il est **impossible de confirmer** une politique métier pour ces profils à partir du code.

## 7. Modèle de données

Les collections sont définies comme constantes dans `src/data/mockData.js`; `DB` est l'objet retourné par `loadDb()`. Les champs décrits ci-dessous sont ceux effectivement utilisés/présents, sans schéma de validation formel.

| Entité | Champs présents observés | Identifiants / relations | États ou remarques |
|---|---|---|---|
| Équipe | `id`, `name`, `color` | IDs `alpha`, `atlas`, `nova`, `orion`, `vega`; relation par `team` | 5 équipes. |
| Client | `id`, `name`, `sector`, `city` | `projects[].client` | 10 clients; aucune page CRUD client. |
| Chef | `id`, `name`, `email`, `team`, `status`, `since`, `phone` | ID `c1...`; `projects[].chef` | `Actif`, `Inactif`; login ne vérifie pas les comptes CRUD. |
| Employé | `id`, `name`, `email`, `team`, `profile`, `project`, `status`, `phone`, `since` | `employee.project` est un ID projet; tâches via `assigneeId` | Profil: Salarié/Freelance/Stagiaire; statut Actif/Inactif. |
| Projet | `id`, `name`, `client`, `chef`, `team`, `progress`, `start`, `end`, `status`, `risk`, `tasks` | `tasks` est un objet compteurs `done/doing/todo/late`, différent de `DB.tasks` | Statuts `En cours`, `Terminé`, `En retard`; risk `faible`, `moyen`, `élevé`. |
| Alerte | `id`, `level`, `type`, `title`, `desc`, `ago`, `project`, `read`, `archived` | Projet éventuel | niveaux `urgent`, `warning`, `info`; types `demande`, `retard`, `projet`, `systeme`. |
| Activité | `icon`, `tone`, `text`, `meta`, `ago` | Pas d'ID métier explicite | Flux statique fourni par mock. |
| Tâche | `id`, `title`, `projectId`, `projectName`, `assigneeId`, `assigneeName`, `teamId`, `status`, `priority`, `dueDate`, `owner` | Project et Employee IDs; owner est une chaîne Chef | Statuts vus: `À faire`, `En cours`, `En révision`, `Terminée`, `En retard`; priorités `Urgent`, `Haute`, `Moyenne`, `Faible`. |
| Congé | `id`, `employeeId`, `employeeName`, `type`, `start`, `end`, `duration`, `reason`, `status` | `employeeId` identifie le membre | `En attente`, `Validé`, `Refusé`; duration présente sur échantillons mais pas calculée à la création. |
| Rapport | `id`, `employeeId`, `employeeName`, `projectId`, `projectName`, `date`, `tasks[]`, `problems[]`, `status`, éventuellement `reason` après refus | Employé et projet par ID | `À valider`, `Validé`, `Refusé`; aucun champ fichier. |
| Présence | `id`, `employeeName`, `teamId`, `date`, `time`, `status` | Nom + équipe, pas d'`employeeId` | `Présent`, `Absent`, `Retard`; exemple `time:"Absent"` pour une ligne absente. |
| Réunion | `id`, `title`, `date`, `time`, `duration`, `participants[]`, `projectId`, `description`; `location` ajouté par création | `projectId`; participants sont des noms, pas des IDs | Exemples initiaux sans `location`; formulaire fournit une valeur par défaut. |
| Conversation | `id`, `title`, `preview`, `unread`, `participants[]`, `messages[]` | Participants par noms | Aucun recipient ID ou relation de conversation externe. |
| Message | `id`, `sender`, `me`, `text`, `time` | `me` sert à la présentation locale | Pas d'horodatage/date ou livraison serveur. |
| Notification | `id`, `type`, `level`, `title`, `message`, `date`, `read` | `employeeId` peut être ajouté mais n'est pas présent sur les exemples; correspondances texte en Employé | `level` `warning/info/urgent`; aucune génération automatique trouvée. |
| Séries statistiques | `months`, `total`, `done`, `active`, `late`, `productivity` | Données tableau indépendantes des autres collections | 12 points statiques; mois libellés en abrégé. |
| Paramètres | `theme`, `accent`, `density`, `profile`, `app` | Stocké sous clé séparée | `app` comprend company/timezone/lateThreshold dans l'initialisation. |

### Volumes du jeu initial visible dans `mockData.js`

5 équipes, 10 clients, 8 chefs, 20 employés, 14 projets, 11 alertes, 6 activités, 5 tâches, 4 demandes de congé, 4 rapports, 5 présences, 3 réunions, 1 conversation contenant 3 messages, 4 notifications et 12 valeurs par série statistique. Des créations locales peuvent changer ces volumes.

## 8. Persistance et logique métier

### Clés `localStorage`

| Clé | Contenu / auteur |
|---|---|
| `workflow_admin_session` | Objet de connexion `{email, role}` écrit par `Login.jsx`; retiré à la déconnexion. |
| `workflow_admin_settings` | Préférences, profil et configuration d'application écrits par `useAppSettings()` et Login. |
| `workflow_admin_db_v1` | Sérialisation métier écrite par `saveDb()` dans `mockData.js`. |

`loadDb()` parse la clé DB au chargement du module puis prend les tableaux sauvegardés s'ils existent, sinon utilise les tableaux par défaut. `saveDb()` écrit `chefs`, `employees`, `alertState` (uniquement `read/archived` des alertes), `tasks`, `leaveRequests`, `reports`, `attendance`, `meetings`, `messages`, `notifications`. `teams`, `clients`, `projects`, `activities`, `stats` restent définis dans le code et ne sont pas sérialisés par cette fonction.

Le mécanisme est local au navigateur : il persiste après actualisation sur le même profil navigateur, mais ne synchronise pas entre utilisateurs/appareils. L'initialisation `JSON.parse()` n'est pas protégée contre un JSON corrompu dans `loadDb()`/`useAppSettings()`; aucun traitement d'erreur global de stockage n'a été trouvé.

### Session et permissions

`Login.jsx` définit trois comptes de démonstration en dur (Admin, Chef, Yasmine Employé) et compare email/mot de passe côté client. Les mots de passe de démo sont affichés sur la page. La route `Protected` teste l'existence du JSON de session et le rôle; les pages et filtres complètent certaines restrictions, mais toute cette logique est modifiable via le navigateur. Il n'y a ni serveur d'authentification, hash de mot de passe, expiration/renouvellement de session, ni contrôle d'accès distant.

`Settings.reset()` appelle `localStorage.clear()`, ce qui efface les données, paramètres et session de démonstration, puis recharge la page.

### Validations et calculs

- `Login.jsx` valide le format email et une longueur de mot de passe minimale de six caractères puis compare à un compte fixe.
- Les formulaires de projets/tâches/membres/congés utilisent surtout `required` et quelques `min/max`; les règles métier globales ne sont pas centralisées.
- `EmployeeLeave` vérifie que les deux dates existent et que `end >= start`; aucun calcul de durée ouvrée.
- `ChefMeetings` trie par date/heure/ID et conserve l'ID en édition.
- `metrics()` calcule le ponctualité sur le ratio des projets non en retard, utilise la dernière productivité statique et leur moyenne.
- `delayDays()` utilise une date de référence codée en dur (`2026-09-18`), donc le calcul ne suit pas l'horloge courante.
- Recherche Employé des notifications utilise des sous-chaînes de titre/message; risque de faux positif et couverture incertaine.

## 9. Interface et CSS

### Identité visuelle

Les tokens principaux sont dans `base.css` : fonds/surfaces, texte, accent par défaut `#7c5cff`, couleurs sémantiques, rayons 8/12/18/26 px, ombres et variables de densité. Le thème par défaut est sombre; `[data-theme="light"]` propose aussi des surfaces claires. Les paramètres peuvent changer thème, accent et densité. Les piles de polices indiquent Onest et Bricolage Grotesque en tête avec des fallbacks système; aucune déclaration de chargement de fichiers de polices n'a été identifiée.

`Layout.jsx` porte sidebar responsive, topbar, recherche globale, notifications, menu profil et titres. `component.css` contient boutons, cartes, badges, formulaires, tableaux, modales, toasts, graphiques et styles d'espaces Chef/Employé. `layout.css` définit sidebar, contenu, grilles et breakpoints. `auth.css` concerne la page Login; `app-overrides.css` ajuste le dashboard, graphiques, modales et alertes.

### Responsive et points visuels connus

Breakpoints structurants de `layout.css` : 1240 px (grilles deux-tiers), 1024 px (sidebar drawer), 760 px (colonnes/cards et tables compactes), 480 px (padding et KPI). `component.css` ajoute notamment 760/520 px. Les tableaux `.responsive` cachent l'entête et réaffichent `data-label` sur petites largeurs.

Les styles de calendrier sont partagés entre Chef congés, Chef réunions et Employé; toute modification doit cibler une classe spécifique comme `employee-calendar-*` pour ne pas altérer les autres calendriers. Le calendrier Employé fixe une largeur minimale de 700 px et utilise le défilement horizontal interne en fenêtre étroite.

Problèmes repérés en source : `auth-foot` de Login affiche pour le rôle Employé « Administrateur »; `Settings` et `EmployeeSettings` ont des instances locales distinctes du hook settings; certains affichages et styles historiques utilisent des variables de texte anciennes comme `--text-main`/`--text-muted`, non définies dans `base.css` (leur résultat dépend du fallback CSS).

## 10. État d'avancement, anomalies et tests

### Opérationnel selon les chemins de code

- Routage SPA par rôles Admin/Chef/Employé avec page d'accueil et garde de rôle côté client.
- CRUD local des chefs et employés; filtres et affichage projets.
- Pages et tableaux Chef/Employé décrits dans les sections précédentes.
- Persistance locale de plusieurs mutations via `saveDb()`.
- Calendrier Chef des réunions avec création/édition; calendrier Employé hebdomadaire et calendrier Chef des congés mensuel.
- Consultations, actions de statut et préférences d'affichage locales.

### Partiel, incohérent ou absent

1. **Aucune API/backend/base de données** : données mock embarquées; les contrôles de rôle ne sont pas une sécurité réelle.
2. **Freelance/Stagiaire** : seulement profils d'employés; pas de rôle/login/navigation dédiée.
3. **Comptes** : Login n'accepte que trois identités fixes; création Admin de nouveaux employés/chefs ne crée pas de compte.
4. **ChefProjects** : création ne sauvegarde pas via `saveDb()` et ne force pas le recalcul du `useMemo`; vérifier rafraîchissement/réouverture.
5. **Statistiques** : séries et activités sont préfabriquées; certaines métriques de projet sont dérivées de compteurs statiques.
6. **Rapports** : aucun dépôt ou document attaché; les « comptes rendus » sont données structurées. Pas d'envoi Employé.
7. **Présences** : lecture seulement, liaison par nom; aucun pointage ou règle retard.
8. **Notifications** : collections distinctes Admin/notifications; aucune génération métier automatique; relation Employé parfois par texte.
9. **Congés** : durée de données mock non recalculée; pas de règle d'entreprise d'ouvrés, de chevauchement ou de solde.
10. **Chef réunions** : table appelée « à venir » mais contient toute la collection; projet Chef de création est codé sur IDs par défaut; comportement en présence de données incohérentes à tester.
11. **Chef messages** : conversations non filtrées par équipe et auteur Chef fixe.
12. **Routes par rôle** : garde frontend seulement; aucune page 404; les routes `/admin/...` n'existent pas (Admin utilise des routes racine).
13. **Titre `/login`** : reste celui du HTML `Workflow Admin`, car cette page n'est pas dans `Layout`.
14. **Manifestes divergents** : `src/package.json` et `package.react-example.json` annoncent d'autres versions; intention à vérifier.
15. **Tests automatiques** : script CRA `npm test` disponible mais aucun fichier `*.test.*`/`*.spec.*` trouvé dans l'arborescence examinée. Les scénarios unitaires et d'intégration restent à écrire.

### Niveau de vérification de cet audit

- Inspection statique : effectuée sur les routes, pages, modèle mock, styles, shell HTML, scripts et manifeste.
- `npm ls --depth=0` : exécuté; versions observées listées en section 1.
- Tests automatisés : non exécutés pour cette documentation; aucun fichier de test dédié repéré.
- Parcours complet de toutes les routes pendant cette étape : non exécuté. Ne pas interpréter l'inventaire statique comme une certification visuelle exhaustive.
- Fonctionnement d'un backend/API externe : sans objet dans les sources présentes; aucune connexion détectée.

## 11. Fichiers importants pour les futures modifications

| Sujet | Fichiers à lire/modifier ensemble | Dépendances / risques |
|---|---|---|
| Ajouter une route ou protéger une page | `src/App.jsx`, `src/components/Layout.jsx` | Route, rôle `Protected`, destination de redirection, navigation et liens. |
| Login/session/rôle | `src/pages/Login.jsx`, `src/App.jsx`, `src/components/Layout.jsx`, `src/data/mockData.js` | Emails de session doivent correspondre aux entités; toutes les permissions restent client-side. |
| Sidebar/topbar/recherche | `src/components/Layout.jsx`, `src/styles/layout.css`, `src/styles/component.css` | Layout partagé aux trois espaces; éviter d'impacter les autres rôles. |
| Données et persistance | `src/data/mockData.js`, page qui mute, éventuellement `src/components/Layout.jsx` | Ajouter champs aux données initiales, charger/sauvegarder dans `saveDb()`, rafraîchir état React après mutation. |
| Page Admin employés/chefs | `src/pages/Employees.jsx`, `src/pages/Chiefs.jsx`, `mockData.js` | Pas d'authentification automatique associée aux comptes CRUD. |
| Dashboard/graphes | `Dashboard.jsx`, `Overview.jsx`, `Statistics.jsx`, `Charts.jsx`, `mockData.js`, CSS | Distinguer séries statiques des agrégats calculés; charts partagés. |
| Espace Chef | `src/pages/ChefSpace.jsx`, `Layout.jsx`, `mockData.js`, `component.css` | Un fichier regroupe de nombreuses pages; calendrier/modales/classes peuvent être partagés. |
| Espace Employé | `src/pages/EmployeeSpace.jsx`, `Layout.jsx`, `App.jsx`, `mockData.js`, `component.css` | Helpers de filtrage par ID/email; CSS `employee-*` pour ne pas toucher Chef. |
| Rapports/document | `ChefSpace.jsx`, `mockData.js`, `component.css`, puis infrastructure serveur absente | Aucun fichier n'est stocké; une vraie prise en charge requiert un backend et stockage privé avant le frontend. |
| Paramètres | `Settings.jsx`, `EmployeeSpace.jsx` (EmployeeSettings), `Layout.jsx`, `base.css` | `useAppSettings` est le hook partagé; `workflow_admin_settings` mélange profil et préférences. |
| CSS global | `base.css`, `component.css`, `layout.css`, `auth.css`, `app-overrides.css`, `index.js` | Ordre d'import : règles de layout peuvent écraser les règles composant à spécificité égale. |
| Shell/favicon/titre | `public/index.html`, `Layout.jsx`, `App.jsx` | Titre initial pour login; titre dynamique uniquement quand `Layout` est monté. |
| Build/dépendances | `package.json`, `package-lock.json`, `src/index.js` | Utiliser le manifeste racine; `src/package.json` est divergent. |

## 12. Guide pour les prochaines interventions avec Copilot

1. Commencer par les routes réelles dans `App.jsx`; ne pas supposer de préfixe `/admin`.
2. Suivre une mutation de bout en bout : formulaire → objet dans `DB` → `saveDb()` → rafraîchissement React → lecture dans les autres espaces.
3. Vérifier les identifiants stables et la relation exacte (ID préférable au nom); relever les cas où la source actuelle ne fournit qu'un nom.
4. Modifier le minimum de pages et préférer des classes CSS de rôle (`employee-*`, ou classe spécifique Chef) lorsque la feuille est partagée.
5. Ne pas généraliser les helpers ou statuts d'une page vers un autre acteur sans vérifier ses données et permissions.
6. Préserver les champs, états, routes et actions existants; noter explicitement toute fonction qui est seulement une maquette.
7. Ne pas présenter `localStorage` comme authentification, autorisation serveur, base distante ou partage multi-utilisateur.
8. Ne pas simuler des fichiers, rapports, activités, réunions ou notifications absents des données; indiquer le besoin d'infrastructure si nécessaire.
9. Après modification, utiliser `npm run build`; ajouter tests ciblés lorsqu'une infrastructure de tests existe. Le projet ne contient actuellement aucun test dédié repéré.
10. Vérifier les changements de comportement dans les espaces concernés, puis au moins une route Admin et Chef si le layout, CSS partagé, `DB` ou `saveDb()` ont été touchés.
11. Dans le compte rendu, lister précisément fichiers modifiés, validations réellement exécutées et points restant à vérifier.

## 13. Glossaire et résumé de référence

### Glossaire

| Terme | Sens dans le code |
|---|---|
| Admin / CEO | Session dont le rôle n'est ni `chef` ni `employee`; accès aux routes racine `/dashboard`, `/employees`, etc. |
| Chef | Session `role: "chef"`; équipe résolue depuis `DB.chefs` par email, repli `alpha`. |
| Employé | Session `role: "employee"`; membre de `DB.employees` résolu par email. |
| Freelance / Stagiaire | Valeurs de `employee.profile`, pas des rôles applicatifs. |
| `DB` | Objet mutable chargé depuis les mocks et certains tableaux `localStorage`. |
| `saveDb()` | Sérialisation locale des principales collections métier dans `workflow_admin_db_v1`. |
| `employee.project` | Projet principal unique stocké sur le profil; les autres projets visibles viennent de ses tâches. |
| `teamId` | Clé d'équipe, par exemple `alpha`; relation sur employés, chefs, projets et présences. |
| En retard | Statut de tâche/projet ou badge de tâche dérivé d'une échéance; calculs non uniformes. |
| À valider / En attente | États initiaux de rapports/congés, traités par les actions Chef. |
| `workflow_admin_settings` | Profil/préférences/application locale, distincte de `workflow_admin_db_v1`. |
| Compte rendu | Dans les données actuelles, tableaux `tasks` et `problems`; aucun document PDF/Word attaché. |

### Résumé à transmettre à ChatGPT

Cadran/Workflow est un frontend CRA React 18 avec React Router 6 et Lucide. Les espaces réellement routés sont Admin/CEO (`/dashboard`, chemins racine), Chef (`/chef/...`) et Employé (`/employee/...`); Freelance et Stagiaire ne sont que des profils. `App.jsx` fait le garde client à partir de `workflow_admin_session`; Login contient trois comptes de démo codés en dur. `Layout.jsx` fournit navigation/recherche/profil/titres et `useAppSettings` persiste les réglages dans `workflow_admin_settings`. `mockData.js` définit les entités et `saveDb()` écrit surtout dans `workflow_admin_db_v1`; aucune API/backend n'existe dans les sources. Le Chef crée des tâches, change leur statut, décide congés/rapports et crée/modifie réunions; l'Employé voit ses relations par ID ou parfois nom, change ses tâches, demande congés, lit réunions, envoie dans une conversation existante et marque ses notifications. Les rapports n'ont pas de fichiers; les présences sont en lecture seule; les notifications et statistiques restent mock/heuristiques. Les styles sont partagés; respecter l'ordre d'import CSS et scoper les corrections par rôle. Les scripts racine sont `npm start`, `npm run build`, `npm test`, `npm run eject`; aucun test dédié n'a été trouvé. Pour toute fonctionnalité serveur, documenter d'abord le backend requis au lieu de prétendre que le stockage local fournit sécurité ou synchronisation.

## Parties non confirmées / à examiner ultérieurement

- Aucun backend ou service externe n'est présent dans les fichiers source visibles; il reste possible qu'un service hors dépôt soit utilisé manuellement, mais rien ne l'indique ici.
- La raison d'être de `workflow-admin-react/` et des deux manifestes secondaires divergents est **à vérifier**.
- Aucun jeu de tests n'a été découvert; les cas navigateur complets des espaces et des transitions métier ne sont donc pas certifiés par une suite automatisée.
- Les règles métier de jours de congé, présence/retard, distribution des notifications, rôles Freelance/Stagiaire, reporting Employé et affectations multi-projets ne sont pas définies dans le code observé.
- Les performances, la persistance en cas de stockage bloqué/corrompu et les comportements multi-onglets ne sont pas vérifiés.
