# Horaire PEPS

Projet statique pour afficher les horaires des bains libres (PEPS) avec extraction dynamique des données, filtres facettés et pipeline de build (Grunt + Sass).

## Structure
- `index.html` — page d'entrée
- `scss/` — sources Sass
  - `_variables.scss`, `_mixins.scss`, `_filters.scss`, `styles.scss`
- `src/js/` — sources JavaScript
  - `script.js`, `filters.js`
- `css/` — CSS généré (minifié + source map)
- `js/` — bundle JS généré (minifié + source map)

## Prérequis
- Node.js et npm

## Installation
```
npm install
```

## Build
```
npm run build
```
Génère :
- `css/styles.min.css` et `css/styles.min.css.map`
- `js/app.min.js` et `js/app.min.js.map`

## Développement (watch)
```
npm run watch
```
Regénère automatiquement les assets à chaque modification dans `scss/` et `src/js/`.

## Git
Un `.gitignore`, `.gitattributes` et `.editorconfig` sont fournis.
- Les assets générés (`*.min.*`, maps, `js/app.js`) ne sont pas suivis par défaut.
- Commitez les sources (`scss/`, `src/js/`, `index.html`, `Gruntfile.js`, `package.json`, etc.).

## Notes
- Le HTML référence les versions minifiées: `css/styles.min.css` et `js/app.min.js`.
- Exécutez `npm run build` avant un déploiement/commit si vous souhaitez versionner les assets générés (à adapter selon votre flux de déploiement).
