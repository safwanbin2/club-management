import type { Types } from 'mongoose'

export type ClubCategory =
  | 'academic'
  | 'arts'
  | 'community_service'
  | 'culture'
  | 'entrepreneurship'
  | 'sports'
  | 'technology'

export type ClubStatus = 'active' | 'disabled' | 'pending'

export type Club = {
  category: ClubCategory
  contactEmail: null | string
  contactPhone: null | string
  coverImageUrl: null | string
  createdAt: Date
  createdBy: null | Types.ObjectId
  deletedAt: Date | null
  description: string
  disabledAt: Date | null
  facultyAdvisor: {
    department?: string
    email?: string
    name: string
  }
  gallery: string[]
  logoUrl: null | string
  name: string
  slug: string
  socialLinks: {
    facebook?: string
    instagram?: string
    linkedin?: string
    website?: string
  }
  status: ClubStatus
  updatedAt: Date
}
