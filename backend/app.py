"""
Backend Flask pour le projet CAN 2025 - ISMAGI
================================================
INSTRUCTIONS:
1. Installez les dépendances: pip install flask flask-cors pandas numpy scikit-learn playwright flask_swagger_ui bs4
1.1 executer la commande : python -m playwright install
2. Lancez le serveur: python app.py
3. Le serveur sera accessible sur http://localhost:5001

Chaque camarade doit compléter sa fonction correspondante.
"""
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
import pandas as pd
import numpy as np
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from datetime import datetime
import csv

import os
from preprocessing import PreprocessingPipeline

URL = "https://www.cafonline.com/fr/can2025/calendrier-resultats/"


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Permet toutes les origines pour le développement

# Configuration Swagger
SWAGGER_URL = '/api/docs'  # URL pour accéder à l'interface Swagger
API_URL = '/static/swagger.json'  # URL vers le fichier de spec

swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "CAN 2025 Analysis API"
    }
)

app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

@app.route('/static/swagger.json')
def send_swagger_spec():
    return send_from_directory(os.path.dirname(os.path.abspath(__file__)), 'swagger.json')

# Chemin vers le dossier public/data du frontend
DATA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "data")
if not os.path.exists(DATA_PATH):
    os.makedirs(DATA_PATH)

# Suffixe pour les fichiers CSV
DATA_PATH = DATA_PATH + "/"

def load_dataset():
    """Charge le dataset principal pour les visualisations"""
    try:
        # On cherche d'abord dans public/data, puis dans le dossier courant (backend)
        search_paths = [
            f"{DATA_PATH}dataset_can_2025_FULL_CLEANED.csv",
            f"{DATA_PATH}dataset_can_2025_realiste.csv",
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "dataset_can_2025_FULL_CLEANED.csv"),
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "dataset_can_2025_realiste.csv")
        ]
        
        for path in search_paths:
            if os.path.exists(path):
                print(f"✅ Dataset chargé depuis: {path}")
                return pd.read_csv(path)
        
        print("❌ Dataset non trouvé dans les chemins spécifiés")
        return None
    except Exception as e:
        print(f"❌ Erreur lors du chargement du dataset: {str(e)}")
        return None


# ============================================
# TÂCHE 2: EXPORTATION (SCRAPING)
# ============================================
@app.route('/api/scrape/matches', methods=['POST'])
def scrape_matches():
    """Scrape real CAN 2025 matches and save to CSV"""

    try:
        html = ""
        with sync_playwright() as p:
            # 1. Launch browser with specific configurations to avoid detection
            browser = p.chromium.launch(headless=True)
            
            # Use a real browser User-Agent so the site doesn't block the request
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
            )
            
            page = context.new_page()
            
            # 2. Navigate and wait for the data to actually load
            # 'networkidle' waits until there are no more network requests (API calls finished)
            page.goto(URL, wait_until="networkidle", timeout=60000)
            
            # Wait for a specific element that contains actual team names
            page.wait_for_selector(".Opta-TeamName", timeout=15000)
            
            html = page.content()
            browser.close()

        # 3. Parse HTML
        soup = BeautifulSoup(html, "html.parser")
        
        # We use a class selector instead of #Opta_0 in case the ID increments
        fixtures = soup.find_all(class_="Opta-fixture")

        if not fixtures:
            return jsonify({
                "error": "Scraper found 0 fixtures. The site structure might have changed or blocked the request."
            }), 404

        matches = []

        def safe_text(el):
            return el.get_text(strip=True) if el else None

        # 4. Extract + map to model
        for f in fixtures:
            date_ms = f.get("data-date")
            
            # Scores
            home_score_el = f.select_one(".Opta-Score.Opta-Home .Opta-Team-Score")
            away_score_el = f.select_one(".Opta-Score.Opta-Away .Opta-Team-Score")
            
            home_score = safe_text(home_score_el)
            away_score = safe_text(away_score_el)

            # Draw Logic
            is_draw = False
            if home_score is not None and away_score is not None:
                is_draw = (home_score == away_score)

            match = {
                "match_id": f.get("data-match"),
                "date": datetime.fromtimestamp(int(date_ms) / 1000).isoformat() if date_ms else None,
                "status": safe_text(f.select_one("abbr")) or "Scheduled",
                "stage": f.get("data-competition_stage") or "Group",

                "home_team": safe_text(f.select_one(".Opta-Home .Opta-TeamName")),
                "away_team": safe_text(f.select_one(".Opta-Away .Opta-TeamName")),

                "home_score": int(home_score) if home_score and home_score.isdigit() else None,
                "away_score": int(away_score) if away_score and away_score.isdigit() else None,

                "winner_side": f.get("data-match_winner_side"),
                "is_draw": is_draw,
                "stadium": None
            }
            matches.append(match)

        # 5. Save to CSV
        df_matches = pd.DataFrame(matches)
        csv_filename = os.path.join(DATA_PATH, "CAN_2025_Matches.csv")
        df_matches.to_csv(csv_filename, index=False)

        return jsonify({
            "message": f"Successfully extracted {len(matches)} matches",
            "data": matches
        })

    except Exception as e:
        print(f"Scraping Error: {str(e)}") # Visible in your server logs
        return jsonify({"error": str(e)}), 500

