import mongoose from 'mongoose'

import { defineModel } from '../../utils/define-model.js'
import type { Club } from './club.types.js'

const clubSchema = new mongoose.Schema<Club>(
  {
    category: {
      enum: [
        'academic',
        'arts',
        'community_service',
        'culture',
        'entrepreneurship',
        'sports',
        'technology'
      ],
      required: true,
      type: String
    },
    contactEmail: {
      default: null,
      lowercase: true,
      trim: true,
      type: String
    },
    contactPhone: {
      default: null,
      trim: true,
      type: String
    },
    coverImageUrl: {
      default: null,
      trim: true,
      type: String
    },
    createdBy: {
      default: null,
      ref: 'User',
      type: mongoose.Schema.Types.ObjectId
    },
    deletedAt: {
      default: null,
      type: Date
    },
    description: {
      required: true,
      trim: true,
      type: String
    },
    disabledAt: {
      default: null,
      type: Date
    },
    facultyAdvisor: {
      department: {
        trim: true,
        type: String
      },
      email: {
        lowercase: true,
        trim: true,
        type: String
      },
      name: {
        required: true,
        trim: true,
        type: String
      }
    },
    gallery: {
      default: [],
      type: [String]
    },
    logoUrl: {
      default: null,
      trim: true,
      type: String
    },
    name: {
      required: true,
      trim: true,
      type: String
    },
    slug: {
      lowercase: true,
      required: true,
      trim: true,
      type: String,
      unique: true
    },
    socialLinks: {
      facebook: {
        trim: true,
        type: String
      },
      instagram: {
        trim: true,
        type: String
      },
      linkedin: {
        trim: true,
        type: String
      },
      website: {
        trim: true,
        type: String
      }
    },
    status: {
      default: 'active',
      enum: ['active', 'disabled', 'pending'],
      type: String
    }
  },
  {
    collection: 'clubs',
    timestamps: true
  }
)

clubSchema.index({ category: 1, status: 1 })
clubSchema.index({ deletedAt: 1, status: 1 })
clubSchema.index({ name: 'text', description: 'text' })

export const ClubModel = defineModel<Club>('Club', clubSchema)
