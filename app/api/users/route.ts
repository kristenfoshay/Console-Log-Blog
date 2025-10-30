import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = {
      name,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };

    const result = await db.collection('users').insertOne(user);

    // Don't return password in response
    const { password: _, ...userResponse } = user;
    return NextResponse.json(
      { _id: result.insertedId, ...userResponse },
      { status: 201 }
    );

  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}