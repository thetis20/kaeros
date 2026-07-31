# Migration vers le design system de la maquette

## Contexte

`mockups/` contient une maquette HTML/CSS/JS validée (navigation, écrans, interactions). La quasi-totalité de sa structure fonctionnelle est déjà implémentée dans l'app réelle via des plans précédents (`nav-shell-regie-v1`, `music-tag-library`, `regie-polish`, `session-creation-screen`) : sidebar avec pastilles de statut, écran Régie avec état vide/session live/musique, bibliothèque de musique par tags, création/édition de session par accordéon d'étapes.

Deux écarts restent :
1. **Visuel** : l'app utilise Bootstrap (`btn`, `d-flex`, `card`...) + `react-bootstrap-icons`, alors que la maquette a son propre design system (CSS custom en variables, icônes Tabler).
2. **Structurel** : l'écran Sessions (`WorkflowDashboard`) utilise un flux liste → sélection → détail avec une UI d'édition d'étapes obsolète (`StepDashboard`/`StepItem`/`AddStep`), remplacée depuis par `SessionCreationScreen`. La maquette montre à la place une grille de cartes avec actions Démarrer/Modifier/Supprimer directement dessus.

## Objectif

Faire correspondre l'app réelle au design system et à la structure de la maquette : mêmes couleurs/typo/icônes, mêmes composants visuels (cartes, tabs, step-list, accordéon), écran Sessions en grille de cartes.

## Non-objectifs

- Pas de nouveaux champs vidéo (volume, boucle, style d'affichage) — absents de la maquette elle-même.
- Pas d'implémentation de "Time Spinoff" — présent dans les traductions FR mais non branché dans la logique métier ; hors périmètre.
- Pas de changement de la logique métier (Workflow/Session, entités, IPC, use cases) — uniquement la couche présentation (CSS + markup + icônes).
- Pas de nouvel écran d'accueil séparé — Régie reste le point d'entrée, comme aujourd'hui.

## Approche

Pas de nouvelle couche de composants UI partagés (`<Card>`, `<IconButton>`...). Le code actuel comme la maquette utilisent des classNames directement dans chaque écran — on garde ce pattern pour rester cohérent avec l'existant et éviter une abstraction non nécessaire.

### Fondations CSS

- Nouveau fichier `src/theme.css` : port direct des variables et classes utilitaires de `mockups/style.css` (`--accent`, `--surface-*`, `--text-*`, `--border`, `--radius`, `.card`, `.btn`, `.btn-sm`, `.btn-icon`, `.btn-accent`, `.is-active`, `.step-list`, `.step-row`, `.accordion-item`, `.accordion-header`, `.accordion-body`, `.tabs`, `.pill`, `.dot`, `.color-chip`, `.grid-cards`, `.top-bar`, `.field-label`, `.file-row`, `.file-thumb`, `.preview-box`, `.time-display`).
- `src/App.js` : retrait de `import 'bootstrap/dist/css/bootstrap.css'`, ajout de `import './theme.css'`.
- `package.json` : ajout de `@tabler/icons-react`, retrait de `react-bootstrap-icons` une fois toutes les références migrées.
- Les composants de formulaire natifs (`input`, `select`, `textarea`, boutons) gardent des classes simples (`form-control`-like renommées ou classes maquette équivalentes) — pas de dépendance à Bootstrap pour leur style.

### Icônes

Remplacement 1:1 `react-bootstrap-icons` → `@tabler/icons-react` dans les 13 fichiers qui l'utilisent aujourd'hui (composants sous `src/component/`). Correspondance basée sur les icônes déjà choisies dans la maquette (`ti-broadcast`, `ti-music`, `ti-device-tv`, `ti-list`, `ti-chevron-up/down`, `ti-player-play/stop/track-prev/track-next`, `ti-edit`, `ti-trash`, `ti-plus`, `ti-minus`, `ti-upload`, `ti-file-music`, `ti-grip-vertical`, `ti-shield`, `ti-photo`, `ti-movie`, `ti-clock`, `ti-square`, `ti-device-floppy`, `ti-x`, `ti-recycle`).

### Écrans à repeindre (CSS + icônes, structure inchangée)

- `Sidebar` — fond clair au lieu de dark Bootstrap, pastilles nav-tag.
- `RegieScreen`, `RegieLiveController`, `AudioController`, `RegieTrackPicker` — cartes, tabs, step-list, preview-box.
- `MusiqueScreen` — cartes, tabs, step-list, pill de tag, file-row pour le champ fichier.
- `SessionCreationScreen` — accordéon, step-list, boutons d'ajout par type (déjà structurellement proche, passage de classNames).

### Écran Sessions à restructurer (`WorkflowDashboard`)

Remplacer le flux actuel (liste cliquable → panneau détail avec back/remove/edit/play → `StepDashboard`) par une grille de cartes, une par workflow, affichant directement :
- pastille couleur (`workflow.color`, déjà présent sur l'entité),
- nom,
- "Modifié {relatif}" (`workflow.updatedAt` via `moment(...).fromNow()`, déjà utilisé dans `WorkflowItem`),
- trois boutons icône inline : Démarrer (`sessionPlay`), Modifier (`onEditWorkflow`, déjà câblé vers `SessionCreationScreen`), Supprimer (`workflowRemove`).

Plus de sélection intermédiaire ni de vue détail. Conséquence : `StepDashboard`, `StepItem`, `AddStep` (ancienne UI d'édition d'étapes, remplacée par `SessionCreationScreen` depuis le plan `session-creation-screen`) n'ont plus aucun appelant — à supprimer avec leurs tests, même logique que le nettoyage `Folder`/`Audio` déjà fait sur ce projet.

Le bouton "Nouvelle session" (`create()`) reste au-dessus de la grille, comme le bouton "Nouvelle session" de la maquette.

## Tests

- 3 assertions dans `RegieLiveController.test.js` vérifient `toHaveClass('btn-primary')` sur l'onglet actif — à adapter vers la classe d'état actif de la maquette (`is-active`).
- Le reste des tests cible par rôle/texte (`getByRole`, `getByText`, `aria-label`) — pas de changement de comportement attendu, donc peu de casse au-delà du point ci-dessus.
- `WorkflowDashboard.test.js` et les tests de `StepDashboard`/`StepItem`/`AddStep` : les premiers seront réécrits pour la nouvelle grille de cartes, les seconds supprimés avec les composants.
- Aucun test visuel/pixel — la vérification du rendu réel se fait manuellement (Electron via Playwright, comme pour `session-creation-screen`) en fin de plan.

## Risques

- Volume : 13 fichiers d'icônes + ~7 écrans à repeindre + une restructuration fonctionnelle (Sessions) → plan à découper en tâches unitaires par écran/composant, dans cet ordre : fondations CSS/icônes → Sidebar → Régie (Screen+LiveController+AudioController+TrackPicker) → Musique → Sessions (restructuration + suppression legacy) → SessionCreationScreen → vérification manuelle Electron.
- Le retrait de `react-bootstrap-icons` du `package.json` ne doit se faire qu'après confirmation qu'aucun fichier n'y fait plus référence (`grep -rl react-bootstrap-icons src`).
