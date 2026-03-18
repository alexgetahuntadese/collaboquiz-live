import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Users, Copy, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InviteFriendButtonProps {
  subject: string;
  chapter: string;
  difficulty: string;
  grade: string;
  playerName: string;
}

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const InviteFriendButton = ({ subject, chapter, difficulty, grade, playerName }: InviteFriendButtonProps) => {
  const [open, setOpen] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const handleCreateRoom = async () => {
    setCreating(true);
    const code = generateRoomCode();

    const { data, error } = await supabase
      .from('quiz_rooms')
      .insert({
        room_code: code,
        host_name: playerName || 'Host',
        quiz_subject: subject,
        quiz_difficulty: difficulty,
        quiz_chapters: [chapter],
        quiz_duration: 10,
        quiz_question_count: 10,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create room');
      setCreating(false);
      return;
    }

    // Join as host
    await supabase.from('quiz_room_participants').insert({
      room_id: data.id,
      player_name: playerName || 'Host',
    });

    setRoomCode(code);
    setCreating(false);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/room/${roomCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinRoom = () => {
    if (joinCode.trim()) {
      window.location.href = `/room/${joinCode.trim().toUpperCase()}`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10 hover:border-violet-400"
        >
          <Users className="mr-1 h-4 w-4" />
          Invite a Friend
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-950 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Multiplayer Quiz</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create Room */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/60">Create a Room</h3>
            {!roomCode ? (
              <Button
                onClick={handleCreateRoom}
                disabled={creating}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white"
              >
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
                {creating ? 'Creating...' : 'Create Room'}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-white/60">Room Code:</span>
                  <span className="font-mono text-lg font-bold text-violet-400">{roomCode}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyLink}
                    className="ml-auto text-white/60 hover:text-white hover:bg-white/10"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  onClick={() => window.location.href = `/room/${roomCode}`}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  Enter Room
                </Button>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-slate-950 px-2 text-white/40">OR</span></div>
          </div>

          {/* Join Room */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/60">Join a Room</h3>
            <div className="flex gap-2">
              <Input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                maxLength={6}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 font-mono uppercase"
              />
              <Button
                onClick={handleJoinRoom}
                disabled={!joinCode.trim()}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white"
              >
                Join
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteFriendButton;
