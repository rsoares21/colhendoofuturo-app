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
      // Fetch and display user information immediately
      fetchUserInfo(result.decoded.userId);
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
  const sidebarLinks = document.querySelectorAll('#sidebar a[data-tab]');
  const floatingImage = document.getElementById('floating-image');

  let coletaChart;
  let poluicaoChart;

  function switchTab(tab) {
    sidebar.classList.remove('visible'); // Collapse sidebar immediately
    setTimeout(() => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      document.querySelector(`.tab-button[data-tab="${tab}"]`).classList.add('active');
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

            // Render charts if the "Home" tab is selected
            if (tab === 'home') {
              renderCharts();
            }

            // Fetch plantios when the search tab is selected
            if (tab === 'buscar') {
              fetchPlantios();
            }
          }, 10); // Add a small delay to trigger the transition
        } else {
          content.classList.remove('active');
          setTimeout(() => {
            content.style.display = 'none'; // Hide other tab contents
          }, 300); // Match the delay with the transition duration
        }
      });

      // Apply transition effect to floating image
      floatingImage.style.transform = 'scale(1.2)';
      setTimeout(() => {
        floatingImage.style.transform = 'scale(1)';
      }, 300);
    }, 300); // Add a delay to ensure sidebar is fully hidden
  }

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tab = button.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = link.getAttribute('data-tab');
      switchTab(tab);
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
    renderCharts(); // Render charts on initial load
  }, 10); // Add a small delay to trigger the transition

  const plantingDate = new Date('2024-11-01');
  const harvestDate = new Date('2024-12-01');
  const totalDays = (harvestDate - plantingDate) / (1000 * 60 * 60 * 24);

  function updateLettuceProgress() {
    const progressBar = document.querySelector('#progress-bar-lettuce');
    const daysLeftElement = document.querySelector('#days-left-lettuce');

    if (progressBar && daysLeftElement) {
      const plantingDate = new Date('2023-01-01'); // Example planting date
      const harvestDate = new Date('2023-06-01'); // Example harvest date
      const today = new Date();
      const totalDays = (harvestDate - plantingDate) / (1000 * 60 * 60 * 24);
      const daysPassed = (today - plantingDate) / (1000 * 60 * 60 * 24);
      const progress = Math.min((daysPassed / totalDays) * 100, 100);
      const daysLeft = Math.max(totalDays - daysPassed, 0);

      progressBar.style.width = `${progress}%`;
      daysLeftElement.innerText = `Dias restantes: ${Math.ceil(daysLeft)}`;
    } else {
      console.error('Progress bar or days left element not found.');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateLettuceProgress();
    // ...other code...
  });

  // Function to fetch and display user information
  async function fetchUserInfo() {
    try {
      const response = await fetch('/profile', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      const result = await response.json();

      if (response.ok) {
        const userInfoContainer = document.getElementById('user-info');
        userInfoContainer.innerHTML = `
          <p>Email: ${result.user.email}</p>
          <p>Verificado: ${result.user.verified ? 'Sim' : 'Não'}</p>
          <p>Roles: ${result.user.roles.join(', ')}</p> <!-- Display user roles -->
          <p>Créditos: ${result.user.credits}</p> <!-- Display user credits -->
        `;

        const userBag = document.getElementById('user-bag');
        userBag.innerHTML = ''; // Clear previous items
        if (result.user.bag && result.user.bag.length > 0) {
          result.user.bag.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'bag-item';
            itemDiv.innerHTML = `
              <p><strong>ID do Plantio:</strong> ${item.plantioId._id}</p>
              <p><strong>Tipo:</strong> ${item.plantioId.tipo}</p>
              <p><strong>Data de Plantio:</strong> ${new Date(item.plantioId.dataPlantio).toLocaleDateString()}</p>
              <p><strong>Data de Colheita:</strong> ${new Date(item.plantioId.dataColheita).toLocaleDateString()}</p>
              <p><strong>Créditos Necessários:</strong> ${item.plantioId.requiredCredits}</p>
              <p><strong>Quantidade:</strong> 
                <button class="quantity-btn" data-plantio-id="${item.plantioId._id}" data-action="decrease">-</button>
                <input type="number" value="${item.quantity}" min="1" data-plantio-id="${item.plantioId._id}" class="quantity-input" readonly>
                <button class="quantity-btn" data-plantio-id="${item.plantioId._id}" data-action="increase">+</button>
              </p>
              <button class="remove-item-btn" data-plantio-id="${item.plantioId._id}">Remover</button>
            `;
            userBag.appendChild(itemDiv);
          });

          // Add event listeners to quantity buttons
          document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', updateQuantity);
          });

          // Add event listeners to remove buttons
          document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', removeItem);
          });
        } else {
          userBag.innerHTML = '<p>Sua sacola está vazia.</p>';
        }

        // Display "Administração" link if user has "ADMIN" role
        if (result.user.roles.includes('ADMIN')) {
          document.getElementById('admin-link').style.display = 'block';
        }
      } else {
        console.error('Erro ao buscar informações do usuário:', result.message);
      }
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error);
    }
  }

  // Function to update the quantity of an item in the user's bag
  function updateQuantity(event) {
    const button = event.target;
    const plantioId = button.getAttribute('data-plantio-id');
    const action = button.getAttribute('data-action');
    const input = document.querySelector(`input[data-plantio-id="${plantioId}"]`);
    let quantity = parseInt(input.value, 10);

    if (action === 'increase') {
      quantity += 1;
    } else if (action === 'decrease' && quantity > 1) {
      quantity -= 1;
    }

    fetch('/api/update-bag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ plantioId, quantity }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Quantidade atualizada com sucesso!');
        fetchUserInfo(); // Refresh user info after updating quantity
      } else {
        alert('Erro ao atualizar a quantidade: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Erro ao atualizar a quantidade:', error);
      alert('Erro ao atualizar a quantidade.');
    });
  }

  // Function to remove an item from the user's bag
  function removeItem(event) {
    const button = event.target;
    const plantioId = button.getAttribute('data-plantio-id');

    fetch('/api/remove-from-bag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ plantioId }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Item removido com sucesso!');
        fetchUserInfo(); // Refresh user info after removing item
      } else {
        alert('Erro ao remover o item: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Erro ao remover o item:', error);
      alert('Erro ao remover o item.');
    });
  }

  // Function to render charts
  function renderCharts() {
    const coletaCtx = document.getElementById('coletaChart').getContext('2d');
    const poluicaoCtx = document.getElementById('poluicaoChart').getContext('2d');

    // Destroy existing charts if they exist
    if (coletaChart) {
      coletaChart.destroy();
    }
    if (poluicaoChart) {
      poluicaoChart.destroy();
    }

    // Example data for charts
    const coletaData = {
      labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
      datasets: [{
        label: 'Coleta de Resíduos (kg)',
        data: [30, 45, 60, 50, 70, 80],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };

    const poluicaoData = {
      labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
      datasets: [{
        label: 'Poluição Evitada (kg CO2)',
        data: [20, 35, 50, 40, 60, 70],
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }]
    };

    coletaChart = new Chart(coletaCtx, {
      type: 'bar',
      data: coletaData,
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    poluicaoChart = new Chart(poluicaoCtx, {
      type: 'line',
      data: poluicaoData,
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  const batchId = 'ALF-2023-001'; // Define the batch identifier
  const batchIdElement = document.getElementById('batch-id');
  if (batchIdElement) {
    batchIdElement.textContent = batchId;
  } else {
    console.error('Element with ID "batch-id" not found.');
  }

  const applyBtn = document.getElementById('apply-btn');
  if (applyBtn) {
    applyBtn.addEventListener('click', function() {
      alert(`Você se candidatou para receber uma muda de alface da colheita ${batchId}.`);
      // Add additional logic to handle the application process
    });
  } else {
    console.error('Element with ID "apply-btn" not found.');
  }

  // Function to fetch plantios data from the backend and generate cards
  async function fetchPlantios() {
    try {
      const response = await fetch('/api/plantios');
      const plantios = await response.json();
      const searchContainer = document.getElementById('search-container');
      searchContainer.innerHTML = ''; // Clear previous content

      plantios.forEach(plantio => {
        const card = document.createElement('div');
        card.className = 'plant-card';
        card.innerHTML = `
          <img src="${plantio.thumbnail}" alt="${plantio.tipo} Thumbnail" class="plant-thumb">
          <div class="plant-info">
            <p><strong>${plantio.tipo}</strong> &nbsp;<span style="font-size: 14px; color: #60752d;">(${plantio.requiredCredits} créditos)</span></p>
            <div id="progress-bar-container" style="flex-grow: 1; margin: 10px 0; display: flex; align-items: center;">
              <div id="progress-bar-${plantio._id}" style="width: 0; height: 20px; background-color: #4CAF50; border-radius: 25px; transition: width 0.5s ease-in-out;"></div>
            </div>
            <p id="days-left-${plantio._id}" style="font-size: 16px; color: #60752d;">Dias restantes: <span>${plantio.daysLeft}</span></p>
            <p class="date-info left">Plantio: <strong style="font-size: 10px;">${new Date(plantio.dataPlantio).toLocaleDateString()}</strong></p>
            <p class="date-info right">Colheita Prevista: <strong style="font-size: 10px;">${new Date(plantio.dataColheita).toLocaleDateString()}</strong></p>
          </div>
        `;
        card.addEventListener('click', () => openModal(plantio)); // Add click event to open modal
        searchContainer.appendChild(card);
        updateProgressBar(plantio._id, plantio.dataPlantio, plantio.dataColheita);
      });
    } catch (error) {
      console.error('Erro ao buscar plantios:', error);
    }
  }

  function updateProgressBar(id, plantingDate, harvestDate) {
    const progressBar = document.getElementById(`progress-bar-${id}`);
    const daysLeftElement = document.getElementById(`days-left-${id}`);

    if (progressBar && daysLeftElement) {
      const today = new Date();
      const totalDays = (new Date(harvestDate) - new Date(plantingDate)) / (1000 * 60 * 60 * 24);
      const daysPassed = (today - new Date(plantingDate)) / (1000 * 60 * 60 * 24);
      const progress = Math.min((daysPassed / totalDays) * 100, 100);
      const daysLeft = Math.max(totalDays - daysPassed, 0);

      progressBar.style.width = `${progress}%`;
      daysLeftElement.innerText = `Dias restantes: ${Math.ceil(daysLeft)}`;
    } else {
      console.error('Progress bar or days left element not found.');
    }
  }

  function openModal(plantio) {
    const modal = document.getElementById('plantio-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    modalTitle.innerText = `Detalhes do Plantio: ${plantio.tipo}`;
    modalBody.innerHTML = `
      <p><strong>Tipo:</strong> ${plantio.tipo}</p>
      <p><strong>Data de Plantio:</strong> ${new Date(plantio.dataPlantio).toLocaleDateString()}</p>
      <p><strong>Data de Colheita:</strong> ${new Date(plantio.dataColheita).toLocaleDateString()}</p>
      <p><strong>Dias Restantes:</strong> ${plantio.daysLeft}</p>
      <p><strong>Créditos Necessários:</strong> ${plantio.requiredCredits}</p>
      <img src="${plantio.thumbnail}" alt="${plantio.tipo} Thumbnail" class="modal-thumb">
    `;

    const addToBagBtn = document.getElementById('add-to-bag-btn');
    addToBagBtn.onclick = () => addToBag(plantio._id);

    modal.style.display = 'block';
  }

  function addToBag(plantioId) {
    fetch('/api/add-to-bag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ plantioId }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Item adicionado à sacola com sucesso!');
        fetchUserInfo(); // Refresh user info after adding item to bag
      } else {
        alert('Erro ao adicionar o item à sacola: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Erro ao adicionar o item à sacola:', error);
      alert('Erro ao adicionar o item à sacola.');
    });
  }
});