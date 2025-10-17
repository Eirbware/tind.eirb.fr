# Tind'eirb

Application PocketBase - Vite + React pour shotgun son fillot à la rentrée. 
Cette application, originalement réécrite par Benjamin Grolleau, a été mise open source 
afin de faire en sorte que n'importe qui puisse l'améliorer

## Fonctionnalités
- Mise à jour en temps réel sans raffraichissement.
- Se connecter avec le CAS et avoir ses bons rôles, fillières, etc.
- Voir les réponses des 1A de sa fillières grâce aux informations CAS. 
- Possibilité de shotgun un fillot.
- Plusieurs vagues de shotgun en fonction de son association ou non. 

## Technologies
- Framework: React + Zustand
- CSS: Tailwind 
- Database: Pocketbase

On a choisi PocketBase car c'est une base de donnée et un backend opensource et surtout self hostable qui fonctionne en temps réel de la même manière que FireBAse mais complétement gratuite. Pour un usage applicatif au sein de l'Enseirb-Matmeca, cela suffit largement, en septembre 2023, la quasi totalitée des 2A étaient connectés dessus en même temps et cela fonctionnait. 

Puisque PocketBase est un backend, la majorité se fait sur l'interface graphique mais pour implémenter des logiques plus poussées (aka connexion par CAS), on peut écrire un script en js et en go. Le JS a été choisi, le fichier est `backend/pb_hooks/main.pb.js`

Du côté de la base de données, deux tables ont étés mit en place: 
- users (Type: Auth) - Cette table se complète automatiquement quand un nouvel utilisateur se connecte via le CAS
  - firstName: Text
  - lastName: Text
  - diploma: Text
  - shotgunDate: Date
  - favorites: relation multiple sur users
  - parrain: relation simple sur users
  - infos: JSON
  - API Rules: List/Search rule a été changée pour vide
- config (Type Base) 
  - key: text
  - value: text
  - API Rules: List/Search et View sont mit a vide 
  - 2 champs ont étés complétés: 
    - "TIME": "now" (Se met a jour via un cron dans le backend)
    - "MAX_FILLOTS": 5

> A noter que PocketBase tient en un exécutable qu'il faut télécharger depuis le site [PocketBase](https://pocketbase.io/docs/)
> Un décalage temporel ainsi que des lenteurs sont constatés lors de l'usage de WSL.

## Développement
### Installation des dépendances

```bash 
npm i
```

### Démarrer le serveur de développement
```
npm run dev
```

Le site est accessible en développement sur [http://localhost:5173](http://localhost:5173) et l'administration  PocketBase est accessible sur [http://localhost:5173/_](http://localhost:5173/_). L'api, quand à elle, est accessible sur [http://localhost:5173/api](http://localhost:5173/api)

### Déploiment
#### Front
```bash
# A la base du projet
npm run build
```
Le build du front est realiser dans le dossier `backend/pb_public`

#### Back
[https://pocketbase.io/docs/going-to-production/#minimal-setup](https://pocketbase.io/docs/going-to-production/#minimal-setup) 
