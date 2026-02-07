import pandas as pd
import numpy as np

# Load the cleaned dataset
df = pd.read_csv('dataset_can_2025_FULL_CLEANED.csv')

# 1. Price Distribution (Histogram Data)
counts, bins = np.histogram(df['Prix_Final_MAD'], bins=15)
dist_data = pd.DataFrame({
    'bin_start': bins[:-1],
    'bin_end': bins[1:],
    'count': counts
})
dist_data['label'] = dist_data.apply(lambda x: f"{int(x['bin_start'])}-{int(x['bin_end'])}", axis=1)
dist_data.to_csv('viz_price_distribution.csv', index=False)

# 2. Pricing by Category (Aggregated Stats)
cat_pricing = df.groupby('Categorie')['Prix_Final_MAD'].agg(['min', 'mean', 'median', 'max', 'std']).reset_index()
cat_pricing.to_csv('viz_category_pricing.csv', index=False)

# 3. Morocco Effect (Comparison)
morocco_effect = df.groupby('Effet_Maroc').agg({
    'Prix_Final_MAD': 'mean',
    'Indice_Demande': 'mean'
}).reset_index()
morocco_effect['Effet_Maroc'] = morocco_effect['Effet_Maroc'].map({1: 'Maroc', 0: 'Autres'})
morocco_effect.to_csv('viz_morocco_effect.csv', index=False)

# 4. Venue (City) Performance
venue_stats = df.groupby('Ville').agg({
    'Prix_Final_MAD': 'mean',
    'Indice_Demande': 'mean'
}).reset_index().sort_values(by='Prix_Final_MAD', ascending=False)
venue_stats.to_csv('viz_venue_stats.csv', index=False)

# 5. Correlation Matrix (For Heatmap Components)
cols_for_corr = ['Prix_Final_MAD', 'Indice_Demande', 'Taux_Rareté', 'Score_Visibilite',
                 'Score_Rivalite', 'Valeur_Marchande_Totale_MEUR', 'Index_Stars_Total']
corr_matrix = df[cols_for_corr].corr().round(2)
corr_unstacked = corr_matrix.stack().reset_index()
corr_unstacked.columns = ['var1', 'var2', 'correlation']
corr_unstacked.to_csv('viz_correlation_heatmap.csv', index=False)

# 6. Demand by Day of the Week (Ordered)
day_order = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
day_demand = df.groupby('Jour_Semaine')['Indice_Demande'].mean().reindex(day_order).reset_index()
day_demand.to_csv('viz_day_demand.csv', index=False)

# 7. Sampled Scatter Data (Keeps file size small for web)
scatter_data = df[['Indice_Demande', 'Prix_Final_MAD', 'Categorie', 'Effet_Maroc']].sample(n=min(800, len(df)))
scatter_data.to_csv('viz_scatter_demand_price.csv', index=False)

print("Visualization-ready CSVs have been generated.")