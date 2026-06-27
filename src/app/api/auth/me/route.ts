import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'rainy-byte-jwt-secret-dev';

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const token = auth.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    await connectDB();
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id,
      username: user.username,
      email: user.email,
      initials: user.initials,
      savedLocations: user.savedLocations,
      preferences: user.preferences,
      climateRecords: user.climateRecords,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
}
