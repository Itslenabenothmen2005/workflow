# Workflow Admin -> React

## Installation

Dans le terminal VS Code, à la racine de `workflow_admin` :

```powershell
npm install react-router-dom lucide-react
```

Puis remplacer/ajouter les fichiers `src/` de ce dossier.

Si ton projet CRA possède déjà `package.json`, ne remplace pas tout le fichier : installe seulement les deux dépendances ci-dessus.

## Structure

```text
src/
├── components/
│   ├── Charts.jsx
│   ├── Icon.jsx
│   └── Layout.jsx
├── data/
│   └── mockData.js
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Overview.jsx
│   ├── Statistics.jsx
│   ├── Chiefs.jsx
│   ├── Employees.jsx
│   ├── Projects.jsx
│   ├── Alerts.jsx
│   └── Settings.jsx
├── styles/
│   ├── base.css
│   ├── component.css
│   ├── layout.css
│   ├── auth.css
│   └── app-overrides.css
├── utils.js
├── App.jsx
└── index.js
```

## Modifications incluses

1. Dashboard : bouton `Réduire l'aperçu` / `Afficher l'aperçu`.
2. Recherche globale : les clients ne sont plus indexés dans la barre de recherche.
3. `Travailleur(s)` devient `Employee(s)` dans la navigation, les pages, les filtres et les tableaux.
4. Alertes : champ de recherche plus court et largeur des descriptions limitée.
5. Statistiques : le donut `En cours / Terminé / En retard` a une légende verticale, une information par ligne.
