import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorId, content } = await request.json();
    const { db } = await connectToDatabase();

    // Verify author exists
    const author = await db.collection('users').findOne({ 
      _id: new ObjectId(authorId) 
    });

    if (!author) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      );
    }

    const comment = {
      _id: new ObjectId(),
      authorId: new ObjectId(authorId),
      authorName: author.name,
      content,
      createdAt: new Date()
    };

    const result = await db.collection('posts').findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { 
        $push: { comments: comment },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(comment, { status: 201 });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}