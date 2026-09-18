/**
 * Rapports de TP & Documentations Techniques
 * Logique de filtrage en temps réel, recherche instantanée et visualiseur PDF
 */

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('tp-search');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.tp-card');
    const noResults = document.getElementById('no-results');
    const modal = document.getElementById('pdf-modal');
    const modalFrame = document.getElementById('pdf-modal-frame');
    const modalTitle = document.getElementById('pdf-modal-title');
    const modalDownload = document.getElementById('pdf-modal-download');
    const modalExternal = document.getElementById('pdf-modal-external');
    const modalClose = document.getElementById('pdf-modal-close');

    let currentCategory = 'all';
    let searchQuery = '';

    // ============================================
    // FILTRAGE ET RECHERCHE
    // ============================================
    function filterCards() {
        let visibleCount = 0;

        cards.forEach(card => {
            const cardCategory = card.getAttribute('data-category') || '';
            const cardText = (card.textContent || '').toLowerCase();
            
            const matchesCategory = (currentCategory === 'all') || cardCategory.split(' ').includes(currentCategory);
            const matchesSearch = searchQuery === '' || cardText.includes(searchQuery);

            if (matchesCategory && matchesSearch) {
                card.style.display = 'flex';
                card.style.animation = 'fadeIn 0.35s ease forwards';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }

    // Gestion de la recherche instantanée
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim().toLowerCase();
            filterCards();
        });
    }

    // Gestion des boutons de filtres
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-filter');
            filterCards();
        });
    });

    // ============================================
    // MODAL VISUALISEUR DE PDF
    // ============================================
    window.openPdfModal = function(pdfUrl, title) {
        if (!modal) return;
        modalTitle.textContent = title || 'Aperçu du Rapport';
        modalFrame.src = pdfUrl;
        modalDownload.href = pdfUrl;
        modalExternal.href = pdfUrl;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    function closePdfModal() {
        if (!modal) return;
        modal.classList.remove('active');
        modalFrame.src = '';
        document.body.style.overflow = '';
    }

    if (modalClose) modalClose.addEventListener('click', closePdfModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closePdfModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closePdfModal();
        }
    });

    // Configuration des boutons "Aperçu rapide"
    document.querySelectorAll('.btn-preview').forEach(btn => {
        btn.addEventListener('click', () => {
            const pdfUrl = btn.getAttribute('data-pdf');
            const title = btn.getAttribute('data-title');
            if (pdfUrl) {
                openPdfModal(pdfUrl, title);
            }
        });
    });
});
