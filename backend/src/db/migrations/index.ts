import { initializeCoreDomainMigration } from './001-initialize-core-domain.js'
import type { Migration } from './migration.types.js'

export const migrations: Migration[] = [initializeCoreDomainMigration]
