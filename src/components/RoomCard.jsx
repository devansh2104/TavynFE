import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, CheckCircle2 } from 'lucide-react';

export default function RoomCard({ roomNumber, capacity, occupied, beds, onOpenRoom }) {
  return (
    <Card className="flex flex-col h-full border-border hover:border-primary/50 transition-colors">
      <CardHeader className="bg-muted/50 pb-4 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold">ROOM {roomNumber}</CardTitle>
          <span className="text-sm font-medium text-muted-foreground">
            {occupied} / {capacity} Occupied
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pt-4 pb-2">
        <div className="space-y-3">
          {beds.map((bed, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-sm font-semibold w-8">{bed.id}</span>
              
              {bed.status === 'Available' ? (
                <div className="flex-1 flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Available</span>
                </div>
              ) : (
                <div className="flex-1 flex items-center gap-2 text-foreground">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate">{bed.tenantName}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <Button variant="outline" className="w-full text-primary" onClick={onOpenRoom}>
          Open Room
        </Button>
      </CardFooter>
    </Card>
  );
}
