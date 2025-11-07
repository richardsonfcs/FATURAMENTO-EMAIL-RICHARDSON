import { useState } from "react";

export default function Home() {
  const [clientName, setClientName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [valor, setValor] = useState("");
  const [email, setEmail] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [template, setTemplate] = useState("cliente");
  const [previewHtml, setPreviewHtml] = useState("");

  // Gera o HTML substituindo os placeholders
  const gerarHtml = async () => {
    try {
      const res = await fetch(`/templates/${template}.html`);
      if (!res.ok) throw new Error("Template não encontrado.");

      let html = await res.text();

      html = html
        .replace(/{{empresa}}/g, clientName)
        .replace(/{{cnpj}}/g, cnpj)
        .replace(/{{valor}}/g, valor)
        .replace(/{{contato}}/g, email)
        .replace(
          /{{periodo}}/g,
          periodo.trim() !== ""
            ? periodo
            : new Date().toLocaleString("pt-BR", {
                month: "long",
                year: "numeric",
              })
        )
        .replace(/{{mensagem_adicional}}/g, mensagem);

      setPreviewHtml(html);
    } catch (err) {
      alert("Erro ao gerar o HTML: " + err.message);
      console.error(err);
    }
  };

  // Copia o HTML para a área de transferência
  const copiarHtml = async () => {
    try {
      await navigator.clipboard.writeText(previewHtml);
      alert("HTML copiado para a área de transferência!");
    } catch (err) {
      alert("Erro ao copiar HTML.");
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
      <h1>Gerador de E-mails de Faturamento</h1>

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
          placeholder="Período (ex: Setembro de 2025)"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
        />
        <textarea
          placeholder="Mensagem adicional"
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

        <button onClick={gerarHtml}>Gerar HTML</button>
      </div>

      {previewHtml && (
        <div style={{ marginTop: "40px" }}>
          <h2>Pré-visualização</h2>
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
          <button
            onClick={copiarHtml}
            style={{
              marginTop: "15px",
              padding: "10px 20px",
              background: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Copiar HTML
          </button>
        </div>
      )}
    </div>
  );
}
