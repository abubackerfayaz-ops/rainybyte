import mongoose, { Schema, Document } from 'mongoose';

export interface ISource extends Document {
  key: string;
  name: string;
  type: 'global_model' | 'regional_model' | 'ensemble' | 'satellite' | 'station' | 'reanalysis';
  provider: string;
  url: string;
  region: string;
  description: string;
  resolution: string;
  updateFreq: string;
  accuracy: number;
  reportsCount: number;
  status: 'active' | 'degraded' | 'offline';
  lastAccuracyUpdate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SourceSchema = new Schema<ISource>(
  {
    key: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['global_model', 'regional_model', 'ensemble', 'satellite', 'station', 'reanalysis'],
      required: true,
    },
    provider: { type: String, required: true },
    url: { type: String },
    region: { type: String, default: 'global' },
    description: { type: String },
    resolution: { type: String },
    updateFreq: { type: String },
    accuracy: { type: Number, default: 0, min: 0, max: 100 },
    reportsCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'degraded', 'offline'],
      default: 'active',
    },
    lastAccuracyUpdate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Source || mongoose.model<ISource>('Source', SourceSchema);
