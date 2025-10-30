import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { title, content, authorId, tags } = await request.json();

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

    const post = {
      title,
      content,
      authorId: new ObjectId(authorId),
      authorName: author.name,
      tags: tags || [],
      comments: [],
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('posts').insertOne(post);
    return NextResponse.json(
      { _id: result.insertedId, ...post },
      { status: 201 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const { db } = await connectToDatabase();

    const posts = await db.collection('posts')
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection('posts').countDocuments();

    return NextResponse.json({
      posts,
      page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}