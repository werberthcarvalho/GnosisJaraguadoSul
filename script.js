// script.js - Funcionalidades completas para todo o sistema

// ===== FUNÇÕES GLOBAIS =====
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// ===== SISTEMA DE PRESENÇAS =====
let registros = JSON.parse(localStorage.getItem('registrosPresencas')) || [
  {
    id: 1,
    avatar: 'https://ui-avatars.com/api/?name=Maria+Silva&background=random',
    nome: 'Maria Silva',
    email: 'maria@email.com',
    whatsapp: '(11) 99999-9999',
    turma: '1ª Câmara',
    data: '2023-06-15',
    status: 'presente',
    tema: 'Introdução à Gnosis'
  }
];

function renderizarTabelaPresencas(dados = registros) {
  const tabela = document.querySelector('#tabelaRegistros tbody');
  if (!tabela) return;

  tabela.innerHTML = '';

  if (dados.length === 0) {
    tabela.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4 text-muted">
          <i class="bi bi-exclamation-circle me-2"></i>Nenhum registro encontrado
        </td>
      </tr>
    `;
    return;
  }

  dados.forEach(registro => {
    const statusClasses = {
      presente: 'bg-success',
      falta: 'bg-warning text-dark',
      justificada: 'bg-info',
      reposicao: 'bg-secondary'
    };

    const statusText = {
      presente: 'Presente',
      falta: 'Falta',
      justificada: 'Justificada',
      reposicao: 'Reposição'
    };

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="avatar avatar-sm">
          <img src="${registro.avatar}" class="rounded-circle" alt="${registro.nome}">
        </div>
      </td>
      <td>
        <strong>${registro.nome}</strong>
        <div class="text-muted small">${registro.email}</div>
      </td>
      <td>${registro.whatsapp}</td>
      <td>${registro.turma}</td>
      <td>${formatarData(registro.data)}</td>
      <td>
        <span class="badge ${statusClasses[registro.status]}">${statusText[registro.status]}</span>
      </td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-1 btn-editar" data-id="${registro.id}" title="Editar">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger btn-remover" data-id="${registro.id}" title="Remover">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    tabela.appendChild(row);
  });

  // Adiciona eventos aos botões
  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', editarRegistro);
  });

  document.querySelectorAll('.btn-remover').forEach(btn => {
    btn.addEventListener('click', removerRegistro);
  });
}

function formatarData(dataString) {
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR');
}

function editarRegistro(e) {
  const id = parseInt(e.currentTarget.getAttribute('data-id'));
  const registroEditando = registros.find(r => r.id === id);

  // Preenche o modal com os dados do registro
  document.getElementById('dataAula').value = registroEditando.data;
  document.getElementById('turma').value = registroEditando.turma;
  document.getElementById('tema').value = registroEditando.tema || '';

  // Armazena o ID do registro sendo editado
  document.getElementById('formNovaAula').dataset.editingId = id;

  // Abre o modal
  new bootstrap.Modal(document.getElementById('novaAulaModal')).show();
}

function removerRegistro(e) {
  const id = parseInt(e.currentTarget.getAttribute('data-id'));
  
  if (confirm('Tem certeza que deseja remover este registro?')) {
    registros = registros.filter(r => r.id !== id);
    localStorage.setItem('registrosPresencas', JSON.stringify(registros));
    renderizarTabelaPresencas();
    alert('Registro removido com sucesso!');
  }
}

function adicionarRegistro(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const id = parseInt(e.target.dataset.editingId) || Math.max(...registros.map(r => r.id)) + 1;
  
  const novoRegistro = {
    id,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.get('nomeAluno'))}&background=random`,
    nome: formData.get('nomeAluno'),
    email: formData.get('emailAluno'),
    whatsapp: formData.get('whatsappAluno'),
    turma: formData.get('turma'),
    data: formData.get('dataAula'),
    status: formData.get('status'),
    tema: formData.get('tema')
  };

  if (e.target.dataset.editingId) {
    // Atualiza registro existente
    const index = registros.findIndex(r => r.id === id);
    registros[index] = novoRegistro;
  } else {
    // Adiciona novo registro
    registros.push(novoRegistro);
  }

  localStorage.setItem('registrosPresencas', JSON.stringify(registros));
  
  // Fecha o modal e limpa o formulário
  bootstrap.Modal.getInstance(document.getElementById('novaAulaModal')).hide();
  e.target.reset();
  delete e.target.dataset.editingId;

  // Atualiza a tabela
  renderizarTabelaPresencas();
  alert(e.target.dataset.editingId ? 'Registro atualizado com sucesso!' : 'Registro adicionado com sucesso!');
}

