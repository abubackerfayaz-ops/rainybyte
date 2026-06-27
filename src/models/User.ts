import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  initials: string;
  savedLocations: { name: string; lat: number; lon: number }[];
  preferences: {
    unit: 'C' | 'F';
    notifications: boolean;
    defaultLocation: string;
  };
  climateRecords: {
    location: string;
    lat: number;
    lon: number;
    condition: string;
    temp: number;
    humidity: number;
    date: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    initials: { type: String, default: '' },
    savedLocations: [{
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
    }],
    preferences: {
      unit: { type: String, enum: ['C', 'F'], default: 'C' },
      notifications: { type: Boolean, default: true },
      defaultLocation: { type: String, default: '' },
    },
    climateRecords: [{
      location: { type: String },
      lat: { type: Number },
      lon: { type: Number },
      condition: { type: String },
      temp: { type: Number },
      humidity: { type: Number },
      date: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
