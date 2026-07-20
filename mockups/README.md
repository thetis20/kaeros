# Maquettes Kaeros

Ce dossier contient une maquette HTML/CSS/JS navigable de l'interface de Kaeros, construite pour réfléchir aux écrans avant implémentation. Elle ne dépend d'aucun outil de build : ouvrir `index.html` dans un navigateur suffit. La seule dépendance externe est la police d'icônes Tabler, chargée depuis un CDN (jsDelivr), donc une connexion internet est nécessaire à l'affichage.

## Structure de navigation

Le menu de gauche propose trois entrées : Régie (écran par défaut à l'ouverture), puis une catégorie Bibliothèque qui regroupe Musique et Sessions. Il n'y a pas d'écran d'accueil séparé — la Régie fait office de point d'entrée principal, qu'une session soit en cours ou non.

À côté du libellé "Régie" dans le menu, deux pastilles apparaissent dynamiquement : une icône écran quand une session est en train de tourner, une icône musique quand au moins une musique est en cours de lecture. Elles se mettent à jour automatiquement selon l'état de l'application.

## Correspondance avec le code actuel

Les types d'étape utilisés dans la maquette reprennent exactement ceux définis dans `public/script/application/entity/step/` et `src/component/Step/` du code réel : `image`, `dubbing-video` (vidéo de doublage, avec fichier + durée en texte libre + description affichée avant lancement), `time` (paramétré par un nombre d'impros et un nombre de minutes, pas une simple durée), et `battle-royal` (liste de joueurs avec scores). Ce sont les seuls types réellement implémentés aujourd'hui ; il n'existe pas de type vidéo générique indépendant du doublage.

La distinction Workflow/Session du code (le scénario préparé à l'avance vs l'instance en cours de lecture live) a été volontairement conservée sous un seul mot, "Session", à la demande du produit — ce qui recrée l'ambiguïté déjà présente dans l'interface actuelle où les deux notions sont toutes deux appelées "Sessions" en français. C'est un choix assumé, pas un oubli, mais à garder en tête si une clarification devient nécessaire côté implémentation.

## Écarts par rapport au code actuel (évolutions proposées, pas de l'existant)

La bibliothèque musicale de la maquette remplace le système de dossiers colorés (`Folder` + `Audio`) actuellement dans le code par un système de tags plats (Bruitage, Musique, Disco), avec une page dédiée à la configuration des musiques (ajout, tag, suppression) plutôt qu'à leur simple lecture. C'est une extension du modèle `Audio` à prévoir côté code, pas une fonctionnalité existante.

L'écran Régie propose un état vide (liste des sessions à démarrer) quand aucune session ne tourne, avec un bloc musique toujours visible et démarrable indépendamment — utile pour les événements qui n'ont besoin que de musique sans scénario. Le bloc "Session" peut être réduit via un chevron, pour les mêmes cas d'usage.

Aucun champ volume, boucle ou style d'affichage n'existe dans le code actuel pour les vidéos — ces réglages ne sont donc pas repris dans la maquette. Le "Time Spinoff" apparaît dans les traductions FR (`translation.fr.json`) sans être branché dans la logique de step actuelle ; il n'a pas été inclus non plus, à vérifier si c'est une fonctionnalité prévue.

## Limites de la maquette

Tout est simulé côté client, sans persistance ni vrai import de fichier : les boutons "Choisir un fichier" n'ouvrent pas de sélecteur système, les données sont réinitialisées à chaque rechargement de page. L'objectif est de valider les parcours et les interactions avant de les implémenter avec de vraies données Electron/React.
