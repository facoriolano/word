const editor = document.getElementById('editor');
const loginBtn = document.getElementById('login-btn');
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');
const clearBtn = document.getElementById('clear-btn');
const status = document.getElementById('status');
const gistsList = document.getElementById('gists-list');
const list = document.getElementById('list');
const closeListBtn = document.getElementById('close-list');

let token = localStorage.getItem('github_token') || null;
let username = null;

function setStatus(msg, isError = false) {
    status.textContent = msg;
    status.style.color = isError ? 'tomato' : '#ccffff';
}

function enableButtons(enabled) {
    saveBtn.disabled = !enabled;
    loadBtn.disabled = !enabled;
}

async function fetchUser() {
    if (!token) return;
    try {
        const res = await fetch('https://api.github.com/user', {
            headers: { Authorization: 'token ' + token }
        });
        if (!res.ok) throw new Error('Falha ao obter usuário');
        const data = await res.json();
        username = data.login;
        setStatus(`Olá, ${username}! Você está logado.`);
        enableButtons(true);
        loginBtn.textContent = 'Logout';
    } catch (err) {
        setStatus('Erro no token, faça login novamente.', true);
        logout();
    }
}

function logout() {
    token = null;
    username = null;
    localStorage.removeItem('github_token');
    setStatus('Desconectado.');
    loginBtn.textContent = 'Login GitHub';
    enableButtons(false);
}

async function login() {
    const inputToken = prompt('Cole seu Token de acesso GitHub (escopo gist)');
    if (!inputToken) {
        setStatus('Login cancelado.', true);
        return;
    }
    token = inputToken.trim();
    localStorage.setItem('github_token', token);
    await fetchUser();
}

async function saveGist() {
    if (!token) return;
    const content = editor.value;
    if (!content.trim()) {
        setStatus('Não há texto para salvar.', true);
        return;
    }

    const filename = prompt('Nome do arquivo (com .txt)');
    if (!filename) {
        setStatus('Salvamento cancelado.', true);
        return;
    }

    setStatus('Salvando...');

    const gistData = {
        description: 'Editor Retro - arquivo salvo',
        public: false,
        files: {}
    };
    gistData.files[filename] = { content };

    try {
        const res = await fetch('https://api.github.com/gists', {
            method: 'POST',
            headers: {
                'Authorization': 'token ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gistData)
        });
        if (!res.ok) throw new Error('Erro ao salvar gist');
        setStatus(`Arquivo "${filename}" salvo no GitHub!`);
    } catch (err) {
        setStatus(`Erro: ${err.message}`, true);
    }
}

async function loadGists() {
    if (!token) return;
    setStatus('Carregando lista de arquivos...');
    list.innerHTML = '';
    gistsList.classList.remove('hidden');

    try {
        const res = await fetch(`https://api.github.com/users/${username}/gists`, {
            headers: { Authorization: 'token ' + token }
        });
        if (!res.ok) throw new Error('Erro ao buscar gists');
        const gists = await res.json();

        if (gists.length === 0) {
            list.innerHTML = '<li>Nenhum arquivo encontrado.</li>';
            setStatus('Nenhum arquivo salvo no GitHub.');
            return;
        }

        gists.forEach(gist => {
            // Pega primeiro arquivo txt do gist
            const file = Object.values(gist.files).find(f => f.filename.endsWith('.txt'));
            if (file) {
                const li = document.createElement('li');
                li.textContent = file.filename;
                li.title = file.description || '';
                li.style.cursor = 'pointer';
                li.onclick = async () => {
                    setStatus(`Carregando "${file.filename}"...`);
                    try {
                        const contentRes = await fetch(file.raw_url);
                        if (!contentRes.ok) throw new Error('Erro ao carregar conteúdo');
                        const text = await contentRes.text();
                        editor.value = text;
                        setStatus(`Arquivo "${file.filename}" carregado!`);
                        gistsList.classList.add('hidden');
                    } catch (err) {
                        setStatus(`Erro: ${err.message}`, true);
                    }
                };
                list.appendChild(li);
            }
        });
    } catch (err) {
        setStatus(`Erro: ${err.message}`, true);
    }
}

loginBtn.onclick = () => {
    if (token) logout();
    else login();
};

saveBtn.onclick = saveGist;
loadBtn.onclick = loadGists;
clearBtn.onclick = () => {
    editor.value = '';
    setStatus('Editor limpo.');
};

closeListBtn.onclick = () => {
    gistsList.classList.add('hidden');
};

window.onload = () => {
    if (token) fetchUser();
    else setStatus('Faça login para salvar e carregar seus arquivos.');
};
