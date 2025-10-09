}
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const { to, subject, text } = req.body;
    const data = await resend.emails.send({
      from: 'clinica@seu-dominio.com',
      to,
      subject,
      text,
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error });
  }
}
