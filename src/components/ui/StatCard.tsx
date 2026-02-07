import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "emerald" | "royal" | "gold" | "default";
  delay?: number;
}

const variantStyles = {
  emerald: "border-emerald/30 hover:border-emerald/50",
  royal: "border-royal/30 hover:border-royal/50",
  gold: "border-gold/30 hover:border-gold/50",
  default: "border-border hover:border-primary/30",
};

const iconStyles = {
  emerald: "text-emerald bg-emerald/10",
  royal: "text-royal bg-royal/10",
  gold: "text-gold bg-gold/10",
  default: "text-primary bg-primary/10",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "glass-card p-6 transition-all duration-300 hover:scale-105 cursor-default",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", iconStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}
