import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// POST: Save progress for a question
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subjectId, chapterId, questionId, isCorrect } = await req.json();

  try {
    const progress = await prisma.progress.upsert({
      where: {
        userId_questionId: {
          userId: session.user.id,
          questionId,
        },
      },
      update: {
        isCorrect,
      },
      create: {
        userId: session.user.id,
        subjectId,
        chapterId,
        questionId,
        isCorrect,
      },
    });
    return NextResponse.json(progress);
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// DELETE: Reset progress for a specific deck (or all decks)
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get("subjectId");
  const chapterId = searchParams.get("chapterId");

  try {
    const whereClause: any = { userId: session.user.id };
    if (subjectId) whereClause.subjectId = subjectId;
    if (chapterId) whereClause.chapterId = chapterId;

    await prisma.progress.deleteMany({
      where: whereClause,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
