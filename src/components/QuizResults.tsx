import { Trophy, RotateCcw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
}

export const QuizResults = ({ score, totalQuestions, onRestart }: QuizResultsProps) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  const getPerformanceMessage = () => {
    if (percentage >= 90) return "Outstanding! 🌟";
    if (percentage >= 80) return "Excellent work! 🎉";
    if (percentage >= 70) return "Great job! 👏";
    if (percentage >= 60) return "Good effort! 👍";
    return "Keep practicing! 💪";
  };

  const getPerformanceColor = () => {
    if (percentage >= 80) return "text-quiz-correct";
    if (percentage >= 60) return "text-quiz-timer-warning";
    return "text-quiz-incorrect";
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-quiz-card rounded-xl shadow-lg p-8 border border-border text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-10 w-10 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold text-quiz-question mb-2">Quiz Complete!</h2>
          <p className="text-lg text-muted-foreground">{getPerformanceMessage()}</p>
        </div>

        <div className="bg-quiz-bg rounded-lg p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-quiz-question">{score}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-quiz-question">{totalQuestions - score}</p>
              <p className="text-sm text-muted-foreground">Incorrect</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${getPerformanceColor()}`}>{percentage}%</p>
              <p className="text-sm text-muted-foreground">Score</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-sm">Great collaboration with your study partner!</span>
          </div>
          
          <div className="flex gap-3 justify-center">
            <Button onClick={onRestart} size="lg" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Start New Quiz
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};