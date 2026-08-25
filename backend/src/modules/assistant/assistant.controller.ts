import type { Request, Response } from 'express'

import { env } from '../../config/env.js'
import { success } from '../../http/responses/index.js'
import { createGeminiClient } from './assistant.gemini-client.js'
import { runAssistantChat } from './assistant.service.js'
import { ASSISTANT_TOOL_DECLARATIONS, executeAssistantTool } from './assistant.tools.js'
import type { AssistantChatRequest } from './assistant.validation.js'

export async function chat(req: Request, res: Response) {
  const input = req.validated!.body as AssistantChatRequest
  const result = await runAssistantChat(input, req.auth!.user, {
    client: createGeminiClient({ apiKey: env.GEMINI_API_KEY }),
    executeTool: executeAssistantTool,
    model: env.GEMINI_MODEL,
    toolDeclarations: ASSISTANT_TOOL_DECLARATIONS
  })

  return success(res, result)
}
