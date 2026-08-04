# Bouton stop session — Régie

## Contexte

Dans `RegieLiveController`, aucune façon d'arrêter une session en cours depuis l'UI. Le seul mécanisme existant est la fermeture physique de la fenêtre de diffusion externe (`SessionWindow`), qui déclenche `MainWindow.sessionClose()` et notifie le renderer via l'event IPC `session-onchange` (payload `undefined`).

## Objectif

Ajouter un bouton "stop" dans `RegieLiveController` qui arrête la session en cours (ferme la fenêtre de diffusion, réinitialise l'écran régie), avec confirmation avant action car destructif en plein direct.

## Flux

1. Clic sur bouton stop (icône, style `btn btn-icon` existant) dans `RegieLiveController`, à côté des contrôles play/pause.
2. Ouverture de `ConfirmDialog` (nouveau composant générique) : titre + message + boutons confirmer/annuler.
3. Confirmation → appel `window.session.stop()` (nouvelle API preload).
4. Nouveau canal IPC `session-stop` (`ipcRenderer.invoke` / `ipcMain.handle`) dans `preload-main.js` / `MainWindow.js`.
5. Handler main process ferme `this.sessionWindow.window` → déclenche le listener `closed` existant (`SessionWindow.js`) → `onClose()` → `MainWindow.sessionClose()` (chemin déjà existant, pas de nouvelle logique de nettoyage à écrire).
6. `sessionClose()` envoie déjà `session-onchange` avec `undefined` → `useSession` (renderer) reçoit `undefined` → `RegieScreen` retombe dans l'état "pas de session" (comportement déjà existant, réutilisé tel quel).
7. Annulation → fermeture du dialog, aucun effet.

## Composants à créer/modifier

- **`src/component/Screen/ConfirmDialog.js`** (nouveau) : composant générique réutilisable — props `title`, `message`, `confirmLabel`, `cancelLabel`, `onConfirm`, `onCancel`. Overlay + boîte centrée, CSS scoped inline (aucune lib de modal dans le projet, aucun pattern existant à réutiliser — vérifié).
- **`src/component/Screen/RegieLiveController.js`** : ajout bouton stop (`btn btn-icon`, icône `IconPlayerStop` de `@tabler/icons-react`, `aria-label={t('regie.controller.stop')}`), état local `showStopConfirm` (useState), rendu conditionnel de `ConfirmDialog`.
- **`public/script/preload/preload-main.js`** : ajout `sessionStop: () => ipcRenderer.invoke('session-stop')` dans l'objet exposé `window.session`.
- **`public/script/window/MainWindow.js`** : ajout handler `ipcMain.handle('session-stop', ...)` qui ferme `this.sessionWindow.window` si présent (no-op si pas de session active).
- **`src/i18n/translation.fr.json`** (et fichiers autres langues si présents) : nouvelles clés sous `regie.controller` :
  - `stop` : libellé aria du bouton (ex. "Arrêter la session")
  - `stopConfirm.title`, `stopConfirm.message`, `stopConfirm.confirm`, `stopConfirm.cancel`

## Gestion d'erreur

Pas de cas d'erreur particulier à gérer : si `sessionWindow` est déjà `null` (session déjà fermée), le handler IPC est un no-op silencieux. Pas de retour d'erreur au renderer nécessaire.

## Tests

- `ConfirmDialog` : rendu, clic confirmer déclenche `onConfirm`, clic annuler déclenche `onCancel`, pas d'appel croisé.
- `RegieLiveController` : clic stop affiche le dialog ; confirmer appelle `window.session.stop` puis ferme le dialog ; annuler ferme le dialog sans appeler `window.session.stop`.
- Pas de test process main dédié requis au-delà des tests existants (réutilisation du chemin `sessionClose()` déjà couvert).

## Hors scope

- Pas de champ `status` ajouté à l'entité `Session`/`Workflow` (non nécessaire, le stop se limite à fermer la fenêtre).
- Pas de raccourci clavier pour le stop.
- Pas de confirmation "double" (ex. maintenir 3s) — un simple dialog suffit.
