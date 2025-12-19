import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Video, Image, FileText, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SurveyContent {
  id: string;
  content_type: string;
  title: string;
  content_url: string | null;
  content_text: string | null;
  display_order: number;
  is_active: boolean;
}

function getYouTubeEmbedUrl(url: string, autoplay: boolean = false): string | null {
  // Support regular YouTube URLs
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}${autoplay ? '?autoplay=1&mute=1' : ''}`;
  }
  
  // Support YouTube Shorts URLs
  const shortsRegExp = /^.*(youtube.com\/shorts\/)([^#&?]*).*/;
  const shortsMatch = url.match(shortsRegExp);
  if (shortsMatch && shortsMatch[2]) {
    const videoId = shortsMatch[2].split('?')[0]; // Remove query params
    return `https://www.youtube.com/embed/${videoId}${autoplay ? '?autoplay=1&mute=1' : ''}`;
  }
  
  return null;
}

export function SurveyView() {
  const [fullscreenPoster, setFullscreenPoster] = useState<SurveyContent | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentPosterIndex, setCurrentPosterIndex] = useState(0);

  const { data: videos } = useQuery({
    queryKey: ['survey-content', 'video'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('survey_content')
        .select('*')
        .eq('content_type', 'video')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data as SurveyContent[];
    },
  });

  const { data: posters } = useQuery({
    queryKey: ['survey-content', 'poster'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('survey_content')
        .select('*')
        .eq('content_type', 'poster')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data as SurveyContent[];
    },
  });

  const { data: writeups } = useQuery({
    queryKey: ['survey-content', 'writeup'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('survey_content')
        .select('*')
        .eq('content_type', 'writeup')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data as SurveyContent[];
    },
  });

  return (
    <div className="space-y-8">
      {/* Video Gallery Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Video Gallery
          </CardTitle>
          <CardDescription>
            Watch our promotional videos {videos && videos.length > 1 && `(${currentVideoIndex + 1}/${videos.length})`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {videos && videos.length > 0 ? (
            <div className="relative">
              {(() => {
                const video = videos[currentVideoIndex];
                const embedUrl = video?.content_url ? getYouTubeEmbedUrl(video.content_url, false) : null;
                return (
                  <div>
                    <h4 className="font-medium mb-2">{video?.title}</h4>
                    <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
                      {embedUrl ? (
                        <iframe
                          key={video?.id}
                          src={embedUrl}
                          title={video?.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      ) : video?.content_url ? (
                        <video 
                          key={video?.id}
                          src={video.content_url} 
                          controls 
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Video className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                    </AspectRatio>
                  </div>
                );
              })()}
              
              {/* Video Navigation */}
              {videos.length > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentVideoIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex gap-1">
                    {videos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentVideoIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentVideoIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentVideoIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-primary/5">
                <div className="text-center space-y-2">
                  <Video className="h-16 w-16 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No videos available yet
                  </p>
                </div>
              </div>
            </AspectRatio>
          )}
        </CardContent>
      </Card>

      {/* Photo Gallery Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            Photo Gallery
          </CardTitle>
          <CardDescription>
            Tap on any photo to view in fullscreen {posters && posters.length > 0 && `(${posters.length} photos)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {posters && posters.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {posters.map((poster, index) => (
                <div 
                  key={poster.id} 
                  className="cursor-pointer group"
                  onClick={() => {
                    if (poster.content_url) {
                      setCurrentPosterIndex(index);
                      setFullscreenPoster(poster);
                    }
                  }}
                >
                  <AspectRatio ratio={1} className="bg-muted rounded-lg overflow-hidden group-hover:ring-2 group-hover:ring-primary transition-all">
                    {poster.content_url ? (
                      <img
                        src={poster.content_url}
                        alt={poster.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Image className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </AspectRatio>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{poster.title}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 bg-muted rounded-lg">
              <div className="text-center space-y-2">
                <Image className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No photos available yet
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Write-ups Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Campaign Write-ups
          </CardTitle>
          <CardDescription>
            Learn more about our event and initiatives
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {writeups && writeups.length > 0 ? (
            writeups.map((writeup) => (
              <div key={writeup.id} className="p-4 bg-muted rounded-lg space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {writeup.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {writeup.content_text}
                </p>
              </div>
            ))
          ) : (
            <div className="prose prose-sm max-w-none">
              <div className="p-4 bg-muted rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Welcome to Our Grand Event!
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We are excited to invite you to our upcoming celebration! This event promises to be a memorable experience 
                  filled with entertainment, food, and community spirit. Join us as we come together to celebrate our 
                  traditions and create lasting memories.
                </p>
                
                <h4 className="text-md font-semibold text-foreground mt-4">
                  Event Highlights
                </h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Cultural performances and entertainment</li>
                  <li>Delicious food from various stalls</li>
                  <li>Games and activities for all ages</li>
                  <li>Special programs and ceremonies</li>
                  <li>Community gathering and networking</li>
                </ul>
                
                <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-foreground font-medium">
                    📅 Don't miss out! Mark your calendars and join us for an unforgettable experience.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fullscreen Photo Dialog with Navigation */}
      <Dialog open={!!fullscreenPoster} onOpenChange={(open) => !open && setFullscreenPoster(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          <button
            onClick={() => setFullscreenPoster(null)}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          
          {posters && posters.length > 1 && (
            <>
              <button
                onClick={() => {
                  const newIndex = currentPosterIndex === 0 ? posters.length - 1 : currentPosterIndex - 1;
                  setCurrentPosterIndex(newIndex);
                  setFullscreenPoster(posters[newIndex]);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() => {
                  const newIndex = currentPosterIndex === posters.length - 1 ? 0 : currentPosterIndex + 1;
                  setCurrentPosterIndex(newIndex);
                  setFullscreenPoster(posters[newIndex]);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          
          {fullscreenPoster?.content_url && (
            <div className="flex flex-col items-center justify-center w-full h-full p-4">
              <img
                src={fullscreenPoster.content_url}
                alt={fullscreenPoster.title}
                className="max-w-full max-h-[85vh] object-contain"
              />
              <div className="mt-2 text-center">
                <p className="text-white text-sm">{fullscreenPoster.title}</p>
                {posters && posters.length > 1 && (
                  <p className="text-white/60 text-xs mt-1">{currentPosterIndex + 1} / {posters.length}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
