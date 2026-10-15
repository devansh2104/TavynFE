import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function KpiCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = 'neutral', 
  subtitle,
  progress,
  colorScheme = 'primary',
  onClick 
}) {
  const colorMap = {
    primary: {
      iconBg: 'bg-primary/10 text-primary',
      badgeBg: 'bg-primary/10 text-primary border-primary/20',
      progressBar: 'bg-primary'
    },
    success: {
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      progressBar: 'bg-emerald-500'
    },
    warning: {
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      progressBar: 'bg-amber-500'
    },
    danger: {
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      badgeBg: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
      progressBar: 'bg-rose-500'
    },
    indigo: {
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      badgeBg: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
      progressBar: 'bg-indigo-500'
    }
  };

  const currentTheme = colorMap[colorScheme] || colorMap.primary;

  return (
    <Card 
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/80 bg-card p-3.5 sm:p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-border",
        onClick && "cursor-pointer"
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
          {title}
        </span>
        <div className={cn("flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl transition-transform hover:scale-105", currentTheme.iconBg)}>
          {Icon && <Icon className="h-4 w-4 sm:h-5 sm:w-5" />}
        </div>
      </div>

      <div className="mt-2 sm:mt-3">
        <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground truncate">
          {value}
        </div>
      </div>

      <div className="mt-2 sm:mt-3 flex items-center justify-between text-xs gap-1 flex-wrap sm:flex-nowrap">
        {change && (
          <div className={cn("inline-flex items-center gap-1 rounded-full px-1.5 sm:px-2 py-0.5 font-medium border text-[10px] sm:text-[11px] shrink-0", currentTheme.badgeBg)}>
            {trend === 'up' && <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
            {trend === 'down' && <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
            {trend === 'neutral' && <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
            <span className="truncate max-w-[120px]">{change}</span>
          </div>
        )}
        {subtitle && (
          <span className="text-muted-foreground text-[10px] sm:text-[11px] truncate hidden sm:inline ml-auto">
            {subtitle}
          </span>
        )}
      </div>

      {typeof progress === 'number' && (
        <div className="mt-2.5 sm:mt-3 h-1 sm:h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div 
            className={cn("h-full transition-all duration-500 rounded-full", currentTheme.progressBar)} 
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </Card>
  );
}
