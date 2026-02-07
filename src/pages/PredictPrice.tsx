import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Calculator, Info, TrendingUp, AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PredictPrice() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5001/api/workflow/status");
        if (response.ok) {
          const status = await response.json();
          setIsLocked(!status.modeling);
        }
      } catch (err) {
        console.error("Erreur status:", err);
      }
    };
    checkStatus();
  }, []);

  // Form state with default values based on dataset characteristics
  const [formData, setFormData] = useState({
    Capacite_Stade: 45000,
    Prestige_Stade: 3,
    Score_Visibilite: 4,
    Distance_Pelouse_m: 15,
    Classement_FIFA_Moyen: 45,
    Valeur_Marchande_Totale_MEUR: 250,
    Score_Rivalite: 2,
    Effet_Maroc: 0,
    Indice_Demande: 1.5,
    Categorie: "Cat 2",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePredict = async () => {
    setLoading(true);
    setPrediction(null);
    try {
      const response = await fetch("http://127.0.0.1:5001/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Erreur lors de la prédiction");

      const data = await response.json();
      setPrediction(data.predicted_price);
      toast({
        title: "Prédiction réussie",
        description: "Le modèle a calculé un prix estimé.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de contacter le serveur de prédiction.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Brain className="h-8 w-8 text-emerald" />
          Simulateur de Prix IA
        </h1>
        <p className="text-muted-foreground">
          Posez une question au modèle en ajustant les paramètres du match pour prédire le prix optimal du ticket.
        </p>
      </div>

      {isLocked && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
          <Lock className="h-4 w-4" />
          <AlertTitle>Modèle non disponible</AlertTitle>
          <AlertDescription>
            Veuillez d'abord entraîner le modèle IA (Tâche 7) avant de pouvoir utiliser le simulateur.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <Card className={`lg:col-span-2 glass-card ${isLocked ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
          <CardHeader>
            <CardTitle className="text-xl">Paramètres du Scénario</CardTitle>
            <CardDescription>Modifiez les variables pour voir l'impact sur le prix final.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="Categorie">Catégorie du Ticket</Label>
                <Select 
                  value={formData.Categorie} 
                  onValueChange={(value) => handleSelectChange("Categorie", value)}
                >
                  <SelectTrigger id="Categorie">
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cat 1">Catégorie 1 (Premium)</SelectItem>
                    <SelectItem value="Cat 2">Catégorie 2 (Standard)</SelectItem>
                    <SelectItem value="Cat 3">Catégorie 3 (Économique)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="Capacite_Stade">Capacité du Stade</Label>
                <Input
                  id="Capacite_Stade"
                  name="Capacite_Stade"
                  type="number"
                  value={formData.Capacite_Stade}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="Classement_FIFA_Moyen">Classement FIFA Moyen</Label>
                <Input
                  id="Classement_FIFA_Moyen"
                  name="Classement_FIFA_Moyen"
                  type="number"
                  value={formData.Classement_FIFA_Moyen}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="Valeur_Marchande_Totale_MEUR">Valeur Marchande (M€)</Label>
                <Input
                  id="Valeur_Marchande_Totale_MEUR"
                  name="Valeur_Marchande_Totale_MEUR"
                  type="number"
                  value={formData.Valeur_Marchande_Totale_MEUR}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="Indice_Demande">Indice de Demande (1-5)</Label>
                <Input
                  id="Indice_Demande"
                  name="Indice_Demande"
                  type="number"
                  step="0.1"
                  value={formData.Indice_Demande}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="Score_Rivalite">Score de Rivalité (1-10)</Label>
                <Input
                  id="Score_Rivalite"
                  name="Score_Rivalite"
                  type="number"
                  value={formData.Score_Rivalite}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="Effet_Maroc">Match du Maroc ? (1=Oui, 0=Non)</Label>
                <Input
                  id="Effet_Maroc"
                  name="Effet_Maroc"
                  type="number"
                  min="0"
                  max="1"
                  value={formData.Effet_Maroc}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button
                onClick={handlePredict}
                disabled={loading}
                className="bg-emerald hover:bg-emerald-dark text-white px-8 py-6 rounded-xl text-lg font-semibold"
              >
                {loading ? "Calcul en cours..." : "Calculer le Prix Prédit"}
                <Calculator className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Prediction Results */}
        <div className="space-y-6">
          <Card className="glass-card overflow-hidden">
            <CardHeader className="bg-emerald/5 border-b border-emerald/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald" />
                Estimation IA
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 pb-8 text-center">
              {prediction !== null ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-2"
                >
                  <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Prix Estimé</div>
                  <div className="text-5xl font-bold text-emerald">{prediction.toFixed(2)} <span className="text-2xl">MAD</span></div>
                  <div className="flex items-center justify-center gap-1 text-emerald mt-4 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Basé sur RandomForest
                  </div>
                </motion.div>
              ) : (
                <div className="py-8 space-y-4">
                  <Calculator className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
                  <p className="text-muted-foreground text-sm px-4">
                    Remplissez les paramètres et cliquez sur calculer pour voir la prédiction.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Comment ça marche ?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-3">
              <p>
                Le modèle utilise une forêt d'arbres décisionnels (Random Forest) entraînée sur l'historique de la CAN 2025.
              </p>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-3 w-3 mt-0.5 text-royal" />
                <span>Plus le classement FIFA est bas (ex: 10 vs 100), plus le prix a tendance à augmenter.</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-3 w-3 mt-0.5 text-royal" />
                <span>L'effet Maroc (match à domicile) est un multiplicateur de prix majeur.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
