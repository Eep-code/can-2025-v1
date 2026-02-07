import { motion } from "framer-motion";
import { Trophy, Building2, Ticket, Users, MapPin, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { StatCard } from "@/components/ui/StatCard";

const features = [
  {
    title: "Matchs",
    description: "Explorez tous les matchs de la CAN 2025, scores et statistiques",
    icon: Trophy,
    href: "/matches",
    variant: "emerald" as const,
  },
  {
    title: "Stades",
    description: "Découvrez les 6 stades marocains qui accueilleront la compétition",
    icon: Building2,
    href: "/stadiums",
    variant: "royal" as const,
  },
  {
    title: "Billetterie",
    description: "Analysez les prix et catégories de billets par phase",
    icon: Ticket,
    href: "/ticketing",
    variant: "gold" as const,
  },
];

const stats = [
  { title: "Total Matchs", value: "52", subtitle: "Phase de groupes à finale", icon: Calendar, variant: "emerald" as const },
  { title: "Capacité Max", value: "75,000", subtitle: "Grand Stade de Tanger", icon: MapPin, variant: "royal" as const },
  { title: "Prix Moyen", value: "450 MAD", subtitle: "Toutes catégories", icon: DollarSign, variant: "gold" as const },
  { title: "Équipes", value: "24", subtitle: "Nations africaines", icon: Users, variant: "emerald" as const },
];

export default function Index() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl hero-pattern p-8 lg:p-12"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-royal/10 to-transparent rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 text-xs font-semibold bg-primary/20 text-primary rounded-full">
              Projet ISMAGI 2025
            </span>
            <span className="px-3 py-1 text-xs font-semibold bg-royal/20 text-royal rounded-full">
              Maroc 🇲🇦
            </span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-4">
            Analyse de Données
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald via-gold to-royal">
              CAN 2025
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mb-8">
            Plateforme complète d'analyse des données de la Coupe d'Afrique des Nations 2025. 
            Explorez les matchs, stades et statistiques de billetterie.
          </p>

          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a
                href="/visualization"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald to-emerald-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald/30 transition-all"
              >
                <TrendingUp className="h-5 w-5" />
                Voir les Visualisations
              </a>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a
                href="/introduction"
                className="inline-flex items-center gap-2 px-6 py-3 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 transition-all"
              >
                En savoir plus
              </a>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Feature Cards */}
      <section>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl font-bold text-foreground mb-6"
        >
          Explorer les Données
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} delay={0.3 + index * 0.1} />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-2xl font-bold text-foreground mb-6"
        >
          Aperçu Rapide
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={stat.title} {...stat} delay={0.6 + index * 0.1} />
          ))}
        </div>
      </section>

      {/* Quick Info */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="glass-card p-6 lg:p-8"
      >
        <h3 className="text-xl font-bold text-foreground mb-4">À propos du Projet</h3>
        <div className="grid md:grid-cols-2 gap-6 text-muted-foreground">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Objectifs</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald" />
                Visualisation des données avec Recharts
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald" />
                Nettoyage et préparation des données
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald" />
                Modélisation et prédiction IA
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Technologies</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-royal" />
                React + TypeScript (Frontend)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-royal" />
                Flask + Python (Backend)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-royal" />
                Pandas, Scikit-learn (Data Science)
              </li>
            </ul>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
