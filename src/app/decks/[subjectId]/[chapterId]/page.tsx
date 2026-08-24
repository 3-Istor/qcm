import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import QuizEngine from "@/components/QuizEngine";
import { getAllDecks } from "@/lib/data";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

interface PageProps {
    params: Promise<{ subjectId: string; chapterId: string }>;
    searchParams: Promise<{ mode?: string }>;
}

export default async function DeckPage({ params, searchParams }: PageProps) {
    // Unwrapping Next.js promises
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    const decks = await getAllDecks();
    const deck = decks.find(
        (d) =>
            d.subjectId === resolvedParams.subjectId &&
            d.chapterId === resolvedParams.chapterId
    );

    if (!deck) return notFound();

    const session = await getServerSession(authOptions);
    const dbProgress: Record<string, boolean> = {};

    if (session?.user?.id) {
        const progressList = await prisma.progress.findMany({
            where: {
                userId: session.user.id,
                subjectId: resolvedParams.subjectId,
                chapterId: resolvedParams.chapterId,
            },
        });
        progressList.forEach((p) => {
            dbProgress[ p.questionId ] = p.isCorrect;
        });
    }

    const isReviewMode = resolvedSearchParams.mode === "review";

    return (
        /* py-3 sur mobile pour coller la barre de progression directement sous la navbar */
        <main className="max-w-4xl mx-auto py-3 sm:py-8 px-4 sm:px-6 lg:px-8">

            {/*
        Section Titre responsive :
        - hidden sur mobile (gain de place maximal)
        - sm:flex sur PC (affiche le contexte élégamment)
      */}
            <div className="hidden sm:flex sm:flex-col mb-6 border-b border-slate-200 pb-4">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
                    {resolvedParams.subjectId}
                </span>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {deck.meta.title}
                </h1>
            </div>

            <QuizEngine
                deck={deck}
                dbProgress={dbProgress}
                isAuthenticated={!!session}
                isReviewMode={isReviewMode}
            />
        </main>
    );
}
