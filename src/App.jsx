import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BuildingProvider } from './context/BuildingContext';
import { SocketProvider } from './context/SocketContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Rooms from './pages/Rooms/Rooms';
import Tenants from './pages/Tenants/Tenants';
import AddTenant from './pages/Tenants/AddTenant';
import Rent from './pages/Rent/Rent';
import Electricity from './pages/Electricity/Electricity';
import Expenses from './pages/Expenses/Expenses';
import Reports from './pages/Reports/Reports';
import StaffManagement from './pages/Staff/StaffManagement';
import AccessControl from './pages/AccessControl/AccessControl';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center font-medium text-muted-foreground">
        Loading session...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PermissionRoute({ menuKey, allowedRoles, children }) {
  const { user, hasPermission } = useAuth();
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  if (menuKey && !hasPermission(menuKey)) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <h3 className="text-lg font-bold text-destructive">Access Restricted</h3>
        <p className="text-sm mt-1">Access to this menu has been disabled by your administrator.</p>
      </div>
    );
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BuildingProvider>
        <SocketProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              
              <Route 
                path="tenants" 
                element={
                  <PermissionRoute menuKey="tenants">
                    <Tenants />
                  </PermissionRoute>
                } 
              />
              <Route 
                path="tenants/add" 
                element={
                  <PermissionRoute menuKey="tenants">
                    <AddTenant />
                  </PermissionRoute>
                } 
              />
              
              <Route 
                path="rooms" 
                element={
                  <PermissionRoute menuKey="rooms">
                    <Rooms />
                  </PermissionRoute>
                } 
              />
              
              <Route 
                path="rent" 
                element={
                  <PermissionRoute menuKey="rent">
                    <Rent />
                  </PermissionRoute>
                } 
              />
              
              <Route 
                path="electricity" 
                element={
                  <PermissionRoute menuKey="electricity">
                    <Electricity />
                  </PermissionRoute>
                } 
              />
              
              <Route 
                path="expenses" 
                element={
                  <PermissionRoute menuKey="expenses">
                    <Expenses />
                  </PermissionRoute>
                } 
              />
              
              <Route 
                path="reports" 
                element={
                  <PermissionRoute menuKey="reports">
                    <Reports />
                  </PermissionRoute>
                } 
              />

              {/* Staff Management for Hostel Admin & Super Admin */}
              <Route 
                path="staff" 
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'HOSTEL_ADMIN']}>
                    <StaffManagement />
                  </PermissionRoute>
                } 
              />

              {/* Access Control for Super Admin */}
              <Route 
                path="access-control" 
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN']}>
                    <AccessControl />
                  </PermissionRoute>
                } 
              />
              
              <Route path="payments" element={<Rent />} />
              <Route path="settings" element={<div className="p-4">Owner Profile & Building Settings</div>} />
              <Route path="more" element={<div className="p-4">Settings, Reports & Logout Options</div>} />
              <Route path="add" element={<Navigate to="/tenants/add" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
        </SocketProvider>
      </BuildingProvider>
    </AuthProvider>
  );
}

export default App;
