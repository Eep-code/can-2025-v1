import { Brain } from "lucide-react";
import { PythonTaskPage } from "@/components/PythonTaskPage";

/**
 * TaskAI component for displaying the AI modeling task page
 */
export default function TaskAI() {
  return (
    <PythonTaskPage
      taskNumber={7}
      title="Modélisation IA"
      description="Création et entraînement de modèles de Machine Learning pour la prédiction des prix."
      apiEndpoint="/api/task7_ai"
      ownerName="Atlas Insights Team"
      icon={<Brain className="h-6 w-6" />}
      requiredStep="reduction"
    />
  );
}
