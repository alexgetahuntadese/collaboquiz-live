import { QuizHeader } from "@/components/QuizHeader";
import { FunctionalVideoWindows } from "@/components/FunctionalVideoWindows";
import { QuizQuestion } from "@/components/QuizQuestion";
import { QuizProgress } from "@/components/QuizProgress";
import { QuizResults } from "@/components/QuizResults";
import { useQuiz } from "@/hooks/useQuiz";

const Index = () => {
  const {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    score,
    answers,
    showResults,
    timeRemaining,
    isQuizCompleted,
    answerQuestion,
    resetQuiz,
  } = useQuiz();

  return (
    <div className="min-h-screen bg-quiz-bg">
      <QuizHeader 
        timeRemaining={timeRemaining}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
      />
      
      <FunctionalVideoWindows callId="quiz-study-session" />
      
      <main className="pt-6 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          {!isQuizCompleted ? (
            <>
              <QuizProgress 
                currentQuestion={currentQuestionIndex + 1}
                totalQuestions={totalQuestions}
                score={score}
              />
              
              {currentQuestion && (
                <QuizQuestion
                  question={currentQuestion.question}
                  options={currentQuestion.options}
                  onAnswer={answerQuestion}
                  showResults={showResults}
                  selectedAnswer={answers[currentQuestion.id]}
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center min-h-[60vh]">
              <QuizResults
                score={score}
                totalQuestions={totalQuestions}
                onRestart={resetQuiz}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
