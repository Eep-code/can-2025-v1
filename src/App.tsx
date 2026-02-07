import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

// Pages
import Index from "./pages/Index";
import Introduction from "./pages/Introduction";
import Visualization from "./pages/Visualization";
import Matches from "./pages/Matches";
import Stadiums from "./pages/Stadiums";
import Ticketing from "./pages/Ticketing";
import TaskImport from "./pages/tasks/TaskImport";
import TaskCleaning from "./pages/tasks/TaskCleaning";
import TaskSelection from "./pages/tasks/TaskSelection";
import TaskTransform from "./pages/tasks/TaskTransform";
import TaskReduction from "./pages/tasks/TaskReduction";
import TaskAI from "./pages/tasks/TaskAI";
import PredictPrice from "./pages/PredictPrice";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/introduction" element={<Introduction />} />
            <Route path="/visualization" element={<Visualization />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/stadiums" element={<Stadiums />} />
            <Route path="/ticketing" element={<Ticketing />} />
            <Route path="/task/import" element={<TaskImport />} />
            <Route path="/task/cleaning" element={<TaskCleaning />} />
            <Route path="/task/selection" element={<TaskSelection />} />
            <Route path="/task/transform" element={<TaskTransform />} />
            <Route path="/task/reduction" element={<TaskReduction />} />
            <Route path="/task/ai" element={<TaskAI />} />
            <Route path="/predict" element={<PredictPrice />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
