import { useState, ReactNode, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Loader2, CheckCircle, XCircle, Code, FileJson, Lock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const FLASK_API_URL = "http://127.0.0.1:5001";

interface PythonTaskPageProps {
  taskNumber: number;
  title: string;
  description: string;
  apiEndpoint: string;
  ownerName?: string;
  icon: ReactNode;
  requiredStep?: string;
  isUploadPage?: boolean;
}

interface TaskResult {
  message: string;
  resultat?: any;
  error?: string;
  logs?: string[];
  preview?: any[];
  metrics?: any;
  feature_importance?: any[];
  transformations?: string[];
  shape_before?: number[];
  shape_after?: number[];
  pca_data?: any[];
  tsne_data?: any[];
}

export function PythonTaskPage({
  taskNumber,
  title,
  description,
  apiEndpoint,
  ownerName = "Votre nom",
  icon,
  requiredStep,
  isUploadPage = false,
}: PythonTaskPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TaskResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(!!requiredStep);
  const [workflowStatus, setWorkflowStatus] = useState<Record<string, boolean>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const checkStatus = async () => {
    try {
      const response = await fetch(`${FLASK_API_URL}/api/workflow/status`);
      if (response.ok) {
        const status = await response.json();
        setWorkflowStatus(status);
        if (requiredStep) {
          setIsLocked(!status[requiredStep]);
        } else {
          setIsLocked(false);
        }
      }
    } catch (err) {
      console.error("Erreur lors de la vérification du statut:", err);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [requiredStep]);

  const handleReset = async () => {
    if (!confirm("Êtes-vous sûr de vouloir réinitialiser tout le workflow ? Toutes les étapes devront être exécutées à nouveau.")) {
      return;
    }

    try {
      const response = await fetch(`${FLASK_API_URL}/api/workflow/reset`, {
        method: 'POST'
      });
      if (response.ok) {
        toast({
          title: "Workflow réinitialisé",
          description: "Le statut de toutes les étapes a été remis à zéro.",
        });
        setLogs([`[${new Date().toLocaleTimeString()}] 🔄 Workflow réinitialisé par l'utilisateur`]);
        setResult(null);
        await checkStatus();
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de réinitialiser le workflow.",
      });
    }
  };

  const executeScript = async () => {
    if (isUploadPage && !selectedFile) {
      toast({
        variant: "destructive",
        title: "Fichier manquant",
        description: "Veuillez sélectionner un fichier CSV avant d'importer.",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setLogs([`[${new Date().toLocaleTimeString()}] Démarrage du processus...`]);

    try {
      const FLASK_API_URL = "http://127.0.0.1:5001";
      
      let response;
      if (isUploadPage && selectedFile) {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Upload du fichier ${selectedFile.name}...`]);
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        response = await fetch(`${FLASK_API_URL}/api/upload_dataset`, {
          method: "POST",
          body: formData,
        });
      } else {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Connexion à ${FLASK_API_URL}${apiEndpoint}...`]);
        response = await fetch(`${FLASK_API_URL}${apiEndpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      // Si c'est un upload, le résultat du pipeline est dans pipeline_result
      const actualData = data.pipeline_result || data;
      const serverLogs = actualData.logs || [];
      
      setLogs((prev) => [
        ...prev,
        ...serverLogs.map((l: string) => `[SERVER] ${l}`),
        `[${new Date().toLocaleTimeString()}] Réponse reçue du serveur`,
        `[${new Date().toLocaleTimeString()}] ${isUploadPage ? 'Importation' : 'Traitement'} terminé avec succès`,
      ]);
      
      setResult(actualData);
      await checkStatus(); // Mettre à jour les verrous
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ❌ Erreur: ${errorMessage}`,
        `[${new Date().toLocaleTimeString()}] Vérifiez que le serveur Flask est démarré (python app.py)`,
      ]);

      // Mock response for demo purposes
      setTimeout(() => {
        setResult({
          message: "Calcul terminé (Mode démo)",
          resultat: {
            info: "Serveur Flask non connecté - Affichage de données de démonstration",
            rows_processed: 1000,
            columns_cleaned: 15,
            missing_values_handled: 42,
          },
        });
        setLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] 📝 Affichage des résultats de démonstration`,
        ]);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="glass-card p-6 lg:p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-semibold bg-muted text-muted-foreground rounded">
                  Tâche {taskNumber}
                </span>
                <span className="px-2 py-1 text-xs font-semibold bg-emerald/20 text-emerald rounded">
                  Python
                </span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReset}
                className="text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Réinitialiser le Workflow
              </Button>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
            <p className="text-sm text-primary mt-2">
              Responsable: <span className="font-medium">{ownerName}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Execute Button */}
      <div className="flex flex-col items-center gap-4">
        {isUploadPage && !isLocked && (
          <div className="w-full max-w-md mb-4">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Sélectionner le dataset (CSV)
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-emerald/10 file:text-emerald
                hover:file:bg-emerald/20
                cursor-pointer"
            />
            {selectedFile && (
              <p className="mt-2 text-xs text-emerald font-medium">
                Fichier sélectionné : {selectedFile.name}
              </p>
            )}
          </div>
        )}

        <Button
          onClick={executeScript}
          disabled={isLoading || isLocked}
          size="lg"
          className="bg-gradient-to-r from-emerald to-emerald-dark hover:from-emerald-light hover:to-emerald text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-emerald/30 transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Exécution en cours...
            </>
          ) : isLocked ? (
            <>
              <Lock className="mr-2 h-5 w-5" />
              Étape Verrouillée
            </>
          ) : (
            <>
              <Play className="mr-2 h-5 w-5" />
              Exécuter le script Python (Flask)
            </>
          )}
        </Button>

        {isLocked && (
          <Alert variant="destructive" className="max-w-2xl bg-destructive/10 border-destructive/20 text-destructive">
            <Lock className="h-4 w-4" />
            <AlertTitle>Action requise</AlertTitle>
            <AlertDescription>
              Veuillez terminer l'étape précédente (<strong>{requiredStep}</strong>) avant de pouvoir lancer celle-ci.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Logs Section */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Code className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Logs d'exécution</h3>
        </div>
        <div className="code-output min-h-32">
          {logs.length === 0 ? (
            <span className="text-muted-foreground">Cliquez sur "Exécuter" pour voir les logs...</span>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="py-0.5">
                {log}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-center gap-2 mt-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="animate-pulse">Traitement en cours...</span>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileJson className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Résultat</h3>
          {result && !error && (
            <CheckCircle className="h-5 w-5 text-emerald ml-auto" />
          )}
          {error && !result && (
            <XCircle className="h-5 w-5 text-royal ml-auto" />
          )}
        </div>

        {!result && !error && (
          <div className="text-center py-12 text-muted-foreground">
            <FileJson className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Les résultats s'afficheront ici après l'exécution</p>
          </div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald/10 border border-emerald/20">
              <CheckCircle className="h-5 w-5 text-emerald" />
              <span className="font-medium text-emerald">{result.message}</span>
            </div>

            {/* Metrics */}
            {result.metrics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="text-sm text-muted-foreground mb-1">MAE (Mean Absolute Error)</div>
                  <div className="text-2xl font-bold text-emerald">{result.metrics.mae.toFixed(4)}</div>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="text-sm text-muted-foreground mb-1">R² Score (Précision)</div>
                  <div className="text-2xl font-bold text-emerald">{(result.metrics.r2 * 100).toFixed(2)}%</div>
                </div>
              </div>
            )}

            {/* Feature Importance */}
            {result.feature_importance && (
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <h4 className="text-sm font-semibold mb-3">Importance des variables (Top 5)</h4>
                <div className="space-y-2">
                  {result.feature_importance.map((f: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="text-xs font-mono w-32 truncate" title={f.name}>{f.name}</div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${f.importance * 100}%` }}
                          className="h-full bg-emerald"
                        />
                      </div>
                      <div className="text-xs font-mono w-12 text-right">{(f.importance * 100).toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transformations */}
            {result.transformations && (
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <h4 className="text-sm font-semibold mb-2">Transformations appliquées</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.transformations.map((t: string, i: number) => (
                    <li key={i} className="text-xs text-muted-foreground">{t}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preview Table */}
            {result.preview && result.preview.length > 0 && (
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <h4 className="text-sm font-semibold mb-3">Aperçu des données ({result.preview.length} premières lignes)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        {Object.keys(result.preview[0]).map((h) => (
                          <th key={h} className="p-2 font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.preview.map((row: any, i: number) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/80 transition-colors">
                          {Object.values(row).map((v: any, j: number) => (
                            <td key={j} className="p-2 whitespace-nowrap">
                              {typeof v === 'number' ? v.toFixed(2) : String(v)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Original JSON for everything else */}
            {result.resultat && (
              <div className="code-output">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(result.resultat, null, 2)}
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* API Endpoint Info */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="px-2 py-1 bg-muted rounded font-mono text-xs">POST</span>
          <code className="font-mono">{apiEndpoint}</code>
        </div>
        <span className="text-xs text-muted-foreground">Flask Backend</span>
      </div>
    </motion.div>
  );
}
