import { describe, expect, it } from 'vitest'

import { hashPassword, verifyPassword } from './password.service.js'

describe('password.service', () => {
  it('verifies a password against its scrypt hash', async () => {
    const passwordHash = await hashPassword('DemoStudent123!')

    await expect(verifyPassword('DemoStudent123!', passwordHash)).resolves.toBe(true)
  })

  it('rejects a password that does not match the hash', async () => {
    const passwordHash = await hashPassword('DemoStudent123!')

    await expect(verifyPassword('WrongPassword123!', passwordHash)).resolves.toBe(false)
  })
})
