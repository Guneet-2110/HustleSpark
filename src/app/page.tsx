
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CheckCircle, Lightbulb, Rocket, Sparkles, Check, Star, TrendingUp, Users, Bot } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

function Avatar1() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill="#635BFF" />
            <path d="M26.5 28C26.5 24.4101 23.5899 21.5 20 21.5C16.4101 21.5 13.5 24.4101 13.5 28" stroke="#E0E7FF" strokeWidth="2" strokeLinecap="round" />
            <circle cx="20" cy="16" r="4" fill="#E0E7FF" />
        </svg>
    )
}

function Avatar2() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill="#F472B6" />
            <path d="M26.5 28C26.5 24.4101 23.5899 21.5 20 21.5C16.4101 21.5 13.5 24.4101 13.5 28" stroke="#FCE7F3" strokeWidth="2" strokeLinecap="round" />
            <circle cx="20" cy="16" r="4" fill="#FCE7F3" />
        </svg>
    )
}

function Avatar3() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill="#38BDF8" />
            <path d="M26.5 28C26.5 24.4101 23.5899 21.5 20 21.5C16.4101 21.5 13.5 24.4101 13.5 28" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round" />
            <circle cx="20" cy="16" r="4" fill="#E0F2FE" />
        </svg>
    )
}


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-br from-background to-primary/10">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-24 items-center">
              <div className="flex flex-col justify-center space-y-4 animate-fade-in-down">
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    Launch Your Next Side Hustle with AI
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground text-base md:text-xl">
                    HustleSpark is your personal AI-powered launchpad for side hustles. Stop wondering and start building your next venture today.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="group">
                    <Link href="/login?tab=signup">
                      Get Started for Free
                      <Rocket className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative h-[400px] flex items-center justify-center animate-fade-in">
                 <div className="absolute w-72 h-72 bg-accent/30 rounded-full blur-3xl animate-pulse" />
                 <div className="absolute bottom-0 right-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl animate-pulse animation-delay-400" />
                 <div className="absolute top-0 left-10 w-56 h-56 bg-primary/10 rounded-full blur-3xl animate-pulse animation-delay-200" />
                 <div className="relative z-10 text-center">
                    <Card className="p-6 bg-background/50 backdrop-blur-sm border-primary/20 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-2xl">Your Idea, Supercharged</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">From a simple thought to a full-fledged business plan.</p>
                      </CardContent>
                    </Card>
                 </div>
              </div>
            </div>
          </div>
        </section>
        
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 animate-fade-in-down">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Launch Your Hustle Faster Than Ever</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  HustleSpark provides you with the tools and ideas you need to get your side business off the ground.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
              <div className="grid gap-1 text-center p-4 rounded-lg hover:bg-muted/50 transition-all duration-300 transform hover:-translate-y-1">
                <Lightbulb className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-lg font-bold">AI Idea Generation</h3>
                <p className="text-sm text-muted-foreground">Get personalized side hustle ideas based on your unique skills and interests.</p>
              </div>
              <div className="grid gap-1 text-center p-4 rounded-lg hover:bg-muted/50 transition-all duration-300 transform hover:-translate-y-1">
                <Sparkles className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-lg font-bold">AI Marketing Kits</h3>
                <p className="text-sm text-muted-foreground">Instantly generate marketing prompts and even a logo to kickstart your brand.</p>
              </div>
              <div className="grid gap-1 text-center p-4 rounded-lg hover:bg-muted/50 transition-all duration-300 transform hover:-translate-y-1">
                <Rocket className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-lg font-bold">Fast-Track to Launch</h3>
                <p className="text-sm text-muted-foreground">Go from idea to launch in record time with our streamlined, AI-driven process.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6 animate-fade-in-down">
                <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                    See What Others Are Building
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Our users have launched amazing ventures. Get inspired by their success.
                </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    <Card className="transform hover:scale-105 transition-transform duration-300 text-left">
                        <CardHeader>
                             <div className="flex items-center mb-4">
                                <Avatar1 />
                                <div className="ml-4">
                                    <p className="font-semibold">Jane D.</p>
                                    <div className="flex text-yellow-400">
                                       <Star className="w-4 h-4 fill-current"/>
                                       <Star className="w-4 h-4 fill-current"/>
                                       <Star className="w-4 h-4 fill-current"/>
                                       <Star className="w-4 h-4 fill-current"/>
                                       <Star className="w-4 h-4 fill-current"/>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">"I always had a passion for graphic design but no clue how to market it. HustleSpark gave me the exact marketing ideas and a killer logo that got me noticed. I landed my first paying client within a week!"</p>
                        </CardContent>
                    </Card>
                    <Card className="transform hover:scale-105 transition-transform duration-300 text-left">
                         <CardHeader>
                            <div className="flex items-center mb-4">
                                <Avatar2 />
                                <div className="ml-4">
                                    <p className="font-semibold">Mike R.</p>
                                     <div className="flex text-yellow-400">
                                       <Star className="w-4 h-4 fill-current"/>
                                       <Star className="w-4 h-4 fill-current"/>
                                       <Star className="w-4 h-4 fill-current"/>
                                       <Star className="w-4 h-4 fill-current"/>
                                       <Star className="w-4 h-4 fill-current"/>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                           <p className="text-muted-foreground">"The 1-month plan was a game-changer. It broke down everything into simple daily tasks. Before I knew it, my custom sneaker business was launched and I was making actual sales. Incredible."</p>
                        </CardContent>
                    </Card>
                     <Card className="transform hover:scale-105 transition-transform duration-300 text-left">
                        <CardHeader>
                           <div className="flex items-center mb-4">
                                <Avatar3 />
                                <div className="ml-4">
                                    <p className="font-semibold">Alex P.</p>
                                    <div className="flex text-yellow-400">
                                       <Star className="w-4 h-4 fill-current"/>
                                       <Star className="w-4 h-4 fill-current"/>
                                       <Star className="w-4 h-4 fill-current"/>
                                       <Star className="w-4 h-4 fill-current"/>
                                       <Star className="w-4 h-4 "/>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                           <p className="text-muted-foreground">"I went premium for the Live Hustle Tracker and it's worth every penny. Seeing my earnings goal and progress in one place keeps me motivated. The AI-generated flyer was just the cherry on top."</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
        
        <section id="premium" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6 animate-fade-in-down">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-primary text-primary-foreground px-3 py-1 text-sm">Premium</div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Unlock Your Full Potential</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Our Premium plan gives you everything you need to turn an idea into a real business.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
                    <div className="flex flex-col justify-center space-y-4">
                        <ul className="grid gap-6">
                            <li>
                                <div className="grid gap-1">
                                    <h3 className="text-xl font-bold flex items-center"><CheckCircle className="mr-2 text-primary"/>In-depth Hustle Blueprints</h3>
                                    <p className="text-muted-foreground">
                                        Go beyond basic descriptions with expert-level pricing strategies, creative marketing ideas to land your first customers, and ready-to-use text for flyers and social media.
                                    </p>
                                </div>
                            </li>
                            <li>
                                <div className="grid gap-1">
                                    <h3 className="text-xl font-bold flex items-center"><CheckCircle className="mr-2 text-primary"/>Full Marketing & Launch Kit</h3>
                                    <p className="text-muted-foreground">
                                        Instantly generate professional logos and flyers, get AI-crafted marketing prompts for social media, and receive a detailed, day-by-day 4-week action plan to guide you from zero to launch.
                                    </p>
                                </div>
                            </li>
                            <li>
                                <div className="grid gap-1">
                                    <h3 className="text-xl font-bold flex items-center"><CheckCircle className="mr-2 text-primary"/>Live Hustle Tracker</h3>
                                    <p className="text-muted-foreground">
                                        Manage your entire hustle in one place. Track your launch progress with an interactive checklist, monitor your earnings with a visual dashboard, and stay on top of your goals.
                                    </p>
                                </div>
                            </li>
                             <li>
                                <div className="grid gap-1">
                                    <h3 className="text-xl font-bold flex items-center"><Bot className="mr-2 text-primary"/>Personal AI Hustle Coach</h3>
                                    <p className="text-muted-foreground">
                                        Chat with Sparky, your AI mentor. Get personalized advice, stay motivated with progress tracking, and get help with copywriting and project management whenever you're stuck.
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>
                     <div className="grid grid-cols-1 gap-6">
                        <Card className="border-primary border-2 shadow-2xl shadow-primary/20 transform hover:scale-105 transition-transform duration-300">
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl">Monthly</CardTitle>
                                <p className="text-4xl font-bold">$15<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                            </CardHeader>
                            <CardContent>
                                <p className="text-center text-sm text-muted-foreground">A small investment for a lifetime of potential paychecks. Invest in yourself.</p>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full group">
                                    <Link href="/login?tab=signup">
                                        Choose Monthly
                                        <Rocket className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                         <div className="text-center">
                            <p className="text-base text-muted-foreground italic">A small investment for a lifetime of potential paychecks. Invest in yourself.</p>
                        </div>
                     </div>
                </div>
            </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6 animate-fade-in-down">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to Start Your Hustle?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Stop dreaming and start doing. Sign up now and generate your first side hustle idea in minutes.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
               <Button asChild size="lg" className="w-full group">
                <Link href="/login?tab=signup">
                  Sign Up Now
                  <Sparkles className="ml-2 h-5 w-5 transition-all duration-300 group-hover:animate-pulse" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Get started for free. No credit card required.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <div className="flex flex-col sm:flex-row gap-2 items-center w-full">
            <p className="text-xs text-muted-foreground">&copy; 2025 HustleSpark. All rights reserved.</p>
            <p className="sm:ml-auto text-[10px] text-muted-foreground/50">
                These testimonials are illustrative examples to showcase potential user experiences.
            </p>
        </div>
      </footer>
    </div>
  );
}
