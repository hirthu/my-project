import type { Tutor } from '@/services/tutor';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, PlayCircle, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface TutorCardProps {
  tutor: Tutor;
}

export default function TutorCard({ tutor }: TutorCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg">
      <CardHeader className="p-0 relative">
         {/* Placeholder for intro video thumbnail */}
         <div className="aspect-video relative bg-muted group">
           <Image
             // Using a placeholder - replace introVideoUrl if it's an actual video URL
             src={`https://picsum.photos/seed/${tutor.id}/400/225`}
             alt={`${tutor.name} intro video thumbnail`}
             fill
             style={{ objectFit: 'cover' }}
             data-ai-hint="person teaching online video"
             unoptimized
           />
           <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <PlayCircle className="h-12 w-12 text-white/80" />
           </div>
         </div>
      </CardHeader>
      <CardContent className="pt-4 pb-2 flex-grow">
        <CardTitle className="text-lg mb-1">{tutor.name}</CardTitle>
        <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-2">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span>{tutor.rating.toFixed(1)}</span>
          {/* Add number of reviews if available */}
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {tutor.certifications.slice(0, 3).map((cert) => ( // Limit certs shown
            <Badge key={cert} variant="secondary" className="text-xs">
              {cert}
            </Badge>
          ))}
           {tutor.certifications.length > 3 && (
             <Badge variant="outline" className="text-xs">
               +{tutor.certifications.length - 3} more
             </Badge>
           )}
        </div>
        <CardDescription className="text-sm line-clamp-2">
          {/* Placeholder description - fetch from tutor data if available */}
          Experienced and passionate tutor specializing in helping students achieve their academic goals.
        </CardDescription>
      </CardContent>
      <CardFooter className="pt-2 pb-4 px-4 flex justify-between items-center">
        <Button variant="outline" size="sm" asChild>
           <Link href={`/booking?tutorId=${tutor.id}`}>
             <Calendar className="mr-1 h-4 w-4" />
             Book
           </Link>
        </Button>
        {/* Potentially add price or view profile button */}
        <Button variant="ghost" size="sm" className="text-accent">
           View Profile
        </Button>
      </CardFooter>
    </Card>
  );
}
