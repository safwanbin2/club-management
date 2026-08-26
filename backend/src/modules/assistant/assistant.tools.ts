import { z } from 'zod'

import { ApplicationError } from '../../utils/application-error.js'
import { getDashboardSummary as getDashboardSummaryDefault } from '../dashboard/dashboard.service.js'
import { listEvents as listEventsDefault } from '../event/event.service.js'
import { getResourceRequestAnalytics as getResourceRequestAnalyticsDefault } from '../resource-request/resource-request.service.js'
import { search as searchCampusDefault } from '../search/search.service.js'
import type { UserDto } from '../user/user.types.js'
import type { AssistantToolDeclaration, AssistantToolExecutor } from './assistant.types.js'

type AssistantToolDependencies = {
  getDashboardSummary?: typeof getDashboardSummaryDefault
  getResourceRequestAnalytics?: typeof getResourceRequestAnalyticsDefault
  listEvents?: typeof listEventsDefault
  searchCampus?: typeof searchCampusDefault
}

const searchCampusArgsSchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .positive()
    .default(5)
    .transform(value => Math.min(value, 8)),
  query: z.string().trim().min(2).max(140),
  type: z.enum(['all', 'clubs', 'events', 'posts', 'profiles']).default('all')
})

const upcomingEventsArgsSchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .positive()
    .default(5)
    .transform(value => Math.min(value, 8)),
  scope: z.enum(['all', 'managed', 'myClubs', 'registered']).default('all')
})

const emptyArgsSchema = z.object({}).passthrough()

export const ASSISTANT_TOOL_DECLARATIONS: AssistantToolDeclaration[] = [
  {
    description:
      'Get role-aware dashboard metrics, panels, and recommended actions for the authenticated Campus Hub user.',
    name: 'get_dashboard_summary',
    parameters: {
      properties: {},
      type: 'object'
    },
    type: 'function'
  },
  {
    description:
      'Search role-visible campus clubs, events, feed posts, and public profiles. Use for discovery questions.',
    name: 'search_campus',
    parameters: {
      properties: {
        limit: {
          description: 'Maximum results per group. Values above 8 are capped.',
          type: 'integer'
        },
        query: {
          description: 'The campus search term.',
          type: 'string'
        },
        type: {
          description: 'Optional result group to search.',
          enum: ['all', 'clubs', 'events', 'posts', 'profiles'],
          type: 'string'
        }
      },
      required: ['query'],
      type: 'object'
    },
    type: 'function'
  },
  {
    description:
      'Get role-scoped funding and room booking request analytics for the authenticated user.',
    name: 'get_resource_request_analytics',
    parameters: {
      properties: {},
      type: 'object'
    },
    type: 'function'
  },
  {
    description:
      'Get role-visible upcoming published events. Supports all events, managed events, my club events, or registered events.',
    name: 'get_upcoming_events',
    parameters: {
      properties: {
        limit: {
          description: 'Maximum number of events. Values above 8 are capped.',
          type: 'integer'
        },
        scope: {
          description: 'Which event scope to inspect.',
          enum: ['all', 'managed', 'myClubs', 'registered'],
          type: 'string'
        }
      },
      type: 'object'
    },
    type: 'function'
  }
]

function parseToolArgs<TArgs>(
  schema: z.ZodType<TArgs>,
  args: Record<string, unknown>,
  toolName: string
) {
  const result = schema.safeParse(args)

  if (!result.success) {
    throw new ApplicationError(
      `Invalid arguments for assistant tool ${toolName}.`,
      400,
      'ASSISTANT_TOOL_ARGS_INVALID',
      result.error.flatten().fieldErrors
    )
  }

  return result.data
}

export function createAssistantToolExecutor(
  dependencies: AssistantToolDependencies = {}
): AssistantToolExecutor {
  const getDashboardSummary = dependencies.getDashboardSummary ?? getDashboardSummaryDefault
  const getResourceRequestAnalytics =
    dependencies.getResourceRequestAnalytics ?? getResourceRequestAnalyticsDefault
  const listEvents = dependencies.listEvents ?? listEventsDefault
  const searchCampus = dependencies.searchCampus ?? searchCampusDefault

  return async (name: string, args: Record<string, unknown>, actor: UserDto) => {
    if (name === 'get_dashboard_summary') {
      parseToolArgs(emptyArgsSchema, args, name)
      return getDashboardSummary(actor)
    }

    if (name === 'search_campus') {
      const parsedArgs = parseToolArgs(searchCampusArgsSchema, args, name)
      return searchCampus(
        {
          limit: parsedArgs.limit ?? 5,
          q: parsedArgs.query,
          type: parsedArgs.type ?? 'all'
        },
        actor
      )
    }

    if (name === 'get_resource_request_analytics') {
      parseToolArgs(emptyArgsSchema, args, name)
      return getResourceRequestAnalytics(actor)
    }

    if (name === 'get_upcoming_events') {
      const parsedArgs = parseToolArgs(upcomingEventsArgsSchema, args, name)
      const events = await listEvents(
        {
          page: 1,
          perPage: parsedArgs.limit ?? 5,
          scope: parsedArgs.scope ?? 'all',
          search: '',
          sort: 'upcoming',
          status: 'published',
          timeframe: 'upcoming'
        },
        actor
      )

      return {
        events: events.data,
        total: events.total
      }
    }

    throw new ApplicationError('Assistant tool was not found.', 400, 'ASSISTANT_TOOL_NOT_FOUND')
  }
}

export const executeAssistantTool = createAssistantToolExecutor()
