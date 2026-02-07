import { Trash2 } from "lucide-react";
import { PythonTaskPage } from "@/components/PythonTaskPage";

export default function TaskCleaning() {
  return (
    <PythonTaskPage
      taskNumber={3}
      title="Nettoyage des Données"
      description="Suppression des valeurs manquantes, doublons et correction des erreurs dans le dataset CAN 2025."
      apiEndpoint="/api/task3_clean"
      ownerName="Atlas Insights Team"
      icon={<Trash2 className="h-6 w-6" />}
      requiredStep="import"
    />
  );
}
