import { useState } from "react";

export default function Home() {
  const [clientName, setClientName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [valor, setValor] = useState("");
  const [email, setEmail] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [template, setTemplate] = useState("cliente");
  const [arquivo, setArquivo] = useState(null);
  const [previewHtml, setPreviewHtml] = useState("");

  // Converte PDF em base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (err) => reject(err);
    });

  // Gera HTML do template selecionado
  const gerarHtml = async (dados) => {
    try {
      const res = await fetch(`/templates/${dados.template}.html`);
      if (!res.ok) throw new Error("Template não encontrado.");
      let html = await res.text();

      html = html
        .replace(/{{empresa}}/g, dados.clientName)
        .replace(/{{cnpj}}/g, dados.cnpj)
        .replace(/{{valor}}/g, dados.valor)
        .replace(/{{contato}}/g, dados.email)
        .replace(
          /{{periodo}}/g,
          dados.periodo ||
            new Date().toLocaleString("pt-BR", {
              month: "long",
              year: "numeric",
            })
        )
        .replace(/{{mensagem_adicional}}/g, dados.mensagem);

      setPreviewHtml(html);
      return html;
    } catch (err) {
      console.error("Erro ao gerar HTML:", err);
      alert("Erro ao gerar o HTML: " + err.message);
    }
  };

  const handleSend = async () => {
    try {
      console.log("Iniciando envio de e-mail...");

      const html = await gerarHtml({
        clientName,
        cnpj,
        valor,
        email,
        periodo,
        mensagem,
        template,
      });

      if (!html) throw new Error("HTML não foi gerado corretamente.");

      let fileContent = null;
      let fileName = null;

      if (arquivo) {
        fileContent = await fileToBase64(arquivo);
        fileName = arquivo.name;
      }

      console.log("Enviando para API /api/enviar:", {
        to: email,
        subject: "Faturamento",
        fileName,
      });

      const response = await fetch("/api/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: "Faturamento",
          html,
          fileName,
          fileContent,
        }),
      });

      const data = await response.json();
      console.log("Resposta da API:", data);

      if (data.ok) {
        alert("✅ E-mail enviado com sucesso!");
      } else {
        alert("❌ Erro: " + data.error);
      }
    } catch (err) {
      console.error("Erro no envio:", err);
      alert("Erro no envio: " + err.message);
    }
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "50px auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Envio de E-mails - Faturamento</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input
          type="text"
          placeholder="Nome da Empresa"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />
        <input
          type="text"
          placeholder="CNPJ"
          value={cnpj}
          onChange={(e) => setCnpj(e.target.value)}
        />
        <input
          type="text"
          placeholder="Valor Total (ex: 1000,00)"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />
        <input
          type="email"
          placeholder="E-mail Destinatário"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Período de Referência (ex: Setembro de 2025)"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
        />
        <textarea
          placeholder="Mensagem Adicional"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
        />
        <select
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
        >
          <option value="cliente">Cliente</option>
          <option value="contabilidade">Contabilidade</option>
        </select>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setArquivo(e.target.files[0])}
        />
        <button onClick={handleSend}>Enviar E-mail</button>
      </div>

      {previewHtml && (
        <div style={{ marginTop: "40px" }}>
          <h2>Pré-visualização do HTML</h2>
          <iframe
            title="preview"
            srcDoc={previewHtml}
            style={{
              width: "100%",
              height: "500px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </div>
      )}
    </div>
  );
}
