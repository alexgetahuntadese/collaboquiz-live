import { GraduationCap, Clock } from "lucide-react";

interface QuizHeaderProps {
  timeRemaining: number;
  questionNumber: number;
  totalQuestions: number;
}

export const QuizHeader = ({ timeRemaining, questionNumber, totalQuestions }: QuizHeaderProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemaining <= 30;

  return (
    <header className="w-full bg-card border-b border-border p-4 z-10">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">CollaboQuiz Live</h1>
            <p className="text-sm text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className={`h-5 w-5 ${isLowTime ? 'text-quiz-timer-warning' : 'text-muted-foreground'}`} />
          <span className={`text-lg font-mono font-semibold ${
            isLowTime ? 'text-quiz-timer-warning' : 'text-foreground'
          }`}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>
    </header>
  );
};