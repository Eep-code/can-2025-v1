import { Sparkles } from "lucide-react";
import { PythonTaskPage } from "@/components/PythonTaskPage";

export default function TaskTransform() {
  return (
    <PythonTaskPage
      taskNumber={5}
      title="Transformations des Données"
      description="Normalisation, standardisation et encodage des variables catégorielles."
      apiEndpoint="/api/task5_transform"
      ownerName="Atlas Insights Team"
      icon={<Sparkles className="h-6 w-6" />}
      requiredStep="selection"
    />
  );
}
