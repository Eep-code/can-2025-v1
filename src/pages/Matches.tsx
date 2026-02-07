import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Calendar, MapPin, Flag, Search, Filter, Download, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { fetchCsvData } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Match {
  match_id: string;
  date: string;
  status: string;
  stage: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  winner_side: string;
  is_draw: boolean;
  stadium: string;
}

// Sample data from CSV
const defaultMatchesData: Match[] = [];

const teamNames: { [key: string]: string } = {
  MRC: "Maroc", COM: "Comores", MLI: "Mali", ZMB: "Zambie", ZAF: "Afrique du Sud",
  ANG: "Angola", EGY: "Égypte", ZIM: "Zimbabwe", COD: "RD Congo", BEN: "Bénin",
  SEN: "Sénégal", BOT: "Botswana", NGR: "Nigeria", TAN: "Tanzanie", TUN: "Tunisie",
  UGA: "Ouganda", ALG: "Algérie", SDN: "Soudan", CIV: "Côte d'Ivoire", CAM: "Cameroun",
  GAB: "Gabon", MOZ: "Mozambique", BFA: "Burkina Faso", EQU: "Guinée Équatoriale",
};

export default function Matches() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    const data = await fetchCsvData("/data/CAN_2025_Matches.csv");
    if (data && data.length > 0) {
      // Convert CSV strings to correct types and filter out invalid data
      const formattedData = data
        .map((m: any) => ({
          ...m,
          home_score: parseInt(m.home_score),
          away_score: parseInt(m.away_score),
          is_draw: m.is_draw === "True" || m.is_draw === "true",
        }))
        .filter((m: any) => !isNaN(m.home_score) && !isNaN(m.away_score));
      
      setMatches(formattedData);
    } else {
      setMatches([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScrape = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5001/api/scrape/matches", {
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
          description: "Données des matchs extraites et actualisées",
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
    if (!confirm("Êtes-vous sûr de vouloir réinitialiser les données des matchs ? Cela supprimera les fichiers extraits pour cette page.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5001/api/workflow/reset", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "matches" })
      });
      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Données Réinitialisées",
          description: data.message,
        });
        setMatches([]);
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

  const filteredMatches = matches.filter((match) => {
    const homeTeam = (teamNames[match.home_team] || match.home_team || "").toString();
    const awayTeam = (teamNames[match.away_team] || match.away_team || "").toString();
    const stadium = (match.stadium || "").toString();
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      homeTeam.toLowerCase().includes(term) ||
      awayTeam.toLowerCase().includes(term) ||
      stadium.toLowerCase().includes(term);

    const matchesStage = stageFilter === "all" || match.stage === stageFilter;

    return matchesSearch && matchesStage;
  });

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
            <div className="p-3 rounded-xl bg-emerald/10 text-emerald">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Matchs CAN 2025</h1>
              <p className="text-muted-foreground">
                Explorez tous les matchs de la compétition avec scores et détails
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
              className="bg-emerald hover:bg-emerald/90 text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              {loading ? "Extraction..." : "Lancer l'extraction"}
            </Button>
          </div>
        </div>
      </div>

      {matches.length > 0 && (
        <>
          {/* Filters */}
          <div className="glass-card p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher équipe ou stade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted border-0"
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-muted border-0">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Phase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les phases</SelectItem>
            <SelectItem value="Group">Phase de groupes</SelectItem>
            <SelectItem value="Round of 16">Huitièmes</SelectItem>
            <SelectItem value="Quarter-final">Quarts de finale</SelectItem>
            <SelectItem value="Semi-final">Demi-finales</SelectItem>
            <SelectItem value="Final">Finale</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Matches List */}
      {filteredMatches.length > 0 && (
        <div className="space-y-4">
          {filteredMatches.map((match, index) => (
            <motion.div
              key={match.match_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-6 hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(match.date).toLocaleDateString("fr-FR", { 
                    weekday: "long", 
                    day: "numeric", 
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}</span>
                </div>
                <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary font-medium">
                  {match.stage}
                </span>
              </div>

              <div className="flex items-center justify-between">
                {/* Home Team */}
                <div className="flex-1 text-right">
                  <p className={`text-lg font-semibold ${match.winner_side === "home" ? "text-emerald" : "text-foreground"}`}>
                    {teamNames[match.home_team] || match.home_team}
                  </p>
                  <p className="text-xs text-muted-foreground">{match.home_team}</p>
                </div>

                {/* Score */}
                <div className="px-8 text-center">
                  <div className="flex items-center gap-2">
                    <span className={`text-3xl font-bold ${match.winner_side === "home" ? "text-emerald" : "text-foreground"}`}>
                      {match.home_score}
                    </span>
                    <span className="text-xl text-muted-foreground">-</span>
                    <span className={`text-3xl font-bold ${match.winner_side === "away" ? "text-emerald" : "text-foreground"}`}>
                      {match.away_score}
                    </span>
                  </div>
                  {match.is_draw && (
                    <span className="text-xs text-gold">Match nul</span>
                  )}
                </div>

                {/* Away Team */}
                <div className="flex-1 text-left">
                  <p className={`text-lg font-semibold ${match.winner_side === "away" ? "text-emerald" : "text-foreground"}`}>
                    {teamNames[match.away_team] || match.away_team}
                  </p>
                  <p className="text-xs text-muted-foreground">{match.away_team}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{match.stadium}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredMatches?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Aucun match trouvé</p>
        </div>
      )}
        </>
      )}
    </motion.div>
  );
}
