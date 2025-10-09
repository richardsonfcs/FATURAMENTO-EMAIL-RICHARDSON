import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  try {
    const data = await resend.emails.send({
      from: 'Faturamento <faturamento@richardsoncastro.com>',
      to: 'seuemail@exemplo.com',
      subject: 'Teste Resend direto',
      html: '<strong>Teste de envio direto pela API</strong>',
    });
    res.status(200).json({ sucesso: true, resposta: data });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: erro.message });
  }
}
