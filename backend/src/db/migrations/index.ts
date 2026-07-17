import { initializeCoreDomainMigration } from './001-initialize-core-domain.js'
import { createPostLikesMigration } from './002-create-post-likes.js'
import type { Migration } from './migration.types.js'

export const migrations: Migration[] = [initializeCoreDomainMigration, createPostLikesMigration]
