import mongoose from 'mongoose'

import { defineModel } from '../../utils/define-model.js'
import type { ChatMessage } from './chat-message.types.js'

const chatAttachmentSchema = new mongoose.Schema(
  {
    name: {
      required: true,
      trim: true,
      type: String
    },
    size: {
      default: 0,
      min: 0,
      type: Number
    },
    type: {
      default: 'other',
      enum: ['image', 'other'],
      type: String
    },
    url: {
      required: true,
      trim: true,
      type: String
    }
  },
  {
    _id: false
  }
)

const seenBySchema = new mongoose.Schema(
  {
    seenAt: {
      default: Date.now,
      type: Date
    },
    user: {
      ref: 'User',
      required: true,
      type: mongoose.Schema.Types.ObjectId
    }
  },
  {
    _id: false
  }
)

const chatMessageSchema = new mongoose.Schema<ChatMessage>(
  {
    attachments: {
      default: [],
      type: [chatAttachmentSchema]
    },
    author: {
      ref: 'User',
      required: true,
      type: mongoose.Schema.Types.ObjectId
    },
    body: {
      default: '',
      trim: true,
      type: String
    },
    club: {
      ref: 'Club',
      required: true,
      type: mongoose.Schema.Types.ObjectId
    },
    deletedAt: {
      default: null,
      type: Date
    },
    parentMessage: {
      default: null,
      ref: 'ChatMessage',
      type: mongoose.Schema.Types.ObjectId
    },
    pinned: {
      default: false,
      type: Boolean
    },
    seenBy: {
      default: [],
      type: [seenBySchema]
    }
  },
  {
    collection: 'chat_messages',
    timestamps: true
  }
)

chatMessageSchema.index({ club: 1, createdAt: -1 })
chatMessageSchema.index({ club: 1, pinned: -1 })
chatMessageSchema.index({ author: 1, createdAt: -1 })
chatMessageSchema.index({ deletedAt: 1 })

export const ChatMessageModel = defineModel<ChatMessage>('ChatMessage', chatMessageSchema)
