import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { destinatario, assunto, corpo, dados, anexo } = req.body;

  try {
    // Substitui placeholders no HTML
    let htmlFinal = corpo;
    if (dados && typeof dados === 'object') {
      Object.keys(dados).forEach((chave) => {
        const valor = dados[chave] || '';
        const regex = new RegExp(`{{\\s*${chave}\\s*}}`, 'g');
        htmlFinal = htmlFinal.replace(regex, valor);
      });
    }

    const emailData = {
      from: 'Faturamento <seu-email@dominio.com>',
      to: destinatario,
      subject: assunto,
      html: htmlFinal,
    };

    if (anexo) {
      emailData.attachments = [
        {
          filename: anexo.nome,
          content: anexo.base64,
        },
      ];
    }

    await resend.emails.send(emailData);
    res.status(200).json({ sucesso: true });
  } catch (erro) {
    console.error('Erro ao enviar e-mail:', erro);
    res.status(500).json({ erro: 'Falha ao enviar e-mail' });
  }
}
