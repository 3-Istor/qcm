import fs from 'fs';
import path from 'path';

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  justification: string;
}

export interface Question {
  id: string;
  type: "theoretical" | "practical";
  text: string;
  image: string | null;
  hint: string;
  options: Option[];
}

export interface DeckMeta {
  title: string;
  description: string;
}

export interface Deck {
  subjectId: string;
  chapterId: string;
  meta: DeckMeta;
  questions: Question[];
}

const DATA_DIR = path.join(process.cwd(), 'data', 'subjects');

export async function getAllDecks(): Promise<Deck[]> {
  if (!fs.existsSync(DATA_DIR)) return [];

  const decks: Deck[] = [];
  const subjects = fs.readdirSync(DATA_DIR);

  for (const subject of subjects) {
    const subjectPath = path.join(DATA_DIR, subject);
    if (!fs.statSync(subjectPath).isDirectory()) continue;

    const chapters = fs.readdirSync(subjectPath);

    for (const chapter of chapters) {
      const chapterPath = path.join(subjectPath, chapter);
      if (!fs.statSync(chapterPath).isDirectory()) continue;

      // Read meta.json
      const metaPath = path.join(chapterPath, 'meta.json');
      let meta: DeckMeta = { title: chapter, description: "" };
      if (fs.existsSync(metaPath)) {
        meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      }

      // Read all chunk-*.json files
      let questions: Question[] = [];
      const files = fs.readdirSync(chapterPath);
      for (const file of files) {
        if (file.startsWith('chunk-') && file.endsWith('.json')) {
          const chunkPath = path.join(chapterPath, file);
          const chunkData = JSON.parse(fs.readFileSync(chunkPath, 'utf-8'));
          questions = questions.concat(chunkData);
        }
      }

      decks.push({
        subjectId: subject,
        chapterId: chapter,
        meta,
        questions
      });
    }
  }

  return decks;
}