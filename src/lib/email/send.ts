import { Resend } from 'resend'

let cachedClient: Resend | null = null

function getClient(): Resend {
  if (cachedClient) return cachedClient
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set')
  }
  cachedClient = new Resend(apiKey)
  return cachedClient
}

function getFromAddress(): string {
  const from = process.env.EMAIL_FROM
  if (!from) {
    throw new Error('EMAIL_FROM is not set')
  }
  return from
}

export interface SendEmailArgs {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailArgs): Promise<void> {
  const client = getClient()
  const from = getFromAddress()
  const result = await client.emails.send({ from, to, subject, html, text })
  if (result.error) {
    throw new Error(`Failed to send email: ${result.error.message}`)
  }
}