function filtrarRegistros(e) {
  e.preventDefault();

  const turma = document.getElementById('filtroTurma').value;
  const data = document.getElementById('filtroData').value;
  const status = document.getElementById('filtroStatus').value;

  const resultados = registros.filter(registro => {
    return (
      (turma === '' || registro.turma === turma) &&
      (data === '' || registro.data === data) &&
      (status === '' || registro.status === status.toLowerCase())
    );
  });

  renderizarTabelaPresencas(resultados);
}

// ===== SISTEMA DE LOGIN/CADASTRO =====
function validarCadastro(e) {
  e.preventDefault();
  
  const senha = document.getElementById('senha').value;
  const confirmarSenha = document.getElementById('confirmarSenha').value;
  
  if (senha !== confirmarSenha) {
    alert('As senhas não coincidem!');
    return;
  }
  
  if (senha.length < 8) {
    alert('A senha deve ter no mínimo 8 caracteres!');
    return;
  }
  
  alert('Cadastro realizado com sucesso! Redirecionando para login...');
  window.location.href = 'login.html';
}

function toggleSenha() {
  const senha = document.getElementById('senha');
  const icon = document.getElementById('togglePassword').querySelector('i');
  if (senha.type === 'password') {
    senha.type = 'text';
    icon.classList.remove('bi-eye-fill');
    icon.classList.add('bi-eye-slash-fill');
  } else {
    senha.type = 'password';
    icon.classList.remove('bi-eye-slash-fill');
    icon.classList.add('bi-eye-fill');
  }
}

function login() {
  const usuario = document.getElementById('usuario').value;
  const senha = document.getElementById('senha').value;
  
  if (!usuario || !senha) {
    alert('Por favor, preencha todos os campos!');
    return;
  }
  
  alert(`Bem-vindo, ${usuario}! Login simulado com sucesso.`);
}

// ===== SISTEMA DE PRESENÇAS DO ALUNO =====
function marcarPresenca(aula) {
  let presencas = JSON.parse(localStorage.getItem('presencas') || '[]');
  if (!presencas.includes(aula)) {
    presencas.push(aula);
    localStorage.setItem('presencas', JSON.stringify(presencas));
    alert(`Presença na ${aula.replace('aula', 'Aula ')} registrada com sucesso!`);
  } else {
    alert(`Você já registrou presença na ${aula.replace('aula', 'Aula ')}`);
  }
}

function carregarPresencas() {
  if (document.getElementById('lista-presenca')) {
    const presencas = JSON.parse(localStorage.getItem('presencas') || '[]');
    const lista = document.getElementById('lista-presenca');
    const total = document.getElementById('total-presencas');
    
    lista.innerHTML = '';
    
    if (presencas.length === 0) {
      lista.innerHTML = '<li class="list-group-item text-muted">Nenhuma presença registrada ainda</li>';
    } else {
      presencas.forEach(aula => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
          <span>Aula ${aula.replace('aula', '')}</span>
          <span class="badge bg-success rounded-pill">Presente</span>
        `;
        lista.appendChild(li);
      });
    }
    
    total.textContent = presencas.length;
  }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
  // Dark Mode
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }

  // Página de Presenças Admin
  if (document.getElementById('tabelaRegistros')) {
    renderizarTabelaPresencas();
    document.getElementById('filtroForm')?.addEventListener('submit', filtrarRegistros);
    document.getElementById('formNovaAula')?.addEventListener('submit', adicionarRegistro);
  }

  // Página de Presenças do Aluno
  carregarPresencas();

  // Página de Cadastro
  document.getElementById('formCadastro')?.addEventListener('submit', validarCadastro);
  document.getElementById('togglePassword')?.addEventListener('click', toggleSenha);

  // Página de Login
  if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
      e.preventDefault();
      login();
    });
  }
});

// ===== EVENT LISTENERS GLOBAIS =====
document.getElementById('darkModeToggle')?.addEventListener('click', toggleDarkMode);