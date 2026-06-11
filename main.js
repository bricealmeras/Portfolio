// =====================
// TOGGLE TERMINAL
// =====================
document.addEventListener('DOMContentLoaded', function() {
    const btn      = document.getElementById('terminal-toggle-btn');
    const terminal = document.getElementById('terminal-cli');
    const input    = document.getElementById('cli-input');

    btn.addEventListener('click', function() {
        // On sauvegarde la position du scroll avant l'ouverture
        const scrollY = window.scrollY;

        const isHidden = terminal.classList.toggle('terminal-hidden');

        // On remet le scroll exactement au même endroit
        window.scrollTo({ top: scrollY, behavior: 'instant' });

        if (!isHidden) {
            // Terminal ouvert : focus sans scroll
            setTimeout(() => {
                input.focus({ preventScroll: true });
            }, 50);
            btn.innerHTML = '<i class="fas fa-terminal"></i> Fermer le terminal';
        } else {
            btn.innerHTML = '<i class="fas fa-terminal"></i> Ouvrir le terminal';
        }
    });

    // Texte initial du bouton
    btn.innerHTML = '<i class="fas fa-terminal"></i> Ouvrir le terminal';
});

// =====================
// TERMINAL CLI
// =====================
(function() {
    const output   = document.getElementById('cli-output');
    const input    = document.getElementById('cli-input');
    const body     = document.getElementById('cli-body');
    const terminal = document.getElementById('terminal-cli');

    let history = [];
    let historyIndex = -1;

    const commands = {
        help: () => [
            { text: '┌─ Commandes disponibles ──────────────────┐', cls: 'cli-border' },
            { text: '  help               → Affiche cette aide', cls: 'cli-info' },
            { text: '  ls                 → Liste les rubriques du portfolio', cls: 'cli-info' },
            { text: '  cd [rubrique]       → Navigue vers une rubrique', cls: 'cli-info' },
            { text: '  cat [fichier]       → Affiche un fichier (bio.txt, cv.txt)', cls: 'cli-info' },
            { text: '  clear              → Vide le terminal', cls: 'cli-info' },
            { text: '└──────────────────────────────────────────┘', cls: 'cli-border' },
        ],
        ls: () => [
            { text: '📁 Rubriques disponibles :', cls: 'cli-success' },
            { text: '  home        → Accueil', cls: 'cli-info' },
            { text: '  skills      → Compétences techniques', cls: 'cli-info' },
            { text: '  diplomes    → Diplômes & Certifications', cls: 'cli-info' },
            { text: '  experience  → Expérience professionnelle', cls: 'cli-info' },
            { text: '  projets     → Mes réalisations E4', cls: 'cli-info' },
            { text: '  veilles     → Veille technologique E5', cls: 'cli-info' },
            { text: '  contact     → Me contacter', cls: 'cli-info' },
        ],
        cd: (args) => {
            const sections = ['home','skills','diplomes','experience','projets','veilles','contact'];
            const target = args[0];
            if (!target) return [{ text: 'Usage : cd [rubrique] — tape ls pour voir les rubriques.', cls: 'cli-error' }];
            if (!sections.includes(target)) return [{ text: `Rubrique "${target}" introuvable. Tape ls pour voir les rubriques.`, cls: 'cli-error' }];
            const el = document.getElementById(target);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            return [{ text: `✔ Navigation vers → #${target}`, cls: 'cli-success' }];
        },
        cat: (args) => {
            const files = {
                'bio.txt': [
                    { text: '── bio.txt ──────────────────────────────', cls: 'cli-border' },
                    { text: 'Nom    : Brice Almeras', cls: 'cli-info' },
                    { text: 'Statut : Étudiant BTS SIO SISR', cls: 'cli-info' },
                    { text: 'Passions : Cybersécurité, Réseaux, Virtualisation', cls: 'cli-info' },
                    { text: 'Objectif : Administrateur Systèmes & Réseaux', cls: 'cli-info' },
                    { text: '─────────────────────────────────────────', cls: 'cli-border' },
                ],
                'cv.txt': [
                    { text: '── cv.txt ───────────────────────────────', cls: 'cli-border' },
                    { text: 'CV disponible en téléchargement :', cls: 'cli-info' },
                    { text: '→ CV_Brice_Almeras.pdf', cls: 'cli-success' },
                    { text: '─────────────────────────────────────────', cls: 'cli-border' },
                ],
            };
            const file = args[0];
            if (!file) return [{ text: 'Usage : cat [fichier] — ex: cat bio.txt', cls: 'cli-error' }];
            if (!files[file]) return [{ text: `Fichier "${file}" introuvable. Essaie bio.txt ou cv.txt`, cls: 'cli-error' }];
            return files[file];
        },
        clear: () => 'CLEAR',
    };

    function scrollToBottom() {
        body.scrollTop = body.scrollHeight;
    }

    function printLines(lines) {
        lines.forEach(line => {
            const p = document.createElement('p');
            p.className = 'cli-line ' + (line.cls || '');
            p.textContent = line.text;
            output.appendChild(p);
        });
        scrollToBottom();
    }

    function printCommand(cmd) {
        const p = document.createElement('p');
        p.className = 'cli-line cli-user-cmd';
        p.innerHTML = '<span class="cli-prompt">visiteur@portfolio:~$&nbsp;</span>' + escapeHtml(cmd);
        output.appendChild(p);
    }

    function escapeHtml(str) {
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    function handleCommand(raw) {
        const trimmed = raw.trim();
        if (!trimmed) return;

        history.unshift(trimmed);
        historyIndex = -1;

        printCommand(trimmed);

        const parts = trimmed.split(/\s+/);
        const cmd   = parts[0].toLowerCase();
        const args  = parts.slice(1);

        if (cmd === 'clear') {
            output.innerHTML = '';
            scrollToBottom();
            return;
        }

        if (commands[cmd]) {
            const result = commands[cmd](args);
            if (result !== 'CLEAR') printLines(result);
        } else {
            printLines([{ text: `Commande introuvable : "${trimmed}". Tape help pour l'aide.`, cls: 'cli-error' }]);
        }
    }

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            handleCommand(input.value);
            input.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < history.length - 1) {
                historyIndex++;
                input.value = history[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                input.value = history[historyIndex];
            } else {
                historyIndex = -1;
                input.value = '';
            }
        }
    });

    // Clic sur le terminal = focus sur l'input
    terminal.addEventListener('click', function() {
        input.focus();
    });

    // Focus auto au chargement
    input.focus();
})();

