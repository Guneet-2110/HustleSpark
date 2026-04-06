
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Key, Sparkles, Terminal, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const signupSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});


function LoginPageContent() {
  const { login, signup, isLoggedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const initialForm = searchParams.get('tab') === 'signup' ? 'signup' : 'login';
  const [activeForm, setActiveForm] = useState<'login' | 'signup'>(initialForm);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  
  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  // Global observer to redirect on successful auth
  useEffect(() => {
    if (isLoggedIn) {
        router.push('/profile');
    }
  }, [isLoggedIn, router]);

  const switchForm = (form: 'login' | 'signup') => {
    setAuthError(null);
    loginForm.reset();
    signupForm.reset();
    setActiveForm(form);
  };

  async function onLogin(values: z.infer<typeof loginSchema>) {
    setAuthError(null);
    const error = await login(values.email, values.password);
    if (error) {
        setAuthError(error);
    }
  }

  async function onSignup(values: z.infer<typeof signupSchema>) {
    setAuthError(null);
    const result = await signup(values.email, values.password);
    if (result) {
        setAuthError(result);
    }
    // Redirect is handled by the useEffect isLoggedIn observer
  }

  return (
    <div className="container flex min-h-[calc(100vh-theme(spacing.14))] items-center justify-center py-12">
        <div className="w-full max-w-md mx-auto">
            <Card className="overflow-hidden shadow-2xl shadow-primary/10">
                <div className={`p-6 md:p-8 transform transition-all duration-500 ease-in-out ${activeForm === 'login' ? 'translate-x-0' : '-translate-x-full hidden'}`}>
                   <div className="animate-slide-in-from-left">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle>Welcome Back</CardTitle>
                            <CardDescription>Enter your credentials to access your account.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                             {authError && activeForm === 'login' && (
                                <Alert variant="destructive" className="mb-4">
                                    <Terminal className="h-4 w-4" />
                                    <AlertTitle>Authentication Failed</AlertTitle>
                                    <AlertDescription>{authError}</AlertDescription>
                                </Alert>
                            )}
                            <Form {...loginForm}>
                            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
                                <FormField
                                control={loginForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input placeholder="you@example.com" {...field} />
                                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={loginForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">
                                                {showPassword ? <EyeOff /> : <Eye />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <Button type="submit" className="w-full !mt-8">
                                Login with Email
                                </Button>
                            </form>
                            </Form>
                             <div className="mt-6 text-center text-sm">
                                Don't have an account?{' '}
                                <button onClick={() => switchForm('signup')} className="font-semibold text-primary hover:underline">
                                    Sign Up
                                </button>
                            </div>
                        </CardContent>
                   </div>
                </div>

                <div className={`p-6 md:p-8 transform transition-all duration-500 ease-in-out ${activeForm === 'signup' ? 'translate-x-0' : 'translate-x-full hidden'}`}>
                    <div className="animate-slide-in-from-right">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle>Create an Account</CardTitle>
                            <CardDescription>It's quick and easy to get started.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {authError && activeForm === 'signup' && (
                                <Alert variant="destructive" className="mb-4">
                                    <Terminal className="h-4 w-4" />
                                    <AlertTitle>Signup Failed</AlertTitle>
                                    <AlertDescription>{authError}</AlertDescription>
                                </Alert>
                            )}
                            <Form {...signupForm}>
                            <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-6">
                                <FormField
                                control={signupForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input placeholder="you@example.com" {...field} />
                                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={signupForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type={showPassword ? 'text' : 'password'} placeholder="Minimum 8 characters" {...field} />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">
                                                {showPassword ? <EyeOff /> : <Eye />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={signupForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="Re-enter your password" {...field} />
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">
                                                {showConfirmPassword ? <EyeOff /> : <Eye />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <Button type="submit" className="w-full !mt-8">
                                    Create Account
                                </Button>
                            </form>
                            </Form>
                            <div className="mt-6 text-center text-sm">
                                Already have an account?{' '}
                                <button onClick={() => switchForm('login')} className="font-semibold text-primary hover:underline">
                                    Log In
                                </button>
                            </div>
                        </CardContent>
                    </div>
                </div>
            </Card>
        </div>
    </div>
  );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginPageContent />
        </Suspense>
    )
}
