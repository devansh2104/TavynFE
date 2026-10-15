import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { 
  Building2, 
  CreditCard, 
  LayoutDashboard, 
  Users, 
  Settings, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navItems = [
  { title: 'Dashboard', icon: LayoutDashboard, url: '#' },
  { title: 'Residents', icon: Users, url: '#' },
  { title: 'Rooms & Beds', icon: Building2, url: '#' },
  { title: 'Fee Management', icon: CreditCard, url: '#' },
  { title: 'Gate Passes', icon: FileText, url: '#' },
  { title: 'Complaints', icon: AlertCircle, url: '#' },
];

export function AppSidebar() {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="h-14 flex items-center justify-center border-b">
        <div className="flex items-center gap-2 px-4 w-full font-semibold text-lg">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="truncate group-data-[collapsible=icon]:hidden">Hostel Hub</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-medium">Admin User</span>
            <span className="text-xs text-muted-foreground">admin@hostel.edu</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
