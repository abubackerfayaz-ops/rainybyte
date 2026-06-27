import mongoose, { Schema, Document } from 'mongoose';

export interface IAccuracyReport extends Document {
  sourceKey: string;
  sourceName: string;
  date: Date;
  tempAccuracy: number;
  rainAccuracy: number;
  windAccuracy: number;
  overallAccuracy: number;
  sampleSize: number;
  region: string;
  notes: string;
  createdAt: Date;
}

const AccuracyReportSchema = new Schema<IAccuracyReport>(
  {
    sourceKey: { type: String, required: true, index: true },
    sourceName: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    tempAccuracy: { type: Number, required: true, min: 0, max: 100 },
    rainAccuracy: { type: Number, required: true, min: 0, max: 100 },
    windAccuracy: { type: Number, required: true, min: 0, max: 100 },
    overallAccuracy: { type: Number, required: true, min: 0, max: 100 },
    sampleSize: { type: Number, default: 1 },
    region: { type: String, default: 'global' },
    notes: { type: String },
  },
  { timestamps: true }
);

AccuracyReportSchema.index({ sourceKey: 1, date: -1 });

export default mongoose.models.AccuracyReport ||
  mongoose.model<IAccuracyReport>('AccuracyReport', AccuracyReportSchema);
