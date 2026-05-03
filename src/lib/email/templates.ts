function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html><body style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #111;">
  <h1 style="font-size: 20px; margin-bottom: 16px;">${escapeHtml(title)}</h1>
  ${body}
  <p style="font-size: 12px; color: #666; margin-top: 32px;">If you did not request this, you can safely ignore this email.</p>
</body></html>`
}

export function magicLinkEmail(url: string, host: string): { subject: string; html: string; text: string } {
  const safeUrl = escapeHtml(url)
  const safeHost = escapeHtml(host)
  return {
    subject: `Sign in to ${host}`,
    html: layout(
      `Sign in to ${safeHost}`,
      `<p>Click the link below to sign in. This link expires in 24 hours.</p>
       <p><a href="${safeUrl}" style="display:inline-block; padding: 10px 16px; background:#111; color:#fff; text-decoration:none; border-radius:6px;">Sign in</a></p>
       <p style="font-size: 12px; color: #666;">Or copy and paste this URL: ${safeUrl}</p>`,
    ),
    text: `Sign in to ${host}\n\n${url}\n\nThis link expires in 24 hours.`,
  }
}

export function passwordResetEmail(url: string, host: string): { subject: string; html: string; text: string } {
  const safeUrl = escapeHtml(url)
  const safeHost = escapeHtml(host)
  return {
    subject: `Reset your password on ${host}`,
    html: layout(
      `Reset your password`,
      `<p>Click the link below to set a new password. This link expires in 1 hour.</p>
       <p><a href="${safeUrl}" style="display:inline-block; padding: 10px 16px; background:#111; color:#fff; text-decoration:none; border-radius:6px;">Reset password</a></p>
       <p style="font-size: 12px; color: #666;">Or copy and paste this URL: ${safeUrl}</p>
       <p style="font-size: 12px; color: #666;">From: ${safeHost}</p>`,
    ),
    text: `Reset your password on ${host}\n\n${url}\n\nThis link expires in 1 hour.`,
  }
}
