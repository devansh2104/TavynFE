import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Radio, 
  CreditCard, 
  UserPlus, 
  LogOut, 
  Zap, 
  FileText, 
  Sparkles, 
  Activity, 
  Calendar, 
  CheckCircle2, 
  Clock,
  RotateCcw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { format } from 'date-fns';

export function RealtimeFeedWidget() {
  const { isConnected, eventLog, sendPing, lastEvent } = useSocket();
  const [testing, setTesting] = useState(false);

  const getEventIcon = (type) => {
    switch (type) {
      case 'PAYMENT_RECEIVED':
        return <CreditCard className="h-4 w-4 text-emerald-500" />;
      case 'TENANT_ADDED':
        return <UserPlus className="h-4 w-4 text-primary" />;
      case 'TENANT_CHECKOUT':
        return <LogOut className="h-4 w-4 text-rose-500" />;
      case 'RENT_GENERATED':
        return <Calendar className="h-4 w-4 text-amber-500" />;
      case 'ELECTRICITY_LOGGED':
        return <Zap className="h-4 w-4 text-indigo-500" />;
      case 'EXPENSE_ADDED':
        return <FileText className="h-4 w-4 text-rose-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-primary" />;
    }
  };

  const getEventBadge = (type) => {
    switch (type) {
      case 'PAYMENT_RECEIVED':
        return <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-1.5 py-0">Payment</Badge>;
      case 'TENANT_ADDED':
        return <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/20 px-1.5 py-0">Resident</Badge>;
      case 'TENANT_CHECKOUT':
        return <Badge variant="outline" className="text-[9px] bg-rose-500/10 text-rose-600 border-rose-500/20 px-1.5 py-0">Checkout</Badge>;
      case 'RENT_GENERATED':
        return <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-600 border-amber-500/20 px-1.5 py-0">Invoicing</Badge>;
      case 'ELECTRICITY_LOGGED':
        return <Badge variant="outline" className="text-[9px] bg-indigo-500/10 text-indigo-600 border-indigo-500/20 px-1.5 py-0">Utility</Badge>;
      default:
        return <Badge variant="outline" className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0">Socket Sync</Badge>;
    }
  };

  const handleSimulatePayment = () => {
    setTesting(true);
    sendPing('PAYMENT_RECEIVED', `Real-time payment of ₹${(Math.floor(Math.random() * 50) + 50) * 100} settled via UPI`);
    setTimeout(() => setTesting(false), 800);
  };

  const handleSimulateTenant = () => {
    setTesting(true);
    sendPing('TENANT_ADDED', `New resident check-in verified via real-time WebSocket channel`);
    setTimeout(() => setTesting(false), 800);
  };

  return (
    <Card className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isConnected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>Real-Time Live Feed</span>
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground mt-0.5">
                WebSocket updates via <code className="text-[10px] font-mono">dashboard_update</code>
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              isConnected 
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              <span>{isConnected ? 'Live' : 'Offline'}</span>
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-3">
        {/* Test simulation buttons */}
        <div className="grid grid-cols-2 gap-2 bg-muted/30 p-2 rounded-xl border border-border/50 text-xs">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSimulatePayment}
            disabled={!isConnected || testing}
            className="h-7 text-[11px] rounded-lg gap-1.5 font-medium bg-card hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30"
          >
            <CreditCard className="h-3 w-3" />
            <span>Simulate Payment</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSimulateTenant}
            disabled={!isConnected || testing}
            className="h-7 text-[11px] rounded-lg gap-1.5 font-medium bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/30"
          >
            <UserPlus className="h-3 w-3" />
            <span>Simulate Check-in</span>
          </Button>
        </div>

        {/* Live event stream list */}
        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
          {eventLog.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
              <Radio className="h-6 w-6 mx-auto text-muted-foreground/60 animate-pulse" />
              <p className="font-semibold text-foreground text-xs pt-1">Listening for Live Events</p>
              <p className="text-[11px] text-muted-foreground max-w-[220px] mx-auto">
                Any rent payment, tenant registration, or meter entry will display here live.
              </p>
            </div>
          ) : (
            eventLog.slice(0, 8).map((evt) => (
              <div 
                key={evt.id} 
                className="flex items-start gap-2.5 p-2 rounded-lg bg-muted/20 border border-border/40 text-xs hover:bg-muted/40 transition-colors animate-in fade-in"
              >
                <div className="p-1 rounded-md bg-card border border-border/60 shrink-0 mt-0.5">
                  {getEventIcon(evt.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    {getEventBadge(evt.type)}
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {format(new Date(evt.timestamp), 'HH:mm:ss')}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">
                    {evt.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
