const API_BASE_URL = 'https://4b140882400b.ngrok-free.app/api';  // Altere para a URL da sua API

// Templates e rotas simplificadas
const templates = {
  home: document.getElementById('home-template').content
};

const routes = {
  '/home': {
    template: 'home',
    title: 'Home',
    onLoad: loadPosts // Função que carrega os posts
  }
};

// Função principal de renderização
function renderRoute(route) {
  const app = document.getElementById('app');
  app.innerHTML = '';

  if (route.template) {
    app.appendChild(document.importNode(templates[route.template], true));
  }

  document.title = route.title || 'Rede Social PWA';

  if (route.onLoad) {
    route.onLoad();
  }
}

// Navegação entre rotas
function navigateTo(path) {
  const route = routes[path] || routes['/home']; // Default para home

  window.history.pushState({}, path, window.location.origin + path);
  renderRoute(route);
}

// Função para carregar posts da API
async function loadPosts() {
  try {
    const response = await axios.get(`${API_BASE_URL}`);
    renderPosts(response.data);
  } catch (error) {
    console.error('Erro ao carregar posts:', error);
    showOfflineMessage();
  }
}

function showOfflineMessage() {
  const postsContainer = document.getElementById('posts-container');
  if (postsContainer) {
    postsContainer.innerHTML = `
      <div class="alert alert-warning">
        Não foi possível carregar os posts. Verifique sua conexão.
      </div>
    `;
  }
}

function renderPosts(posts) {
  const postsContainer = document.getElementById('posts-container');
  if (!postsContainer) return;

  postsContainer.innerHTML = '';

  if (!posts || posts.length === 0) {
    postsContainer.innerHTML = `
      <div class="alert alert-info">
        Nenhum post encontrado.
      </div>
    `;
    return;
  }

  posts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'post mb-4 p-3 bg-white rounded shadow-sm';
    postElement.innerHTML = `
      <div class="post-header mb-2">
        <h5 class="mb-1">${post.title || 'Sem título'}</h5>
        <small class="text-muted">Postado em: ${new Date(post.dateCreation).toLocaleString()}</small>
      </div>
      <div class="post-content mb-3">
        <p>${post.contentText || ''}</p>
      </div>
      ${post.contentImage ? `<img src="${post.imageUrl}" class="img-fluid mb-2 rounded" alt="Imagem do post">` : ''}
      <div class="post-actions d-flex justify-content-end">
        <button class="btn btn-sm btn-outline-secondary me-2">
          <i class="bi bi-heart"></i> Curtir
        </button>
        <button class="btn btn-sm btn-outline-secondary">
          <i class="bi bi-chat"></i> Comentar
        </button>
      </div>
    `;
    postsContainer.appendChild(postElement);
  });
}

// Configura eventos de navegação
function setupNavigationEvents() {
  // Links da sidebar
  document.querySelectorAll('[data-route]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const route = e.target.getAttribute('data-route');
      navigateTo(route);
    });
  });

  // Remove o botão de logout já que não temos mais autenticação
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.remove();
  }
}

// Inicialização da aplicação
window.addEventListener('DOMContentLoaded', () => {
  // Configura o gerenciamento do histórico
  window.onpopstate = () => {
    const path = window.location.pathname;
    navigateTo(path);
  };

  // Configura eventos de navegação
  setupNavigationEvents();

  // Rota inicial
  const initialPath = window.location.pathname || '/home';
  navigateTo(initialPath);
});

// Service Worker Registration para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/projeto-mobile-eduni/service-worker.js').then(registration => {
      console.log('ServiceWorker registration successful');
    }).catch(err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
