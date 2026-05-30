/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Deck } from "@/lib/data";
import { useProgressStore } from "@/store/useProgressStore";
import { Eye, Library, PlayCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ConfirmModal from "./ui/ConfirmModal";

interface DashboardClientProps {
    decks: Deck[];
    dbProgress: Record<string, boolean>;
    isAuthenticated: boolean;
}

export default function DashboardClient({ decks, dbProgress, isAuthenticated }: DashboardClientProps) {
    const localAnswers = useProgressStore((state) => state.answers);
    const setBulkAnswers = useProgressStore((state) => state.setBulkAnswers);
    const resetAllLocal = useProgressStore((state) => state.resetAllLocal);

    const [ mounted, setMounted ] = useState(false);
    const [ isResetModalOpen, setIsResetModalOpen ] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            setBulkAnswers(dbProgress);
        }
    }, [ isAuthenticated, dbProgress, setBulkAnswers ]);
    if (!mounted) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const activeAnswers = isAuthenticated ? dbProgress : localAnswers;

    const handleResetAll = async () => {
        if (isAuthenticated) {
            await fetch('/api/progress', { method: 'DELETE' });
            window.location.reload();
        } else {
            resetAllLocal();
            setIsResetModalOpen(false);
        }
    };

    const subjects = decks.reduce((acc, deck) => {
        if (!acc[ deck.subjectId ]) acc[ deck.subjectId ] = [];
        acc[ deck.subjectId ].push(deck);
        return acc;
    }, {} as Record<string, Deck[]>);

    return (
        <div className="space-y-12">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center space-x-3">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                        <Library className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Your Progress</h2>
                        <p className="text-sm text-slate-500">Pick up where you left off or review past questions.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsResetModalOpen(true)}
                    className="flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Reset All Data</span>
                </button>
            </div>

            {Object.entries(subjects).map(([ subjectId, subjectDecks ]) => (
                <div key={subjectId} className="space-y-6">
                    <h2 className="text-2xl font-black text-slate-900 capitalize tracking-tight flex items-center space-x-2">
                        <span className="w-2 h-6 bg-indigo-500 rounded-full inline-block"></span>
                        <span>{subjectId}</span>
                    </h2>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {subjectDecks.map((deck) => {
                            const questionIds = deck.questions.map(q => q.id);
                            const answeredCount = questionIds.filter(id => id in activeAnswers).length;
                            const total = deck.questions.length;
                            const percent = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
                            const isCompleted = percent === 100;

                            return (
                                <div
                                    key={deck.chapterId}
                                    className="relative group bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                                >
                                    <Link
                                        href={`/decks/${deck.subjectId}/${deck.chapterId}`}
                                        className="absolute inset-0 z-0 focus:outline-none"
                                    >
                                        <span className="sr-only">Start {deck.meta.title}</span>
                                    </Link>

                                    <div className="p-6 z-10 pointer-events-none">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                                                {deck.meta.title}
                                            </h3>
                                            {isCompleted && (
                                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md">
                                                    Done
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-slate-500 leading-relaxed mb-6">
                                            {deck.meta.description}
                                        </p>

                                        <div>
                                            <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                                                <span>{percent}% Completed</span>
                                                <span className="text-slate-500 font-medium">{answeredCount} / {total}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                    style={{ width: `${percent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/80 px-6 py-4 flex justify-between items-center border-t border-slate-100 z-10">
                                        <span className="flex items-center space-x-1.5 text-sm font-bold text-indigo-600 group-hover:text-indigo-700 pointer-events-none">
                                            <PlayCircle className="h-4 w-4" />
                                            <span>{answeredCount > 0 && !isCompleted ? "Resume" : "Start"}</span>
                                        </span>

                                        <Link
                                            href={`/decks/${deck.subjectId}/${deck.chapterId}?mode=review`}
                                            className="flex items-center space-x-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 relative z-20 pointer-events-auto bg-white px-3 py-1.5 rounded-md border border-slate-200 hover:border-slate-300 shadow-sm transition-all"
                                        >
                                            <Eye className="h-4 w-4" />
                                            <span>Review</span>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            <ConfirmModal
                isOpen={isResetModalOpen}
                title="Reset Global Progress"
                message="This will permanently delete your progress for ALL subjects and chapters. Are you sure you want to start over?"
                confirmText="Yes, Reset Everything"
                onConfirm={handleResetAll}
                onCancel={() => setIsResetModalOpen(false)}
            />
        </div>
    );
}
