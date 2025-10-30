import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { tag: string } }
) {
  try {
    const { db } = await connectToDatabase();
    
    const posts = await db.collection('posts')
      .find({ tags: params.tag })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(posts);

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}