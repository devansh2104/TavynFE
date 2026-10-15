import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const sampleBlocks = [
  { name: 'Block A (Boys)', occupied: 320, available: 30, capacity: 350 },
  { name: 'Block B (Boys)', occupied: 280, available: 70, capacity: 350 },
  { name: 'Block C (Girls)', occupied: 250, available: 15, capacity: 265 },
  { name: 'Block D (PG/Single)', occupied: 140, available: 45, capacity: 185 },
  { name: 'Block E (Annex)', occupied: 95, available: 25, capacity: 120 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border/80 bg-background/95 p-3 shadow-xl backdrop-blur-md text-xs">
        <p className="font-semibold text-foreground mb-1.5">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-muted-foreground">Occupied Beds:</span>
            <span className="font-bold text-foreground">{payload[0].value}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            <span className="text-muted-foreground">Vacant Beds:</span>
            <span className="font-bold text-foreground">{payload[1].value}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function OccupancyChart({ data = sampleBlocks }) {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <Card className="rounded-xl border border-border/80 bg-card shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-2">
        <div>
          <CardTitle className="text-base sm:text-lg font-bold tracking-tight">
            Building & Wing Occupancy
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Capacity distribution and bed allocation per block
          </CardDescription>
        </div>
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg">
          <Button 
            variant={activeTab === 'all' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="h-7 text-xs px-2.5 rounded-md"
            onClick={() => setActiveTab('all')}
          >
            All Wings
          </Button>
          <Button 
            variant={activeTab === 'boys' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="h-7 text-xs px-2.5 rounded-md"
            onClick={() => setActiveTab('boys')}
          >
            Boys
          </Button>
          <Button 
            variant={activeTab === 'girls' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="h-7 text-xs px-2.5 rounded-md"
            onClick={() => setActiveTab('girls')}
          >
            Girls
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[230px] sm:h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              margin={{ top: 10, right: 8, left: -25, bottom: 0 }}
              maxBarSize={28}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.6)" />
              <XAxis 
                dataKey="name" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(val) => typeof val === 'string' ? val.replace(/ \(.*/, '') : val}
              />
              <YAxis 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                align="right" 
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              />
              <Bar 
                dataKey="occupied" 
                name="Occupied Beds" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]} 
                stackId="a" 
              />
              <Bar 
                dataKey="available" 
                name="Vacant Beds" 
                fill="hsl(var(--muted-foreground) / 0.2)" 
                radius={[4, 4, 0, 0]} 
                stackId="a" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
