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
  const register = async (email, password) => {
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
    if (validateInput()) {
      if (document.getElementById('submit-btn').textContent === 'Entrar') {
          login(emailInput.value.trim(), passwordInput.value.trim());
      } else {
          register(document.getElementById('register-email').value.trim(),
          document.getElementById('register-password').value.trim());
      }
    }
  });

  // Exibir o formulário de cadastro
  registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterFields();
  });


  // Função para validar a entrada do usuário
  const validateInput = () => {
    const email = (document.getElementById('submit-btn').textContent === 'Entrar') ? emailInput.value.trim() : document.getElementById('register-email').value.trim();
    const password = (document.getElementById('submit-btn').textContent === 'Entrar') ? passwordInput.value.trim() : document.getElementById('register-password').value.trim();
    const passwordConfirm = document.getElementById('register-password-confirm').value.trim();
  
    if (email === "" || password === "") {
      showMessage("Por favor, preencha todos os campos.", true);
      return false;
    }
  
    if (!validator.isEmail(email)) {
      showMessage("Por favor, insira um endereço de email válido.", true);
      return false;
    }
  
    if (password.length < 6) {
      showMessage("A senha deve ter pelo menos 6 caracteres.", true);
      return false;
    }
  
    if (document.getElementById('submit-btn').textContent !== 'Entrar' && password !== passwordConfirm) {
      showMessage("As senhas não coincidem.", true);
      return false;
    }
  
    return true;
  };

  const showLoginFields = () => {
    document.getElementById('login-fields').style.display = 'block';
    document.getElementById('register-fields').style.display = 'none';
    document.getElementById('submit-btn').textContent = 'Entrar';
    document.getElementById('form-title').textContent = 'Login';
    document.getElementById('register-link').style.display = 'block';
  };
  
  const showRegisterFields = () => {
    document.getElementById('login-fields').style.display = 'none';
    document.getElementById('register-fields').style.display = 'block';
    document.getElementById('submit-btn').textContent = 'Registrar';
    document.getElementById('form-title').textContent = 'Cadastro';
    document.getElementById('register-link').style.display = 'none';
  };

  document.getElementById('login-link').addEventListener('click', (e) => {
    e.preventDefault();
    showLoginFields();
  });

  // Inicializa a tela conforme o estado de login
  checkLoginStatus();

  // Mostra a tela de login inicialmente
  showLoginFields();
});
