import request from 'supertest'
import { describe, expect, it } from 'vitest'

import app from './app.js'

describe('app CORS policy', () => {
  it('allows preflight requests from any origin with custom headers', async () => {
    const origin = 'https://student-project.example'

    const response = await request(app)
      .options('/api/auth/login')
      .set('Origin', origin)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'authorization,x-student-project')

    expect(response.status).toBe(204)
    expect(response.headers['access-control-allow-origin']).toBe(origin)
    expect(response.headers['access-control-allow-credentials']).toBe('true')
    expect(response.headers['access-control-allow-headers']).toBe('authorization,x-student-project')
  })

  it('reflects arbitrary origins on normal responses', async () => {
    const origin = 'https://any-campus-client.example'

    const response = await request(app).get('/missing-route').set('Origin', origin)

    expect(response.status).toBe(404)
    expect(response.headers['access-control-allow-origin']).toBe(origin)
    expect(response.headers['access-control-allow-credentials']).toBe('true')
  })
})
