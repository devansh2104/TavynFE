import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
  { name: 'Block A (Boys)', occupied: 320, available: 30 },
  { name: 'Block B (Boys)', occupied: 280, available: 70 },
  { name: 'Block C (Girls)', occupied: 250, available: 10 },
  { name: 'Block D (PG)', occupied: 150, available: 50 },
];

export function OccupancyChart() {
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle>Room Occupancy</CardTitle>
        <CardDescription>
          Current occupancy vs availability across all blocks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="occupied" name="Occupied Beds" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="available" name="Available Beds" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
