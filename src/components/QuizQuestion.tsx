import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestionProps {
  question: string;
  options: QuizOption[];
  onAnswer: (optionId: string) => void;
  showResults?: boolean;
  selectedAnswer?: string;
}

export const QuizQuestion = ({ 
  question, 
  options, 
  onAnswer, 
  showResults = false,
  selectedAnswer 
}: QuizQuestionProps) => {
  const [selected, setSelected] = useState<string | null>(selectedAnswer || null);

  useEffect(() => {
    setSelected(selectedAnswer || null);
  }, [selectedAnswer]);

  const handleOptionClick = (optionId: string) => {
    if (showResults) return;
    setSelected(optionId);
    onAnswer(optionId);
  };

  const getOptionClasses = (option: QuizOption) => {
    const baseClasses = "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 relative overflow-hidden";
    
    if (showResults) {
      if (option.isCorrect) {
        return `${baseClasses} bg-quiz-correct text-white border-quiz-correct`;
      } else if (selected === option.id) {
        return `${baseClasses} bg-quiz-incorrect text-white border-quiz-incorrect`;
      } else {
        return `${baseClasses} bg-quiz-option border-border text-foreground opacity-60`;
      }
    } else {
      if (selected === option.id) {
        return `${baseClasses} bg-quiz-option-selected text-white border-quiz-option-selected`;
      } else {
        return `${baseClasses} bg-quiz-option border-border text-foreground hover:bg-quiz-option-hover hover:border-primary/30`;
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-quiz-card rounded-xl shadow-lg p-8 border border-border">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-quiz-question leading-relaxed">
          {question}
        </h2>
      </div>
      
      <div className="grid gap-4">
        {options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => handleOptionClick(option.id)}
            className={getOptionClasses(option)}
            disabled={showResults}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-lg font-medium">{option.text}</span>
              </div>
              
              {showResults && (
                <div className="flex-shrink-0">
                  {option.isCorrect ? (
                    <Check className="h-6 w-6" />
                  ) : selected === option.id ? (
                    <X className="h-6 w-6" />
                  ) : null}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {!showResults && selected && (
        <div className="mt-6 text-center">
          <p className="text-muted-foreground">Answer selected! Waiting for other participants...</p>
        </div>
      )}
    </div>
  );
};