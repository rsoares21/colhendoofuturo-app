document.addEventListener('DOMContentLoaded', async function() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
    return;
  }

  try {
    const response = await fetch('/validate-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Token válido:', result.decoded);
    } else {
      console.error('Token inválido:', result.message);
      localStorage.removeItem('token');
      window.location.href = '/';
      return;
    }
  } catch (error) {
    console.error('Erro ao validar o token:', error);
    localStorage.removeItem('token');
    window.location.href = '/';
    return;
  }

  var menuBtn = document.getElementById('menu-btn');
  var sidebar = document.getElementById('sidebar');
  menuBtn.addEventListener('click', function() {
    sidebar.classList.toggle('visible');
  });

  var logoutBtn = document.getElementById('logout-btn');
  var logoutBtnConta = document.getElementById('logout-btn-conta'); // Add reference to the new logout button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      try {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('token');
      } catch (error) {
        console.error('Erro ao acessar o localStorage:', error);
      }
      document.getElementById('loading-overlay').classList.add('visible');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    });
  }

  if (logoutBtnConta) {
    logoutBtnConta.addEventListener('click', function() {
      try {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('token');
      } catch (error) {
        console.error('Erro ao acessar o localStorage:', error);
      }
      document.getElementById('loading-overlay').classList.add('visible');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    });
  }

  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  const floatingImage = document.getElementById('floating-image');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tab = button.getAttribute('data-tab');
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      tabContents.forEach(content => {
        if (content.id === `${tab}-tab`) {
          content.style.display = 'block'; // Ensure the content is displayed
          setTimeout(() => {
            content.classList.add('active');
            content.scrollTo(0, 0); // Scroll to the top of the content
            window.scrollTo({ top: content.offsetTop - 70, behavior: 'smooth' }); // Adjust for the top bar height

            // Fetch and display user information if the "Informações da Conta" tab is selected
            if (tab === 'conta') {
              fetchUserInfo();
            }
          }, 10); // Add a small delay to trigger the transition
        } else {
          content.classList.remove('active');
          setTimeout(() => {
            content.style.display = 'none'; // Hide other tab contents
          }, 300); // Match the delay with the transition duration
        }
      });
      sidebar.classList.remove('visible'); // Collapse sidebar when clicking on a tab button

      // Apply transition effect to floating image
      floatingImage.style.transform = 'scale(1.2)';
      setTimeout(() => {
        floatingImage.style.transform = 'scale(1)';
      }, 300);
    });
  });

  tabContents.forEach(content => {
    content.addEventListener('click', () => {
      sidebar.classList.remove('visible'); // Collapse sidebar when clicking on tab content
    });
  });

  // Show home tab content by default
  document.getElementById('home-tab').style.display = 'block';
  setTimeout(() => {
    document.getElementById('home-tab').classList.add('active');
    document.getElementById('home-tab').scrollTo(0, 0); // Scroll to the top of the content
    window.scrollTo({ top: document.getElementById('home-tab').offsetTop - 70, behavior: 'smooth' }); // Adjust for the top bar height
  }, 10); // Add a small delay to trigger the transition

  // Function to fetch and display user information
  async function fetchUserInfo() {
    try {
      const response = await fetch('/profile', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const result = await response.json();

      if (response.ok) {
        const userInfoContainer = document.getElementById('user-info');
        userInfoContainer.innerHTML = `
          <p>Email: ${result.user.email}</p>
          <p>Verificado: ${result.user.verified ? 'Sim' : 'Não'}</p>
          <p>Roles: ${result.user.roles.join(', ')}</p> <!-- Display user roles -->
        `;
      } else {
        console.error('Erro ao buscar informações do usuário:', result.message);
      }
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error);
    }
  }
});