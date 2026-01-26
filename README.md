# Planning PWA

Application web progressive de gestion de planning, développée en JavaScript vanilla.

Projet personnel, conçu pour un usage réel sur smartphone, en conditions de mobilité.

---

## Présentation générale

Planning PWA est une application **offline-first** permettant la consultation et la saisie d’un planning de travail.

L’application fonctionne :

- sans serveur,
- sans compte utilisateur,
- sans dépendance externe,
- avec stockage local uniquement.

Elle est conçue pour être installée comme une application native via les mécanismes PWA.

---

## Objectif fonctionnel

L’application permet de :

- consulter rapidement un planning,
- naviguer par jour et par mois,
- saisir et modifier les services,
- fonctionner de manière fiable hors connexion.

Le périmètre fonctionnel est volontairement restreint et maîtrisé.

---

## Contexte métier

L’application a été conçue à partir d’un besoin réel de terrain, avec les contraintes suivantes :

- usage principal sur smartphone,
- réseau instable ou absent,
- nécessité de rapidité et de lisibilité,
- fiabilité des données locales.

Voir : `docs/CONTEXTE_METIER.md`

---

## Architecture technique

- HTML / CSS / JavaScript vanilla
- Architecture modulaire (components / domain / data / state)
- Router interne par masquage DOM
- IndexedDB pour les données persistantes
- LocalStorage pour l’état applicatif léger
- Service Worker avec cache versionné
- Hébergement GitHub Pages

Aucune bibliothèque externe n’est utilisée.

Voir : `ARCHITECTURE.md`

---

## Offline et mises à jour

L’application est conçue pour fonctionner **entièrement hors ligne**.

La gestion du cache et des mises à jour repose exclusivement sur le Service Worker, avec un comportement déterministe et contrôlé.

Voir : `docs/SERVICE_WORKER.md`

---

## Activation de l’application

L’application nécessite une activation locale par code lors de la première utilisation sur un appareil.

L’activation est :

- liée à l’appareil,
- stockée localement,
- restaurable via sauvegarde.

Voir : `docs/ACTIVATION.md`

---

## Sauvegarde et restauration

Les données peuvent être :

- sauvegardées dans un fichier local,
- restaurées intégralement sur le même appareil ou un autre.

La sauvegarde inclut l’activation si elle est présente.

Voir : `docs/SAUVEGARDE_RESTAURATION.md`

---

## Installation en tant qu’application (PWA)

### Android (Chrome)

1. Ouvrir l’application dans Chrome.
2. Menu ⋮ → **Ajouter à l’écran d’accueil**.
3. Valider.

### iOS (Safari)

1. Ouvrir l’application dans Safari.
2. Bouton **Partager**.
3. **Sur l’écran d’accueil**.

L’application apparaît ensuite comme une application native.

---

## Aperçu

### Accueil

![Accueil](docs/home.jpg)

### Vue jour

![Jour](docs/day.jpg)

### Vue mois

![Mois](docs/month.jpg)

### Saisie guidée

![Saisie guidée](docs/guided-month.jpg)

---

## Licence

Voir le fichier `LICENSE`.

---

## Statut

Projet stable, autonome, sans dépendance externe.  
Le comportement documenté fait foi.
