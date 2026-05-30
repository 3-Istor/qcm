import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProgressState {
  answers: Record<string, boolean>; // key: questionId, value: isCorrect
  saveAnswer: (questionId: string, isCorrect: boolean) => void;
  setBulkAnswers: (answers: Record<string, boolean>) => void;
  resetDeckLocal: (questionIds: string[]) => void;
  resetAllLocal: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      answers: {},
      saveAnswer: (questionId, isCorrect) =>
        set((state) => ({ answers: { ...state.answers, [questionId]: isCorrect } })),
      setBulkAnswers: (answers) => set({ answers }),
      resetDeckLocal: (questionIds) =>
        set((state) => {
          const newAnswers = { ...state.answers };
          questionIds.forEach((id) => delete newAnswers[id]);
          return { answers: newAnswers };
        }),
      resetAllLocal: () => set({ answers: {} }),
    }),
    {
      name: 'qcm-progress-storage',
    }
  )
);
