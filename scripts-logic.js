const firebaseConfig = {
    apiKey: "AIzaSyAQ3TNLZ2JDIx4epEBoScG30EoZyXOv0_8",
    authDomain: "gatilho-digital.firebaseapp.com",
    projectId: "gatilho-digital",
    storageBucket: "gatilho-digital.appspot.com",
    messagingSenderId: "976478299682",
    appId: "1:976478299682:web:95e9aefa274cf9ab524c7b",
    measurementId: "G-KN6052TK8L"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const userWelcome = document.getElementById('user-welcome');
const logoutBtn = document.getElementById('logout-btn');
const scriptsGrid = document.getElementById('scripts-grid');

auth.onAuthStateChanged(user => {
    if (user) {
        userWelcome.textContent = `Olá, ${user.displayName.split(' ')[0]}`;
        db.collection('users').doc(user.uid).onSnapshot(userDoc => {
            loadAllScripts(userDoc.data());
        });
    } else {
        window.location.href = 'index.html';
    }
});

logoutBtn.addEventListener('click', () => auth.signOut());

async function loadAllScripts(userData) {
    scriptsGrid.innerHTML = '<p>Carregando scripts...</p>';
    const snapshot = await db.collection('scripts').get();
    
    scriptsGrid.innerHTML = '';
    snapshot.forEach(doc => {
        const script = doc.data();
        createScriptCard(doc.id, script, userData);
    });
}

function createScriptCard(id, script, user) {
    const card = document.createElement('div');
    let isLocked = true;
    let tagColorClass = 'tag-locked';
    let tagText = 'Bloqueado';
    let buttonHTML = '';

    // Lógica de Acesso
    if (script.tipo === 'gratis') {
        isLocked = false;
        tagText = 'Grátis';
        tagColorClass = 'tag-free';
        buttonHTML = `<button class="button-access">Acessar</button>`;
    }

    card.className = `script-card ${isLocked ? 'grayscale' : ''}`;
    card.innerHTML = `
        <div class="script-card-image">
            <img src="${script.imagemUrl || 'https://placehold.co/600x400'}" alt="${script.nome}">
        </div>
        <div class="card-content">
            <div class="card-header">
                <h3>${script.nome}</h3>
                <span class="tag ${tagColorClass}">${tagText}</span>
            </div>
            <p>${script.descricao}</p>
        </div>
        <div class="card-footer">
            ${buttonHTML}
        </div>
    `;
    scriptsGrid.appendChild(card);
}