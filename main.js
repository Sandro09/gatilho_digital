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

    // --- LÓGICA DO ACCORDION (PÁGINA SOBRE) ---
    const accordionItems = document.querySelectorAll('.accordion-item');
    if (accordionItems.length > 0) {
        accordionItems.forEach(item => {
            const header = item.querySelector('.accordion-header');
            header.addEventListener('click', () => {
                // Fecha todos os outros itens
                accordionItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                // Abre ou fecha o item clicado
                item.classList.toggle('active');
            });
        });
    }
});