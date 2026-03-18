import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Trophy, Clock, Copy, Check, Loader2 } from 'lucide-react';
import StarField from '@/components/StarField';
import TopBar from '@/components/TopBar';
import { toast } from 'sonner';

interface Room {
  id: string;
  room_code: string;
  host_name: string;
  quiz_subject: string;
  quiz_difficulty: string;
  quiz_chapters: string[];
  quiz_duration: number;
  quiz_question_count: number;
  status: string;
}

interface Participant {
  id: string;
  room_id: string;
  player_name: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  is_finished: boolean;
}

const RoomPage = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [joined, setJoined] = useState(false);
  const [myParticipantId, setMyParticipantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  // Fetch room
  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomCode) return;
      const { data, error } = await supabase
        .from('quiz_rooms')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .single();

      if (error || !data) {
        toast.error('Room not found');
        setLoading(false);
        return;
      }
      setRoom(data as Room);
      setLoading(false);
    };
    fetchRoom();
  }, [roomCode]);

  // Subscribe to participants
  useEffect(() => {
    if (!room) return;

    const fetchParticipants = async () => {
      const { data } = await supabase
        .from('quiz_room_participants')
        .select('*')
        .eq('room_id', room.id)
        .order('score', { ascending: false });
      if (data) setParticipants(data as Participant[]);
    };

    fetchParticipants();

    const channel = supabase
      .channel(`room-${room.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'quiz_room_participants',
        filter: `room_id=eq.${room.id}`,
      }, () => {
        fetchParticipants();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'quiz_rooms',
        filter: `id=eq.${room.id}`,
      }, (payload) => {
        setRoom(payload.new as Room);
        if (payload.new.status === 'active') {
          setQuizStarted(true);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [room?.id]);

  const handleJoin = async () => {
    if (!playerName.trim() || !room) return;

    const { data, error } = await supabase
      .from('quiz_room_participants')
      .insert({ room_id: room.id, player_name: playerName.trim() })
      .select()
      .single();

    if (error) {
      toast.error('Failed to join room');
      return;
    }

    setMyParticipantId(data.id);
    setJoined(true);
    toast.success('Joined the room!');
  };

  const handleStartQuiz = async () => {
    if (!room) return;
    await supabase.from('quiz_rooms').update({ status: 'active' }).eq('id', room.id);
    setQuizStarted(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple quiz taking within the room
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (quizStarted && joined && room) {
      // Dynamically import question getter
      import('@/data/naturalScienceQuizzes').then(({ getQuestionsForQuiz }) => {
        const chapter = room.quiz_chapters[0] || '';
        const qs = getQuestionsForQuiz(room.quiz_subject, chapter, room.quiz_difficulty as any, room.quiz_question_count);
        setQuestions(qs);
      });
    }
  }, [quizStarted, joined, room]);

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQ]: answer }));
  };

  const handleNext = async () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Finish quiz
      const correct = questions.filter((q, i) => answers[i] === q.correct).length;
      const score = Math.round((correct / questions.length) * 100);

      if (myParticipantId) {
        await supabase.from('quiz_room_participants').update({
          score,
          correct_answers: correct,
          total_questions: questions.length,
          is_finished: true,
        }).eq('id', myParticipantId);
      }

      setFinished(true);
      toast.success(`Quiz complete! Score: ${score}%`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-violet-900 to-purple-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-violet-900 to-purple-950 pt-14 px-4 pb-4 relative">
        <StarField starCount={30} shootingCount={2} />
        <TopBar />
        <div className="max-w-lg mx-auto text-center mt-20">
          <h1 className="text-2xl font-bold text-white mb-4">Room Not Found</h1>
          <p className="text-white/60 mb-6">The room code may be invalid or expired.</p>
          <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-violet-900 to-purple-950 pt-14 px-4 pb-4 relative">
      <StarField starCount={30} shootingCount={2} />
      <TopBar />
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-white hover:bg-white/10 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        {/* Room Info */}
        <Card className="bg-white/[0.04] border-white/[0.08] mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <Users className="h-5 w-5 text-violet-400" />
                Room: {room.room_code}
              </CardTitle>
              <Badge className={room.status === 'waiting' ? 'bg-yellow-500' : room.status === 'active' ? 'bg-green-500' : 'bg-blue-500'}>
                {room.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-white/60">Subject: <span className="text-white font-medium">{room.quiz_subject}</span></div>
              <div className="text-white/60">Difficulty: <span className="text-white font-medium">{room.quiz_difficulty}</span></div>
              <div className="text-white/60">Host: <span className="text-white font-medium">{room.host_name}</span></div>
              <div className="text-white/60">Questions: <span className="text-white font-medium">{room.quiz_question_count}</span></div>
            </div>
            <Button size="sm" variant="ghost" onClick={handleCopyLink} className="mt-3 text-violet-400 hover:bg-violet-500/10">
              {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy Invite Link'}
            </Button>
          </CardContent>
        </Card>

        {/* Join Form */}
        {!joined && room.status === 'waiting' && (
          <Card className="bg-white/[0.04] border-white/[0.08] mb-6">
            <CardContent className="pt-6">
              <h3 className="text-white font-medium mb-3">Join this room</h3>
              <div className="flex gap-2">
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Your name"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
                <Button onClick={handleJoin} disabled={!playerName.trim()} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
                  Join
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Live Leaderboard */}
        <Card className="bg-white/[0.04] border-white/[0.08] mb-6">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Live Leaderboard ({participants.length} players)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <p className="text-white/40 text-center py-4">Waiting for players to join...</p>
            ) : (
              <div className="space-y-2">
                {participants
                  .sort((a, b) => b.score - a.score)
                  .map((p, i) => (
                    <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg ${
                      p.id === myParticipantId ? 'bg-violet-500/20 border border-violet-500/30' : 'bg-white/5'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold ${
                          i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-white/40'
                        }`}>#{i + 1}</span>
                        <span className="text-white font-medium">{p.player_name}</span>
                        {p.id === myParticipantId && <Badge className="bg-violet-500 text-xs">You</Badge>}
                      </div>
                      <div className="flex items-center gap-3">
                        {p.is_finished ? (
                          <span className="text-green-400 font-bold">{p.score}%</span>
                        ) : (
                          <span className="text-white/40 text-sm flex items-center gap-1">
                            <Clock className="h-3 w-3" /> In progress
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Start / Quiz */}
        {joined && room.status === 'waiting' && (
          <Button onClick={handleStartQuiz} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 text-lg">
            Start Quiz for Everyone
          </Button>
        )}

        {/* In-room quiz */}
        {quizStarted && joined && !finished && questions.length > 0 && (
          <Card className="bg-white/[0.04] border-white/[0.08]">
            <CardHeader>
              <CardTitle className="text-white">
                Question {currentQ + 1} of {questions.length}
              </CardTitle>
              <p className="text-white/80 text-lg">{questions[currentQ]?.question}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {questions[currentQ]?.options.map((opt: string, i: number) => (
                <Button
                  key={i}
                  variant="outline"
                  className={`w-full text-left justify-start p-4 h-auto ${
                    answers[currentQ] === opt
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                  onClick={() => handleAnswer(opt)}
                >
                  <span className="mr-3 font-bold">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </Button>
              ))}
              <Button
                onClick={handleNext}
                disabled={answers[currentQ] === undefined}
                className="w-full mt-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white disabled:opacity-50"
              >
                {currentQ === questions.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </CardContent>
          </Card>
        )}

        {finished && (
          <Card className="bg-white/[0.04] border-white/[0.08] text-center">
            <CardContent className="pt-6">
              <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h2>
              <p className="text-white/60">Your score is on the leaderboard above. Wait for others to finish!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RoomPage;
