/**
 * Funções de criação de botões e elementos de acessibilidade
 *
 * Este arquivo fornece funções para criar os botões e elementos de interface
 * necessários para o plugin AGUIA
 *
 * @module     local_aguiaplugin/accessibility_buttons
 * @copyright  2025 AGUIA
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// Criar botão de acessibilidade
function createAccessibilityButton() {
    // Verificar se já existe um botão
    if (document.getElementById('aguiaButton')) {
        return;
    }
    
    // Criar wrapper para o botão
    const wrapper = document.createElement('div');
    wrapper.className = 'aguia-button-wrapper';
    
    // Criar o botão principal
    const button = document.createElement('button');
    button.id = 'aguiaButton';
    button.className = 'aguia-button pulse';
    button.setAttribute('aria-label', 'Menu de acessibilidade');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    
    // Adicionar o ícone
    const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <title>Ícone de acessibilidade AGUIA</title>
        <path d="M16,4c-6.6,0-12,5.4-12,12s5.4,12,12,12s12-5.4,12-12S22.6,4,16,4z M16,8c1.1,0,2,0.9,2,2s-0.9,2-2,2s-2-0.9-2-2
        S14.9,8,16,8z M20,24h-8v-2h2v-6h-2v-2h6v8h2V24z" fill="#FFFFFF"/>
    </svg>`;
    button.innerHTML = iconSvg;
    
    // Criar banner de hover
    const createHoverBanner = function() {
        if (document.getElementById('aguiaBanner')) {
            document.getElementById('aguiaBanner').remove();
        }
        
        const banner = document.createElement('div');
        banner.id = 'aguiaBanner';
        banner.textContent = 'Menu de Acessibilidade';
        banner.className = 'aguia-hover-banner';
        
        return banner;
    };
    
    // Adicionar eventos de hover
    button.addEventListener('mouseenter', () => {
        const banner = createHoverBanner();
        if (banner) {
            wrapper.appendChild(banner);
            setTimeout(() => {
                banner.style.opacity = '1';
                banner.style.left = '-115px';
                banner.style.transform = 'translateX(0)';
            }, 10);
        }
    });
    
    button.addEventListener('mouseleave', () => {
        const banner = document.getElementById('aguiaBanner');
        if (banner) {
            banner.style.opacity = '0';
            banner.style.left = '-100px';
            banner.style.transform = 'translateX(20px)';
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    });
    
    // Função para alternar o menu
    function toggleMenu() {
        const menu = document.getElementById('aguiaMenu');
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            menu.style.display = 'none';
            button.setAttribute('aria-expanded', 'false');
        } else {
            menu.style.display = 'block';
            button.setAttribute('aria-expanded', 'true');
            // Foco no primeiro elemento do menu
            const firstFocusable = menu.querySelector('button, [tabindex="0"]');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }
    }
    
    // Adicionar evento de clique
    button.addEventListener('click', toggleMenu);
    button.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu();
        }
    });
    
    // Adicionar ao wrapper
    wrapper.appendChild(button);
    document.body.appendChild(wrapper);
    
    // Remover a animação de pulsar após 5 segundos
    setTimeout(function() {
        button.classList.remove('pulse');
    }, 5000);
}

// Exportar funções para uso global
window.createAccessibilityButton = createAccessibilityButton;