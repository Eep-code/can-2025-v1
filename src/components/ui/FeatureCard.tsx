import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  variant: "emerald" | "royal" | "gold";
  delay?: number;
}

const gradientStyles = {
  emerald: "from-emerald to-emerald-dark",
  royal: "from-royal to-royal-dark",
  gold: "from-gold to-gold-dark",
};

const glowStyles = {
  emerald: "group-hover:shadow-[0_20px_50px_-12px_hsl(160,84%,39%,0.4)]",
  royal: "group-hover:shadow-[0_20px_50px_-12px_hsl(0,72%,51%,0.4)]",
  gold: "group-hover:shadow-[0_20px_50px_-12px_hsl(45,93%,47%,0.4)]",
};

export function FeatureCard({
  title,
  description,
  icon: Icon,
  href,
  variant,
  delay = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link to={href} className="block">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl p-8 h-64 transition-all duration-500",
            "bg-gradient-to-br",
            gradientStyles[variant],
            glowStyles[variant]
          )}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Icon className="h-8 w-8 text-white" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
              <p className="text-white/80 text-sm">{description}</p>
            </div>

            {/* Arrow indicator */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="absolute bottom-8 right-8"
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
