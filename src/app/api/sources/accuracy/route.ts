import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AccuracyReport from '@/models/AccuracyReport';
import Source from '@/models/Source';

export async function GET() {
  try {
    await connectDB();
    const reports = await AccuracyReport.find({})
      .sort({ date: -1 })
      .limit(100)
      .lean();
    return NextResponse.json({ reports });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch accuracy reports' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { sourceKey, sourceName, overallAccuracy, tempAccuracy, rainAccuracy, windAccuracy, region } = body;

    const report = await AccuracyReport.create({
      sourceKey,
      sourceName,
      date: new Date(),
      overallAccuracy: overallAccuracy ?? Math.round((tempAccuracy + rainAccuracy + windAccuracy) / 3),
      tempAccuracy,
      rainAccuracy,
      windAccuracy,
      region: region || 'global',
    });

    const allReports = await AccuracyReport.find({ sourceKey }).sort({ date: -1 }).limit(30).lean();
    const avgAccuracy = Math.round(
      allReports.reduce((sum, r) => sum + r.overallAccuracy, 0) / allReports.length
    );

    await Source.updateOne(
      { key: sourceKey },
      {
        $set: {
          accuracy: avgAccuracy,
          lastAccuracyUpdate: new Date(),
          reportsCount: allReports.length,
        },
      }
    );

    return NextResponse.json({ report, updatedAccuracy: avgAccuracy }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record accuracy' }, { status: 500 });
  }
}
