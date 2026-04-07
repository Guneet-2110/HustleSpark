
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
import { Mail, Key, Sparkles, Terminal, Eye, EyeOff, ArrowRight, ShieldAlert } from 'lucide-react';
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
    if (isLoggedIn && activeForm === 'login') {
        router.push('/profile');
    }
}, [isLoggedIn, router, activeForm]);

  const switchForm = (form: 'login' | 'signup') => {
    setAuthError(null);
    loginForm.reset();
    signupForm.reset();
    setActiveForm(form);
  };

  async function onLogin(values: z.infer<typeof loginSchema>) {
    setAuthError(null);
    const error = await login(values.email, values.password);
    if (error === "EMAIL_NOT_VERIFIED") {
        setAuthError("VERIFICATION REQUIRED: Your email has not been verified. Please check your inbox and spam folder for the verification link.");
    } else if (error) {
        setAuthError("AUTHENTICATION FAILED: ACCESS DENIED. PLEASE VERIFY CREDENTIALS AND RETRY.");
    }
}

  async function onSignup(values: z.infer<typeof signupSchema>) {
    setAuthError(null);
    const result = await signup(values.email, values.password);
    if (result === "VERIFY_EMAIL") {
        setActiveForm('login');
        loginForm.setValue('email', values.email);
        setAuthError("VERIFICATION REQUIRED: A confirmation link has been sent to your email. Please verify before logging in. Check your spam folder if you don't see it.");
    } else if (result) {
        setAuthError("ENROLLMENT FAILED: SYSTEM REJECTED REGISTRATION. PLEASE VERIFY DETAILS.");
    }
}

  return (
    <div className="container flex min-h-[calc(100vh-theme(spacing.14))] items-center justify-center py-12">
        <div className="w-full max-w-md mx-auto">
            <Card className="overflow-hidden shadow-2xl shadow-primary/10 rounded-[2rem] border-primary/20 bg-card/50 backdrop-blur-xl">
                <div className={`p-6 md:p-8 transform transition-all duration-500 ease-in-out ${activeForm === 'login' ? 'translate-x-0' : '-translate-x-full hidden'}`}>
                   <div className="animate-slide-in-from-left">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-2xl font-black">Hustle Interface</CardTitle>
                            <CardDescription className="font-medium">Identify yourself to access the launchpad.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                             {authError && activeForm === 'login' && (
                                <Alert variant="destructive" className="mb-4 bg-destructive/10 border-destructive/50 text-destructive rounded-xl">
                                    <ShieldAlert className="h-4 w-4" />
                                    <AlertTitle className="font-black text-xs uppercase tracking-widest">Security Alert</AlertTitle>
                                    <AlertDescription className="font-mono text-[10px] leading-tight mt-1">{authError}</AlertDescription>
                                </Alert>
                            )}
                            <Form {...loginForm}>
                            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
                                <FormField
                                control={loginForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="font-bold">Protocol Email</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input placeholder="user@hustlespark.net" {...field} className="h-12 rounded-xl bg-background/50" />
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
                                    <FormLabel className="font-bold">Security Key</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} className="h-12 rounded-xl bg-background/50" />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-primary transition-colors">
                                                {showPassword ? <EyeOff /> : <Eye />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg shadow-xl !mt-8">
                                    Establish Session
                                </Button>
                            </form>
                            </Form>
                             <div className="mt-6 text-center text-sm">
                                No profile detected?{' '}
                                <button onClick={() => switchForm('signup')} className="font-black text-primary hover:underline uppercase tracking-widest text-[10px]">
                                    Initialize Enrollment
                                </button>
                            </div>
                        </CardContent>
                   </div>
                </div>

                <div className={`p-6 md:p-8 transform transition-all duration-500 ease-in-out ${activeForm === 'signup' ? 'translate-x-0' : 'translate-x-full hidden'}`}>
                    <div className="animate-slide-in-from-right">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-2xl font-black">User Enrollment</CardTitle>
                            <CardDescription className="font-medium">Register your credentials for the venture network.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {authError && activeForm === 'signup' && (
                                <Alert variant="destructive" className="mb-4 bg-destructive/10 border-destructive/50 text-destructive rounded-xl">
                                    <ShieldAlert className="h-4 w-4" />
                                    <AlertTitle className="font-black text-xs uppercase tracking-widest">Enrollment Error</AlertTitle>
                                    <AlertDescription className="font-mono text-[10px] leading-tight mt-1">{authError}</AlertDescription>
                                </Alert>
                            )}
                            <Form {...signupForm}>
                            <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-6">
                                <FormField
                                control={signupForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="font-bold">Protocol Email</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input placeholder="user@hustlespark.net" {...field} className="h-12 rounded-xl bg-background/50" />
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
                                    <FormLabel className="font-bold">Security Key</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters" {...field} className="h-12 rounded-xl bg-background/50" />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-primary transition-colors">
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
                                    <FormLabel className="font-bold">Confirm Key</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="Repeat Security Key" {...field} className="h-12 rounded-xl bg-background/50" />
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-primary transition-colors">
                                                {showConfirmPassword ? <EyeOff /> : <Eye />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg shadow-xl !mt-8">
                                    Authorize Account
                                </Button>
                            </form>
                            </Form>
                            <div className="mt-6 text-center text-sm">
                                Already enrolled?{' '}
                                <button onClick={() => switchForm('login')} className="font-black text-primary hover:underline uppercase tracking-widest text-[10px]">
                                    Verify Identity
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
        <Suspense fallback={<div>Loading Secure Interface...</div>}>
            <LoginPageContent />
        </Suspense>
    )
}
