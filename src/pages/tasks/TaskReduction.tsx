import { Minimize2 } from "lucide-react";
import { PythonTaskPage } from "@/components/PythonTaskPage";

export default function TaskReduction() {
  return (
    <PythonTaskPage
      taskNumber={6}
      title="Réduction de Dimensionnalité"
      description="Application de PCA et autres techniques pour réduire le nombre de variables."
      apiEndpoint="/api/task6_reduce"
      ownerName="Atlas Insights Team"
      icon={<Minimize2 className="h-6 w-6" />}
      requiredStep="transformation"
    />
  );
}
