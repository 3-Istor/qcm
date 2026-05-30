/* eslint-disable @next/next/no-img-element */
"use client";

import { Question } from '@/lib/data';
import { useProgressStore } from '@/store/useProgressStore';
import { CheckCircle2, ChevronRight, HelpCircle, Lightbulb, XCircle } from "lucide-react";
import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function QuizCard({ question, onNext }: { question: Question, onNext: () => void }) {
  const [ selectedOptionId, setSelectedOptionId ] = useState<string | null>(null);
  const [ showHint, setShowHint ] = useState(false);
  const [ expandedOptions, setExpandedOptions ] = useState<Record<string, boolean>>({});

  const saveAnswer = useProgressStore((state) => state.saveAnswer);
  const { status } = useSession();

  const handleSelect = async (optionId: string, isCorrect: boolean) => {
    if (selectedOptionId) return;
    setSelectedOptionId(optionId);

    saveAnswer(question.id, isCorrect);

    if (status === "authenticated") {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question.id, isCorrect })
      });
    }
  };

  const toggleJustification = (optionId: string) => {
    setExpandedOptions(prev => ({ ...prev, [ optionId ]: !prev[ optionId ] }));
  };

  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header compact sur mobile */}
      <div className="bg-slate-50/50 px-4 sm:px-6 py-2.5 sm:py-4 flex justify-between items-center border-b border-slate-100">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold bg-indigo-100 text-indigo-700 uppercase tracking-widest">
          {question.type}
        </span>
        <button
          onClick={() => setShowHint(!showHint)}
          className={`flex items-center space-x-1 text-xs sm:text-sm font-semibold transition-colors px-2.5 py-1 rounded-md ${showHint ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
        >
          <Lightbulb className="h-3.5 w-3.5" />
          <span>Hint</span>
        </button>
      </div>

      <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        {/* Texte adaptatif : plus petit sur mobile pour éviter de pousser l'écran */}
        <h2 className="text-base sm:text-lg md:text-2xl font-bold text-slate-900 leading-snug">{question.text}</h2>

        {question.image && (
          <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100">
            {/* max-h-32 sur mobile pour laisser de la place aux options */}
            <img src={question.image} alt="Visual" className="rounded-lg max-h-32 sm:max-h-64 object-contain mx-auto mix-blend-multiply" />
          </div>
        )}

        {showHint && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start space-x-2 text-amber-800 animate-in fade-in slide-in-from-top-2">
            <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-medium leading-relaxed">{question.hint}</p>
          </div>
        )}

        <div className="space-y-2.5 sm:space-y-4">
          {question.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isRevealed = selectedOptionId !== null;

            let cardClass = "bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:shadow-md cursor-pointer";
            let icon = null;

            if (isRevealed) {
              cardClass = "cursor-default opacity-60 bg-slate-50 border-slate-200";
              if (opt.isCorrect) {
                cardClass = "bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm ring-1 ring-emerald-400";
                icon = <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 shrink-0" />;
              } else if (isSelected && !opt.isCorrect) {
                cardClass = "bg-rose-50 border-rose-400 text-rose-900 shadow-sm ring-1 ring-rose-400";
                icon = <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-rose-600 shrink-0" />;
              }
            }

            return (
              <div key={opt.id} className="space-y-1.5">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* Padding réduit sur mobile : p-3 */}
                  <button
                    onClick={() => handleSelect(opt.id, opt.isCorrect)}
                    disabled={isRevealed}
                    className={`flex-1 flex items-center justify-between text-left p-3 sm:p-4 md:p-5 rounded-xl border-2 transition-all duration-200 ${cardClass}`}
                  >
                    <div className="flex items-center space-x-2.5 sm:space-x-4">
                      {/* Rond d'indexation plus petit sur mobile (h-6 w-6) */}
                      <span className="flex items-center justify-center bg-slate-100 text-slate-500 font-bold rounded-lg h-6 w-6 sm:h-8 sm:w-8 shrink-0 text-xs sm:text-sm">
                        {opt.id}
                      </span>
                      <span className="font-semibold text-xs sm:text-base md:text-lg">{opt.text}</span>
                    </div>
                    {icon && <div className="ml-2 animate-in zoom-in">{icon}</div>}
                  </button>

                  {/* Bouton d'action "?" plus compact sur mobile (h-11 w-11) */}
                  {isRevealed && !opt.isCorrect && (
                    <button
                      onClick={() => toggleJustification(opt.id)}
                      className={`flex-shrink-0 h-11 w-11 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-xl border-2 flex items-center justify-center transition-all focus:outline-none ${expandedOptions[ opt.id ]
                        ? 'bg-slate-800 border-slate-800 text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      title="Toggle explanation"
                    >
                      <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                  )}
                </div>

                {isRevealed && (
                  <div className="overflow-hidden">
                    {opt.isCorrect && (
                      <div className="mt-1.5 text-xs sm:text-sm p-3 sm:p-4 rounded-xl bg-emerald-50 text-emerald-800 flex items-start space-x-2 sm:space-x-3 animate-in slide-in-from-top-2">
                        <div className="shrink-0 mt-0.5 bg-emerald-200/50 p-0.5 rounded">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                        </div>
                        <p className="leading-relaxed"><strong>Correct Answer:</strong> {opt.justification}</p>
                      </div>
                    )}

                    {!opt.isCorrect && expandedOptions[ opt.id ] && (
                      <div className="mt-1.5 text-xs sm:text-sm p-3 sm:p-4 rounded-xl bg-slate-100 text-slate-700 flex items-start space-x-2 sm:space-x-3 animate-in slide-in-from-top-2">
                        <div className="shrink-0 mt-0.5 bg-slate-200 p-0.5 rounded">
                          <HelpCircle className="h-3.5 w-3.5 text-slate-600" />
                        </div>
                        <p className="leading-relaxed"><strong>Explanation:</strong> {opt.justification}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Next Button plus compact sur mobile */}
      {selectedOptionId && (
        <div className="bg-slate-50 p-4 sm:p-6 border-t border-slate-100 flex justify-end animate-in fade-in slide-in-from-bottom-4">
          <button
            onClick={onNext}
            className="flex items-center space-x-1.5 px-6 py-2.5 sm:px-8 sm:py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all text-xs sm:text-base"
          >
            <span>Next Question</span>
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
