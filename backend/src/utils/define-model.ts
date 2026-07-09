import type { Model } from 'mongoose'
import mongoose from 'mongoose'

export function defineModel<TDocument>(name: string, schema: mongoose.Schema<TDocument>) {
  return (
    (mongoose.models[name] as Model<TDocument> | undefined) ??
    mongoose.model<TDocument>(name, schema)
  )
}
