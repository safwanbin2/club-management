import type { Request, Response } from 'express'

import { env } from '../../config/env.js'
import { success } from '../../http/responses/index.js'
import { createGeminiClient } from './assistant.gemini-client.js'
import { getAssistantRun, startAssistantRun } from './assistant.service.js'
import { ASSISTANT_TOOL_DECLARATIONS, executeAssistantTool } from './assistant.tools.js'
import type { AssistantChatRequest, AssistantRunParams } from './assistant.validation.js'

export async function chat(req: Request, res: Response) {
  const input = req.validated!.body as AssistantChatRequest
  const result = startAssistantRun(input, req.auth!.user, {
    client: createGeminiClient({
      apiKey: env.GEMINI_API_KEY,
      timeoutMs: env.GEMINI_REQUEST_TIMEOUT_MS
    }),
    executeTool: executeAssistantTool,
    model: env.GEMINI_MODEL,
    toolDeclarations: ASSISTANT_TOOL_DECLARATIONS
  })

  return success(res, result, 'Assistant run started', result.status === 'pending' ? 202 : 200)
}

export async function getRun(req: Request, res: Response) {
  const { runId } = req.validated!.params as AssistantRunParams

  return success(res, getAssistantRun(runId, req.auth!.user))
}
