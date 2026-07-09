import { fileURLToPath } from 'node:url'

import { connectDatabase, disconnectDatabase } from '../mongoose.js'
import { MigrationModel } from './migration.model.js'
import { migrations } from './index.js'

export async function runMigrations() {
  await MigrationModel.createCollection()
  await MigrationModel.createIndexes()

  for (const migration of migrations) {
    const existingMigration = await MigrationModel.exists({ name: migration.name })

    if (existingMigration) {
      console.log(`Already applied: ${migration.name}`)
      continue
    }

    console.log(`Applying: ${migration.name}`)
    await migration.up()
    await MigrationModel.create({
      appliedAt: new Date(),
      name: migration.name
    })
    console.log(`Applied: ${migration.name}`)
  }
}

async function main() {
  await connectDatabase()
  await runMigrations()
  await disconnectDatabase()
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(async error => {
    console.error(error)
    await disconnectDatabase()
    process.exit(1)
  })
}
