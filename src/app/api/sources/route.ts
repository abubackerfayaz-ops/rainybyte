import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Source from '@/models/Source';

export async function GET() {
  try {
    await connectDB();
    const sources = await Source.find({})
      .sort({ accuracy: -1 })
      .select('key name type provider region description resolution updateFreq accuracy reportsCount status lastAccuracyUpdate')
      .lean();
    return NextResponse.json({ sources });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const source = await Source.create(body);
    return NextResponse.json({ source }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Source with this key already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create source' }, { status: 500 });
  }
}
