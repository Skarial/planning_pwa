# Sauvegarde et restauration des données

Ce document décrit le mécanisme de sauvegarde et de restauration des données de l’application.

Toutes les opérations sont effectuées **localement**, sans serveur et sans connexion réseau.

---

## Principe général

L’application permet :

- l’export complet des données locales dans un fichier,
- l’import de ce fichier sur le même appareil ou un autre appareil.

Ces mécanismes permettent de conserver l’état de l’application en cas de :

- changement de téléphone,
- réinstallation,
- réinitialisation volontaire.

---

## Données concernées par la sauvegarde

La sauvegarde contient l’intégralité des données stockées localement, notamment :

- le planning,
- les services,
- les paramètres,
- l’état d’activation.

Toutes les données proviennent de la base IndexedDB de l’application.

---

## Export des données

### Fonctionnement

Lors d’un export :

1. La base de données locale est ouverte.
2. Tous les stores connus sont lus.
3. Les données sont regroupées dans un objet structuré.
4. Un fichier de sauvegarde est généré.

Le fichier contient :

- les données,
- des métadonnées (version, date, format).

Aucune donnée n’est transmise à l’extérieur.

---

## Import des données

### Fonctionnement

Lors d’un import :

1. Le fichier de sauvegarde est chargé.
2. Son format est validé.
3. Les données locales existantes sont supprimées.
4. Les données du fichier sont restaurées.
5. L’application redémarre automatiquement.

La restauration est **totale**.

---

## Effet sur l’activation

Si la sauvegarde contenait une activation valide :

- l’activation est restaurée,
- aucun nouveau code d’activation n’est requis.

L’activation est traitée comme une donnée locale persistante.

---

## Compatibilité des sauvegardes

- Le format de sauvegarde est versionné.
- Une sauvegarde incompatible est refusée.
- Aucune tentative de migration automatique n’est effectuée.

---

## Sécurité et confidentialité

- Les données ne quittent jamais l’appareil sans action explicite.
- Aucun chiffrement n’est appliqué au fichier de sauvegarde.
- La confidentialité repose sur le contrôle du fichier par l’utilisateur.

---

## Limites

- La sauvegarde ne protège pas contre une suppression définitive sans export préalable.
- Le fichier peut être modifié manuellement, ce qui peut entraîner un import invalide.

---

## Statut du document

Ce document décrit un comportement **contractuel**.

Toute modification du format ou du périmètre de sauvegarde doit être :

- implémentée dans le code,
- reflétée dans ce document.
