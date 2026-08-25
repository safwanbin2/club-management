export const EAST_DELTA_EMAIL_DOMAIN = 'eastdelta.edu.bd'
export const EAST_DELTA_EMAIL_SUFFIX = `@${EAST_DELTA_EMAIL_DOMAIN}`
export const EAST_DELTA_EMAIL_DOMAIN_ERROR = `This email domain is not allowed. Use your ${EAST_DELTA_EMAIL_SUFFIX} email.`
export const EAST_DELTA_PROGRAM_ERROR = 'Select a valid EDU program.'

export const EAST_DELTA_PROGRAMS = [
  'BBA',
  'MBA',
  'MPPL',
  'BUSINESS ADMINISTRATION AND ARTIFICIAL INTELLIGENCE',
  'BSC IN ECONOMICS',
  'DATA ANALYTICS AND DESIGN THINKING FOR BUSINESS',
  'BA IN ENGLISH',
  'MA IN ENGLISH',
  'MA IN TESOL',
  'B.SC. IN CSE',
  'B.SC. IN EEE',
  'B.SC. IN ETE',
  'M.SC. IN CSE',
  'M.SC. IN ETE'
] as const

export type EastDeltaProgram = (typeof EAST_DELTA_PROGRAMS)[number]

export const EAST_DELTA_PROGRAM_OPTIONS = EAST_DELTA_PROGRAMS.map(program => ({
  label: program,
  value: program
}))

export function isEastDeltaEmail(email: string) {
  return email.trim().toLowerCase().endsWith(EAST_DELTA_EMAIL_SUFFIX)
}

export function isEastDeltaProgram(value: null | string | undefined): value is EastDeltaProgram {
  return Boolean(value && (EAST_DELTA_PROGRAMS as readonly string[]).includes(value))
}
