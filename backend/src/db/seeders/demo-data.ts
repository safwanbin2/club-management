import { USER_ROLES, type UserRole } from '../../constants/roles.js'

export type DemoUser = {
  email: string
  name: string
  password: string
  role: UserRole
}

export const demoUsers: DemoUser[] = [
  {
    email: 'aisha.student@example.edu',
    name: 'Aisha Rahman',
    password: 'DemoStudent123!',
    role: USER_ROLES.student
  },
  {
    email: 'nabila.executive@example.edu',
    name: 'Nabila Chowdhury',
    password: 'DemoExecutive123!',
    role: USER_ROLES.clubExecutive
  },
  {
    email: 'farhana.admin@example.edu',
    name: 'Dr. Farhana Karim',
    password: 'DemoAdmin123!',
    role: USER_ROLES.universityAdmin
  }
]

export const demoClubs = [
  'Robotics Club',
  'Debate Society',
  'Photography Club',
  'Cultural Club',
  'Volunteer Forum'
] as const
