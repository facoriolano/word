const editor = document.getElementById("editor");
const tokenInput = document.getElementById("token");
const gistIdInput = document.getElementById("gistId");

let timeout = null;

// Auto salvar a cada 3 segundos após o último input
editor.addEventListener("input", () => {
  clearTimeout(timeout);
  timeout = setTimeout(salvarGist, 3000);
});

// Carrega o conteúdo do Gist ao iniciar a página
window.addEventListener("load", carregarGist);

async function carregarGist() {
  const token = tokenInput.value.trim();
  const gistId = gistIdInput.value.trim();
  if (!token || !gistId) return;

  try {
    const res = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        Authorization: `token ${token}`
      }
    });
    const data = await res.json();
    const fileKey = Object.keys(data.files)[0];
    editor.value = data.files[fileKey].content;
  } catch (e) {
    console.error("Erro ao carregar Gist:", e);
  }
}

async function salvarGist() {
  const token = tokenInput.value.trim();
  const gistId = gistIdInput.value.trim();
  const conteudo = editor.value;

  if (!token || !gistId) return;

  try {
    await fetch(`https://api.github.com/gists/${gistId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        files: {
          "metas2025.txt": {
            content: conteudo
          }
        }
      })
    });
    console.log("✅ Salvo no Gist");
  } catch (e) {
    console.error("❌ Erro ao salvar no Gist:", e);
  }
}
