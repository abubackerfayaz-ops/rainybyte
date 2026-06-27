import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Source from '@/models/Source';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    await connectDB();
    const { key } = await params;
    const body = await request.json();
    const source = await Source.findOneAndUpdate({ key }, { $set: body }, { new: true }).lean();
    if (!source) return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    return NextResponse.json({ source });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update source' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    await connectDB();
    const { key } = await params;
    const source = await Source.findOneAndDelete({ key }).lean();
    if (!source) return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    return NextResponse.json({ message: 'Source deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete source' }, { status: 500 });
  }
}
