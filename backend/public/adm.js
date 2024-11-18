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
      if (!result.decoded.roles.includes('ADMIN')) {
        window.location.href = '/';
      }
    } else {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  } catch (error) {
    localStorage.removeItem('token');
    window.location.href = '/';
  }

  var menuBtn = document.getElementById('menu-btn');
  var sidebar = document.getElementById('sidebar');
  menuBtn.addEventListener('click', function() {
    sidebar.classList.toggle('visible');
  });

  var logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      try {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('token');
      } catch (error) {
        console.error('Erro ao remover do localStorage:', error);
      }
      window.location.href = '/';
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

  // Show the first tab content by default
  const firstTabButton = tabButtons[0];
  const firstTab = firstTabButton.getAttribute('data-tab');
  document.getElementById(`${firstTab}-tab`).style.display = 'block';
  setTimeout(() => {
    document.getElementById(`${firstTab}-tab`).classList.add('active');
    document.getElementById(`${firstTab}-tab`).scrollTo(0, 0); // Scroll to the top of the content
    window.scrollTo({ top: document.getElementById(`${firstTab}-tab`).offsetTop - 70, behavior: 'smooth' }); // Adjust for the top bar height
  }, 10); // Add a small delay to trigger the transition
});
