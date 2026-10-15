import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const residents = [
  {
    id: 'R001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    room: 'A-102',
    course: 'B.Tech CS',
    status: 'Paid',
  },
  {
    id: 'R002',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    room: 'C-205',
    course: 'B.Arch',
    status: 'Due',
  },
  {
    id: 'R003',
    name: 'Rohan Gupta',
    email: 'rohan.gupta@example.com',
    room: 'B-310',
    course: 'MBA',
    status: 'Paid',
  },
  {
    id: 'R004',
    name: 'Ananya Singh',
    email: 'ananya.s@example.com',
    room: 'C-101',
    course: 'B.Tech EC',
    status: 'Overdue',
  },
  {
    id: 'R005',
    name: 'Kabir Verma',
    email: 'kabir.v@example.com',
    room: 'A-412',
    course: 'M.Tech',
    status: 'Paid',
  },
];

export function ResidentsTable() {
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Residents</CardTitle>
            <CardDescription>Directory of newly admitted or updated profiles.</CardDescription>
          </div>
          <Button variant="outline" size="sm">View All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Resident</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Fee Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {residents.map((resident) => (
              <TableRow key={resident.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${resident.name}`} />
                      <AvatarFallback>{resident.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{resident.name}</span>
                      <span className="text-xs text-muted-foreground">{resident.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{resident.room}</TableCell>
                <TableCell>{resident.course}</TableCell>
                <TableCell>
                  <Badge 
                    variant={resident.status === 'Paid' ? 'default' : resident.status === 'Due' ? 'secondary' : 'destructive'}
                    className={resident.status === 'Paid' ? 'bg-green-500 hover:bg-green-600' : ''}
                  >
                    {resident.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Edit Details</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Mark Defaulter</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
