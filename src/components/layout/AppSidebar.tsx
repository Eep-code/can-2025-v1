import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Trophy,
  Building2,
  Ticket,
  BarChart3,
  Database,
  Sparkles,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Eye,
  Trash2,
  Filter,
  RefreshCw,
  Minimize2,
  Brain,
  Calculator,
  FileInput,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { title: "Accueil", href: "/", icon: Home },
  { title: "Introduction", href: "/introduction", icon: BookOpen },
  {
    title: "Scraping Data",
    icon: Database,
    children: [
      { title: "Matchs", href: "/matches", icon: Trophy },
      { title: "Stades", href: "/stadiums", icon: Building2 },
      { title: "Billetterie", href: "/ticketing", icon: Ticket },
    ],
  },
  { title: "Importation", href: "/task/import", icon: FileInput },
  { title: "Visualisation", href: "/visualization", icon: BarChart3 },
  { title: "Nettoyage", href: "/task/cleaning", icon: Trash2 },
  { title: "Sélection", href: "/task/selection", icon: Filter },
  { title: "Transformations", href: "/task/transform", icon: RefreshCw },
  { title: "Réduction", href: "/task/reduction", icon: Minimize2 },
  { title: "IA", href: "/task/ai", icon: Brain },
  { title: "Simulateur", href: "/predict", icon: Calculator },
];

interface SidebarItemProps {
  item: NavItem;
  isCollapsed: boolean;
}

function SidebarItem({ item, isCollapsed }: SidebarItemProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isActive = item.href === location.pathname;
  const hasActiveChild = item.children?.some((child) => child.href === location.pathname);

  if (item.children) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            hasActiveChild
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <item.icon className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{item.title}</span>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </>
          )}
        </button>
        <AnimatePresence>
          {isOpen && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-4 space-y-1 border-l border-border pl-3"
            >
              {item.children.map((child) => (
                <SidebarItem key={child.title} item={child} isCollapsed={isCollapsed} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      to={item.href || "/"}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary/10 text-primary border-l-2 border-primary -ml-0.5 pl-[14px]"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && <span>{item.title}</span>}
    </Link>
  );
}

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 280 : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-50 overflow-hidden",
          "lg:relative lg:opacity-100",
          !isOpen && "lg:w-0"
        )}
      >
        <div className="flex flex-col h-full w-[280px]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-emerald-dark flex items-center justify-center">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-foreground">CAN 2025</h1>
                <p className="text-xs text-muted-foreground">Analyse de Données</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-muted transition-colors lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <SidebarItem key={item.title} item={item} isCollapsed={false} />
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="glass-card p-3 text-center">
              <p className="text-xs text-muted-foreground">Projet ISMAGI 2025</p>
              <p className="text-xs text-primary font-medium">Maroc 🇲🇦</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={cn(
          "fixed top-4 left-4 z-50 p-2 rounded-lg bg-muted hover:bg-primary/10 transition-all duration-200",
          isOpen && "lg:left-[296px]"
        )}
      >
        <Menu className="h-5 w-5" />
      </button>
    </>
  );
}
