import { FileInput } from "lucide-react";
import { PythonTaskPage } from "@/components/PythonTaskPage";

export default function TaskImport() {
  return (
    <PythonTaskPage
      taskNumber={1}
      title="Importation du Dataset"
      description="Chargement du fichier dataset_can_2025_realiste.csv pour initialiser le pipeline de traitement."
      apiEndpoint="/api/task_import"
      ownerName="Atlas Insights Team"
      icon={<FileInput className="h-6 w-6" />}
      isUploadPage={true}
    />
  );
}
