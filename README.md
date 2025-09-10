<p align="center">
  <img src="https://files.catbox.moe/jvwq8s.jpeg" alt="RENEGADES_MD Banner" width="90%"/>
</p>

```
# ⚡ RENEGADES_MD (alias DEVCADIS) ⚡
------------------------------------------------------------------------

## 📌 Description

**RENEGADES_MD**, également connu comme **DEVCADIS**, est un bot
WhatsApp multi-device basé sur **Baileys**.\
Il permet d'automatiser les discussions, d'exécuter des commandes et de
tirer pleinement parti de WhatsApp via une interface avancée.

------------------------------------------------------------------------

## 🚀 Déploiement

### 1. Cloner le dépôt

``` bash
git clone https://github.com/DEVCADIS/DEVCADIS.git
cd DEVCADIS
```

### 2. Installer les dépendances

``` bash
npm install
```

### 3. Lancer localement

``` bash
node index.js
```

------------------------------------------------------------------------

## ☁️ Déploiement sur Render

1.  Inscris-toi sur [Render](https://render.com).
2.  Crée un **nouveau Web Service**, connecte ton compte GitHub et
    sélectionne le dépôt `DEVCADIS`.
3.  Configure :
    -   **Environment** : `Node`

    -   **Build Command** :

        ``` bash
        npm install
        ```

    -   **Start Command** :

        ``` bash
        node index.js
        ```
4.  Clique sur **Deploy** pour lancer ton bot en ligne 🎉

------------------------------------------------------------------------

## ⚙️ Configuration

Crée un fichier **`.env`** à la racine avec les variables suivantes :

``` env
PREFIXE=.
DOSSIER_AUTH=auth_baileys
NUMBER=‪237xxxxxx
USE_QR=false
LOG_LEVEL=info
RECONNECT_DELAY=5000
STATUS_REACT=💚
```

------------------------------------------------------------------------

## 📂 Structure du projet

    DEVCADIS/
    │── index.js        # Fichier principal
    │── package.json    # Dépendances et scripts
    │── /commands       # Commandes du bot
    │── /media          # Médias sauvegardés
    │── /sessions       # Sessions WhatsApp
    │── .env            # Variables d'environnement

------------------------------------------------------------------------

## 👨‍💻 Auteur

**RENEGADES_MD / DEVCADIS** développé par
[𝘋𝘌𝘝-𝘙𝘈𝘐𝘡𝘌𝘓]([https://github.com/TON_USER](https://github.com/DEVCADIS/DEVCADIS.git))
