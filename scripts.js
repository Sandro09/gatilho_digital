// ===================================================================
// SUA CHAVE SECRETA (firebaseConfig) JÁ ESTÁ INSERIDA AQUI!
// ===================================================================

const firebaseConfig = {
    apiKey: "AIzaSyAQ3TNLZ2JDIx4epEBoScG30EoZyXOv0_8",
    authDomain: "gatilho-digital.firebaseapp.com",
    projectId: "gatilho-digital",
    storageBucket: "gatilho-digital.appspot.com",
    messagingSenderId: "976478299682",
    appId: "1:976478299682:web:95e9aefa274cf9ab524c7b",
    measurementId: "G-KN6052TK8L"
};

// ===================================================================
// INICIALIZANDO O FIREBASE
// Esta linha usa sua config para conectar seu código ao seu projeto.
// ===================================================================

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();


// ===================================================================
// LÓGICA DA PÁGINA DE LOGIN
// ===================================================================

// Pegando os elementos do HTML pelo ID
const loginBox = document.getElementById('login-box');
const userDashboard = document.getElementById('user-dashboard');
const googleLoginBtn = document.getElementById('google-login-btn');
const logoutBtn = document.getElementById('logout-btn');
const redirectBtn = document.getElementById('redirect-btn');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const userPhoto = document.getElementById('user-photo');

// --- Ação de Login ---
googleLoginBtn.addEventListener('click', () => {
    auth.signInWithPopup(provider)
        .then((result) => {
            console.log("Login com Google bem-sucedido!", result.user);
        })
        .catch((error) => {
            console.error("Erro durante o login:", error);
            alert("Ocorreu um erro ao tentar fazer o login. Tente novamente.");
        });
});

// --- Ação de Logout ---
logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

// --- Ação para ir para a página de scripts ---
redirectBtn.addEventListener('click', () => {
    window.location.href = 'scripts.html';
});

// --- O OBSERVADOR DO FIREBASE ---
// Roda sempre que o status de login muda (alguém entra ou sai)
auth.onAuthStateChanged(user => {
    if (user) {
        // SE O USUÁRIO ESTÁ LOGADO:
        loginBox.classList.add('hidden');
        userDashboard.classList.remove('hidden');

        userName.textContent = user.displayName;
        userEmail.textContent = user.email;
        userPhoto.src = user.photoURL;

        // VERIFICA/CRIA O USUÁRIO NO BANCO DE DADOS (FIRESTORE)
        const userRef = db.collection('users').doc(user.uid);
        userRef.get().then((doc) => {
            if (!doc.exists) {
                // Se é o primeiro login, cria o perfil no banco
                userRef.set({
                    nome: user.displayName,
                    email: user.email,
                    assinatura: { status: 'inactive', dataFim: null },
                    scriptsComprados: []
                });
            }
        });

    } else {
        // SE O USUÁRIO NÃO ESTÁ LOGADO:
        loginBox.classList.remove('hidden');
        userDashboard.classList.add('hidden');
    }
});