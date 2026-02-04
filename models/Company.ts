import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ICompanySettings {
  timezone: string;
  currency: string;
  language: string;
}

export interface ICompanyDocument extends Document {
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  logo?: string;
  website?: string;
  taxId?: string;
  isActive: boolean;
  settings: ICompanySettings;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'Company email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
    },
    website: {
      type: String,
      trim: true,
    },
    taxId: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      timezone: {
        type: String,
        default: 'America/Lima',
      },
      currency: {
        type: String,
        default: 'PEN',
      },
      language: {
        type: String,
        default: 'es',
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

CompanySchema.index({ slug: 1 });
CompanySchema.index({ email: 1 });
CompanySchema.index({ isActive: 1 });
CompanySchema.index({ createdBy: 1 });

CompanySchema.pre('save', function () {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
});

const Company: Model<ICompanyDocument> =
  mongoose.models.Company || mongoose.model<ICompanyDocument>('Company', CompanySchema);

export default Company;
