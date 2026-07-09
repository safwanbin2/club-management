export type Migration = {
  name: string
  up: () => Promise<void>
}
