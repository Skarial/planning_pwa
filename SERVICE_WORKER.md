# SERVICE WORKER — Gestion du offline et des mises à jour

## 1. Objectif

Garantir :

- Un fonctionnement 100% offline
- Un chargement instantané
- Une application toujours disponible
- Une gestion fiable des mises à jour

---

## 2. Problème classique des PWA

Dans beaucoup de PWA :

- Les utilisateurs restent bloqués sur une ancienne version en cache
- Les mises à jour ne se déploient pas correctement
- Les développeurs n’ont pas de contrôle clair sur le cache actif

Ce problème est souvent mal géré.

---

## 3. Solution mise en place

Le Service Worker repose sur un **versionning explicite** :

- `APP_VERSION`
- `CACHE_NAME` dérivé de la version

À chaque nouvelle version :

- Le nom du cache change
- L’ancien cache est supprimé
- Les nouveaux fichiers sont mis en cache proprement

---

## 4. Stratégie de cache

Lors de l’installation :

- Tous les fichiers nécessaires à l’application sont pré-cachés
- L’application peut fonctionner sans aucun accès réseau

Lors des requêtes :

- Réponse prioritaire depuis le cache
- Aucune dépendance réseau

---

## 5. Enregistrement côté application

`sw/sw-register.js` :

- Enregistre le Service Worker
- Détecte les mises à jour
- Affiche une notification claire à l’utilisateur
- Permet de recharger l’application pour appliquer la nouvelle version

---

## 6. Résultat

Cette approche garantit :

- Aucun utilisateur bloqué sur une ancienne version
- Une maîtrise totale du cache
- Un comportement prévisible
- Une expérience utilisateur fiable

---

## 7. Intérêt technique

Ce point est critique dans les PWA réelles.

La solution mise en place est simple, lisible, et facilement industrialisable.
