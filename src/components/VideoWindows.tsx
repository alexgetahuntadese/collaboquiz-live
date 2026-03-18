import { Video, VideoOff, Mic, MicOff } from "lucide-react";
import { useState } from "react";

interface VideoWindowProps {
  position: 'top-left' | 'top-right';
  participantName: string;
  isVideoOn?: boolean;
  isAudioOn?: boolean;
}

export const VideoWindow = ({ 
  position, 
  participantName, 
  isVideoOn = true, 
  isAudioOn = true 
}: VideoWindowProps) => {
  const [videoEnabled, setVideoEnabled] = useState(isVideoOn);
  const [audioEnabled, setAudioEnabled] = useState(isAudioOn);

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-20 w-48 h-36 bg-quiz-card rounded-lg border-2 border-quiz-video-border shadow-lg overflow-hidden`}>
      {videoEnabled ? (
        <div className="relative w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          {/* Placeholder for actual video stream */}
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-2 mx-auto">
                <span className="text-primary-foreground font-semibold text-lg">
                  {participantName.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{participantName}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full bg-quiz-card flex items-center justify-center">
          <div className="text-center">
            <VideoOff className="h-8 w-8 text-muted-foreground mb-2 mx-auto" />
            <p className="text-xs text-muted-foreground">{participantName}</p>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-2 right-2 flex gap-1">
        <button
          onClick={() => setVideoEnabled(!videoEnabled)}
          className={`p-1 rounded ${videoEnabled ? 'bg-primary' : 'bg-destructive'} text-white`}
        >
          {videoEnabled ? <Video className="h-3 w-3" /> : <VideoOff className="h-3 w-3" />}
        </button>
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className={`p-1 rounded ${audioEnabled ? 'bg-primary' : 'bg-destructive'} text-white`}
        >
          {audioEnabled ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
        </button>
      </div>
    </div>
  );
};

export const VideoWindows = () => {
  return (
    <>
      <VideoWindow position="top-left" participantName="You" />
      <VideoWindow position="top-right" participantName="Study Partner" />
    </>
  );
};