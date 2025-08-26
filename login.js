// A sua configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAQ3TNLZ2JDIx4epEBoScG30EoZyXOv0_8",
    authDomain: "gatilho-digital.firebaseapp.com",
    projectId: "gatilho-digital",
    storageBucket: "gatilho-digital.appspot.com",
    messagingSenderId: "976478299682",
    appId: "1:976478299682:web:95e9aefa274cf9ab524c7b"
};

// Inicialização
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Elementos da página
const loginBox = document.getElementById('login-box');
const userDashboard = document.getElementById('user-dashboard');
const googleLoginBtn = document.getElementById('google-login-btn');
const logoutBtn = document.getElementById('logout-btn');

// --- DISPARA A ANIMAÇÃO QUANDO A PÁGINA CARREGA ---
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
});

// Evento de clique para o botão de login
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
        auth.signInWithPopup(googleProvider).catch(error => {
            console.error("Erro no login com Google:", error);
            alert("Ocorreu um erro ao tentar fazer o login. Verifique se os pop-ups não estão bloqueados.");
        });
    });
}

// Evento de clique para o botão de logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });
}

// Observador de estado de login
auth.onAuthStateChanged(user => {
    if (user) {
        loginBox.style.display = 'none';
        userDashboard.style.display = 'block';

        document.getElementById('user-photo').src = user.photoURL;
        document.getElementById('user-name').textContent = user.displayName;
        document.getElementById('user-email').textContent = user.email;

        // Verifica/cria o usuário no Firestore
        const userRef = db.collection('users').doc(user.uid);
        userRef.get().then((doc) => {
            if (!doc.exists) {
                userRef.set({
                    nome: user.displayName,
                    email: user.email,
                    assinatura: { status: 'inactive', dataFim: null },
                    scriptsComprados: []
                });
            }
        });

    } else {
        loginBox.style.display = 'block';
        userDashboard.style.display = 'none';
    }
});