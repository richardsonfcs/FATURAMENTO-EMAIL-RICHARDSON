import { useState } from "react";

export default function Home() {
  const [clientName, setClientName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [valor, setValor] = useState("");
  const [email, setEmail] = useState("");
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
  const gerarHtml = async () => {
    // fetch para /public/templates/
    const res = await fetch(`/templates/${template}.html`);
    let html = await res.text();

    html = html
      .replace(/{{ \$json\.clientName }}/g, clientName)
      .replace(/{{ \$json\.reportData\.totalValue\.toFixed\(2\)\.replace\('\.', ','\) }}/g, valor)
      .replace(/{{ \$now\.minus\({ months: 1 }\)\.setLocale\('pt-BR'\)\.toFormat\("MMMM 'de' yyyy"\) }}/g,
        new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" }))
      .replace(/{{ mensagem_adicional }}/g, mensagem);

    setPreviewHtml(html);
    return html;
  };

  const handleSend = async () => {
    const html = await gerarHtml();
    let fileContent = null;
    let fileName = null;

    if (arquivo) {
      fileContent = await fileToBase64(arquivo);
      fileName = arquivo.name;
    }

    const response = await fetch("/api/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: email, subject: "Faturamento", html, fileName, fileContent })
    });

    const data = await response.json();
    if (data.ok) alert("E-mail enviado com sucesso!");
    else alert("Erro: " + data.error);
  };

  return (
    <div style={{ maxWidth: "700px", margin: "50px auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Envio de E-mails - Faturamento</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input type="text" placeholder="Nome da Empresa" value={clientName} onChange={(e) => setClientName(e.target.value)} />
        <input type="text" placeholder="CNPJ" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
        <input type="text" placeholder="Valor Total (ex: 1000,00)" value={valor} onChange={(e) => setValor(e.target.value)} />
        <input type="email" placeholder="E-mail Destinatário" value={email} onChange={(e) => setEmail(e.target.value)} />
        <textarea placeholder="Mensagem Adicional" value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
        <select value={template} onChange={(e) => setTemplate(e.target.value)}>
          <option value="cliente">Cliente</option>
          <option value="contabilidade">Contabilidade</option>
        </select>
        <input type="file" accept="application/pdf" onChange={(e) => setArquivo(e.target.files[0])} />
        <button onClick={handleSend}>Enviar E-mail</button>
      </div>

      {previewHtml && (
        <div style={{ marginTop: "40px" }}>
          <h2>Pré-visualização do HTML</h2>
          <iframe
            title="preview"
            srcDoc={previewHtml}
            style={{ width: "100%", height: "500px", border: "1px solid #ccc", borderRadius: "8px" }}
          />
        </div>
      )}
    </div>
  );
}
