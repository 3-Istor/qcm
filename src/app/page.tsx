import DashboardClient from "@/components/DashboardClient";
import { getAllDecks } from "@/lib/data";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import Link from "next/link";
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
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between border-b border-gray-200 pb-5 mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-extrabold leading-7 text-gray-900 sm:text-4xl sm:truncate">
            My Study Decks
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Active recall QCM platform. Track your knowledge chapter by chapter.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          {session ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Hello, <strong>{session.user?.name || session.user?.email}</strong></span>
              <Link href="/api/auth/signout" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Sign Out
              </Link>
            </div>
          ) : (
            <Link href="/api/auth/signin" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              Sign In with Keycloak
            </Link>
          )}
        </div>
      </div>

      {/* Client Interface handling progress calculations */}
      <DashboardClient decks={decks} dbProgress={dbProgress} isAuthenticated={!!session} />
    </main>
  );
}
