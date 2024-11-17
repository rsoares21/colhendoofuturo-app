document.addEventListener('DOMContentLoaded', () => {
  const authForm = document.getElementById('auth-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginBtn = document.getElementById('login-btn');
  const registerLink = document.getElementById('register-link');
  const logoutBtn = document.getElementById('logout-btn');
  const authContainer = document.getElementById('auth-container');
  const contentContainer = document.getElementById('content-container');
  const messageBox = document.getElementById('message-box');
  const loginLink = document.getElementById('login-link');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const loadingOverlay = document.getElementById('loading-overlay');

  // Função para mostrar a tela de login/cadastro
  const showAuthScreen = () => {
    if (authContainer && contentContainer) {
      authContainer.style.display = 'block';
      contentContainer.style.display = 'none';
    }
  };

  // Função para mostrar o conteúdo protegido
  const showContent = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch('/validate-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (response.ok) {
          window.location.href = '/home.html';
        } else {
          localStorage.removeItem('token');
          showAuthScreen();
        }
      } catch (error) {
        console.error('Erro ao validar o token:', error);
        localStorage.removeItem('token');
        showAuthScreen();
      }
    } else {
      showAuthScreen();
    }
  };

  // Função para exibir mensagens
  const showMessage = (message, isError = false) => {
    messageBox.textContent = message;
    messageBox.style.color = isError ? 'red' : 'green';
    messageBox.style.visibility = 'visible';
    setTimeout(() => {
      messageBox.style.visibility = 'hidden';
    }, 5000);
  };

  // Função para mostrar o overlay de carregamento
  const showLoading = () => {
    if (loadingOverlay) {
      loadingOverlay.classList.add('visible');
    }
  };

  // Função para esconder o overlay de carregamento
  const hideLoading = () => {
    if (loadingOverlay) {
      loadingOverlay.classList.remove('visible');
    }
  };

  // Verificar se o usuário está logado
  const checkLoginStatus = () => {
    try {
      const loggedInUser = localStorage.getItem('loggedInUser');
      if (loggedInUser) {
        showContent();
      } else {
        showAuthScreen();
      }
    } catch (error) {
      console.error('Erro ao acessar o localStorage:', error);
      showAuthScreen();
    }
  };

  // Lidar com o login
  const login = async (email, password) => {
    showLoading();
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        try {
          localStorage.setItem('loggedInUser', JSON.stringify(result.user));
          localStorage.setItem('token', result.token);
        } catch (error) {
          console.error('Erro ao salvar no localStorage:', error);
        }
        showMessage('Login bem-sucedido!');
        showContent();
      } else {
        showMessage(result.message, true);
      }
    } catch (error) {
      showMessage('Erro ao realizar login. Tente novamente mais tarde.', true);
    } finally {
      hideLoading();
    }
  };

  // Lidar com o registro
  const register = async (email, password, confirmPassword) => {
    if (password !== confirmPassword) {
      showMessage('As senhas não coincidem.', true);
      return;
    }
    showLoading();
    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        showMessage('Cadastro realizado com sucesso! Verifique seu email.');
        showAuthScreen(); // Volta para a tela de login
      } else {
        showMessage(result.message, true);
      }
    } catch (error) {
      showMessage('Erro ao realizar cadastro. Tente novamente mais tarde. ' + error, true);
    } finally {
      hideLoading();
    }
  };

  if (logoutBtn) {
    // Lidar com o logout
    logoutBtn.addEventListener('click', () => {
      showLoading();
      try {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('token');
      } catch (error) {
        console.error('Erro ao remover do localStorage:', error);
      }
      showMessage('Logout realizado com sucesso!');
      setTimeout(() => {
        showAuthScreen();
        hideLoading();
      }, 1000);
    });
  }

  // Submeter o formulário de login ou cadastro
  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (loginBtn.textContent === 'Entrar') {
      // Se o texto do botão for "Entrar", estamos fazendo login
      login(email, password);
    } else {
      // Caso contrário, é um registro
      register(email, password, confirmPassword);
    }
  });

  // Exibir o formulário de cadastro
  registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerLink.style.display = 'none';
    loginLink.style.display = 'block';
    confirmPasswordInput.style.display = 'block';
    confirmPasswordInput.setAttribute('required', 'required');
    loginBtn.textContent = 'Registrar';
    document.getElementById('form-title').textContent = 'Cadastro';
  });

  // Exibir o formulário de login
  loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginLink.style.display = 'none';
    registerLink.style.display = 'block';
    confirmPasswordInput.style.display = 'none';
    confirmPasswordInput.removeAttribute('required');
    loginBtn.textContent = 'Entrar';
    document.getElementById('form-title').textContent = 'Login';
  });

  // Inicializa a tela conforme o estado de login
  checkLoginStatus();
});