import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { query: string } }
) {
  try {
    const { db } = await connectToDatabase();
    
    const posts = await db.collection('posts')
      .find({ $text: { $search: params.query } })
      .toArray();

    return NextResponse.json(posts);

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}