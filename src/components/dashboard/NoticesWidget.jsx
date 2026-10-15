import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarClock, AlertTriangle, PartyPopper, BellRing, ArrowRight, CheckCircle2 } from 'lucide-react';

const notices = [
  {
    id: 1,
    title: 'Monthly Rent Invoices Generated',
    description: 'Auto-billed for October cycle across all 4 hostel blocks.',
    time: '2 hours ago',
    type: 'success',
    icon: CheckCircle2,
  },
  {
    id: 2,
    title: 'Routine Water Tank Cleaning',
    description: 'Block B & C overhead tanks maintenance scheduled for tomorrow 10:00 AM.',
    time: 'Tomorrow, 10:00 AM',
    type: 'warning',
    icon: AlertTriangle,
  },
  {
    id: 3,
    title: 'Hostel Cultural Fest & Dinner',
    description: 'Annual gathering in central courtyard at 7:30 PM on Saturday.',
    time: '20 Oct, 2026',
    type: 'event',
    icon: PartyPopper,
  },
];

export function NoticesWidget() {
  const getBadge = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'event':
        return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
      case 'success':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-500/10 text-amber-600';
      case 'event':
        return 'bg-indigo-500/10 text-indigo-600';
      case 'success':
        return 'bg-emerald-500/10 text-emerald-600';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  return (
    <Card className="rounded-xl border border-border/80 bg-card shadow-sm flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
            <BellRing className="h-4 w-4 text-primary" />
            Notice Board & Broadcasts
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Operational announcements and events
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 pt-1">
        {notices.map((notice) => (
          <div 
            key={notice.id} 
            className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 transition-colors hover:bg-muted/40"
          >
            <div className={`p-2 rounded-lg shrink-0 ${getIconBg(notice.type)}`}>
              <notice.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-semibold text-foreground leading-snug">{notice.title}</p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{notice.description}</p>
              <span className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${getBadge(notice.type)}`}>
                {notice.time}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
