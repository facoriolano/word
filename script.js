const editor = document.getElementById("editor");
const tokenInput = document.getElementById("token");
const gistIdInput = document.getElementById("gistId");

let timeout = null;

// Auto salvar a cada 3 segundos
editor.addEventListener("input", () => {
  clearTimeout(timeout);
  timeout = setTimeout(salvarGist, 3000);
});

// Carrega o conteúdo do Gist ao iniciar
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

const GIST_URL = "https://api.github.com/gists/SEU_ID_DO_GIST";
const GITHUB_TOKEN = "SEU_TOKEN_GITHUB";

function salvarNoGist(conteudo) {
    fetch(GIST_URL, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${GITHUB_TOKEN}`,
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            files: {
                "metas.txt": {
                    content: conteudo
                }
            }
        })
    }).then(response => {
        if (!response.ok) {
            throw new Error("Erro ao salvar no Gist");
        }
        console.log("Salvo no Gist com sucesso!");
    }).catch(error => {
        console.error("Erro:", error);
    });
}
