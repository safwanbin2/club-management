import { PostLikeModel } from '../../modules/feed/post-like.model.js'
import type { Migration } from './migration.types.js'

async function createPostLikeCollectionAndIndexes() {
  try {
    await PostLikeModel.createCollection()
  } catch (error) {
    const maybeMongoError = error as { codeName?: string }

    if (maybeMongoError.codeName !== 'NamespaceExists') {
      throw error
    }
  }

  await PostLikeModel.createIndexes()
}

export const createPostLikesMigration: Migration = {
  name: '002-create-post-likes',
  up: createPostLikeCollectionAndIndexes
}
