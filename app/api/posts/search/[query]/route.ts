import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { query: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const query = decodeURIComponent(params.query);
    
    const searchRegex = new RegExp(query, 'i');
    
    const posts = await db.collection('posts')
      .find({
        $or: [
          { title: { $regex: searchRegex } },
          { content: { $regex: searchRegex } },
          { tags: { $in: [searchRegex] } }
        ]
      })
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