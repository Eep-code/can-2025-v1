import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, MapPin, Users, Leaf, CheckCircle, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { fetchCsvData } from "@/lib/utils";

interface Stadium {
  name: string;
  city: string;
  capacity: number;
  pitch_surface: string;
  pitch_type: string;
}

const defaultStadiumsData: Stadium[] = [];

const cityNames: { [key: string]: string } = {
  "Tangier": "Tanger",
  "Rabat": "Rabat",
  "Agadir": "Agadir",
  "Casablanca": "Casablanca",
  "Marrakech": "Marrakech",
  "Fez": "Fès",
};

export default function Stadiums() {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    const data = await fetchCsvData("/data/CAN_2025_StadiumTerrain.csv");
    if (data && data.length > 0) {
      const formattedData = data
        .map((s: any) => ({
          ...s,
          capacity: parseInt(s.capacity),
        }))
        .filter((s: any) => !isNaN(s.capacity));
      setStadiums(formattedData);
    } else {
      setStadiums([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScrape = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5001/api/scrape/stadiums", {
        method: "POST",
      });
      const result = await response.json();
      
      if (response.ok) {
        // Trigger viz generation to keep everything in sync
        //await fetch("http://127.0.0.1:5001/api/viz/generate-all", { method: "POST" });
        
        // Small delay to allow filesystem to sync
        await new Promise(resolve => setTimeout(resolve, 800));
        
        await loadData();
        
        toast({
          title: "Succès",
          description: "Données des stades extraites et actualisées",
        });
      } else {
        throw new Error(result.error || "Erreur lors du scraping");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de contacter le serveur de scraping",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetWorkflow = async () => {
    if (!confirm("Êtes-vous sûr de vouloir réinitialiser les données des stades ? Cela supprimera les fichiers extraits pour cette page.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5001/api/workflow/reset", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "stadiums" })
      });
      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Données Réinitialisées",
          description: data.message,
        });
        setStadiums([]);
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

  const totalCapacity = stadiums.reduce((sum, s) => sum + s.capacity, 0);
  const avgCapacity = stadiums.length > 0 ? Math.round(totalCapacity / stadiums.length) : 0;
  const hybridCount = stadiums.filter(s => s.pitch_surface === "Hybrid Grass").length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="glass-card p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-royal/10 text-royal">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Stades CAN 2025</h1>
              <p className="text-muted-foreground">
                Les 6 stades marocains qui accueilleront la compétition
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
              className="bg-royal hover:bg-royal/90 text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              {loading ? "Extraction..." : "Lancer l'extraction"}
            </Button>
          </div>
        </div>
      </div>

      {stadiums.length > 0 && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 text-center"
        >
          <p className="text-2xl font-bold text-foreground">{stadiums.length}</p>
          <p className="text-sm text-muted-foreground">Stades</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 text-center"
        >
          <p className="text-2xl font-bold text-emerald">{totalCapacity.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Capacité Totale</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 text-center"
        >
          <p className="text-2xl font-bold text-royal">{avgCapacity.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Moyenne</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-4 text-center"
        >
          <p className="text-2xl font-bold text-gold">{hybridCount}</p>
          <p className="text-sm text-muted-foreground">Pelouse Hybride</p>
        </motion.div>
      </div>

      {/* Stadiums Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {stadiums.map((stadium, index) => (
          <motion.div
            key={stadium.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="glass-card p-6 hover:border-royal/30 transition-all group"
          >
            {/* Stadium Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-royal transition-colors">
                  {stadium.name}
                </h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{cityNames[stadium.city] || stadium.city}</span>
                </div>
              </div>
              {index === 0 && (
                <span className="px-2 py-1 text-xs bg-gold/20 text-gold rounded font-medium">
                  Plus grand
                </span>
              )}
            </div>

            {/* Capacity Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Capacité
                </span>
                <span className="font-semibold text-foreground">
                  {stadium.capacity.toLocaleString()} places
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(stadium.capacity / 75000) * 100}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-royal to-royal-light rounded-full"
                />
              </div>
            </div>

            {/* Pitch Info */}
            <div className="flex items-center gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-emerald" />
                <span className="text-sm text-muted-foreground">{stadium.pitch_surface}</span>
              </div>
              {stadium.pitch_type === "Natural reinforced" && (
                <div className="flex items-center gap-1 text-xs text-emerald">
                  <CheckCircle className="h-3 w-3" />
                  <span>Renforcé</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      </>
      )}
    </motion.div>
  );
}
