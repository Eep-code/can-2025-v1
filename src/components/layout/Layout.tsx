import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { motion } from "framer-motion";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <motion.main
        className="flex-1 min-h-screen overflow-x-hidden"
        initial={false}
        animate={{
          marginLeft: sidebarOpen ? 0 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
}
