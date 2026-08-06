(function() {
    var STORAGE_KEY = 'ehaak-theme';

    function getTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
        } catch (e) {
            return 'light';
        }
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (e) {}
        var button = document.getElementById('theme-toggle');
        if (button) button.textContent = theme;
    }

    function toggleTheme(e) {
        if (e) e.preventDefault();
        setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    }

    setTheme(getTheme());

    function ensureToggle() {
        var button = document.getElementById('theme-toggle');
        if (!button) {
            button = document.createElement('button');
            button.id = 'theme-toggle';
            button.type = 'button';
            button.setAttribute('aria-label', 'Toggle color theme');
            document.body.appendChild(button);
            button.addEventListener('click', toggleTheme);
        } else if (!button._themeBound) {
            button.addEventListener('click', toggleTheme);
        }
        button._themeBound = true;
        button.textContent = getTheme();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureToggle);
    } else {
        ensureToggle();
    }
})();
