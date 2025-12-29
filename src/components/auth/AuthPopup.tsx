
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, User } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export function AuthPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { toast } = useToast();
  const { user, signIn, signUp, loading } = useAuth();
  const { settings } = useSiteSettings();

  useEffect(() => {
    // Show popup if user is not logged in
    const timer = setTimeout(() => {
      if (!loading && !user) {
        setIsOpen(true);
      }
    }, 1000); // Small delay for better UX

    return () => clearTimeout(timer);
  }, [loading, user]);

  const validateForm = () => {
    try {
      authSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        err.errors.forEach((error) => {
          if (error.path[0] === 'email') fieldErrors.email = error.message;
          if (error.path[0] === 'password') fieldErrors.password = error.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && !settings.features.registration_enabled) {
      toast({
        title: "Registration Disabled",
        description: "New user registration is currently turned off.",
        variant: "destructive"
      });
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Login failed",
            description: error.message === 'Invalid login credentials'
              ? "Invalid email or password. Please try again."
              : error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
          setIsOpen(false);
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              avatar_url: "",
            },
            emailRedirectTo: `${window.location.origin}/`,
          }
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please log in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign up failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Account created!",
            description: "Please check your email to confirm your account.",
          });
          setIsOpen(false);
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-transparent border-0 shadow-none">
        <div className="glass-card p-8 rounded-2xl shadow-elevated bg-background/95 backdrop-blur-xl border border-white/10">
          {/* Header */}
          <div className="text-center mb-8">
            <DialogTitle className="sr-only">
              {isLogin ? 'Login' : 'Sign Up'}
            </DialogTitle>
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 transition-transform hover:scale-105 duration-300"
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-semibold text-foreground">
              {isLogin ? 'Welcome Back' : 'Join Unheard Pages'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isLogin
                ? 'Enter your credentials to access your account'
                : 'Create an account to share your story'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="popup-email" className="text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="popup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="popup-name" className="text-foreground">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="popup-name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="popup-password" className="text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="popup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full btn-glow"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            {settings.features.registration_enabled ? (
              <p className="text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                  }}
                  className="ml-2 text-primary hover:underline font-medium"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            ) : (
              isLogin ? null : (
                <p className="text-muted-foreground text-sm">
                  Registration is currently closed. <button onClick={() => setIsLogin(true)} className="text-primary hover:underline">Back to Login</button>
                </p>
              )
            )}
            {!isLogin && !settings.features.registration_enabled && (
              <div className="mt-2 text-amber-500 text-sm">
                New registrations are temporarily disabled.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
