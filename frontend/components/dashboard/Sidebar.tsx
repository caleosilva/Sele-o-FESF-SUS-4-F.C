"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, ClipboardList, LogOut, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api/axios";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { label: "Pacientes", href: "/pacientes", icon: Users },
  { label: "Triagem",   href: "/triagem",   icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { usuario, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    await api.post("/auth/logout").catch(() => {});
    logout();
    router.replace("/login");
  }

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-background px-3 py-4 shrink-0 transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-1 mb-6">
        {!collapsed && (
          <span className="font-bold text-base leading-tight">FESF-SUS — Triagem</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 ml-auto"
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed
            ? <ChevronRight className="h-4 w-4" />
            : <ChevronLeft className="h-4 w-4" />
          }
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <Tooltip key={href} delayDuration={0}>
            <TooltipTrigger asChild>
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-2",
                  pathname.startsWith(href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && label}
              </Link>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
          </Tooltip>
        ))}
      </nav>

      <Separator className="my-3" />

      {/* Usuário + logout */}
      <div className={cn("space-y-2", !collapsed && "px-1")}>
        {!collapsed && usuario && (
          <div className="text-xs text-muted-foreground truncate px-1">
            <p className="font-medium text-foreground truncate">{usuario.email}</p>
            <p className="capitalize">{usuario.perfil}</p>
          </div>
        )}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full gap-2 text-muted-foreground",
                collapsed ? "justify-center px-2" : "justify-start"
              )}
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && "Sair"}
            </Button>
          </TooltipTrigger>
          {collapsed && <TooltipContent side="right">Sair</TooltipContent>}
        </Tooltip>
      </div>
    </aside>
  );
}
