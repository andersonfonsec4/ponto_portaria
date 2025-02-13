// Função para abrir o banco de dados
function openDB() {
    return new Promise((resolve, reject) => {
        let request = indexedDB.open('RegistroDB', 1);

        request.onupgradeneeded = function(event) {
            let db = event.target.result;
            if (!db.objectStoreNames.contains('registros')) {
                db.createObjectStore('registros', { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = function(event) {
            resolve(event.target.result);
        };

        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

// Função para adicionar um registro
function addRegistro(db, registro) {
    return new Promise((resolve, reject) => {
        let transaction = db.transaction(['registros'], 'readwrite');
        let objectStore = transaction.objectStore('registros');
        let request = objectStore.add(registro);

        request.onsuccess = function() {
            resolve();
        };

        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

// Função para obter todos os registros
function getRegistros(db) {
    return new Promise((resolve, reject) => {
        let transaction = db.transaction(['registros'], 'readonly');
        let objectStore = transaction.objectStore('registros');
        let request = objectStore.getAll();

        request.onsuccess = function(event) {
            resolve(event.target.result);
        };

        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

// Função para excluir um registro
function deleteRegistro(db, id) {
    return new Promise((resolve, reject) => {
        let transaction = db.transaction(['registros'], 'readwrite');
        let objectStore = transaction.objectStore('registros');
        let request = objectStore.delete(id);

        request.onsuccess = function() {
            resolve();
        };

        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

// Função para limpar todos os registros
function clearRegistros(db) {
    return new Promise((resolve, reject) => {
        let transaction = db.transaction(['registros'], 'readwrite');
        let objectStore = transaction.objectStore('registros');
        let request = objectStore.clear();

        request.onsuccess = function() {
            resolve();
        };

        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

// Função para imprimir registros
document.getElementById('printBtn').addEventListener('click', function() {
    window.print();
});

// Função para salvar registros em um arquivo e limpar campos e registros
document.getElementById('saveBtn').addEventListener('click', async function() {
    let db = await openDB();
    let registros = await getRegistros(db);

    let funcionario = document.getElementById('funcionario').value;
    let turno = document.getElementById('turno').value;
    let data = new Date().toLocaleDateString();
    let cabecalho = `Funcionário de Serviço: ${funcionario}, Turno: ${turno}, Data: ${data}\n\n`;

    let relatorio = registros.map(registro => `Ação: ${registro.acao}, Horário: ${registro.horario}`).join('\n');

    let blob = new Blob([cabecalho + relatorio], { type: 'text/plain' });
    let url = URL.createObjectURL(blob);

    let a = document.createElement('a');
    a.href = url;
    a.download = 'registros.txt';
    a.click();

    // Limpar campos e registros após salvar
    document.getElementById('funcionario').value = '';
    document.getElementById('turno').value = 'Manhã';
    document.getElementById('registroForm').reset();
    await clearRegistros(db);
    atualizarRegistros();
});

// Manipuladores de eventos
document.getElementById('registroForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    let acao = document.getElementById('acao').value;
    let registro = {
        acao: acao,
        horario: new Date().toLocaleString()
    };

    let db = await openDB();
    await addRegistro(db, registro);
    atualizarRegistros();
    document.getElementById('registroForm').reset();
});

async function atualizarRegistros() {
    let db = await openDB();
    let registros = await getRegistros(db);

    let lista = document.getElementById('registroLista');
    lista.innerHTML = '';

    registros.forEach(registro => {
        let item = document.createElement('li');
        item.textContent = `Ação: ${registro.acao}, Horário: ${registro.horario}`;
        
        let deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Excluir';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = async function() {
            await deleteRegistro(db, registro.id);
            atualizarRegistros();
        };

        item.appendChild(deleteBtn);
        lista.appendChild(item);
    });
}

// Função para ativar o modo de tela cheia
document.getElementById('fullscreenBtn').addEventListener('click', function() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) { // Firefox
        document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari e Opera
        document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
        document.documentElement.msRequestFullscreen();
    }
});

// Atualizar registros ao carregar a página
atualizarRegistros();
