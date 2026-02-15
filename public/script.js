(function() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const mobileThemeBtn = document.getElementById('mobile-theme-btn');
    const body = document.body;

    // Check localStorage or System Preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Initial Setup
    if (savedTheme === 'dark') {
        setTheme(true);
    } else if (savedTheme === 'light') {
        setTheme(false);
    } else {
        setTheme(systemDark);
    }

    function setTheme(isDark) {
        const hljsTheme = document.getElementById('hljs-theme');
        if (isDark) {
            body.classList.add('dark-mode');
            body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
            updateIcons('light_mode');
            if (hljsTheme) hljsTheme.href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css";
        } else {
            body.classList.add('light-mode');
            body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            updateIcons('dark_mode');
            if (hljsTheme) hljsTheme.href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css";
        }
    }

    function updateIcons(iconName) {
        const icons = document.querySelectorAll('.mobile-theme-btn .material-symbols-rounded, #theme-toggle-btn .material-symbols-rounded');
        icons.forEach(icon => {
            icon.textContent = iconName;
        });
    }

    function toggleTheme() {
        const isCurrentlyDark = body.classList.contains('dark-mode');
        setTheme(!isCurrentlyDark);
    }

    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
    if (mobileThemeBtn) mobileThemeBtn.addEventListener('click', toggleTheme);

    // --- Sidebar Persistence ---
    const sidebarCollapse = document.getElementById('sidebar-collapse');
    if (sidebarCollapse) {
        // Restore sidebar state
        const isCollapsed = localStorage.getItem('sidebar-collapsed') !== 'false';
        sidebarCollapse.checked = !isCollapsed;

        sidebarCollapse.addEventListener('change', () => {
            localStorage.setItem('sidebar-collapsed', !sidebarCollapse.checked);
        });
    }

    // --- Folder Persistence ---
    const folders = document.querySelectorAll('.folder-checkbox');
    folders.forEach(folder => {
        // Restore state
        const isExpanded = localStorage.getItem(`folder-expanded-${folder.id}`) === 'true';
        if (isExpanded) folder.checked = true;

        // Save state
        folder.addEventListener('change', () => {
            localStorage.setItem(`folder-expanded-${folder.id}`, folder.checked);
        });
    });

    // --- Code Block Enhancements ---
    function enhanceCodeBlocks() {
        if (typeof hljs !== 'undefined') hljs.highlightAll();

        const preBlocks = document.querySelectorAll('pre');
        preBlocks.forEach(pre => {
            const container = document.createElement('div');
            container.className = 'code-container';
            pre.parentNode.insertBefore(container, pre);
            container.appendChild(pre);

            const code = pre.querySelector('code');
            const lang = [...code.classList].find(c => c.startsWith('language-'))?.replace('language-', '') || 'text';

            // Top Bar
            const topBar = document.createElement('div');
            topBar.className = 'code-bar';
            
            const langLabel = document.createElement('span');
            langLabel.className = 'code-lang';
            langLabel.textContent = lang;
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = '<span class="material-symbols-rounded">content_copy</span>';
            copyBtn.title = 'Copy code';

            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(code.innerText).then(() => {
                    copyBtn.innerHTML = '<span class="material-symbols-rounded">check</span>';
                    setTimeout(() => {
                        copyBtn.innerHTML = '<span class="material-symbols-rounded">content_copy</span>';
                    }, 2000);
                });
            });

            topBar.appendChild(langLabel);
            topBar.appendChild(copyBtn);
            container.insertBefore(topBar, pre);
        });
    }

    // Run enhancement after DOM loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceCodeBlocks);
    } else {
        enhanceCodeBlocks();
    }
})();
