/* eslint-disable @next/next/no-img-element */
"use client";

import { Deck } from "@/lib/data";
import { useProgressStore } from "@/store/useProgressStore";
import { CheckCircle2, GraduationCap, Home, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import QuizCard from "./QuizCard";
import ConfirmModal from "./ui/ConfirmModal";

interface QuizEngineProps {
    deck: Deck;
    dbProgress: Record<string, boolean>;
    isAuthenticated: boolean;
    isReviewMode: boolean;
}

export default function QuizEngine({ deck, dbProgress, isAuthenticated, isReviewMode }: QuizEngineProps) {
    const localAnswers = useProgressStore((state) => state.answers);
    const resetDeckLocal = useProgressStore((state) => state.resetDeckLocal);
    const setBulkAnswers = useProgressStore((state) => state.setBulkAnswers); // <-- Import de l'action de synchronisation

    const [ mounted, setMounted ] = useState(false);
    const [ currentQuestionIndex, setCurrentQuestionIndex ] = useState<number | null>(null);
    const [ isResetModalOpen, setIsResetModalOpen ] = useState(false);

    const initialized = useRef(false);

    const activeAnswers = localAnswers;
    const questionIds = deck.questions.map(q => q.id);

    useEffect(() => {
        if (initialized.current) return;

        if (isAuthenticated) {
            setBulkAnswers(dbProgress);
        }

        const initialAnswers = isAuthenticated ? dbProgress : useProgressStore.getState().answers;
        const firstUnansweredIndex = deck.questions.findIndex(q => !(q.id in initialAnswers));

        setCurrentQuestionIndex(firstUnansweredIndex === -1 ? deck.questions.length : firstUnansweredIndex);
        setMounted(true);

        initialized.current = true;
    }, [ isAuthenticated, dbProgress, deck.questions, setBulkAnswers ]);

    if (!mounted || currentQuestionIndex === null) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const handleResetProgress = async () => {
        if (isAuthenticated) {
            await fetch(`/api/progress?subjectId=${deck.subjectId}&chapterId=${deck.chapterId}`, {
                method: 'DELETE'
            });
            window.location.reload();
        } else {
            resetDeckLocal(questionIds);
            setCurrentQuestionIndex(0);
            setIsResetModalOpen(false);
        }
    };

    const handleNext = () => {
        const nextUnansweredIndex = deck.questions.findIndex(
            (q, idx) => idx > currentQuestionIndex && !(q.id in activeAnswers)
        );
        if (nextUnansweredIndex !== -1) {
            setCurrentQuestionIndex(nextUnansweredIndex);
        } else {
            const loopUnansweredIndex = deck.questions.findIndex(q => !(q.id in activeAnswers));
            if (loopUnansweredIndex !== -1 && loopUnansweredIndex < currentQuestionIndex) {
                setCurrentQuestionIndex(loopUnansweredIndex);
            } else {
                setCurrentQuestionIndex(deck.questions.length);
            }
        }
    };

    if (isReviewMode) {
        return (
            <div className="space-y-4 sm:space-y-6">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center space-x-3 shadow-sm">
                    <GraduationCap className="h-5 w-5 text-amber-600 shrink-0" />
                    <p className="text-amber-800 text-xs sm:text-sm font-medium">
                        <strong>Review Mode:</strong> All questions and explanations are revealed for fast study.
                    </p>
                </div>

                {deck.questions.map((q, idx) => (
                    <div key={q.id} className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                        <div className="flex items-start space-x-3">
                            <span className="flex items-center justify-center bg-slate-100 text-slate-500 font-bold rounded-lg h-7 w-7 text-sm shrink-0">
                                {idx + 1}
                            </span>
                            <h3 className="text-base sm:text-xl font-bold text-slate-900 mt-0.5">{q.text}</h3>
                        </div>
                        {q.image && <img src={q.image} alt="visual" className="max-h-48 sm:max-h-64 object-contain rounded-xl border border-slate-100 mx-auto" />}

                        <div className="grid grid-cols-1 gap-3 pl-0 sm:pl-10">
                            {q.options.map(opt => (
                                <div key={opt.id} className={`p-3.5 rounded-xl border-2 ${opt.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                    <div className="flex items-center space-x-2 font-bold mb-1 text-xs sm:text-base">
                                        {opt.isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                                        <span>{opt.id}. {opt.text}</span>
                                    </div>
                                    <div className={`text-xs sm:text-sm mt-2 pt-2 border-t ${opt.isCorrect ? 'border-emerald-200/50' : 'border-slate-200'}`}>
                                        {opt.justification}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (currentQuestionIndex >= deck.questions.length) {
        return (
            <div className="text-center py-12 sm:py-20 bg-white rounded-2xl sm:rounded-3xl shadow-sm px-6 sm:px-8 border border-slate-200 mt-4 sm:mt-8">
                <div className="bg-emerald-100 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Chapter Completed!</h2>
                <p className="text-slate-500 text-sm sm:text-lg mb-8 max-w-sm mx-auto">
                    Excellent work. You have successfully answered all the questions in this chapter.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <button
                        onClick={() => setIsResetModalOpen(true)}
                        className="flex items-center space-x-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-white border-2 border-slate-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl font-bold transition-all w-full sm:w-auto justify-center text-sm"
                    >
                        <RefreshCcw className="h-4.5 w-4.5" />
                        <span>Retry Chapter</span>
                    </button>
                    <Link
                        href="/"
                        className="flex items-center space-x-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition-all w-full sm:w-auto justify-center text-sm"
                    >
                        <Home className="h-4.5 w-4.5" />
                        <span>Back to Home</span>
                    </Link>
                </div>

                <ConfirmModal
                    isOpen={isResetModalOpen}
                    title="Reset Chapter"
                    message="Are you sure you want to clear your progress for this chapter and start over?"
                    onConfirm={handleResetProgress}
                    onCancel={() => setIsResetModalOpen(false)}
                />
            </div>
        );
    }

    const currentQuestion = deck.questions[ currentQuestionIndex ];
    const progressPercent = Math.round((Object.keys(activeAnswers).length / deck.questions.length) * 100);

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 flex flex-row justify-between items-center gap-4">
                <div className="flex-1">
                    <div className="flex justify-between text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                        <span>Progress</span>
                        <span>{Object.keys(activeAnswers).length} / {deck.questions.length}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>
                <button
                    onClick={() => setIsResetModalOpen(true)}
                    className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors flex items-center space-x-1"
                >
                    <RefreshCcw className="h-3.5 w-3.5" />
                    <span>Reset</span>
                </button>
            </div>

            <QuizCard
                key={currentQuestion.id}
                question={currentQuestion}
                onNext={handleNext}
                subjectId={deck.subjectId}
                chapterId={deck.chapterId}
            />

            <ConfirmModal
                isOpen={isResetModalOpen}
                title="Reset Chapter"
                message="Are you sure you want to clear your progress for this chapter and start over?"
                onConfirm={handleResetProgress}
                onCancel={() => setIsResetModalOpen(false)}
            />
        </div>
    );
}
