(function() {
    // Flip this to true when the Architecture Portfolio.pdf download should work.
    const PORTFOLIO_PDF_ENABLED = false;
    const PROJECT_CATEGORY_ORDER = ['architecture', 'publication', 'objects'];
    const PROJECT_CATEGORY_LABELS = {
        architecture: 'Architecture',
        publication: 'Publication',
        objects: 'Objects',
        all: 'All'
    };
    const PROJECT_PAGE_PATHS = {
        'Twelve Views of Akkajaure': '/twelve-views-of-akkajaure/',
        'Field Harmonics': '/fieldharmonics/',
        "Bachelor's Thesis Exhibitions": '/bachelors-thesis-exhibitions/',
        'Campus Visions': '/campus-visions/',
        'Essays on Architecture': '/essays-on-architecture/',
        'Gibraltar Townhouses': '/gibraltar-townhouses/',
        'Self–observatory': '/self-observatory/',
        'Tree Sculptures': '/tree-sculptures/',
        'Plate Light': '/plate-light/',
        'Lambda Chair': '/lambda-chair/',
        'Torslanda Bath': '/torslanda-bath/',
        'Venezia Ordinata': '/venezia-ordinata/',
        'Spill Chair': '/spill-chair/',
        'Slottskogen Crossbeams': '/slottskogen-crossbeams/'
    };
    const PROJECT_LIST_DURATION_MS = 550;
    const PANEL_EXPAND_MS = 850;
    const LABEL_BLINK_MS = 150;
    const FILTER_STORAGE_KEY = 'ehaak-project-filter';
    const FILTER_PREV_STORAGE_KEY = 'ehaak-project-filter-prev';

    function blinkLabel(element) {
        if (!element) return;
        element.classList.add('is-active');
        window.setTimeout(function() {
            element.classList.remove('is-active');
        }, LABEL_BLINK_MS);
    }

    function readStoredFilter() {
        try {
            return sessionStorage.getItem(FILTER_STORAGE_KEY) || 'all';
        } catch (e) {
            return 'all';
        }
    }

    function readStoredPreviousFilter() {
        try {
            return sessionStorage.getItem(FILTER_PREV_STORAGE_KEY) || '';
        } catch (e) {
            return '';
        }
    }

    function writeStoredFilter(filter) {
        try {
            sessionStorage.setItem(FILTER_STORAGE_KEY, filter);
            if (filter && filter !== 'all') {
                sessionStorage.setItem(FILTER_PREV_STORAGE_KEY, filter);
            }
        } catch (e) {}
    }

    function resolveInitialFilter() {
        const saved = readStoredFilter();
        if (saved === 'all') return 'all';
        if (document.querySelector('.project-filter[data-filter="' + saved + '"]')) {
            return saved;
        }
        return 'all';
    }

    const panelRight = document.getElementById('panel-right');
    const projectsToggle = document.getElementById('projects-toggle');
    const projectsBody = document.getElementById('projects-body');
    const aboutToggle = document.getElementById('about-toggle');
    const aboutContent = document.getElementById('about-content');
    const homeNameLink = document.getElementById('home-name-link');
    const portfolioLink = document.getElementById('portfolio-pdf-link');

    let projectsOpen = false;
    let aboutOpen = false;
    let projectsAnimating = false;
    let filterAnimating = false;
    let previousCategoryFilter = readStoredPreviousFilter() || 'architecture';
    let aboutCloseTimer = null;
    const ABOUT_FADE_MS = 650;
    const ABOUT_STAGGER_MS = 150;

    function formatCategoryLabel(category) {
        return PROJECT_CATEGORY_LABELS[category] || category;
    }

    function sortProjectsByYear(projects) {
        return projects.slice().sort(function(a, b) {
            return Number(b.year) - Number(a.year);
        });
    }

    function getPanelEdgePadding() {
        const fontSize = parseFloat(getComputedStyle(document.body).fontSize) || 20;
        return Math.round(fontSize * 0.35);
    }

    function getCompactPanelHeight() {
        const edge = getPanelEdgePadding();
        if (projectsToggle) {
            return projectsToggle.offsetHeight + edge + 4;
        }
        const fontSize = parseFloat(getComputedStyle(document.body).fontSize) || 20;
        return Math.round(fontSize * 1.1) + edge + 4;
    }

    function getListRowHeight() {
        const fontSize = parseFloat(getComputedStyle(document.body).fontSize) || 20;
        return fontSize * 1.1;
    }

    function getExpandedPanelHeight() {
        if (!panelRight) return getCompactPanelHeight();

        const visibleCount = document.querySelectorAll('#project-list .project-list-item:not(.is-hidden)').length;
        const toggleH = projectsToggle ? projectsToggle.offsetHeight : 0;
        const bodyPadTop = projectsBody ? (parseFloat(getComputedStyle(projectsBody).paddingTop) || 0) : 0;
        const filterBar = document.getElementById('project-filter-bar');
        const filterH = filterBar ? filterBar.offsetHeight : 0;
        const list = document.getElementById('project-list');
        const listMargin = list ? (parseFloat(getComputedStyle(list).marginTop) || 0) : 0;
        const rowsH = visibleCount * getListRowHeight();
        const edge = getPanelEdgePadding();

        return toggleH + bodyPadTop + filterH + listMargin + rowsH + edge + 4;
    }

    function setProjectsPanelHeight(expanded, instant) {
        if (!panelRight) return;

        const to = expanded ? getExpandedPanelHeight() : getCompactPanelHeight();

        if (instant) {
            panelRight.classList.add('is-resizing-instant');
            panelRight.style.height = to + 'px';
            void panelRight.offsetHeight;
            panelRight.classList.remove('is-resizing-instant');
            return;
        }

        const from = panelRight.getBoundingClientRect().height;
        panelRight.style.height = from + 'px';
        void panelRight.offsetHeight;
        panelRight.style.height = to + 'px';
    }

    function lockFilterItemWidths() {
        const filterBar = document.getElementById('project-filter-bar');
        if (!filterBar) return;

        const buttons = filterBar.querySelectorAll('.project-filter');
        const slashes = filterBar.querySelectorAll('.project-filter-slash');
        let activeFilter = 'all';
        buttons.forEach(function(button) {
            if (button.classList.contains('is-active')) {
                activeFilter = button.dataset.filter;
            }
            button.classList.remove('is-active');
            button.style.width = '';
        });
        slashes.forEach(function(slash) {
            slash.style.width = '';
        });

        void filterBar.offsetWidth;

        buttons.forEach(function(button) {
            button.style.width = button.getBoundingClientRect().width + 'px';
        });

        buttons.forEach(function(button) {
            button.classList.toggle('is-active', button.dataset.filter === activeFilter);
        });
    }

    function renderProjectFilterBar(categories) {
        const filterBar = document.getElementById('project-filter-bar');
        if (!filterBar) return;

        filterBar.innerHTML = '';
        const ordered = PROJECT_CATEGORY_ORDER.filter(function(category) {
            return categories.indexOf(category) !== -1;
        });
        const entries = ordered.map(function(category) {
            return { filter: category, label: formatCategoryLabel(category) };
        });
        entries.push({ filter: 'all', label: PROJECT_CATEGORY_LABELS.all });

        const initialFilter = readStoredFilter();
        const group = document.createElement('div');
        group.className = 'project-filter-group';

        entries.forEach(function(entry, index) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'project-filter' + (entry.filter === initialFilter ? ' is-active' : '');
            button.dataset.filter = entry.filter;
            button.textContent = entry.label;
            group.appendChild(button);

            if (index < entries.length - 1) {
                const slash = document.createElement('span');
                slash.className = 'project-filter-slash';
                slash.textContent = ',';
                group.appendChild(slash);
            }
        });

        filterBar.appendChild(group);

        const yearLabel = document.createElement('span');
        yearLabel.className = 'project-filter-year-label';
        yearLabel.textContent = 'Year';
        filterBar.appendChild(yearLabel);

        lockFilterItemWidths();
    }

    function renderProjectList(projects) {
        const list = document.getElementById('project-list');
        if (!list) return;

        list.innerHTML = '';
        list.classList.remove('is-loading');

        sortProjectsByYear(projects).forEach(function(project) {
            const item = document.createElement('li');
            item.className = 'project-list-item';
            item.dataset.category = project.category;

            const link = document.createElement('a');
            link.className = 'project-link';
            const pagePath = PROJECT_PAGE_PATHS[project.name];

            if (pagePath) {
                link.href = pagePath;
                link.classList.add('is-navigable');
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = pagePath;
                });
        } else {
                link.href = '#';
                link.setAttribute('aria-disabled', 'true');
            }

            const name = document.createElement('span');
            name.className = 'project-name';
            name.textContent = project.name;

            const year = document.createElement('span');
            year.className = 'project-year';
            year.textContent = project.year;

            link.appendChild(name);
            link.appendChild(year);
            item.appendChild(link);
            list.appendChild(item);
        });
    }

    function clearProjectListStagger() {
        document.querySelectorAll('.project-list-item').forEach(function(item) {
            item.style.transitionDelay = '';
        });
    }

    function getProjectListTransitionEndMs() {
        return PROJECT_LIST_DURATION_MS;
    }

    function updateProjectYearStyles() {
        const listItems = document.querySelectorAll('.project-list-item');
        const seenYears = new Set();

        listItems.forEach(function(item) {
            const yearEl = item.querySelector('.project-year');
            if (!yearEl) return;

            if (item.classList.contains('is-hidden')) {
                yearEl.classList.remove('is-repeat');
                return;
            }

            const year = yearEl.textContent.trim();
            if (seenYears.has(year)) {
                yearEl.classList.add('is-repeat');
        } else {
                yearEl.classList.remove('is-repeat');
                seenYears.add(year);
            }
        });
    }

    function applyProjectFilter(activeFilter) {
        const list = document.getElementById('project-list');
        const filterButtons = document.querySelectorAll('.project-filter');
        const listItems = document.querySelectorAll('.project-list-item');
        if (!list || filterAnimating) return;

        filterAnimating = true;

        if (applyProjectFilter.resetTimer) {
            window.clearTimeout(applyProjectFilter.resetTimer);
            applyProjectFilter.resetTimer = null;
        }

        if (activeFilter !== 'all') {
            previousCategoryFilter = activeFilter;
        }
        writeStoredFilter(activeFilter);

        filterButtons.forEach(function(button) {
            button.classList.toggle('is-active', button.dataset.filter === activeFilter);
        });

        list.classList.add('is-animated');

        listItems.forEach(function(item) {
            const match = activeFilter === 'all' || item.dataset.category === activeFilter;
            item.style.transitionDelay = '';
            item.classList.toggle('is-hidden', !match);
        });

        updateProjectYearStyles();

        if (projectsOpen && panelRight) {
            panelRight.classList.add('is-filtering');
            // Measure after classes update; height is based on visible count, not mid-transition scrollHeight
            setProjectsPanelHeight(true);
            window.clearTimeout(applyProjectFilter.filterHeightTimer);
            applyProjectFilter.filterHeightTimer = window.setTimeout(function() {
                panelRight.classList.remove('is-filtering');
            }, getProjectListTransitionEndMs());
        }

        applyProjectFilter.resetTimer = window.setTimeout(function() {
            clearProjectListStagger();
            filterAnimating = false;
        }, getProjectListTransitionEndMs());
    }

    function getAllToggleTarget() {
        const preferred = previousCategoryFilter || 'architecture';
        if (document.querySelector('.project-filter[data-filter="' + preferred + '"]')) {
            return preferred;
        }
        for (let i = 0; i < PROJECT_CATEGORY_ORDER.length; i += 1) {
            const category = PROJECT_CATEGORY_ORDER[i];
            if (document.querySelector('.project-filter[data-filter="' + category + '"]')) {
                return category;
            }
        }
        return 'all';
    }

    function initProjectFilterControls() {
        const filterBar = document.getElementById('project-filter-bar');
        if (!filterBar) return;

        filterBar.addEventListener('click', function(event) {
            const button = event.target.closest('.project-filter');
            if (!button || filterAnimating) return;
            event.stopPropagation();

            const filter = button.dataset.filter;
            const isActive = button.classList.contains('is-active');

            if (filter === 'all') {
                applyProjectFilter(isActive ? getAllToggleTarget() : 'all');
            } else if (isActive) {
                applyProjectFilter('all');
        } else {
                applyProjectFilter(filter);
            }
        });
    }

    function initProjectList() {
        const list = document.getElementById('project-list');
        if (!list || typeof Papa === 'undefined') return;

        list.classList.add('is-loading');

        Papa.parse('projects.csv', {
            download: true,
            header: true,
            delimiter: ';',
            skipEmptyLines: true,
            complete: function(results) {
                const projects = (results.data || []).filter(function(row) {
                    return row.category && row.name && row.year;
                });
                const categories = PROJECT_CATEGORY_ORDER.filter(function(category) {
                    return projects.some(function(project) {
                        return project.category === category;
                    });
                });
                renderProjectFilterBar(categories);
                renderProjectList(projects);
                applyProjectFilter(resolveInitialFilter());
                initProjectFilterControls();
                setProjectsPanelHeight(false, true);
            },
            error: function() {
                list.classList.remove('is-loading');
                setProjectsPanelHeight(false, true);
            }
        });
    }

    function toggleProjects(e) {
    e.preventDefault();
    e.stopPropagation();
        if (projectsAnimating) return;

        projectsOpen = !projectsOpen;
        projectsAnimating = true;
        panelRight.classList.toggle('is-expanded', projectsOpen);
        blinkLabel(projectsToggle);

        setProjectsPanelHeight(projectsOpen);

        window.setTimeout(function() {
            projectsAnimating = false;
        }, PANEL_EXPAND_MS);
    }

    function toggleAbout(e) {
    e.preventDefault();
    e.stopPropagation();
    
        if (aboutCloseTimer) {
            window.clearTimeout(aboutCloseTimer);
            aboutCloseTimer = null;
        }

        if (!aboutOpen) {
            aboutOpen = true;
            aboutContent.classList.add('is-expanded');
            void aboutContent.offsetHeight;
            aboutContent.classList.add('is-open');
            aboutContent.setAttribute('aria-hidden', 'false');
    } else {
            aboutOpen = false;
            aboutContent.classList.remove('is-open');
            aboutContent.setAttribute('aria-hidden', 'true');
            aboutCloseTimer = window.setTimeout(function() {
                aboutContent.classList.remove('is-expanded');
                aboutCloseTimer = null;
            }, ABOUT_FADE_MS + ABOUT_STAGGER_MS);
        }

        blinkLabel(aboutToggle);
    }

    if (homeNameLink) {
        homeNameLink.addEventListener('click', function(e) {
            e.preventDefault();
            blinkLabel(homeNameLink);
            window.setTimeout(function() {
                window.location.reload();
            }, LABEL_BLINK_MS);
        });
    }

    if (portfolioLink) {
        if (!PORTFOLIO_PDF_ENABLED) {
            portfolioLink.removeAttribute('href');
            portfolioLink.removeAttribute('download');
            portfolioLink.setAttribute('aria-disabled', 'true');
            portfolioLink.classList.add('is-disabled');
        } else {
            portfolioLink.addEventListener('click', function(e) {
                e.stopPropagation();
                blinkLabel(portfolioLink);
            });
        }
    }

    if (projectsToggle) {
        projectsToggle.addEventListener('click', toggleProjects);
    }

    if (aboutToggle) {
        aboutToggle.addEventListener('click', toggleAbout);
    }

    window.addEventListener('resize', function() {
        lockFilterItemWidths();
        setProjectsPanelHeight(projectsOpen, true);
    });

    setProjectsPanelHeight(false, true);
    initProjectList();
})();
