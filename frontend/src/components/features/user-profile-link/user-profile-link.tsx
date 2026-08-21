import { Link } from 'react-router-dom'

import { useAuthUser } from '@common/globalStates/use-auth-store'

type UserProfileLinkProps = {
  className?: string
  name: string
  userId: string
}

export default function UserProfileLink({ className, name, userId }: UserProfileLinkProps) {
  const currentUser = useAuthUser()
  const path = currentUser?.id === userId ? '/profile' : `/profiles/${userId}`

  return (
    <Link className={className} to={path}>
      {name}
    </Link>
  )
}
