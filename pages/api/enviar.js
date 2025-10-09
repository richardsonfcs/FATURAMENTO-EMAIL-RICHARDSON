import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { to, subject, html, fileName, fileContent } = req.body;

    const emailData = {
      from: 'Faturamento <contato@richardsoncastro.com>',
      to,
      subject,
      html,
    };

    if (fileContent && fileName) {
      emailData.attachments = [
        {
          filename: fileName,
          content: fileContent,
        },
      ];
    }

    const response = await resend.emails.send(emailData);

    res.status(200).json({ ok: true, response });
  } catch (erro) {
    console.error('Erro ao enviar e-mail:', erro);
    res.status(500).json({ error: 'Falha ao enviar e-mail' });
  }
}
