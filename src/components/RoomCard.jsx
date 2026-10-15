import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, CheckCircle2, Bed as BedIcon, ArrowUpRight } from 'lucide-react';

export default function RoomCard({ roomNumber, capacity, occupied, beds = [], onOpenRoom }) {
  const isFull = occupied >= capacity;
  const isVacant = occupied === 0;
  const occupancyPercent = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;

  return (
    <Card className="rounded-xl border border-border/80 bg-card shadow-sm hover:shadow-md hover:border-border transition-all flex flex-col h-full overflow-hidden">
      <CardHeader className="bg-muted/30 p-4 border-b border-border/60">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <BedIcon className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm sm:text-base font-bold tracking-tight">
              Room {roomNumber}
            </CardTitle>
          </div>
          <Badge 
            variant="outline" 
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              isFull 
                ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' 
                : isVacant 
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
            }`}
          >
            {occupied} / {capacity} Beds
          </Badge>
        </div>

        {/* Mini capacity progress bar */}
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              isFull ? 'bg-rose-500' : isVacant ? 'bg-emerald-500' : 'bg-primary'
            }`}
            style={{ width: `${occupancyPercent}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-4 space-y-2.5">
        <div className="space-y-2">
          {beds.map((bed, idx) => {
            const isAvail = bed.status === 'Available' || !bed.tenant;
            return (
              <div 
                key={idx} 
                className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/40 text-xs"
              >
                <span className="font-mono font-bold text-muted-foreground w-12">
                  {bed.bedNumber ? `Bed ${bed.bedNumber}` : bed.id}
                </span>
                
                {isAvail ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Vacant</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-foreground font-semibold truncate max-w-[140px]">
                    <User className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{bed.tenant?.name || bed.tenantName || 'Resident'}</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0">
        <Button 
          variant="outline" 
          size="sm"
          className="w-full text-xs font-semibold rounded-lg h-8 gap-1 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all" 
          onClick={onOpenRoom}
        >
          <span>Manage Room</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
