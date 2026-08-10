import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const platform = searchParams.get('platform');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const where: Record<string, unknown> = { userId };
    if (platform) where.platform = platform;

    const analyses = await db.contentAnalysis.findMany({
      where,
      orderBy: { [sortBy]: order === 'asc' ? 'asc' : 'desc' },
      take: 50,
    });

    const formatted = analyses.map((a) => ({
      id: a.id,
      title: a.title,
      platform: a.platform,
      contentType: a.contentType,
      overallScore: a.overallScore,
      classification: a.classification,
      createdAt: a.createdAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Library error:', error);
    return NextResponse.json({ error: 'Failed to fetch library' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json({ error: 'id and userId are required' }, { status: 400 });
    }

    await db.contentAnalysis.deleteMany({ where: { id, userId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
