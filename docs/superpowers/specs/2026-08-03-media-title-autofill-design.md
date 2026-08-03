# Auto-remplissage du nom depuis le fichier sélectionné (musique / vidéo)

## Contexte

Lors de la sélection d'un fichier musique (`MusiqueScreen`) ou vidéo (`DubbingVideoStep`), le champ `name` (titre affiché — il n'existe pas de champ littéralement appelé `title`) doit être saisi manuellement par l'utilisateur, même si le nom du fichier serait un bon candidat par défaut.

## Objectif

Si le champ `name` est vide (ou ne contient que des espaces) au moment où l'utilisateur choisit un fichier, le pré-remplir avec le nom du fichier (sans extension). Si `name` contient déjà une valeur, ne rien changer (pas d'écrasement).

## Portée

- `src/component/Screen/MusiqueScreen.js` — champ `value.name`, handler `handleFile` (ligne 24).
- `src/component/Step/DubbingVideoStep.js` — le composant reçoit `value` = l'objet `step` complet (passé par `SessionCreationScreen`), qui contient déjà `name`. Handler `handleFile` (ligne 16). Aucune nouvelle prop nécessaire : `setValue` remonte déjà à `updateStep` dans `SessionCreationScreen`.
- Pas d'autre écran concerné (les autres types de step — `image`, `time`, `battle-royal` — n'ont pas de sélection de fichier).

## Conception

Ajouter un helper dans `src/lib/filename.js` :

```js
export function stripExtension(filename) {
    return filename.replace(/\.[^./]+$/, '');
}
```

Dans chaque `handleFile`, après récupération du fichier sélectionné (garde si `file` est `undefined` — annulation de la boîte de dialogue) :

```js
function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return; // annulation dialogue — comportement existant préservé pour le reste
    const name = (!value.name || !value.name.trim()) ? stripExtension(file.name) : value.name;
    setValue({ ...value, file, name });
    if (errors.src) setErrors({ ...errors, src: undefined }); // ou errors.file selon le composant
}
```

Note : le guard `if (!file) return` change légèrement le comportement actuel (aujourd'hui un `file` `undefined` était quand même assigné à `value.file`). C'est un effet de bord nécessaire pour éviter un crash sur `file.name` ; à signaler en revue si jugé hors périmètre.

## Tests

- `MusiqueScreen` : sélection fichier avec `name` vide → `name` pré-rempli avec le nom du fichier sans extension. Sélection fichier avec `name` déjà rempli → `name` inchangé.
- `DubbingVideoStep` : même comportement, vérifié via le `setValue` remonté (assert sur l'objet passé à `setValue`/`updateStep`).
- `stripExtension` : cas simple (`clip.mp4` → `clip`), fichier sans extension (`README` → `README`), plusieurs points (`archive.tar.gz` → `archive.tar`).

## Hors périmètre

- Pas de renommage du champ `name` en `title`.
- Pas de changement de comportement si `name` est déjà rempli.
- Pas de dialogue natif Electron (`showOpenDialog`) — reste un `<input type="file">`.
