-- Create quiz rooms table
CREATE TABLE public.quiz_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  host_name TEXT NOT NULL,
  quiz_subject TEXT NOT NULL,
  quiz_difficulty TEXT NOT NULL,
  quiz_chapters TEXT[] NOT NULL DEFAULT '{}',
  quiz_duration INTEGER NOT NULL DEFAULT 10,
  quiz_question_count INTEGER NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz room participants table
CREATE TABLE public.quiz_room_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.quiz_rooms(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  is_finished BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_room_participants ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read/write rooms (no auth required for simplicity)
CREATE POLICY "Anyone can view rooms" ON public.quiz_rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can create rooms" ON public.quiz_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update rooms" ON public.quiz_rooms FOR UPDATE USING (true);

CREATE POLICY "Anyone can view participants" ON public.quiz_room_participants FOR SELECT USING (true);
CREATE POLICY "Anyone can join rooms" ON public.quiz_room_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update their score" ON public.quiz_room_participants FOR UPDATE USING (true);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_room_participants;