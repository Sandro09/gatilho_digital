document.addEventListener('DOMContentLoaded', function () {
    
    // --- LÓGICA PARA MENU MOBILE (HAMBURGER) ---
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', () => {
            navbarToggler.classList.toggle('active');
            navbarCollapse.classList.toggle('show');
        });
    }

    // --- LÓGICA PARA O TEMA ESCURO (NOVO SELETOR) ---
    const themeCheckbox = document.getElementById('theme-checkbox');
    const currentTheme = localStorage.getItem('theme');

    // Função para aplicar o tema
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            if(themeCheckbox) themeCheckbox.checked = true;
        } else {
            document.documentElement.removeAttribute('data-theme');
            if(themeCheckbox) themeCheckbox.checked = false;
        }
    }

    // Aplica o tema salvo ao carregar a página
    applyTheme(currentTheme);

    // Adiciona o evento de clique no novo seletor
    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', () => {
            if (themeCheckbox.checked) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
                localStorage.removeItem('theme');
            }
        });
    }

    // --- LÓGICA DO ACCORDION (PÁGINA SOBRE) ---
    const accordionItems = document.querySelectorAll('.accordion-item');
    if (accordionItems.length > 0) {
        accordionItems.forEach(item => {
            const header = item.querySelector('.accordion-header');
            header.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                // Fecha todos os outros
                accordionItems.forEach(i => i.classList.remove('active'));
                // Abre ou fecha o item clicado
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }
});