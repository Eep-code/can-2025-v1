import { motion } from "framer-motion";
import { BookOpen, Target, Users, Calendar, CheckCircle2 } from "lucide-react";

export default function Introduction() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Introduction au Projet</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Projet d'analyse de données de la Coupe d'Afrique des Nations 2025 - ISMAGI
        </p>
      </div>

      {/* Context */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-emerald" />
            <h2 className="text-xl font-semibold text-foreground">Contexte</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            La CAN 2025 se déroulera au Maroc, un événement majeur pour le football africain. 
            Ce projet vise à analyser les données relatives aux matchs, stades et billetterie 
            pour en extraire des insights précieux.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-royal" />
            <h2 className="text-xl font-semibold text-foreground">Équipe</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Projet réalisé en groupe dans le cadre de la formation ISMAGI. 
            Chaque membre est responsable d'une tâche spécifique du pipeline 
            de traitement des données.
          </p>
        </motion.div>
      </div>

      {/* Tasks Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-5 w-5 text-gold" />
          <h2 className="text-xl font-semibold text-foreground">Répartition des Tâches</h2>
        </div>

        <div className="grid gap-4">
          {[
            { num: 1, title: "Introduction", desc: "Présentation du projet et du contexte" },
            { num: 2, title: "Exportation", desc: "Exploration des données brutes (Matchs, Stades, Billetterie)" },
            { num: 3, title: "Nettoyage", desc: "Suppression des valeurs manquantes et doublons" },
            { num: 4, title: "Sélection", desc: "Choix des variables pertinentes" },
            { num: 5, title: "Transformations", desc: "Normalisation et encodage des données" },
            { num: 6, title: "Réduction", desc: "Réduction de dimensionnalité (PCA, etc.)" },
            { num: 7, title: "Visualisation", desc: "Création des graphiques avec Recharts" },
            { num: 8, title: "Modélisation IA", desc: "Prédiction des prix avec Machine Learning" },
          ].map((task, index) => (
            <motion.div
              key={task.num}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                {task.num}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{task.title}</h3>
                <p className="text-sm text-muted-foreground">{task.desc}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-muted-foreground/30" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Datasets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold text-foreground mb-4">Jeux de Données</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-emerald/10 border border-emerald/20">
            <h3 className="font-medium text-emerald mb-1">Matchs</h3>
            <p className="text-sm text-muted-foreground">52 matchs avec scores et phases</p>
          </div>
          <div className="p-4 rounded-lg bg-royal/10 border border-royal/20">
            <h3 className="font-medium text-royal mb-1">Stades</h3>
            <p className="text-sm text-muted-foreground">6 stades marocains avec capacités</p>
          </div>
          <div className="p-4 rounded-lg bg-gold/10 border border-gold/20">
            <h3 className="font-medium text-gold mb-1">Billetterie</h3>
            <p className="text-sm text-muted-foreground">Prix par phase et catégorie</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
