# CAN 2025 - Plateforme d'Analyse et de Visualisation (ISMAGI)

Ce projet est une application complète (Full-stack) permettant de scraper, traiter, analyser et visualiser les données de la Coupe d'Afrique des Nations (CAN) 2025. Elle inclut un pipeline de Data Science complet, de l'importation brute à la prédiction par IA.

## 🚀 Fonctionnalités

- **Scraping en temps réel** : Extraction des résultats des matchs depuis le site officiel de la CAF.
- **Pipeline de Prétraitement** : Nettoyage, sélection de caractéristiques, transformations et réduction de dimensionnalité.
- **Visualisations Avancées** : Graphiques interactifs (Recharts) sur les prix, les stades et les performances.
- **IA & Prédiction** : Modèle RandomForest pour prédire les prix des billets en fonction de divers facteurs.

---

## 🛠️ Installation et Lancement

### 1. Cloner le projet
```bash
git clone https://github.com/votre-username/can-2025-v1.git
cd can-2025-v1
```

### 2. Configuration du Backend (Flask)
Le backend gère le scraping, le pipeline de traitement de données et l'IA.

```bash
# Aller dans le dossier backend
cd backend

# Installer les dépendances
pip install flask flask-cors pandas numpy scikit-learn playwright bs4

python -m playwright install

# Lancer le serveur
python app.py
```
*Le serveur backend sera accessible sur : `http://127.0.0.1:5001`*

### 3. Configuration du Frontend (React + Vite)
Le frontend offre une interface moderne et interactive.

```bash
# Revenir à la racine du projet
cd ..

# Installer les dépendances (npm ou bun)
npm install

# Lancer l'application en mode développement
npm run dev
```
*L'application sera accessible sur : `http://localhost:5173` (ou l'URL indiquée dans votre terminal)*

---

## 📁 Structure du Projet

- `/src` : Code source React (Pages, Composants, Hooks).
- `/backend` : Serveur Flask, scripts de scraping et pipeline de Data Science.
- `/public/data` : Stockage des fichiers CSV générés et utilisés par l'application.

## 👥 Équipe
Développé dans le cadre du projet **Can 2025 - ISMAGI 2025**.
