import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, AlertTriangle, PartyPopper } from 'lucide-react';

const notices = [
  {
    id: 1,
    title: 'Semester End Check-out',
    date: '15 Sep, 2026',
    type: 'warning',
    icon: AlertTriangle,
  },
  {
    id: 2,
    title: 'Hostel Night 2026',
    date: '20 Sep, 2026',
    type: 'event',
    icon: PartyPopper,
  },
  {
    id: 3,
    title: 'Routine Maintenance',
    date: 'Tomorrow, 10:00 AM',
    type: 'info',
    icon: CalendarClock,
  },
];

export function NoticesWidget() {
  return (
    <Card className="col-span-1 md:col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Notice Board</CardTitle>
        <CardDescription>Upcoming events and alerts.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice.id} className="flex items-start gap-4 rounded-lg border p-3">
              <div className={`p-2 rounded-full ${notice.type === 'warning' ? 'bg-orange-100 text-orange-600' : notice.type === 'event' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                <notice.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{notice.title}</p>
                <p className="text-sm text-muted-foreground">{notice.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
