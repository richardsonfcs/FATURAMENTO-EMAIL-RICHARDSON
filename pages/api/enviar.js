import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  const { to, subject, html, fileName, fileContent } = req.body;

  try {
    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
      attachments: fileName
        ? [{ filename: fileName, content: fileContent, encoding: 'base64' }]
        : []
    });
    res.status(200).json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
