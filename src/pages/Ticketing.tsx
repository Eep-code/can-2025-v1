import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Ticket, TrendingUp, Tag, Armchair, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { fetchCsvData } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TicketPrice {
  stage: string;
  category: string;
  seat_description: string;
  price_min_MAD: number;
  price_max_MAD: number;
}

const defaultTicketsData: TicketPrice[] = [];

const stageNames: { [key: string]: string } = {
  "Group Stage": "Groupes",
  "Round of 16": "8èmes",
  "Quarter-final": "Quarts",
  "Semi-final": "Demis",
  "Final": "Finale",
};

export default function Ticketing() {
  const [ticketsData, setTicketsData] = useState<TicketPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    const data = await fetchCsvData("/data/CAN_2025_Tickets.csv");
    if (data && data.length > 0) {
      const formattedData = data
        .map((t: any) => ({
          ...t,
          price_min_MAD: parseInt(t.price_min_MAD),
          price_max_MAD: parseInt(t.price_max_MAD),
        }))
        .filter((t: any) => !isNaN(t.price_min_MAD) && !isNaN(t.price_max_MAD));
      setTicketsData(formattedData);
    } else {
      setTicketsData([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScrape = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5001/api/scrape/tickets", {
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
          description: "Données de billetterie extraites et actualisées",
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
    if (!confirm("Êtes-vous sûr de vouloir réinitialiser les données de billetterie ? Cela supprimera les fichiers extraits pour cette page.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5001/api/workflow/reset", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "tickets" })
      });
      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Données Réinitialisées",
          description: data.message,
        });
        setTicketsData([]);
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

  const avgPrice = ticketsData.length > 0 ? Math.round(
    ticketsData.reduce((sum, t) => sum + (t.price_min_MAD + t.price_max_MAD) / 2, 0) / ticketsData.length
  ) : 0;
  const maxPrice = ticketsData.length > 0 ? Math.max(...ticketsData.map(t => t.price_max_MAD)) : 0;
  const minPrice = ticketsData.length > 0 ? Math.min(...ticketsData.map(t => t.price_min_MAD)) : 0;

  // Recalculate chart data based on loaded ticketsData
  const chartData = [
    { stage: "Groupes", cat1: 0, cat2: 0, cat3: 0 },
    { stage: "8èmes", cat1: 0, cat2: 0, cat3: 0 },
    { stage: "Quarts", cat1: 0, cat2: 0, cat3: 0 },
    { stage: "Demis", cat1: 0, cat2: 0, cat3: 0 },
    { stage: "Finale", cat1: 0, cat2: 0, cat3: 0 },
  ];

  ticketsData.forEach(ticket => {
    const stageName = stageNames[ticket.stage] || ticket.stage;
    const cat = ticket.category === "Category 1" ? "cat1" : ticket.category === "Category 2" ? "cat2" : "cat3";
    const avg = (ticket.price_min_MAD + ticket.price_max_MAD) / 2;
    
    const chartItem = chartData.find(d => d.stage === stageName);
    if (chartItem) {
      // @ts-ignore
      chartItem[cat] = avg;
    }
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
            <div className="p-3 rounded-xl bg-gold/10 text-gold">
              <Ticket className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Billetterie CAN 2025</h1>
              <p className="text-muted-foreground">
                Analyse des prix par phase de compétition et catégorie
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
              className="bg-gold hover:bg-gold/90 text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              {loading ? "Extraction..." : "Lancer l'extraction"}
            </Button>
          </div>
        </div>
      </div>

      {ticketsData.length > 0 && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 text-center"
        >
          <p className="text-2xl font-bold text-gold">{avgPrice} MAD</p>
          <p className="text-sm text-muted-foreground">Prix Moyen</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 text-center"
        >
          <p className="text-2xl font-bold text-emerald">{minPrice} MAD</p>
          <p className="text-sm text-muted-foreground">Prix Min</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 text-center"
        >
          <p className="text-2xl font-bold text-royal">{maxPrice} MAD</p>
          <p className="text-sm text-muted-foreground">Prix Max (Finale)</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-4 text-center"
        >
          <p className="text-2xl font-bold text-foreground">5</p>
          <p className="text-sm text-muted-foreground">Phases</p>
        </motion.div>
      </div>

      {/* Price Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-gold" />
          <h3 className="font-semibold text-foreground">Évolution des Prix par Phase</h3>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 18%)" />
            <XAxis dataKey="stage" stroke="hsl(215, 20%, 65%)" fontSize={12} />
            <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222, 47%, 8%)",
                border: "1px solid hsl(222, 47%, 18%)",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`${value} MAD`, ""]}
            />
            <Legend />
            <Bar dataKey="cat1" name="Catégorie 1" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cat2" name="Catégorie 2" fill="hsl(45, 93%, 47%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cat3" name="Catégorie 3" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Price Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card overflow-hidden"
      >
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Tag className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Détail des Tarifs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Phase</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Catégorie</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Description</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Prix Min</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Prix Max</th>
              </tr>
            </thead>
            <tbody>
              {ticketsData.map((ticket, index) => (
                <tr
                  key={`${ticket.stage}-${ticket.category}`}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4">
                    <span className="font-medium text-foreground">
                      {stageNames[ticket.stage] || ticket.stage}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded font-medium ${
                      ticket.category === "Category 1" 
                        ? "bg-emerald/20 text-emerald" 
                        : ticket.category === "Category 2"
                        ? "bg-gold/20 text-gold"
                        : "bg-royal/20 text-royal"
                    }`}>
                      {(ticket.category || "").replace("Category ", "Cat. ")}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground flex items-center gap-2">
                    <Armchair className="h-4 w-4" />
                    {ticket.seat_description || "N/A"}
                  </td>
                  <td className="p-4 text-right font-medium text-emerald">
                    {ticket.price_min_MAD} MAD
                  </td>
                  <td className="p-4 text-right font-medium text-foreground">
                    {ticket.price_max_MAD} MAD
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      </>
      )}
    </motion.div>
  );
}