# ==========================================
#  TÂCHES PRÉTRAITEMENT (3, 4, 5, 6)
# ==========================================

# Initialisation du pipeline
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_CSV = os.path.join(BACKEND_DIR, "dataset_can_2025_realiste.csv")
OUTPUT_CSV = os.path.join(DATA_PATH, "dataset_can_2025_FULL_CLEANED.csv")

pipeline = PreprocessingPipeline(INPUT_CSV, OUTPUT_CSV)

@app.route('/api/workflow/status', methods=['GET'])
def workflow_status():
    """Retourne l'état d'avancement du workflow"""
    return jsonify(pipeline.get_workflow_status())

@app.route('/api/scrape/stadiums', methods=['POST'])
def scrape_stadiums():
    """Simule le scraping des stades et sauvegarde en CSV"""
    try:
        stadiums_data = {
            "name": [
                "Prince Moulay Abdellah Stadium", "Grand Stade de Tanger", "Stade Mohammed V", 
                "Adrar Stadium", "Marrakech Stadium", "Fez Stadium"
            ],
            "city": ["Rabat", "Tangier", "Casablanca", "Agadir", "Marrakech", "Fez"],
            "capacity": [68700, 75000, 45000, 45480, 45000, 45000],
            "pitch_surface": ["Hybrid Grass", "Hybrid Grass", "Hybrid Grass", "Natural Grass", "Natural Grass", "Natural Grass"],
            "pitch_type": ["Natural reinforced", "Natural reinforced", "Natural reinforced", "Natural", "Natural", "Natural"]
        }
        df_stadiums = pd.DataFrame(stadiums_data)
        df_stadiums.to_csv(f"{DATA_PATH}CAN_2025_StadiumTerrain.csv", index=False)
        return jsonify({
            "message": "Données des stades extraites avec succès",
            "data": df_stadiums.to_dict(orient='records')
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/scrape/tickets', methods=['POST'])
def scrape_tickets():
    """Simule le scraping des tickets et sauvegarde en CSV"""
    try:
        stages = ["Group Stage", "Round of 16", "Quarter-final", "Semi-final", "Final"]
        categories = ["Category 1", "Category 2", "Category 3"]
        tickets_rows = []
        base_prices = {
            "Group Stage": 100,
            "Round of 16": 200,
            "Quarter-final": 350,
            "Semi-final": 600,
            "Final": 1200
        }
        for stage in stages:
            for cat in categories:
                multiplier = 1.0 if cat == "Category 3" else (1.5 if cat == "Category 2" else 2.5)
                price_min = base_prices[stage] * multiplier
                tickets_rows.append({
                    "stage": stage,
                    "category": cat,
                    "price_min_MAD": int(price_min),
                    "price_max_MAD": int(price_min * 1.2),
                    "availability": "High" if stage == "Group Stage" else "Limited",
                    "last_updated": "2026-02-07"
                })
        df_tickets = pd.DataFrame(tickets_rows)
        df_tickets.to_csv(f"{DATA_PATH}CAN_2025_Tickets.csv", index=False)
        return jsonify({
            "message": "Données des tickets extraites avec succès",
            "data": df_tickets.to_dict(orient='records')
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================



# ============================================



# ============================================



# ============================================






# ============================================
# TÂCHE 8: VISUALISATIONS AVANCÉES (GÉNÉRATION CSV)
# ============================================

@app.route('/api/viz/generate-all', methods=['POST'])
def viz_generate_all():
    """Génère tous les fichiers CSV de visualisation à partir du dataset nettoyé"""
    try:
        df = load_dataset()
        if df is None:
            return jsonify({"error": "Dataset non disponible pour la génération"}), 404
        
        results = []

        # 1. Price Distribution
        if 'Prix_Final_MAD' in df.columns:
            counts, bins = np.histogram(df['Prix_Final_MAD'], bins=15)
            dist_data = []
            for i in range(len(counts)):
                dist_data.append({
                    "label": f"{int(bins[i])}-{int(bins[i+1])}",
                    "count": int(counts[i])
                })
            pd.DataFrame(dist_data).to_csv(f"{DATA_PATH}viz_price_distribution.csv", index=False)
            results.append("viz_price_distribution.csv")

        # 2. Category Pricing
        if 'Categorie' in df.columns:
            cat_pricing = df.groupby('Categorie')['Prix_Final_MAD'].agg(['min', 'mean', 'median', 'max']).reset_index()
            cat_pricing.to_csv(f"{DATA_PATH}viz_category_pricing.csv", index=False)
            results.append("viz_category_pricing.csv")

        # 3. Morocco Effect
        if 'Effet_Maroc' in df.columns:
            morocco_effect = df.groupby('Effet_Maroc').agg({
                'Prix_Final_MAD': 'mean',
                'Indice_Demande': 'mean'
            }).reset_index()
            morocco_effect['Effet_Maroc'] = morocco_effect['Effet_Maroc'].map({1: 'Maroc', 0: 'Autres'})
            morocco_effect.to_csv(f"{DATA_PATH}viz_morocco_effect.csv", index=False)
            results.append("viz_morocco_effect.csv")

        # 4. Venue Stats
        if 'Ville' in df.columns:
            venue_stats = df.groupby('Ville').agg({
                'Prix_Final_MAD': 'mean',
                'Indice_Demande': 'mean'
            }).reset_index().sort_values(by='Prix_Final_MAD', ascending=False)
            venue_stats.to_csv(f"{DATA_PATH}viz_venue_stats.csv", index=False)
            results.append("viz_venue_stats.csv")

        # 5. Day Demand
        if 'Jour_Semaine' in df.columns:
            day_order = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
            day_demand = df.groupby('Jour_Semaine')['Indice_Demande'].mean()
            existing_days = [day for day in day_order if day in day_demand.index]
            day_demand = day_demand.reindex(existing_days).reset_index()
            day_demand.to_csv(f"{DATA_PATH}viz_day_demand.csv", index=False)
            results.append("viz_day_demand.csv")

        return jsonify({
            "status": "success",
            "message": f"{len(results)} fichiers de visualisation générés avec succès",
            "files": results
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/viz/price-distribution', methods=['GET'])
def viz_price_distribution():
    # Gardé pour compatibilité, mais redirige vers le CSV si possible
    df = load_dataset()
    if df is None or 'Prix_Final_MAD' not in df.columns:
        return jsonify({"error": "Dataset non disponible"}), 404
    
    counts, bins = np.histogram(df['Prix_Final_MAD'], bins=15)
    dist_data = []
    for i in range(len(counts)):
        dist_data.append({
            "label": f"{int(bins[i])}-{int(bins[i+1])}",
            "count": int(counts[i])
        })
    return jsonify(dist_data)

@app.route('/api/viz/category-pricing', methods=['GET'])
def viz_category_pricing():
    df = load_dataset()
    if df is None or 'Categorie' not in df.columns:
        return jsonify({"error": "Dataset non disponible"}), 404
    
    cat_pricing = df.groupby('Categorie')['Prix_Final_MAD'].agg(['min', 'mean', 'median', 'max']).reset_index()
    return jsonify(cat_pricing.to_dict(orient='records'))

@app.route('/api/viz/morocco-effect', methods=['GET'])
def viz_morocco_effect():
    df = load_dataset()
    if df is None or 'Effet_Maroc' not in df.columns:
        return jsonify({"error": "Dataset non disponible"}), 404
    
    morocco_effect = df.groupby('Effet_Maroc').agg({
        'Prix_Final_MAD': 'mean',
        'Indice_Demande': 'mean'
    }).reset_index()
    morocco_effect['Effet_Maroc'] = morocco_effect['Effet_Maroc'].map({1: 'Maroc', 0: 'Autres'})
    return jsonify(morocco_effect.to_dict(orient='records'))

@app.route('/api/viz/venue-stats', methods=['GET'])
def viz_venue_stats():
    df = load_dataset()
    if df is None or 'Ville' not in df.columns:
        return jsonify({"error": "Dataset non disponible"}), 404
    
    venue_stats = df.groupby('Ville').agg({
        'Prix_Final_MAD': 'mean',
        'Indice_Demande': 'mean'
    }).reset_index().sort_values(by='Prix_Final_MAD', ascending=False)
    return jsonify(venue_stats.to_dict(orient='records'))

@app.route('/api/viz/correlation', methods=['GET'])
def viz_correlation():
    df = load_dataset()
    if df is None:
        return jsonify({"error": "Dataset non disponible"}), 404
    
    cols = ['Prix_Final_MAD', 'Indice_Demande', 'Taux_Rareté', 'Score_Visibilite',
            'Score_Rivalite', 'Valeur_Marchande_Totale_MEUR', 'Index_Stars_Total']
    available_cols = [c for c in cols if c in df.columns]
    
    if not available_cols:
        return jsonify({"error": "Colonnes non disponibles"}), 404
        
    corr_matrix = df[available_cols].corr().round(2)
    corr_unstacked = corr_matrix.stack().reset_index()
    corr_unstacked.columns = ['var1', 'var2', 'correlation']
    return jsonify(corr_unstacked.to_dict(orient='records'))

@app.route('/api/viz/day-demand', methods=['GET'])
def viz_day_demand():
    df = load_dataset()
    if df is None or 'Jour_Semaine' not in df.columns:
        return jsonify({"error": "Dataset non disponible"}), 404
    
    day_order = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
    day_demand = df.groupby('Jour_Semaine')['Indice_Demande'].mean()
    # On filtre les jours qui existent dans le dataset
    existing_days = [day for day in day_order if day in day_demand.index]
    day_demand = day_demand.reindex(existing_days).reset_index()
    return jsonify(day_demand.to_dict(orient='records'))

@app.route('/api/viz/scatter', methods=['GET'])
def viz_scatter():
    df = load_dataset()
    if df is None:
        return jsonify({"error": "Dataset non disponible"}), 404
    
    cols = ['Indice_Demande', 'Prix_Final_MAD', 'Categorie', 'Effet_Maroc']
    available_cols = [c for c in cols if c in df.columns]
    
    scatter_data = df[available_cols].sample(n=min(500, len(df)))
    return jsonify(scatter_data.to_dict(orient='records'))


# ============================================
# ROUTES UTILITAIRES
# ============================================
@app.route('/api/health', methods=['GET'])
def health_check():
    """Vérifie que le serveur est en ligne"""
    return jsonify({"status": "ok", "message": "Serveur Flask CAN 2025 opérationnel"})


@app.route('/api/data/summary', methods=['GET'])
def data_summary():
    """Retourne un résumé des données disponibles"""
    # Note: load_data() n'est pas défini ici, on utilise load_dataset() ou des lectures directes
    try:
        summary = {
            "matches": 0,
            "stadiums": 0,
            "tickets": 0,
            "dataset": 0
        }
        
        if os.path.exists(f"{DATA_PATH}CAN_2025_Matches.csv"):
            summary["matches"] = len(pd.read_csv(f"{DATA_PATH}CAN_2025_Matches.csv"))
        if os.path.exists(f"{DATA_PATH}CAN_2025_StadiumTerrain.csv"):
            summary["stadiums"] = len(pd.read_csv(f"{DATA_PATH}CAN_2025_StadiumTerrain.csv"))
        if os.path.exists(f"{DATA_PATH}CAN_2025_Tickets.csv"):
            summary["tickets"] = len(pd.read_csv(f"{DATA_PATH}CAN_2025_Tickets.csv"))
            
        df = load_dataset()
        if df is not None:
            summary["dataset"] = len(df)
            
        return jsonify({"datasets": summary})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/workflow/reset', methods=['POST'])
def reset_workflow():
    """Supprime les fichiers générés pour réinitialiser le workflow (total ou par page)"""
    try:
        # Réinitialiser aussi le statut du pipeline Python
        pipeline.reset_workflow()
        
        # Récupérer le type de données à réinitialiser depuis le corps de la requête
        data = request.get_json(silent=True) or {}
        reset_type = data.get('type', 'all')
        
        files_mapping = {
            'matches': [f"{DATA_PATH}CAN_2025_Matches.csv"],
            'stadiums': [f"{DATA_PATH}CAN_2025_StadiumTerrain.csv"],
            'tickets': [f"{DATA_PATH}CAN_2025_Tickets.csv"],
            'preprocessing': [f"{DATA_PATH}dataset_can_2025_FULL_CLEANED.csv"],
            'viz': [
                f"{DATA_PATH}viz_price_distribution.csv",
                f"{DATA_PATH}viz_category_pricing.csv",
                f"{DATA_PATH}viz_morocco_effect.csv",
                f"{DATA_PATH}viz_venue_stats.csv",
                f"{DATA_PATH}viz_day_demand.csv"
            ]
        }
        
        files_to_delete = []
        if reset_type == 'all':
            for paths in files_mapping.values():
                files_to_delete.extend(paths)
        elif reset_type in files_mapping:
            files_to_delete = files_mapping[reset_type]
        else:
            return jsonify({"error": f"Type de réinitialisation '{reset_type}' non supporté"}), 400
            
        deleted_count = 0
        for file_path in files_to_delete:
            if os.path.exists(file_path):
                os.remove(file_path)
                deleted_count += 1
                
        return jsonify({
            "status": "success", 
            "message": f"Réinitialisation ({reset_type}) effectuée. {deleted_count} fichiers supprimés.",
            "deleted_files": deleted_count
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/task_import', methods=['POST'])
def task_import():
    """Étape 1: Importation du dataset (Legacy/Internal)"""
    try:
        result = pipeline.import_dataset()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/upload_dataset', methods=['POST'])
def upload_dataset():
    """Endpoint pour permettre à l'utilisateur d'uploader son propre dataset"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "Aucun fichier envoyé"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "Nom de fichier vide"}), 400
        
        if file and file.filename.endswith('.csv'):
            # On sauvegarde le fichier uploade à la place du input_csv attendu par le pipeline
            file.save(INPUT_CSV)
            
            # On déclenche l'importation dans le pipeline
            result = pipeline.import_dataset()
            return jsonify({
                "message": "Fichier uploadé et importé avec succès",
                "filename": file.filename,
                "pipeline_result": result
            })
        else:
            return jsonify({"error": "Format de fichier non supporté. Veuillez envoyer un CSV."}), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    print("=" * 50)
    print("🏆 Serveur Flask - CAN 2025 Analysis")
    print("=" * 50)
    print("📍 URL: http://127.0.0.1:5001")
    print("📊 Health check: http://127.0.0.1:5001/api/health")
    print("=" * 50)
    app.run(debug=True, host='127.0.0.1', port=5001)
