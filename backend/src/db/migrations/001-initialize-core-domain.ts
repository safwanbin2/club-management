import { AuthSessionModel } from '../../modules/auth/auth-session.model.js'
import { BadgeModel } from '../../modules/badge/badge.model.js'
import { ChatMessageModel } from '../../modules/chat/chat-message.model.js'
import { ClubModel } from '../../modules/club/club.model.js'
import { AttendanceModel } from '../../modules/attendance/attendance.model.js'
import { CommentModel } from '../../modules/feed/comment.model.js'
import { PostModel } from '../../modules/feed/post.model.js'
import { EventModel } from '../../modules/event/event.model.js'
import { EventRegistrationModel } from '../../modules/event/event-registration.model.js'
import { MembershipModel } from '../../modules/membership/membership.model.js'
import { NotificationModel } from '../../modules/notification/notification.model.js'
import { PollModel } from '../../modules/poll/poll.model.js'
import { PollVoteModel } from '../../modules/poll/poll-vote.model.js'
import { ResourceRequestModel } from '../../modules/resource-request/resource-request.model.js'
import { UserModel } from '../../modules/user/user.model.js'
import type { Migration } from './migration.types.js'

type MigratableModel = {
  createCollection: () => Promise<unknown>
  createIndexes: () => Promise<unknown>
}

const models: MigratableModel[] = [
  UserModel,
  AuthSessionModel,
  ClubModel,
  MembershipModel,
  PostModel,
  CommentModel,
  EventModel,
  EventRegistrationModel,
  AttendanceModel,
  PollModel,
  PollVoteModel,
  ChatMessageModel,
  NotificationModel,
  BadgeModel,
  ResourceRequestModel
]

async function createCollectionsAndIndexes() {
  for (const model of models) {
    await model.createCollection()
    await model.createIndexes()
  }
}

export const initializeCoreDomainMigration: Migration = {
  name: '001-initialize-core-domain',
  up: createCollectionsAndIndexes
}
