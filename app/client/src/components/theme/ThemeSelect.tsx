import { Check, Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";

const themes = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    icon: Monitor,
  },
] as const;

export function ThemeSelect() {
  const { theme, setTheme } = useTheme();

  const activeTheme =
    themes.find((item) => item.value === theme) ?? themes[2];

  const ActiveIcon = activeTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 rounded-xl bg-background"
          aria-label="Change theme"
        >
          <ActiveIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40 rounded-xl">
        {themes.map((item) => {
          const Icon = item.icon;
          const isActive = theme === item.value;

          return (
            <DropdownMenuItem
              key={item.value}
              onClick={() => setTheme(item.value)}
              className="flex cursor-pointer items-center justify-between gap-2"
            >
              <span className="flex items-center gap-2">
                <Icon className="size-4 text-muted-foreground" />
                {item.label}
              </span>

              {isActive && <Check className="size-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}