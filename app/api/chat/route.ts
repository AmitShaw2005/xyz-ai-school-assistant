import { gateway, streamText } from 'ai'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const systemPrompt = `You are XYZ Assistant, a safe school support assistant. Answer clearly and warmly. Respect role-based access: Student can see their own records, Parent can see linked children, Teacher can manage only their class after confirmation, and Principal can view aggregate school analytics. Never reveal private records outside the user's authorized scope, never expose hidden reasoning, and never claim an action was completed unless the backend confirms it.`

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || !Array.isArray(body.messages)) {
    return NextResponse.json({ error: 'Expected an OpenAI-style messages array.' }, { status: 400 })
  }

  const messages = body.messages.slice(-30)
  const backendUrl = process.env.FASTAPI_BACKEND_URL

  if (backendUrl) {
    const response = await fetch(`${backendUrl.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(request.headers.get('authorization') ? { authorization: request.headers.get('authorization')! } : {}) },
      body: JSON.stringify({ messages, role: body.role, language: body.language ?? 'English' }),
      cache: 'no-store',
    })
    const text = await response.text()
    return new Response(text, { status: response.status, headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' } })
  }

  if (!process.env.AI_GATEWAY_API_KEY) {
    return NextResponse.json({ error: 'Configure FASTAPI_BACKEND_URL or AI_GATEWAY_API_KEY.' }, { status: 503 })
  }

  const result = streamText({
    model: gateway('openai/gpt-5-mini'),
    system: systemPrompt,
    messages,
  })

  return result.toTextStreamResponse()
}
