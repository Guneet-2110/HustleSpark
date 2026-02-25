import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { slugify } from '@/lib/utils';
import type { HustleIdea } from '@/ai/flows/generate-hustle-ideas';


interface HustleCardProps {
  hustle: HustleIdea;
}

export function HustleCard({ hustle }: HustleCardProps) {
  const slug = slugify(hustle.name);

  const handleHustleClick = () => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('currentHustle', JSON.stringify(hustle));
    }
  }

  return (
    <Link href={`/hustle/${slug}`} onClick={handleHustleClick} className="block h-full">
      <Card className="h-full flex flex-col transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/20">
        <CardHeader className="flex-grow">
          <CardTitle className="text-xl">{hustle.name}</CardTitle>
          <CardDescription className="pt-2">{hustle.description}</CardDescription>
        </CardHeader>
        <CardFooter>
            <div className="flex items-center text-sm font-medium text-primary">
              Explore Idea
              <ArrowRight className="ml-2 h-4 w-4" />
            </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
