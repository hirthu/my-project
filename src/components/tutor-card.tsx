import type { Tutor } from '@/services/tutor';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, PlayCircle, Calendar, User } from 'lucide-react'; // Added User icon
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Import Avatar components

interface TutorCardProps {
  tutor: Tutor;
}

export default function TutorCard({ tutor }: TutorCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg bg-card border rounded-xl group"> {/* Added rounded-xl and group */}
      <CardHeader className="p-0 relative group"> {/* Re-added group for consistency, though inner one is sufficient */}
         {/* Placeholder for intro video thumbnail */}
         <div className="aspect-video relative bg-muted overflow-hidden">
           <Image
             // Using introVideoUrl which might be an image placeholder URL
             src={tutor.introVideoUrl || `https://picsum.photos/seed/${tutor.id}/400/225`}
             alt={`${tutor.name} intro video thumbnail`}
             fill
             style={{ objectFit: 'cover' }}
             data-ai-hint="person teaching online video professional" // Updated hint
             unoptimized
             className="transition-transform duration-500 group-hover:scale-110" // Zoom effect
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
             {/* Overlay effect */}
           </div>
           {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <PlayCircle className="h-14 w-14 text-white/90 drop-shadow-lg" />
           </div>
           {/* Avatar overlapping the image slightly */}
            <div className="absolute bottom-0 left-4 transform translate-y-1/2">
               <Avatar className="h-16 w-16 border-4 border-card shadow-md">
                   <AvatarImage src={`https://picsum.photos/seed/${tutor.id}/100`} alt={tutor.name} data-ai-hint="profile portrait person friendly"/>
                   <AvatarFallback className="text-lg">{tutor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
               </Avatar>
           </div>
         </div>
      </CardHeader>
      {/* Increased top padding to accommodate overlapping avatar */}
      <CardContent className="pt-10 pb-3 flex-grow">
        <CardTitle className="text-lg font-semibold mb-1">{tutor.name}</CardTitle> {/* Added font-semibold */}
        <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-3">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span>{tutor.rating.toFixed(1)}</span>
           {/* Optionally add review count later: <span className="ml-1">(12 reviews)</span> */}
        </div>
         <CardDescription className="text-sm line-clamp-3 mb-3 min-h-[3.75rem]"> {/* Set min-height to prevent layout shifts */}
          {tutor.description || 'Experienced tutor dedicated to student success.'} {/* Display tutor description */}
        </CardDescription>
        <div className="flex flex-wrap gap-1">
          {tutor.certifications.slice(0, 2).map((cert) => ( // Show fewer certs initially
            <Badge key={cert} variant="secondary" className="text-xs font-normal px-2 py-0.5"> {/* Adjusted padding/font */}
              {cert}
            </Badge>
          ))}
           {tutor.certifications.length > 2 && (
             <Badge variant="outline" className="text-xs font-normal px-2 py-0.5">
               +{tutor.certifications.length - 2} more
             </Badge>
           )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-4 px-4 flex justify-between items-center border-t mt-auto"> {/* Added border-t */}
        <Button asChild variant="ghost" size="sm" className="text-accent hover:bg-accent/10">
          <Link href={`/tutors/${tutor.id}`}>
             {/* Removed unnecessary span wrapper */}
             <User className="mr-1 h-4 w-4 inline-block align-middle" />
             View Profile
           </Link>
        </Button>
         <Button asChild variant="default" size="sm">
           <Link href={`/booking?tutorId=${tutor.id}`}>
              {/* Removed unnecessary span wrapper */}
             <Calendar className="mr-1 h-4 w-4 inline-block align-middle" />
             Book Now
           </Link>
         </Button>
      </CardFooter>
    </Card>
  );
}
