# ARCHITECTURE — Planning PWA Chauffeurs

## 1. Vue d’ensemble

Application web **PWA offline-first** destinée aux chauffeurs de bus pour gérer leur planning personnel quotidien.

Contraintes majeures :

- Usage smartphone
- Réseau instable ou absent
- Rapidité d’accès
- Simplicité maximale
- Aucune authentification
- Aucune donnée serveur

Technologies :

- HTML / CSS / JavaScript vanilla
- Service Worker avec cache versionné
- LocalStorage + IndexedDB
- Hébergement GitHub Pages
- Router maison par masquage DOM

---

## 2. Structure des dossiers

index.html  
service-worker.js  
manifest.webmanifest

css/  
&nbsp;&nbsp;style.css  
&nbsp;&nbsp;tetribus.css

js/  
&nbsp;&nbsp;app.js  
&nbsp;&nbsp;router.js  
&nbsp;&nbsp;utils.js

&nbsp;&nbsp;components/  
&nbsp;&nbsp;&nbsp;&nbsp;home.js  
&nbsp;&nbsp;&nbsp;&nbsp;day.js  
&nbsp;&nbsp;&nbsp;&nbsp;month.js  
&nbsp;&nbsp;&nbsp;&nbsp;guided-month.js  
&nbsp;&nbsp;&nbsp;&nbsp;tetribus.js  
&nbsp;&nbsp;&nbsp;&nbsp;calendar.js  
&nbsp;&nbsp;&nbsp;&nbsp;menu.js

&nbsp;&nbsp;data/  
&nbsp;&nbsp;&nbsp;&nbsp;db.js  
&nbsp;&nbsp;&nbsp;&nbsp;storage.js  
&nbsp;&nbsp;&nbsp;&nbsp;services.js  
&nbsp;&nbsp;&nbsp;&nbsp;services-init.js  
&nbsp;&nbsp;&nbsp;&nbsp;services-catalog.js

&nbsp;&nbsp;state/  
&nbsp;&nbsp;&nbsp;&nbsp;consulted-date.js

&nbsp;&nbsp;sw/  
&nbsp;&nbsp;&nbsp;&nbsp;sw-register.js

&nbsp;&nbsp;utils/  
&nbsp;&nbsp;&nbsp;&nbsp;conges.js  
&nbsp;&nbsp;&nbsp;&nbsp;periods.js  
&nbsp;&nbsp;&nbsp;&nbsp;services-availability.js  
&nbsp;&nbsp;&nbsp;&nbsp;services-grouping.js

games/tetribus/  
&nbsp;&nbsp;tetribus.game.js  
&nbsp;&nbsp;tetribus.render.js

---

## 3. Gestion des vues (Router)

Le routing ne repose sur aucun framework.

`router.js` :

- Masque/affiche les vues du DOM
- Une vue = un module dans `components/`
- Navigation déclenchée par le menu (`menu.js`)
- Pas de rechargement de page

Principe : une seule page HTML, affichage dynamique par JavaScript.

---

## 4. Stockage des données

### LocalStorage

Utilisé pour :

- Paramètres simples
- État léger persistant

### IndexedDB (`data/db.js`, `storage.js`)

Utilisé pour :

- Le planning complet
- Les services
- Les données structurées

Objectif : fonctionnement 100% offline sans limite pratique.

---

## 5. Logique métier

`data/services*.js` et `utils/` contiennent :

- Catalogue des services
- Règles de regroupement
- Disponibilités
- Périodes
- Congés

Cette logique est séparée de l’interface utilisateur.

---

## 6. Gestion d’état

`state/consulted-date.js`

Synchronise la date consultée entre :

- home
- day
- month
- guided-month

Sans dépendance externe.

---

## 7. Service Worker

`service-worker.js` + `sw/sw-register.js`

Fonctions :

- Cache complet de l’application
- Fonctionnement offline total
- Versionning du cache (APP_VERSION / CACHE_NAME)
- Notification de mise à jour utilisateur

Problème classique PWA résolu : utilisateurs bloqués sur un ancien cache.

---

## 8. Initialisation de l’application

`app.js` :

- Initialise IndexedDB
- Initialise les services
- Démarre le router
- Enregistre le Service Worker

---

## 9. Séparation des responsabilités

| Dossier    | Rôle                                       |
| ---------- | ------------------------------------------ |
| components | Interface utilisateur / vues               |
| data       | Données et logique métier                  |
| state      | État global minimal                        |
| utils      | Règles métier                              |
| sw         | Enregistrement Service Worker              |
| css        | Interface visuelle                         |
| games      | Module isolé sans impact sur l’application |

---

## 10. Principes de conception

- Aucune dépendance externe
- Aucun framework
- Offline-first réel
- Données locales uniquement (RGPD natif)
- Code volontairement simple pour être repris facilement
- Architecture pensée pour être industrialisée ultérieurement (TypeScript, tests, backend possible)

---

Cette application est un prototype métier fonctionnel conçu pour être facilement repris et industrialisé par une équipe de développement.
