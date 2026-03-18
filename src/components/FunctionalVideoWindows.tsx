import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { useState, useEffect } from "react";
import { 
  Call, 
  CallControls, 
  ParticipantView, 
  useCall, 
  useCallStateHooks,
  SpeakerLayout,
  StreamCall,
} from '@stream-io/video-react-sdk';
import { useStreamContext } from './StreamProvider';

interface VideoWindowProps {
  position: 'top-left' | 'top-right';
  participantId: string;
  call?: Call;
}

const VideoParticipant = ({ position, participantId, call }: VideoWindowProps) => {
  const { useParticipants, useLocalParticipant } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4'
  };

  const participant = participantId === 'local' 
    ? localParticipant 
    : participants.find(p => p.userId === participantId);

  const toggleVideo = async () => {
    if (call && participantId === 'local') {
      try {
        await call.camera.toggle();
        setIsVideoOn(!isVideoOn);
      } catch (error) {
        console.error('Failed to toggle video:', error);
      }
    }
  };

  const toggleAudio = async () => {
    if (call && participantId === 'local') {
      try {
        await call.microphone.toggle();
        setIsAudioOn(!isAudioOn);
      } catch (error) {
        console.error('Failed to toggle audio:', error);
      }
    }
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-20 w-48 h-36 bg-quiz-card rounded-lg border-2 border-quiz-video-border shadow-lg overflow-hidden`}>
      {participant ? (
        <div className="relative w-full h-full">
          <ParticipantView 
            participant={participant} 
            ParticipantViewUI={null}
          />
          <div className="absolute bottom-2 left-2">
            <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">
              {participant.name || participant.userId}
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full h-full bg-quiz-card flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-2 mx-auto">
              <span className="text-primary-foreground font-semibold text-lg">
                {participantId === 'local' ? 'Y' : 'S'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {participantId === 'local' ? 'You' : 'Study Partner'}
            </p>
          </div>
        </div>
      )}
      
      {participantId === 'local' && (
        <div className="absolute bottom-2 right-2 flex gap-1">
          <button
            onClick={toggleVideo}
            className={`p-1 rounded ${isVideoOn ? 'bg-primary' : 'bg-destructive'} text-white`}
          >
            {isVideoOn ? <Video className="h-3 w-3" /> : <VideoOff className="h-3 w-3" />}
          </button>
          <button
            onClick={toggleAudio}
            className={`p-1 rounded ${isAudioOn ? 'bg-primary' : 'bg-destructive'} text-white`}
          >
            {isAudioOn ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
          </button>
        </div>
      )}
    </div>
  );
};

interface FunctionalVideoWindowsProps {
  callId?: string;
}

export const FunctionalVideoWindows = ({ callId = 'quiz-room-1' }: FunctionalVideoWindowsProps) => {
  const { client, isConnected } = useStreamContext();
  const [call, setCall] = useState<Call | null>(null);
  const [isInCall, setIsInCall] = useState(false);

  useEffect(() => {
    if (!client || !isConnected) return;

    const initCall = async () => {
      try {
        const newCall = client.call('default', callId);
        await newCall.getOrCreate({
          data: {
            members: [
              { user_id: 'student1' },
              { user_id: 'student2' },
            ],
          },
        });
        setCall(newCall);
      } catch (error) {
        console.error('Failed to create call:', error);
      }
    };

    initCall();
  }, [client, isConnected, callId]);

  const joinCall = async () => {
    if (!call) return;
    try {
      await call.join({ create: true });
      setIsInCall(true);
    } catch (error) {
      console.error('Failed to join call:', error);
    }
  };

  const leaveCall = async () => {
    if (!call) return;
    try {
      await call.leave();
      setIsInCall(false);
    } catch (error) {
      console.error('Failed to leave call:', error);
    }
  };

  // Demo mode fallback when Stream is not connected
  if (!isConnected || !call) {
    return (
      <>
        <div className="fixed top-4 left-4 z-20 w-48 h-36 bg-quiz-card rounded-lg border-2 border-quiz-video-border shadow-lg overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-2 mx-auto">
                <span className="text-primary-foreground font-semibold text-lg">Y</span>
              </div>
              <p className="text-xs text-muted-foreground">You (Demo)</p>
            </div>
          </div>
          <div className="absolute bottom-2 right-2 flex gap-1">
            <button className="p-1 rounded bg-primary text-white">
              <Video className="h-3 w-3" />
            </button>
            <button className="p-1 rounded bg-primary text-white">
              <Mic className="h-3 w-3" />
            </button>
          </div>
        </div>
        
        <div className="fixed top-4 right-4 z-20 w-48 h-36 bg-quiz-card rounded-lg border-2 border-quiz-video-border shadow-lg overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-2 mx-auto">
                <span className="text-white font-semibold text-lg">S</span>
              </div>
              <p className="text-xs text-muted-foreground">Study Partner (Demo)</p>
            </div>
          </div>
        </div>
        
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-30">
          <button 
            onClick={() => window.alert('Demo mode - Stream.io integration ready for your API key!')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
          >
            <Phone className="h-4 w-4 inline mr-2" />
            Join Video Call (Demo)
          </button>
        </div>
      </>
    );
  }

  if (!isInCall) {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-30">
        <button 
          onClick={joinCall}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Phone className="h-4 w-4" />
          Join Video Call
        </button>
      </div>
    );
  }

  return (
    <StreamCall call={call}>
      <VideoParticipant position="top-left" participantId="local" call={call} />
      <VideoParticipant position="top-right" participantId="student2" call={call} />
      
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-30">
        <button 
          onClick={leaveCall}
          className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg hover:bg-destructive/90 transition-colors flex items-center gap-2"
        >
          <PhoneOff className="h-4 w-4" />
          Leave Call
        </button>
      </div>
    </StreamCall>
  );
};