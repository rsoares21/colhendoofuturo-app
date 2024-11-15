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

  // Função para mostrar a tela de login/cadastro
  const showAuthScreen = () => {
    authContainer.style.display = 'block';
    contentContainer.style.display = 'none';
  };

  // Função para mostrar o conteúdo protegido
  const showContent = () => {
    authContainer.style.display = 'none';
    contentContainer.style.display = 'block';
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

  // Verificar se o usuário está logado
  const checkLoginStatus = () => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      showContent();
    } else {
      showAuthScreen();
    }
  };

  // Lidar com o login
  const login = async (email, password) => {
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('loggedInUser', JSON.stringify(result.user));
        showMessage('Login bem-sucedido!');
        showContent();
      } else {
        showMessage(result.message, true);
      }
    } catch (error) {
      showMessage('Erro ao realizar login. Tente novamente mais tarde.', true);
    }
  };

  // Lidar com o registro
  const register = async (email, password, confirmPassword) => {
    if (password !== confirmPassword) {
      showMessage('As senhas não coincidem.', true);
      return;
    }
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
      showMessage('Erro ao realizar cadastro. Tente novamente mais tarde.', true);
    }
  };

  // Lidar com o logout
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('loggedInUser');
    showMessage('Logout realizado com sucesso!');
    showAuthScreen();
  });

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