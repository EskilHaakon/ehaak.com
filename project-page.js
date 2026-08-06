(function() {
    const PROJECT_CATEGORY_ORDER = ['architecture', 'publication', 'objects'];
    const PROJECT_CATEGORY_LABELS = {
        architecture: 'Architecture',
        publication: 'Publication',
        objects: 'Objects',
        all: 'All'
    };
    const PROJECT_PAGE_PATHS = {
        'Twelve Views of Vattlafjall': '/twelve-views-of-vattlafjall/',
        Fieldharmonics: '/fieldharmonics/',
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

    const panelProjects = document.getElementById('panel-projects');
    const projectsToggle = document.getElementById('projects-toggle');
    const projectsBody = document.getElementById('projects-body');
    const homeLink = document.getElementById('project-home-link');
    const currentProject = document.body.dataset.project || '';

    let projectsOpen = false;
    let projectsAnimating = false;
    let filterAnimating = false;
    let previousCategoryFilter = 'architecture';

    function blinkLabel(element) {
        if (!element) return;
        element.classList.add('is-active');
        window.setTimeout(function() {
            element.classList.remove('is-active');
        }, LABEL_BLINK_MS);
    }

    function getPanelEdgePadding() {
        const fontSize = parseFloat(getComputedStyle(document.body).fontSize) || 20;
        return Math.round(fontSize * 0.35);
    }

    function getCompactPanelHeight() {
        const edge = getPanelEdgePadding();
        if (projectsToggle) {
            return projectsToggle.offsetHeight + edge + 2;
        }
        const fontSize = parseFloat(getComputedStyle(document.body).fontSize) || 20;
        return Math.round(fontSize * 1.1) + edge + 2;
    }

    function getListRowHeight() {
        const fontSize = parseFloat(getComputedStyle(document.body).fontSize) || 20;
        return fontSize * 1.1;
    }

    function getExpandedPanelHeight() {
        if (!panelProjects) return getCompactPanelHeight();

        const visibleCount = document.querySelectorAll('#project-list .project-list-item:not(.is-hidden)').length;
        const toggleH = projectsToggle ? projectsToggle.offsetHeight : 0;
        const bodyPadTop = projectsBody ? (parseFloat(getComputedStyle(projectsBody).paddingTop) || 0) : 0;
        const filterBar = document.getElementById('project-filter-bar');
        const filterH = filterBar ? filterBar.offsetHeight : 0;
        const list = document.getElementById('project-list');
        const listMargin = list ? (parseFloat(getComputedStyle(list).marginTop) || 0) : 0;
        const rowsH = visibleCount * getListRowHeight();
        const edge = getPanelEdgePadding();

        return toggleH + bodyPadTop + filterH + listMargin + rowsH + edge + 2;
    }

    function setProjectsPanelHeight(expanded, instant) {
        if (!panelProjects) return;

        const to = expanded ? getExpandedPanelHeight() : getCompactPanelHeight();

        if (instant) {
            panelProjects.classList.add('is-resizing-instant');
            panelProjects.style.height = to + 'px';
            void panelProjects.offsetHeight;
            panelProjects.classList.remove('is-resizing-instant');
            return;
        }

        const from = panelProjects.getBoundingClientRect().height;
        panelProjects.style.height = from + 'px';
        void panelProjects.offsetHeight;
        panelProjects.style.height = to + 'px';
    }

    function formatCategoryLabel(category) {
        return PROJECT_CATEGORY_LABELS[category] || category;
    }

    function sortProjectsByYear(projects) {
        return projects.slice().sort(function(a, b) {
            return Number(b.year) - Number(a.year);
        });
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
        slashes.forEach(function(slash) {
            slash.style.width = slash.getBoundingClientRect().width + 'px';
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

        entries.forEach(function(entry, index) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'project-filter' + (entry.filter === 'all' ? ' is-active' : '');
            button.dataset.filter = entry.filter;
            button.textContent = entry.label;
            filterBar.appendChild(button);

            if (index < entries.length - 1) {
                const slash = document.createElement('span');
                slash.className = 'project-filter-slash';
                slash.textContent = '/';
                filterBar.appendChild(slash);
            }
        });

        lockFilterItemWidths();
    }

    function navigateToProject(pagePath) {
        const normalize = function(path) {
            return path.replace(/\/$/, '') || '/';
        };
        if (normalize(window.location.pathname) === normalize(pagePath)) {
            window.location.reload();
            return;
        }
        window.location.href = pagePath;
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
                    navigateToProject(pagePath);
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
        if (filterAnimating) return;
        if (list) list.classList.add('is-animated');

        filterAnimating = true;

        if (activeFilter !== 'all') {
            previousCategoryFilter = activeFilter;
        }

        filterButtons.forEach(function(button) {
            button.classList.toggle('is-active', button.dataset.filter === activeFilter);
        });

        listItems.forEach(function(item) {
            const matches = activeFilter === 'all' || item.dataset.category === activeFilter;
            item.style.transitionDelay = '';
            item.classList.toggle('is-hidden', !matches);
        });

        updateProjectYearStyles();

        if (projectsOpen && panelProjects) {
            panelProjects.classList.add('is-filtering');
            setProjectsPanelHeight(true);
            window.clearTimeout(applyProjectFilter.filterHeightTimer);
            applyProjectFilter.filterHeightTimer = window.setTimeout(function() {
                panelProjects.classList.remove('is-filtering');
            }, getProjectListTransitionEndMs());
        }

        window.clearTimeout(applyProjectFilter.resetTimer);
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

        Papa.parse('../projects.csv', {
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
                applyProjectFilter('all');
                initProjectFilterControls();
                setProjectsPanelHeight(false, true);
            },
            error: function() {
                list.classList.remove('is-loading');
                setProjectsPanelHeight(false, true);
            }
        });
    }

    function initProjectImages() {
        const host = document.getElementById('project-images');
        if (!host || typeof Papa === 'undefined' || !currentProject) return;

        const imagesPath = '../alla bilder på hemsidan/';
        const csvPath = imagesPath + 'images.csv';

        Papa.parse(csvPath, {
            download: true,
            header: true,
            skipEmptyLines: true,
            transformHeader: function(header) {
                return String(header || '').replace(/^\uFEFF/, '').trim();
            },
            complete: function(results) {
                const rows = (results.data || []).filter(function(row) {
                    const project = String(row.project || '').trim();
                    const file = String(row.file || '').trim();
                    return file && project === currentProject;
                });

                host.innerHTML = '';
                if (rows.length === 0) return;

                const list = document.createElement('div');
                list.className = 'project-media-list';
                const total = rows.length;

                rows.forEach(function(row, index) {
                    const file = row.file.trim();
                    const orientation = (row.orientation || '').trim().toLowerCase();
                    const description = String(row.description || '').trim();
                    const counter = (index + 1) + '/' + total;

                    const figure = document.createElement('figure');
                    figure.className = 'project-media-item';
                    if (orientation === 'portrait' || orientation === 'landscape') {
                        figure.classList.add('is-' + orientation);
                    }

                    const img = document.createElement('img');
                    img.src = encodeURI(imagesPath + file);
                    img.alt = description;
                    img.draggable = false;

                    const caption = document.createElement('figcaption');
                    caption.textContent = description ? (counter + '  ' + description) : counter;

                    figure.appendChild(img);
                    figure.appendChild(caption);
                    list.appendChild(figure);
                });

                host.appendChild(list);
            }
        });
    }

    function initProjectText() {
        const metaHost = document.getElementById('project-meta');
        const bodyHost = document.getElementById('project-body');
        if ((!metaHost && !bodyHost) || !currentProject) return;

        const textPanel = document.getElementById('panel-project-text');
        if (textPanel && metaHost && bodyHost) {
            const alreadyWrapped = metaHost.parentElement
                && metaHost.parentElement.classList.contains('project-text-sticky');
            if (!alreadyWrapped) {
                const sticky = document.createElement('div');
                sticky.className = 'project-text-sticky';
                textPanel.insertBefore(sticky, metaHost);
                sticky.appendChild(metaHost);
                sticky.appendChild(bodyHost);
            }
        }

        function renderEntry(entry, category) {
            if (!entry) {
                if (metaHost) metaHost.innerHTML = '';
                if (bodyHost) bodyHost.innerHTML = '';
                return;
            }

            if (metaHost) {
                const lines = [];
                const title = typeof entry.title === 'string' ? entry.title.trim() : currentProject;
                if (title) lines.push(title);

                const details = [];
                if (entry.type) details.push('Type: ' + String(entry.type).trim());
                if (entry.location && category !== 'objects' && category !== 'publication') {
                    details.push('Location: ' + String(entry.location).trim());
                }
                if (entry.keywords) details.push('Keywords: ' + String(entry.keywords).trim());
                if (entry.collaboration) details.push(String(entry.collaboration).trim());

                metaHost.textContent = '';
                lines.forEach(function(line, index) {
                    if (index > 0) metaHost.appendChild(document.createElement('br'));
                    metaHost.appendChild(document.createTextNode(line));
                });
                if (details.length) {
                    metaHost.appendChild(document.createElement('br'));
                    metaHost.appendChild(document.createElement('br'));
                    details.forEach(function(line, index) {
                        if (index > 0) metaHost.appendChild(document.createElement('br'));
                        metaHost.appendChild(document.createTextNode(line));
                    });
                }
            }

            if (bodyHost) {
                const body = typeof entry.body === 'string' ? entry.body.trim() : '';
                bodyHost.innerHTML = '';
                if (!body) return;

                body.split(/\n\s*\n/).forEach(function(paragraph) {
                    const text = paragraph.replace(/\s*\n\s*/g, ' ').trim();
                    if (!text) return;
                    const p = document.createElement('p');
                    p.textContent = text;
                    bodyHost.appendChild(p);
                });
            }
        }

        Promise.all([
            fetch('../project-texts.json').then(function(response) {
                if (!response.ok) throw new Error('Failed to load project texts');
                return response.json();
            }),
            new Promise(function(resolve) {
                if (typeof Papa === 'undefined') {
                    resolve('');
                    return;
                }
                Papa.parse('../projects.csv', {
                    download: true,
                    header: true,
                    delimiter: ';',
                    skipEmptyLines: true,
                    complete: function(results) {
                        const row = (results.data || []).find(function(item) {
                            return item.name === currentProject;
                        });
                        resolve(row && row.category ? String(row.category).trim().toLowerCase() : '');
                    },
                    error: function() {
                        resolve('');
                    }
                });
            })
        ]).then(function(results) {
            const data = results[0];
            const category = results[1];
            renderEntry(data && data[currentProject], category);
        }).catch(function() {
            if (metaHost) metaHost.innerHTML = '';
            if (bodyHost) bodyHost.innerHTML = '';
        });
    }

    function toggleProjects(e) {
        e.preventDefault();
        e.stopPropagation();
        if (projectsAnimating) return;

        projectsOpen = !projectsOpen;
        projectsAnimating = true;
        panelProjects.classList.toggle('is-expanded', projectsOpen);
        blinkLabel(projectsToggle);
        setProjectsPanelHeight(projectsOpen);

        window.setTimeout(function() {
            projectsAnimating = false;
        }, PANEL_EXPAND_MS);
    }

    if (homeLink) {
        homeLink.addEventListener('click', function(e) {
            e.preventDefault();
            blinkLabel(homeLink);
            window.setTimeout(function() {
                window.location.href = '/';
            }, LABEL_BLINK_MS);
        });
    }

    if (projectsToggle) {
        projectsToggle.addEventListener('click', toggleProjects);
    }

    window.addEventListener('resize', function() {
        lockFilterItemWidths();
        setProjectsPanelHeight(projectsOpen, true);
    });

    setProjectsPanelHeight(false, true);
    initProjectList();
    initProjectImages();
    initProjectText();
})();
