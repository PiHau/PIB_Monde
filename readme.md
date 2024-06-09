# Inégalités économiques dans le monde

## Description

Ce projet propose une visualisation des inégalités économiques mondiales en utilisant différents indicateurs économiques tels que le PIB par habitant et le PIB brut. L'objectif principal est de sensibiliser les citoyens suisses à la réalité des inégalités économiques mondiales, souvent atténuées dans notre inconscient.

### Fonctionnalités

- **Carte interactive** : La carte interactive est la composante principale de mes visualisations, permettant aux utilisateurs de voir rapidement les disparités économiques à l'échelle mondiale. Grâce à l'utilisation de la bibliothèque D3.js, la carte présente les données du PIB par habitant de chaque pays en coloration graduelle, reflétant des valeurs allant de faibles à élevées. Cette représentation facilite l'identification des pays avec les niveaux de PIB extrêmes – très hauts ou très bas – et permet une comparaison visuelle entre les nations. Les utilisateurs peuvent survoler chaque pays pour obtenir des détails spécifiques.
  
- **Graphique des stickmen** : Le graphique des stickmen est une méthode parlante pour représenter les inégalités économiques à l'individu suisse moyen. Chaque stickman représente une portion du PIB par habitant de la Suisse comparée à celle d'autres pays, transformant des données économiques (chiffres) en visualisations simples et accessibles. Cette approche permet aux utilisateurs de percevoir visuellement et de comprendre rapidement l'étendue des inégalités de richesse entre la Suisse et le pays sélectionné.

- **Graphique du PIB de 1991 à 2022** : Ce graphique linéaire illustre l'évolution du PIB total de chaque pays de 1991 à 2022, fournissant un aperçu historique des situations économiques au fil des décennies. Les utilisateurs peuvent voir les fluctuations économiques, y compris les périodes de croissance rapide ou de récession, ce qui aide à contextualiser les effets des événements mondiaux tels que les crises financières, les changements politiques majeurs, les guerres ou les génocides sur les économies nationales.

## Capture d'écran

 ![Capture d'écran](img/screenshot1.png)
 
## Installation et Lancement

1. Clonez ce dépôt sur votre machine locale :
    ```bash
    git clone https://github.com/PiHau/PIB_Monde.git
    ```

2. Ouvrez le fichier `index.html` dans votre navigateur. nb: Il sera certainement nécessaire d'ouvrir un serveur local pour passer la sécurité de votre navigateur.

## Modules, Librairies et Scripts

- **D3.js** : Utilisé pour la création de graphiques dynamiques et interactifs.
- **TopoJSON** : Utilisé pour la manipulation de données géographiques.

 **les scripts (en plus de pib.js et style.css) nécessaires au bon fonctionnement de la page sont appelés via leur lien dans le fichier `index.html`**

- https://d3js.org/d3.v6.min.js
- https://d3js.org/topojson.v3.min.js


## Contexte de Développement

Ce projet a été développé dans le cadre du cours visualisation de données dispensé par Isaac Pante (SLI, Lettres, UNIL). Pendant le semestre de printemps 2024.

## Structure du Répertoire

- `index.html` : Fichier principal de la page interactive.
- `style/` : dossier qui contient les fichiers CSS (`style.css`).
- `img/` : dossier qui contient les images utilisées dans le projet.
- `scripts/` : dossier qui contient les fichiers JavaScript (`pib.js`).
- `resources/` : Ressources utilisées

