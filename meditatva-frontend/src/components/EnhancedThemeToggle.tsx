import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Sparkles } from "lucide-react";
import { useTheme, type ThemeMode } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const themes: { mode: ThemeMode; icon: any; label: string; gradient: string }[] = [
  { 
    mode: "light", 
    icon: Sun, 
    label: "Light", 
    gradient: "from-amber-400 to-orange-500" 
  },
  { 
    mode: "dark", 
    icon: Moon, 
    label: "Dark", 
    gradient: "from-slate-700 to-slate-900" 
  },
  { 
    mode: "medical-glass", 
    icon: Sparkles, 
    label: "Medical Glass", 
    gradient: "from-cyan-400 to-blue-500" 
  },
];

export const EnhancedThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const currentTheme = themes.find((t) => t.mode === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-11 w-11 rounded-xl overflow-hidden hover:scale-105 transition-transform"
        >
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradient} opacity-10`}
            animate={{
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ rotate: -180, opacity: 0, scale: 0 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 180, opacity: 0, scale: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentIcon className="h-5 w-5" />
            </motion.div>
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-2"
      >
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          return (
            <DropdownMenuItem
              key={themeOption.mode}
              onClick={() => setTheme(themeOption.mode)}
              className="cursor-pointer"
            >
              <motion.div
                className="flex items-center gap-3 w-full"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${themeOption.gradient} flex items-center justify-center`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="flex-1">{themeOption.label}</span>
                {theme === themeOption.mode && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-2 w-2 rounded-full bg-green-500"
                  />
                )}
              </motion.div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
