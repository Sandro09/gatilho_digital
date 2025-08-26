// A sua configuração do Firebase (deixe como está)
const firebaseConfig = {
    apiKey: "AIzaSyAQ3TNLZ2JDIx4epEBoScG30EoZyXOv0_8",
    authDomain: "gatilho-digital.firebaseapp.com",
    projectId: "gatilho-digital",
    storageBucket: "gatilho-digital.appspot.com",
    messagingSenderId: "976478299682",
    appId: "1:976478299682:web:95e9aefa274cf9ab524c7b"
};

// Inicialização
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// Elementos da página
const pageHeaderWelcome = document.getElementById('page-header-welcome');
const scriptsGrid = document.getElementById('scripts-grid');
const navbarLinks = document.querySelector('.navbar-links');
const navbarCollapse = document.querySelector('.navbar-collapse');

// Observador de estado de login
auth.onAuthStateChanged(user => {
    if (user) {
        // Usuário está logado
        setupUIForLoggedInUser(user);
        db.collection('users').doc(user.uid).get().then(userDoc => {
            loadAllScripts(userDoc.exists ? userDoc.data() : null);
        }).catch(error => {
            console.error("Erro ao buscar dados do usuário:", error);
            loadAllScripts(null); // Carrega scripts mesmo se falhar, tratando como usuário sem dados
        });
    } else {
        // Usuário não está logado, redireciona para o login
        window.location.href = 'index.html';
    }
});

function setupUIForLoggedInUser(user) {
    // Atualiza o cabeçalho da página com boas-vindas
    const firstName = user.displayName ? user.displayName.split(' ')[0] : 'Usuário';
    pageHeaderWelcome.innerHTML = `
        <h1>Olá, ${firstName}!</h1>
        <p>Sua caixa de ferramentas para a produtividade. Escolha um script para começar.</p>
    `;

    // Cria o link de logout
    const logoutLink = document.createElement('a');
    logoutLink.href = '#';
    logoutLink.textContent = 'Sair';
    logoutLink.style.cursor = 'pointer';
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut();
    });

    // Adiciona o link de logout na navbar (desktop e mobile)
    if (navbarLinks) navbarLinks.appendChild(logoutLink.cloneNode(true)).addEventListener('click', () => auth.signOut());
    if (navbarCollapse) navbarCollapse.appendChild(logoutLink.cloneNode(true)).addEventListener('click', () => auth.signOut());
}

// Carrega os scripts do Firestore
async function loadAllScripts(userData) {
    if (!scriptsGrid) return;
    scriptsGrid.innerHTML = '<p>Carregando scripts...</p>';
    try {
        const snapshot = await db.collection('scripts').orderBy('nome').get();
        
        if (snapshot.empty) {
            scriptsGrid.innerHTML = '<p>Nenhum script encontrado no momento.</p>';
            return;
        }

        scriptsGrid.innerHTML = '';
        snapshot.forEach(doc => {
            const script = doc.data();
            createScriptCard(doc.id, script, userData);
        });
    } catch (error) {
        console.error("Erro ao carregar scripts:", error);
        scriptsGrid.innerHTML = '<p>Ocorreu um erro ao carregar os scripts. Tente novamente mais tarde.</p>';
    }
}

// Cria o card para cada script
function createScriptCard(id, script, user) {
    const card = document.createElement('div');
    
    // Lógica de Acesso (simplificada, pode ser expandida)
    const isFree = script.tipo === 'gratis';
    const hasSubscription = user && user.assinatura && user.assinatura.status === 'active';
    const hasPurchased = user && user.scriptsComprados && user.scriptsComprados.includes(id);

    const isUnlocked = isFree || hasSubscription || hasPurchased;

    let tagText = 'Bloqueado';
    let tagColorClass = 'tag-locked';
    if (isFree) {
        tagText = 'Grátis';
        tagColorClass = 'tag-free';
    } else if (isUnlocked) {
        tagText = 'Acesso Liberado';
        tagColorClass = 'tag-free';
    }

    const buttonHTML = isUnlocked
        ? `<button class="button-access">Acessar Script</button>`
        : `<a href="planos.html" class="button-access" style="background-color: #6c757d; text-decoration: none;">Ver Planos</a>`;

    card.className = `script-card ${!isUnlocked ? 'grayscale' : ''}`;
    card.innerHTML = `
        <div class="script-card-image">
            <img src="${script.imagemUrl || 'https://placehold.co/600x400/0d6efd/ffffff?text=Script'}" alt="${script.nome}">
        </div>
        <div class="card-content">
            <div class="card-header">
                <h3>${script.nome || 'Script sem nome'}</h3>
                <span class="tag ${tagColorClass}">${tagText}</span>
            </div>
            <p>${script.descricao || 'Sem descrição disponível.'}</p>
        </div>
        <div class="card-footer">
            ${buttonHTML}
        </div>
    `;
    scriptsGrid.appendChild(card);
}