import { Progress } from "@/components/ui/progress";

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  score?: number;
}

export const QuizProgress = ({ currentQuestion, totalQuestions, score }: QuizProgressProps) => {
  const progressPercentage = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">
          Progress: {currentQuestion}/{totalQuestions}
        </span>
        {score !== undefined && (
          <span className="text-sm font-medium text-muted-foreground">
            Score: {score}/{currentQuestion - 1}
          </span>
        )}
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
};