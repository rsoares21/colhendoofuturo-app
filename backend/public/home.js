
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

  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tab = button.getAttribute('data-tab');
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      tabContents.forEach(content => {
        content.style.display = content.id === `${tab}-tab` ? 'block' : 'none';
      });
      sidebar.classList.remove('visible'); // Collapse sidebar when clicking on a tab button
    });
  });

  tabContents.forEach(content => {
    content.addEventListener('click', () => {
      sidebar.classList.remove('visible'); // Collapse sidebar when clicking on tab content
    });
  });

  // Show home tab content by default
  document.getElementById('home-tab').style.display = 'block';
});