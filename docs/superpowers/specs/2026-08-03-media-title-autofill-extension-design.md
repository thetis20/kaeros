# Extension de l'auto-remplissage du nom (ImageStep + correctif nom par défaut)

## Contexte

La feature d'auto-remplissage du nom depuis le fichier sélectionné a été livrée dans le commit `a3b0a66` (spec d'origine : `2026-08-03-media-title-autofill-design.md`) pour `MusiqueScreen.js` et `DubbingVideoStep.js`. Cette spec d'origine affirmait qu'aucun autre écran n'était concerné, en particulier que les steps `image`/`time`/`battle-royal` n'avaient pas de sélection de fichier — c'est inexact pour `image` : `ImageStep.js` a le même pattern `handleFile` avec un `<input type="file">`, mais n'a jamais reçu l'auto-fill.

Par ailleurs, un second problème a été identifié en relisant `SessionCreationScreen.js` : `newStep(type, t)` (ligne 60-66) donne à chaque nouvelle étape un nom par défaut non-vide dès sa création (`t('sessionCreation.newStepName.${type}')`, ex. "Nouvelle image", "Nouveau doublage"). Le garde-fou actuel de l'auto-fill (`!value.name || !value.name.trim()`) ne se déclenche donc **jamais** en usage réel sur `DubbingVideoStep` : le nom par défaut bloque le remplissage dès qu'un fichier est choisi, sauf si l'utilisateur efface d'abord manuellement le champ. Les tests existants du commit `a3b0a66` passent `renderStep({name: ''})` directement, ce qui contourne ce cas réel et a masqué le problème.

## Objectif

1. Étendre l'auto-remplissage du nom à `ImageStep.js`, pour la cohérence des 3 formulaires à sélection de fichier.
2. Corriger le garde-fou pour qu'il traite le nom par défaut de l'étape comme équivalent à "vide" : l'auto-fill doit se déclencher aussi bien quand `name` est vide que quand `name` est encore égal au nom par défaut généré à la création de l'étape.

## Portée

- `src/lib/filename.js` — nouveau helper `resolveAutoFillName`.
- `src/component/Screen/MusiqueScreen.js` — bascule sur le helper (comportement inchangé, pas de `defaultName`).
- `src/component/Step/DubbingVideoStep.js` — bascule sur le helper avec `defaultName` = nom par défaut traduit du type de step.
- `src/component/Step/ImageStep.js` — ajout de `handleFile` avec auto-fill (absent aujourd'hui), même pattern que `DubbingVideoStep`.
- Non concerné : `TimeStep`, `BattleRoyalStep` (pas de sélection de fichier), `SessionCreationScreen.js` (le champ nom qu'il édite directement, ligne ~235-241, n'est pas touché — il continue d'écrire `step.name` normalement, l'auto-fill n'intervient que côté `handleFile` des composants Step).

## Conception

### Helper partagé (`src/lib/filename.js`)

```js
export function resolveAutoFillName(currentName, defaultName, fileName) {
    const isEmpty = !currentName || !currentName.trim();
    const isUntouchedDefault = !!defaultName && currentName === defaultName;
    return (isEmpty || isUntouchedDefault) ? stripExtension(fileName) : currentName;
}
```

Fonction pure, colocalisée avec `stripExtension`/`hasSource`/`getFilename`. `defaultName` est optionnel : si absent/`undefined`/`''`, seul le check `isEmpty` s'applique (comportement actuel de `MusiqueScreen` préservé à l'identique).

### Intégration

**`MusiqueScreen.js`** (`handleFile`) :
```js
const name = resolveAutoFillName(value.name, undefined, file.name);
```

**`DubbingVideoStep.js`** (`handleFile`) :
```js
const defaultName = t(`sessionCreation.newStepName.${value.type}`);
const name = resolveAutoFillName(value.name, defaultName, file.name);
```

**`ImageStep.js`** (`handleFile`, à créer — le composant n'en a pas aujourd'hui) :
```js
function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const defaultName = t(`sessionCreation.newStepName.${value.type}`);
    const name = resolveAutoFillName(value.name, defaultName, file.name);
    setValue({ ...value, file, name });
    if (errors.file) setErrors({ ...errors, file: undefined });
}
```
`useTranslation` est déjà importé dans `ImageStep.js` (`t` déjà disponible dans le composant).

`value.type` est fiable pour les 4 types de step : posé par `newStep()` dans `SessionCreationScreen.js` et jamais retiré ensuite.

## Edge cases assumés (trade-offs acceptés)

- Si l'utilisateur renomme volontairement une étape en retapant exactement le nom par défaut (ex. "Nouvelle image"), un futur changement de fichier écrasera ce nom. Accepté : l'alternative (flag `nameTouched` explicite, touchant aussi `SessionCreationScreen.js`) a été écartée comme trop invasive pour ce cas marginal.
- Si la clé i18n `sessionCreation.newStepName.<type>` est absente, `t()` renvoie la clé brute : la comparaison `isUntouchedDefault` ne matchera simplement jamais, sans casser quoi que ce soit.
- Pas de nouveau mode d'échec : `resolveAutoFillName` est pure, synchrone, sans I/O.

## Tests

- `src/lib/__tests__/filename.test.js` — nouveau bloc `describe('resolveAutoFillName')` :
  - `name` vide + fichier → nom du fichier sans extension.
  - `name` égal au `defaultName` fourni + fichier → nom du fichier sans extension.
  - `name` personnalisé (différent du défaut) + fichier → inchangé.
  - `defaultName` non fourni (`undefined`) + `name` vide → nom du fichier (comportement `MusiqueScreen`, régression check).
- `src/component/Screen/__tests__/MusiqueScreen.test.js` — inchangé, sert de non-régression (le helper doit reproduire exactement le comportement actuel sans `defaultName`).
- `src/component/Step/__tests__/DubbingVideoStep.test.js` — nouveau cas : step avec `name` = nom par défaut traduit du type + sélection de fichier → `setValue` appelé avec le nom du fichier (couvre le trou identifié en contexte).
- `src/component/Step/__tests__/ImageStep.test.js` — nouveau fichier (n'existe pas aujourd'hui) : cas vide → remplit, nom personnalisé → inchangé, nom par défaut → remplit. Suivre la structure de `DubbingVideoStep.test.js` (mêmes conventions de rendu/props).

## Hors périmètre

- `TimeStep` et `BattleRoyalStep` : pas de sélection de fichier, non concernés.
- `SessionCreationScreen.js` : pas de modification de son propre champ nom (ligne ~235-241) ni de son état.
- Pas de flag `nameTouched` ni de changement de forme de l'objet `step` (pas de nouveau champ persisté).
- Pas de sanitizing supplémentaire du nom extrait du fichier (underscores/tirets, casse, etc.) — hors scope de cette extension.
