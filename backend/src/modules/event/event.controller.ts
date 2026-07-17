import type { Request, Response } from 'express'

import { success } from '../../http/responses/index.js'
import * as eventService from './event.service.js'
import type {
  CancelRegistrationInput,
  CreateEventInput,
  EventListQuery,
  EventRegistrationsQuery,
  UpdateEventInput
} from './event.validation.js'

function getValidatedQuery<TQuery>(req: Request) {
  return req.validated?.query as TQuery
}

function getValidatedBody<TBody>(req: Request) {
  return req.validated?.body as TBody
}

function getEventId(req: Request) {
  return (req.validated?.params as { eventId: string }).eventId
}

export async function index(req: Request, res: Response) {
  return success(
    res,
    await eventService.listEvents(getValidatedQuery<EventListQuery>(req), req.auth!.user)
  )
}

export async function show(req: Request, res: Response) {
  return success(res, await eventService.getEventDetail(getEventId(req), req.auth!.user))
}

export async function manageableClubs(req: Request, res: Response) {
  return success(res, await eventService.listManageableEventClubs(req.auth!.user))
}

export async function store(req: Request, res: Response) {
  return success(
    res,
    await eventService.createEvent(getValidatedBody<CreateEventInput>(req), req.auth!.user),
    'Event created',
    201
  )
}

export async function update(req: Request, res: Response) {
  return success(
    res,
    await eventService.updateEvent(
      getEventId(req),
      getValidatedBody<UpdateEventInput>(req),
      req.auth!.user
    ),
    'Event updated'
  )
}

export async function destroy(req: Request, res: Response) {
  return success(
    res,
    await eventService.deleteEvent(getEventId(req), req.auth!.user),
    'Event deleted'
  )
}

export async function register(req: Request, res: Response) {
  return success(
    res,
    await eventService.registerForEvent(getEventId(req), req.auth!.user),
    'Event registration updated'
  )
}

export async function cancelRegistration(req: Request, res: Response) {
  return success(
    res,
    await eventService.cancelEventRegistration(
      getEventId(req),
      getValidatedBody<CancelRegistrationInput>(req),
      req.auth!.user
    ),
    'Event registration cancelled'
  )
}

export async function registrations(req: Request, res: Response) {
  return success(
    res,
    await eventService.listEventRegistrations(
      getEventId(req),
      getValidatedQuery<EventRegistrationsQuery>(req),
      req.auth!.user
    )
  )
}
