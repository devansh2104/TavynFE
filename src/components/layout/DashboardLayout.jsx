import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AskAiSearchBox from '../AskAiSearchBox';

export function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <AppSidebar />
        <main className="flex w-full flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger />
            <div className="w-full flex-1">
              <div className="w-full md:w-2/3 lg:w-1/2">
                <AskAiSearchBox
                  placeholder="Ask AI or search residents, rooms, bills..."
                  context="global"
                  size="sm"
                  className="w-full"
                />
              </div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </header>
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
