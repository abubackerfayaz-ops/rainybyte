import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AccuracyReport from '@/models/AccuracyReport';
import Source from '@/models/Source';

const cache = new Map<string, { data: any; time: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  try {
    const cached = cache.get('latest');
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      return NextResponse.json({ reports: cached.data });
    }
    await connectDB();
    const reports = await AccuracyReport.aggregate([
      { $sort: { date: -1 } },
      { $group: { _id: '$sourceKey', doc: { $first: '$$ROOT' } } },
      { $replaceWith: '$doc' },
      { $sort: { date: -1 } },
      { $limit: 30 },
    ]);
    cache.set('latest', { data: reports, time: Date.now() });
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

    const [stats] = await AccuracyReport.aggregate([
      { $match: { sourceKey } },
      { $sort: { date: -1 } },
      { $limit: 30 },
      { $group: { _id: null, avgAccuracy: { $avg: '$overallAccuracy' }, count: { $sum: 1 } } },
    ]);

    const avgAccuracy = stats ? Math.round(stats.avgAccuracy) : overallAccuracy;
    const reportCount = stats?.count ?? 1;

    await Source.updateOne(
      { key: sourceKey },
      {
        $set: {
          accuracy: avgAccuracy,
          lastAccuracyUpdate: new Date(),
          reportsCount: reportCount,
        },
      }
    );

    cache.delete('latest');
    cache.delete('list');

    return NextResponse.json({ report, updatedAccuracy: avgAccuracy }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record accuracy' }, { status: 500 });
  }
}
