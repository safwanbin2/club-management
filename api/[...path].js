import app from '../backend/dist/app.js'

export default async function handler(req, res) {
  return app(req, res)
}
