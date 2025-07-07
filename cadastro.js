// script.js - Sistema Completo de Registro de Presenças

// ===== VARIÁVEIS GLOBAIS =====
let registros = JSON.parse(localStorage.getItem('registrosPresencas')) || [];
let registroEditando = null;

// ===== FUNÇÕES PRINCIPAIS =====

// Função para renderizar a tabela de presenças
function renderizarTabela(dados = registros) {
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

// Função para formatar data
function formatarData(dataString) {
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR');
}

// Função para editar registro
function editarRegistro(e) {
  const id = parseInt(e.currentTarget.getAttribute('data-id'));
  registroEditando = registros.find(r => r.id === id);

  // Preenche o modal com os dados do registro
  document.getElementById('dataAula').value = registroEditando.data;
  document.getElementById('turma').value = registroEditando.turma;
  document.getElementById('tema').value = registroEditando.tema || '';
  document.getElementById('nomeAluno').value = registroEditando.nome;
  document.getElementById('emailAluno').value = registroEditando.email;
  document.getElementById('whatsappAluno').value = registroEditando.whatsapp;
  document.getElementById('status').value = registroEditando.status;

  // Atualiza o título do modal
  document.getElementById('modalTitulo').textContent = 'Editar Registro de Aula';

  // Abre o modal
  const modal = new bootstrap.Modal(document.getElementById('novaAulaModal'));
  modal.show();
}

// Função para remover registro
function removerRegistro(e) {
  const id = parseInt(e.currentTarget.getAttribute('data-id'));
  
  if (confirm('Tem certeza que deseja remover este registro?')) {
    registros = registros.filter(r => r.id !== id);
    salvarRegistros();
    renderizarTabela();
    alert('Registro removido com sucesso!');
  }
}

// Função para adicionar/editar registro
function salvarRegistro(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  
  const registro = {
    id: registroEditando ? registroEditando.id : Date.now(),
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.get('nomeAluno'))}&background=random`,
    nome: formData.get('nomeAluno'),
    email: formData.get('emailAluno'),
    whatsapp: formData.get('whatsappAluno'),
    turma: formData.get('turma'),
    data: formData.get('dataAula'),
    status: formData.get('status'),
    tema: formData.get('tema')
  };

  if (registroEditando) {
    // Atualiza registro existente
    const index = registros.findIndex(r => r.id === registroEditando.id);
    registros[index] = registro;
  } else {
    // Adiciona novo registro
    registros.push(registro);
  }

  salvarRegistros();
  
  // Fecha o modal e limpa o formulário
  const modal = bootstrap.Modal.getInstance(document.getElementById('novaAulaModal'));
  modal.hide();
  e.target.reset();
  registroEditando = null;

  // Atualiza a tabela
  renderizarTabela();
  alert(registroEditando ? 'Registro atualizado com sucesso!' : 'Registro adicionado com sucesso!');
}

// Função para salvar registros no localStorage
function salvarRegistros() {
  localStorage.setItem('registrosPresencas', JSON.stringify(registros));
}

// Função para filtrar registros
function filtrarRegistros(e) {
  e.preventDefault();

  const turma = document.getElementById('filtroTurma').value;
  const data = document.getElementById('filtroData').value;
  const status = document.getElementById('filtroStatus').value.toLowerCase();

  const resultados = registros.filter(registro => {
    return (
      (turma === '' || registro.turma === turma) &&
      (data === '' || registro.data === data) &&
      (status === '' || registro.status === status)
    );
  });

  renderizarTabela(resultados);
}

// Função para resetar o modal ao fechar
function resetarModal() {
  registroEditando = null;
  document.getElementById('formNovaAula').reset();
  document.getElementById('modalTitulo').textContent = 'Registrar Nova Aula';
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
  // Renderiza a tabela ao carregar a página
  renderizarTabela();

  // Adiciona eventos aos formulários
  document.getElementById('filtroForm')?.addEventListener('submit', filtrarRegistros);
  document.getElementById('formNovaAula')?.addEventListener('submit', salvarRegistro);

  // Reseta o modal quando é fechado
  document.getElementById('novaAulaModal')?.addEventListener('hidden.bs.modal', resetarModal);

  // Configura o dark mode
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }
});

// ===== FUNÇÕES GLOBAIS =====
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}