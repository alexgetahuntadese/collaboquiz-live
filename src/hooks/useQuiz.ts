import { useState, useEffect } from 'react';

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  question: string;
  options: QuizOption[];
}

interface QuizState {
  currentQuestionIndex: number;
  score: number;
  answers: Record<string, string>;
  showResults: boolean;
  timeRemaining: number;
  isQuizCompleted: boolean;
}

const sampleQuestions: Question[] = [
  {
    id: '1',
    question: 'What is the primary purpose of React hooks?',
    options: [
      { id: 'a', text: 'To manage component state and lifecycle in functional components', isCorrect: true },
      { id: 'b', text: 'To create class-based components', isCorrect: false },
      { id: 'c', text: 'To handle CSS styling', isCorrect: false },
      { id: 'd', text: 'To manage routing in applications', isCorrect: false },
    ],
  },
  {
    id: '2',
    question: 'Which of the following is a valid way to declare a variable in JavaScript?',
    options: [
      { id: 'a', text: 'variable myVar = 5;', isCorrect: false },
      { id: 'b', text: 'let myVar = 5;', isCorrect: true },
      { id: 'c', text: 'declare myVar = 5;', isCorrect: false },
      { id: 'd', text: 'set myVar = 5;', isCorrect: false },
    ],
  },
  {
    id: '3',
    question: 'What does CSS stand for?',
    options: [
      { id: 'a', text: 'Computer Style Sheets', isCorrect: false },
      { id: 'b', text: 'Creative Style Sheets', isCorrect: false },
      { id: 'c', text: 'Cascading Style Sheets', isCorrect: true },
      { id: 'd', text: 'Colorful Style Sheets', isCorrect: false },
    ],
  },
];

export const useQuiz = () => {
  const [state, setState] = useState<QuizState>({
    currentQuestionIndex: 0,
    score: 0,
    answers: {},
    showResults: false,
    timeRemaining: 180, // 3 minutes per question
    isQuizCompleted: false,
  });

  // Timer effect
  useEffect(() => {
    if (state.timeRemaining > 0 && !state.showResults && !state.isQuizCompleted) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, timeRemaining: prev.timeRemaining - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (state.timeRemaining === 0) {
      // Auto-advance to next question when time runs out
      nextQuestion();
    }
  }, [state.timeRemaining, state.showResults, state.isQuizCompleted]);

  const currentQuestion = sampleQuestions[state.currentQuestionIndex];

  const answerQuestion = (optionId: string) => {
    const isCorrect = currentQuestion.options.find(opt => opt.id === optionId)?.isCorrect || false;
    
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [currentQuestion.id]: optionId },
      score: isCorrect ? prev.score + 1 : prev.score,
      showResults: true,
    }));

    // Show results for 2 seconds, then move to next question
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    const nextIndex = state.currentQuestionIndex + 1;
    
    if (nextIndex >= sampleQuestions.length) {
      setState(prev => ({ ...prev, isQuizCompleted: true }));
    } else {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: nextIndex,
        showResults: false,
        timeRemaining: 180, // Reset timer for next question
      }));
    }
  };

  const resetQuiz = () => {
    setState({
      currentQuestionIndex: 0,
      score: 0,
      answers: {},
      showResults: false,
      timeRemaining: 180,
      isQuizCompleted: false,
    });
  };

  return {
    currentQuestion,
    currentQuestionIndex: state.currentQuestionIndex,
    totalQuestions: sampleQuestions.length,
    score: state.score,
    answers: state.answers,
    showResults: state.showResults,
    timeRemaining: state.timeRemaining,
    isQuizCompleted: state.isQuizCompleted,
    answerQuestion,
    nextQuestion,
    resetQuiz,
  };
};