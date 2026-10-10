"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; up: boolean };
  variant?: "teal" | "orange" | "purple" | "yellow" | "pink" | "red";
}

const variantStyles: Record<NonNullable<KpiCardProps["variant"]>, { bg: string; fg: string; ring: string }> = {
  teal: { bg: "bg-primary/10", fg: "text-primary", ring: "ring-primary/20" },
  orange: { bg: "bg-accent/10", fg: "text-accent", ring: "ring-accent/20" },
  purple: { bg: "bg-purple-500/10", fg: "text-purple-600", ring: "ring-purple-500/20" },
  yellow: { bg: "bg-yellow-500/10", fg: "text-yellow-600", ring: "ring-yellow-500/20" },
  pink: { bg: "bg-pink-500/10", fg: "text-pink-600", ring: "ring-pink-500/20" },
  red: { bg: "bg-red-500/10", fg: "text-red-600", ring: "ring-red-500/20" },
};

export function KpiCard({ title, value, subtitle, icon: Icon, trend, variant = "teal" }: KpiCardProps) {
  const styles = variantStyles[variant];
  return (
    <Card className="kpi-card relative overflow-hidden border-0 shadow-sm glass-card">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-xl font-bold mt-1 text-foreground tabular-nums">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            {trend && (
              <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", trend.up ? "text-emerald-600" : "text-red-500")}>
                {trend.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{trend.value}</span>
              </div>
            )}
          </div>
          <div className={cn("rounded-lg p-2 ring-1", styles.bg, styles.fg, styles.ring)}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
