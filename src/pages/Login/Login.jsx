import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { BrandLogo } from '../../components/ui/Logo';

export default function Login() {
  const [email, setEmail] = useState('owner@tavyn.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or server unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/40 relative overflow-hidden">
      
      {/* Background soft glow decoration */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Brand identity */}
        <div className="flex flex-col items-center text-center space-y-2">
          <BrandLogo size="lg" variant="dark" className="mb-1" />
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-1.5">
            TAVYN <span className="text-primary">HOSTEL</span>
          </h1>
          <p className="text-xs text-muted-foreground max-w-xs">
            Integrated hostel HR, occupancy & financial management platform
          </p>
        </div>

        <Card className="rounded-2xl border border-border/80 bg-card shadow-xl overflow-hidden">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-bold text-foreground">Sign In to Control Center</CardTitle>
            <p className="text-xs text-muted-foreground">Enter your admin credentials to access your properties</p>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-xs text-rose-600 bg-rose-500/10 border border-rose-500/20 rounded-xl animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    placeholder="owner@tavyn.com"
                    className="pl-9 h-10 rounded-xl text-xs bg-muted/20 border-border/80 focus-visible:bg-background"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="pl-9 h-10 rounded-xl text-xs bg-muted/20 border-border/80 focus-visible:bg-background"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-[11px] text-muted-foreground space-y-1">
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-500" /> Default Demo Account:
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono">SEEDED</Badge>
                </div>
                <p>Email: <strong className="text-foreground">owner@tavyn.com</strong></p>
                <p>Password: <strong className="text-foreground">admin123</strong></p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 pt-2">
              <Button 
                type="submit" 
                className="w-full text-xs font-semibold py-5 rounded-xl shadow-md gap-2" 
                disabled={loading}
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>

      </div>
    </div>
  );
}
