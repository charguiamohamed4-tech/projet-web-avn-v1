# GameHub — Documentation technique
**Activité 1 — Programmation Web avancée (CSS3)**

## 1. Choix de mise en page
- **CSS Grid** : catalogue (4 colonnes desktop, 2 jusqu'à 1024 px, 1 jusqu'à 640 px), barre de filtres et zone texte/lecteur des fiches (2fr / 1fr).
- **Flexbox** : navbar, bloc jaquette + infos, puces, commandes du lecteur vidéo, footer (empilé en colonne sur mobile).
- **Responsive** : trois media queries (1024, 768, 640 px). Le menu burger est en **CSS pur** (case à cocher `:checked` + label), utilisable au clavier. `object-fit: cover` et `aspect-ratio: 16/9` gardent le cadrage des images et vidéos. `prefers-reduced-motion` coupe les animations si besoin.

## 2. Intégration des API Audio / Video
- **Video, accueil** : chaque carte superpose une balise `<video muted loop>` à la jaquette ; au survol (`pointerenter`) JS appelle `play()`, à la sortie `pause()` et remet `currentTime` à 0.
- **Video, fiche** : lecteur personnalisé (`play()`, `pause()`, `currentTime`, `volume`) avec lecture/pause, barre de progression, avance de 5 s et volume. Progression et avance sont désactivées tant que la durée n'est pas connue.
- **Audio** : `new Audio("media/click.wav")` joue un son discret à chaque filtre et à chaque favori ; chaque fiche a une bande-son ; le footer contient une playlist (précédent / suivant, enchaînement automatique via `ended`).

## 3. Animations, variables et effets CSS
- **Variables** (`:root`) : `--bg`, `--card`, `--text`, `--muted`, `--a` (ambre), `--b` (turquoise), `--r` (rayon), `--sh` (ombre), `--t` (durée de transition).
- **Transitions** : zoom de la jaquette, élévation et ombre colorée des cartes, soulignement animé de la navbar, boutons, icônes sociales.
- **`@keyframes rise`** : apparition du hero, des cartes (délai échelonné) et des sections de la fiche.
- **Pseudo-éléments** : barre sous les `h2` (`::after`), pastilles des puces (`::before`), dégradé sur la jaquette (`::after`), burger animé.
- **Image filtrée** : `filter: saturate() contrast() brightness() sepia()` sur la jaquette, qui retrouve ses couleurs au survol.

## 4. JavaScript et médias
`script.js` génère les cartes, gère recherche, filtres (genre, plateforme) et tri (popularité, date, nom) avec compteur de résultats, les favoris (`localStorage`, clé `gh-fav`) et les suggestions de jeux similaires. Les jaquettes SVG, vidéos MP4 et sons WAV de `media/` sont des fichiers de démonstration : pour les remplacer, garder les mêmes noms.
