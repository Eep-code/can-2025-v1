import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, PieChart, TrendingUp, Activity, Download, MapPin, Calendar, RotateCcw } from "lucide-react";
import { fetchCsvData } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
} from "recharts";

const COLORS = ["hsl(160, 84%, 39%)", "hsl(45, 93%, 47%)", "hsl(0, 72%, 51%)", "hsl(220, 70%, 50%)", "hsl(280, 60%, 50%)", "hsl(340, 75%, 55%)"];

export default function Visualization() {
  const [matches, setMatches] = useState<any[]>([]);
  const [stadiums, setStadiums] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  
  // Advanced Viz States
  const [priceDist, setPriceDist] = useState<any[]>([]);
  const [catPricing, setCatPricing] = useState<any[]>([]);
  const [moroccoEffect, setMoroccoEffect] = useState<any[]>([]);
  const [venueStats, setVenueStats] = useState<any[]>([]);
  const [dayDemand, setDayDemand] = useState<any[]>([]);
  
  
  const [loading, setLoading] = useState(false);
  const [isImported, setIsImported] = useState(false);
  const { toast } = useToast();

  const checkWorkflowStatus = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5001/api/workflow/status");
      if (response.ok) {
        const status = await response.json();
        setIsImported(status.import);
      }
    } catch (err) {
      console.error("Error checking workflow status:", err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await checkWorkflowStatus();
      const [matchesData, stadiumsData, ticketsData] = await Promise.all([
        fetchCsvData("/data/CAN_2025_Matches.csv"),
        fetchCsvData("/data/CAN_2025_StadiumTerrain.csv"),
        fetchCsvData("/data/CAN_2025_Tickets.csv")
      ]);

      if (matchesData) setMatches(matchesData);
      if (stadiumsData) setStadiums(stadiumsData);
      if (ticketsData) setTickets(ticketsData);

      // Fetch advanced viz data from generated CSV files
      const [dist, cat, morocco, venue, day] = await Promise.all([
        fetchCsvData("/data/viz_price_distribution.csv"),
        fetchCsvData("/data/viz_category_pricing.csv"),
        fetchCsvData("/data/viz_morocco_effect.csv"),
        fetchCsvData("/data/viz_venue_stats.csv"),
        fetchCsvData("/data/viz_day_demand.csv")
      ]);

      setPriceDist(dist || []);
      setCatPricing(cat || []);
      setMoroccoEffect(morocco || []);
      setVenueStats(venue || []);
      setDayDemand(day || []);

    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleScrape = async () => {
    setLoading(true);
    try {
      const [resMatches, resStadiums, resTickets] = await Promise.all([
        fetch("http://127.0.0.1:5001/api/scrape/matches", { method: "POST" }),
        fetch("http://127.0.0.1:5001/api/scrape/stadiums", { method: "POST" }),
        fetch("http://127.0.0.1:5001/api/scrape/tickets", { method: "POST" })
      ]);

      const [dataMatches, dataStadiums, dataTickets] = await Promise.all([
        resMatches.json(),
        resStadiums.json(),
        resTickets.json()
      ]);

      if (resMatches.ok && resStadiums.ok && resTickets.ok) {
        // Now trigger the generation of visualization CSVs
        const resViz = await fetch("http://127.0.0.1:5001/api/viz/generate-all", { method: "POST" });
        
        if (resViz.ok) {
          // Small delay to allow filesystem to sync before fetching CSVs
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Refresh all data from the newly generated CSVs
          await loadAllData();
          
          toast({
            title: "Succès",
            description: "Données extraites et fichiers de visualisation générés",
          });
        } else {
          throw new Error("L'extraction a réussi mais la génération des visualisations a échoué");
        }
      } else {
        throw new Error("Certaines extractions ont échoué");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de contacter le serveur de scraping",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetWorkflow = async () => {
    if (!confirm("Êtes-vous sûr de vouloir réinitialiser toutes les données de visualisation ?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5001/api/workflow/reset", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "viz" })
      });
      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Données Réinitialisées",
          description: data.message,
        });
        // Clear local state
        setMatches([]);
        setStadiums([]);
        setTickets([]);
        setPriceDist([]);
        setCatPricing([]);
        setMoroccoEffect([]);
        setVenueStats([]);
        setDayDemand([]);
      } else {
        throw new Error(data.error || "La réinitialisation a échoué");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const hasData = isImported && (matches.length > 0 || stadiums.length > 0 || tickets.length > 0);

  // Real data calculations
  const stadiumChartData = useMemo(() => 
    stadiums
      .filter(s => s && s.name)
      .map(s => ({
        name: s.name.replace(" Stadium", ""),
        capacity: parseInt(s.capacity) || 0
      })), [stadiums]
  );

  const matchResultsData = useMemo(() => {
    if (matches.length === 0) return [];
    const wins = matches.filter(m => m && m.winner_side === "home").length;
    const draws = matches.filter(m => m && (m.is_draw === "True" || m.is_draw === "true" || m.is_draw === true)).length;
    const awayWins = matches.filter(m => m && m.winner_side === "away").length;
    
    return [
      { name: "Victoire Dom.", value: wins, color: "hsl(160, 84%, 39%)" },
      { name: "Match Nul", value: draws, color: "hsl(45, 93%, 47%)" },
      { name: "Victoire Ext.", value: awayWins, color: "hsl(0, 72%, 51%)" },
    ].filter(d => d.value > 0);
  }, [matches]);

  const ticketPricesData = useMemo(() => {
    const stages = ["Group Stage", "Round of 16", "Quarter-final", "Semi-final", "Final"];
    return stages.map(stage => {
      const stageTickets = tickets.filter(t => t && t.stage === stage);
      return {
        stage: stage.replace(" Stage", "").replace("-final", ""),
        cat1: parseFloat(stageTickets.find(t => t.category === "Category 1")?.price_min_MAD || "0"),
        cat2: parseFloat(stageTickets.find(t => t.category === "Category 2")?.price_min_MAD || "0"),
        cat3: parseFloat(stageTickets.find(t => t.category === "Category 3")?.price_min_MAD || "0"),
      };
    }).filter(d => d.cat1 > 0);
  }, [tickets]);

  const goalsData = useMemo(() => {
    const phases = ["Group", "Round of 16", "Quarter-final", "Semi-final", "Final"];
    return phases.map(phase => {
      const phaseMatches = matches.filter(m => m && m.stage === phase);
      const goals = phaseMatches.reduce((sum, m) => sum + parseInt(m.home_score || 0) + parseInt(m.away_score || 0), 0);
      return {
        phase,
        goals,
        matches: phaseMatches.length
      };
    }).filter(d => d.matches > 0);
  }, [matches]);

  const totalGoals = matches.reduce((sum, m) => sum + parseInt(m.home_score || 0) + parseInt(m.away_score || 0), 0);
  const avgGoals = matches.length > 0 ? (totalGoals / matches.length).toFixed(2) : 0;
  const totalCapacity = stadiums.reduce((sum, s) => sum + parseInt(s.capacity || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="glass-card p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Visualisation des Données</h1>
              <p className="text-muted-foreground">
                Exploration visuelle des données réelles CAN 2025
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleResetWorkflow} 
              disabled={loading}
              variant="outline"
              className="border-destructive/20 hover:bg-destructive/10 text-destructive gap-2"
            >
              <RotateCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Réinitialiser
            </Button>
            <Button 
              onClick={handleScrape} 
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-white gap-2"
            >
              <Download className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Extraction..." : "Actualiser toutes les données"}
            </Button>
          </div>
        </div>
      </div>

      {hasData ? (
        <>
          {/* Section 1: Données de Base */}
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Analyses de la Compétition</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            {/* Stadium Capacities */}
            {stadiumChartData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="h-5 w-5 text-emerald" />
                  <h3 className="font-semibold text-foreground">Capacité des Stades</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stadiumChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 18%)" />
                    <XAxis dataKey="name" stroke="hsl(215, 20%, 65%)" fontSize={10} interval={0} angle={-15} textAnchor="end" height={60} />
                    <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222, 47%, 8%)",
                        border: "1px solid hsl(222, 47%, 18%)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="capacity" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Match Results Distribution */}
            {matchResultsData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <PieChart className="h-5 w-5 text-royal" />
                  <h3 className="font-semibold text-foreground">Répartition des Résultats</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={matchResultsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {matchResultsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222, 47%, 8%)",
                        border: "1px solid hsl(222, 47%, 18%)",
                        borderRadius: "8px",
                      }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>

          {/* Section 2: Analyses IA / Cleaned Data */}
          {(priceDist.length > 0 || moroccoEffect.length > 0) && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-gold" />
                <h2 className="text-xl font-bold">Analyses Avancées de Billetterie</h2>
              </div>
              <div className="grid lg:grid-cols-2 gap-6 mb-12">
                {/* Price Distribution */}
                {priceDist.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <BarChart3 className="h-5 w-5 text-emerald" />
                      <h3 className="font-semibold text-foreground">Distribution des Prix (MAD)</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={priceDist}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 18%)" />
                        <XAxis dataKey="label" stroke="hsl(215, 20%, 65%)" fontSize={10} interval={0} angle={-45} textAnchor="end" height={60} />
                        <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(222, 47%, 8%)",
                            border: "1px solid hsl(222, 47%, 18%)",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}

                {/* Morocco Effect */}
                {moroccoEffect.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <TrendingUp className="h-5 w-5 text-gold" />
                      <h3 className="font-semibold text-foreground">Effet Maroc sur les Prix & Demande</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={moroccoEffect}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 18%)" />
                        <XAxis dataKey="Effet_Maroc" stroke="hsl(215, 20%, 65%)" fontSize={12} />
                        <YAxis yAxisId="left" orientation="left" stroke="hsl(160, 84%, 39%)" />
                        <YAxis yAxisId="right" orientation="right" stroke="hsl(45, 93%, 47%)" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(222, 47%, 8%)",
                            border: "1px solid hsl(222, 47%, 18%)",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="Prix_Final_MAD" name="Prix Moyen (MAD)" fill="hsl(160, 84%, 39%)" />
                        <Bar yAxisId="right" dataKey="Indice_Demande" name="Indice Demande" fill="hsl(45, 93%, 47%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}

                {/* Venue Stats */}
                {venueStats.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <MapPin className="h-5 w-5 text-royal" />
                      <h3 className="font-semibold text-foreground">Performance par Ville</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={venueStats} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 18%)" />
                        <XAxis type="number" stroke="hsl(215, 20%, 65%)" fontSize={12} />
                        <YAxis dataKey="Ville" type="category" stroke="hsl(215, 20%, 65%)" fontSize={12} width={100} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(222, 47%, 8%)",
                            border: "1px solid hsl(222, 47%, 18%)",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="Prix_Final_MAD" name="Prix Moyen" fill="hsl(220, 70%, 50%)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}

                {/* Day Demand */}
                {dayDemand.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <Calendar className="h-5 w-5 text-emerald" />
                      <h3 className="font-semibold text-foreground">Demande par Jour de la Semaine</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dayDemand}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 18%)" />
                        <XAxis dataKey="Jour_Semaine" stroke="hsl(215, 20%, 65%)" fontSize={12} />
                        <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(222, 47%, 8%)",
                            border: "1px solid hsl(222, 47%, 18%)",
                            borderRadius: "8px",
                          }}
                        />
                        <Line type="monotone" dataKey="Indice_Demande" name="Indice Demande" stroke="hsl(160, 84%, 39%)" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}
              </div>
            </>
          )}

          {/* Section 3: Prix Standard & Buts */}
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-royal" />
            <h2 className="text-xl font-bold">Évolution & Tendances</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Ticket Prices by Phase */}
            {ticketPricesData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="h-5 w-5 text-gold" />
                  <h3 className="font-semibold text-foreground">Évolution des Prix Standards (MAD)</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={ticketPricesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 18%)" />
                    <XAxis dataKey="stage" stroke="hsl(215, 20%, 65%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222, 47%, 8%)",
                        border: "1px solid hsl(222, 47%, 18%)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="cat1"
                      name="Cat. 1"
                      stroke="hsl(160, 84%, 39%)"
                      fill="hsl(160, 84%, 39%)"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="cat2"
                      name="Cat. 2"
                      stroke="hsl(45, 93%, 47%)"
                      fill="hsl(45, 93%, 47%)"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="cat3"
                      name="Cat. 3"
                      stroke="hsl(0, 72%, 51%)"
                      fill="hsl(0, 72%, 51%)"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Goals per Phase */}
            {goalsData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Buts par Phase</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={goalsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 18%)" />
                    <XAxis dataKey="phase" stroke="hsl(215, 20%, 65%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222, 47%, 8%)",
                        border: "1px solid hsl(222, 47%, 18%)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="goals"
                      name="Buts"
                      stroke="hsl(160, 84%, 39%)"
                      strokeWidth={3}
                      dot={{ fill: "hsl(160, 84%, 39%)", strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="matches"
                      name="Matchs"
                      stroke="hsl(45, 93%, 47%)"
                      strokeWidth={3}
                      dot={{ fill: "hsl(45, 93%, 47%)", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>

          {/* Summary Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6"
          >
            <h3 className="font-semibold text-foreground mb-4">Résumé Statistique</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-emerald/10 text-center">
                <p className="text-3xl font-bold text-emerald">{totalGoals}</p>
                <p className="text-sm text-muted-foreground">Buts Marqués</p>
              </div>
              <div className="p-4 rounded-lg bg-royal/10 text-center">
                <p className="text-3xl font-bold text-royal">{matches.length}</p>
                <p className="text-sm text-muted-foreground">Matchs Joués</p>
              </div>
              <div className="p-4 rounded-lg bg-gold/10 text-center">
                <p className="text-3xl font-bold text-gold">{avgGoals}</p>
                <p className="text-sm text-muted-foreground">Buts/Match</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 text-center">
                <p className="text-3xl font-bold text-primary">{(totalCapacity / 1000).toFixed(0)}K</p>
                <p className="text-sm text-muted-foreground">Capacité Totale</p>
              </div>
            </div>
          </motion.div>
        </>
      ) : (
        <div className="glass-card p-12 text-center">
          <p className="text-xl text-muted-foreground mb-4">
            {!isImported 
              ? "Veuillez d'abord importer le dataset dans l'onglet 'Importation'." 
              : "Aucune donnée disponible pour la visualisation."}
          </p>
          <p className="text-sm text-muted-foreground">
            {!isImported
              ? "L'accès aux visualisations nécessite que le dataset principal soit chargé."
              : "Veuillez d'abord extraire les données dans les onglets Matchs, Stades ou Billetterie."}
          </p>
        </div>
      )}
    </motion.div>
  );
}
