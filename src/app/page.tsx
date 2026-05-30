import DashboardClient from "@/components/DashboardClient";
import { getAllDecks } from "@/lib/data";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const decks = await getAllDecks();
  const session = await getServerSession(authOptions);

  const dbProgress: Record<string, boolean> = {};

  if (session?.user?.id) {
    const progressList = await prisma.progress.findMany({
      where: { userId: session.user.id }
    });
    progressList.forEach((p) => {
      dbProgress[ p.questionId ] = p.isCorrect;
    });
  }

  return (
    <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="border-b border-gray-200 pb-5 mb-8">
        <h1 className="text-3xl font-extrabold leading-7 text-gray-900 sm:text-4xl sm:truncate">
          My Study Decks
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Active recall QCM platform. Track your knowledge chapter by chapter.
        </p>
      </div>

      {/* Client Interface handling progress calculations */}
      <DashboardClient decks={decks} dbProgress={dbProgress} isAuthenticated={!!session} />
    </main>
  );
}