// =====================
// CONTACT CARDS - Copie
// =====================
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.contact-card');
    cards.forEach(card => {
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        const info = card.querySelector('p');
        const href = card.tagName.toLowerCase() === 'a' ? (card.getAttribute('href') || '') : '';
        const isLinkedIn = href.includes('linkedin.com');

        function copyInfo(e) {
            if (isLinkedIn) return;
            if (e) e.preventDefault();
            const text = info ? info.textContent.trim() : '';
            if (!text) return;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    showTooltip(card, 'Copié !');
                }).catch(() => fallbackCopy(text, card));
            } else {
                fallbackCopy(text, card);
            }
        }

        function fallbackCopy(text, card) {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
                showTooltip(card, 'Copié !');
            } catch (err) {
                showTooltip(card, 'Erreur');
            }
            ta.remove();
        }

        card.addEventListener('click', copyInfo);
        card.addEventListener('keydown', function(e) {
            if ((e.key === 'Enter' || e.key === ' ') && isLinkedIn) return;
            if (e.key === 'Enter' || e.key === ' ') copyInfo(e);
        });
    });

    function showTooltip(card, message) {
        let tip = card.querySelector('.copy-tooltip');
        if (!tip) {
            tip = document.createElement('div');
            tip.className = 'copy-tooltip';
            card.appendChild(tip);
        }
        tip.textContent = message;
        tip.classList.add('visible');
        setTimeout(() => tip.classList.remove('visible'), 1400);
    }
});

// =====================
// FLUX RSS IT-CONNECT
// =====================
fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.it-connect.fr/feed/')
    .then(res => res.json())
    .then(data => {
        const feed = document.getElementById('rss-feed');
        if (!data.items || data.items.length === 0) {
            feed.innerHTML = '<p class="rss-error">Impossible de charger les articles.</p>';
            return;
        }
        const articles = data.items.slice(0, 5);
        feed.innerHTML = articles.map(item => {
            const date = new Date(item.pubDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
            return `
            <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="rss-item">
                <div class="rss-item-content">
                    <span class="rss-date">${date}</span>
                    <span class="rss-title">${item.title}</span>
                </div>
                <i class="fas fa-external-link-alt rss-icon"></i>
            </a>`;
        }).join('');
    })
    .catch(() => {
        document.getElementById('rss-feed').innerHTML = '<p class="rss-error">Flux RSS indisponible pour le moment.</p>';
    });