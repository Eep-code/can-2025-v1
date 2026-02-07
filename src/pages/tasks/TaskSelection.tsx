import { Filter } from "lucide-react";
import { PythonTaskPage } from "@/components/PythonTaskPage";

export default function TaskSelection() {
  return (
    <PythonTaskPage
      taskNumber={4}
      title="Sélection des Variables"
      description="Identification et sélection des features les plus pertinentes pour la modélisation."
      apiEndpoint="/api/task4_select"
      ownerName="Atlas Insights Team"
      icon={<Filter className="h-6 w-6" />}
      requiredStep="cleaning"
    />
  );
}
