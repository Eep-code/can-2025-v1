import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder, OneHotEncoder
from sklearn.feature_selection import SequentialFeatureSelector
from sklearn.linear_model import LinearRegression
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE, LocallyLinearEmbedding
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import os
import json

class PreprocessingPipeline:
    def __init__(self, input_path, output_path):
        self.input_path = input_path
        self.output_path = output_path
        self.df = None
        self.log = []
        self.model = None
        self.features = []
        
        # État du workflow
        self.steps_completed = {
            "import": False,
            "cleaning": False,
            "selection": False,
            "transformation": False,
            "reduction": False,
            "modeling": False
        }

    def get_workflow_status(self):
        return self.steps_completed

    def reset_workflow(self):
        """Réinitialise tout le workflow"""
        self.steps_completed = {
            "import": False,
            "cleaning": False,
            "selection": False,
            "transformation": False,
            "reduction": False,
            "modeling": False
        }
        self.log = ["Workflow réinitialisé."]
        # On pourrait aussi supprimer le fichier output_path si on veut un reset physique
        if os.path.exists(self.output_path):
            try:
                # Optionnel: On ne le supprime pas forcément pour éviter les erreurs de lecture, 
                # mais on peut le vider ou laisser les étapes le réécrire.
                pass
            except Exception:
                pass
        return {"message": "Workflow réinitialisé avec succès", "status": self.steps_completed}

    def import_dataset(self):
        """Étape 1: Importation du dataset initial"""
        self.log = []
        if os.path.exists(self.input_path):
            self.df = pd.read_csv(self.input_path)
            self.steps_completed["import"] = True
            self.log.append(f"Dataset importé avec succès: {self.input_path}")
            return {
                "message": "Importation réussie",
                "logs": self.log,
                "shape": self.df.shape,
                "columns": list(self.df.columns),
                "preview": self.df.head().to_dict(orient='records')
            }
        else:
            return {"error": f"Fichier non trouvé: {self.input_path}"}

    def load_data(self):
        if os.path.exists(self.input_path):
            self.df = pd.read_csv(self.input_path)
            self.log.append(f"Chargement des données depuis {self.input_path}")
            return True
        else:
            self.log.append(f"Erreur: Le fichier {self.input_path} n'existe pas.")
            return False
