// ======================
// Terminal Typing Effect
// ======================
const terminalTexts = [
    "$ nmap -sV --script vuln [TARGET]",
    "$ msfconsole -q -x 'use exploit/multi/handler'",
    "$ python3 exploit.py --rhost 10.10.10.10",
    "$ bloodhound-python -d [DOMAIN] -u [USER] -p [PASS]",
    "$ john --wordlist=rockyou.txt hash.txt"
];

function initTerminalEffect() {
    let currentText = 0;    
    let charIndex = 0;
    let isDeleting = false;
    const terminalElement = document.querySelector('.terminal-text');
    const cursorElement = document.querySelector('.cursor');

    function type() {
        const text = terminalTexts[currentText];
        
        if (isDeleting) {
            terminalElement.textContent = text.substring(0, charIndex - 1);
            charIndex--;
            
            if (charIndex === 1) {
                isDeleting = false;
                currentText = (currentText + 1) % terminalTexts.length;
                setTimeout(type, 500);
            } else {
                setTimeout(type, 50);
            }
        } else {
            terminalElement.textContent = text.substring(0, charIndex + 1);
            charIndex++;
            
            if (charIndex === text.length) {
                isDeleting = true;
                setTimeout(type, 2000);
            } else {
                setTimeout(type, Math.random() * 100 + 50);
            }
        }
    }

    setTimeout(type, 1000);
}

// ======================
// Modern Contact Form
// ======================
async function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) {
        console.warn('Contact form not found - element with ID "contact-form" missing');
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Safely get all required elements
        const formContainer = document.getElementById('contact-form-container');
        const thankYouMessage = document.getElementById('thank-you');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Basic element verification
        if (!formContainer || !thankYouMessage || !submitBtn) {
            console.error('Form elements missing:', {
                formContainer: !!formContainer,
                thankYouMessage: !!thankYouMessage,
                submitBtn: !!submitBtn
            });
            return;
        }

        // Honeypot check
        const honeypot = document.getElementById('website');
        if (honeypot && honeypot.value) {
            return false;
        }

        // Get form data
        const formData = new FormData(form);
        const contactValue = formData.get('contact') || '';

        // Validate input
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactValue);
        const isDiscord = /^[a-zA-Z0-9_\.]{2,32}$/.test(contactValue);

        if (!isEmail && !isDiscord) {
            alert('Please enter a valid email or Discord username');
            return;
        }

        // Prepare Formspree submission
        const submissionData = new FormData();
        submissionData.append('name', formData.get('name') || '');
        submissionData.append('message', formData.get('message') || '');
        submissionData.append('_subject', 'New Contact from Portfolio');
        submissionData.append('email', isEmail ? contactValue : 'no-reply@example.com');
        if (!isEmail) {
            submissionData.append('discord', contactValue);
        }

        // UI Loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            // Send to Formspree
            const response = await fetch('https://formspree.io/f/mgvazzrw', {
                method: 'POST',
                body: submissionData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                // Success handling
                formContainer.style.display = 'none';
                thankYouMessage.style.display = 'block';
                
                // Update success message
                const contactDisplay = document.querySelector('.thank-you-message p:last-child');
                if (contactDisplay) {
                    contactDisplay.textContent = `I'll contact you via ${isEmail ? 'email' : 'Discord'}.`;
                }
                
                form.reset();
            } else {
                throw new Error(await response.text());
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert('Message sent successfully! You may close this page.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Securely';
        }
    });
}
// ======================
// Dynamic Projects Loader
// ======================
let allProjects = [];
let visibleProjectsCount = 6;

async function loadAndRenderProjects() {
    const projectsGrid = document.querySelector('.projects-grid');
    if (!projectsGrid) return;

    // Reset state
    visibleProjectsCount = 6;
    
    // Show loading state
    projectsGrid.classList.add('loading');

    try {
        const response = await fetch('projects.json');
        if (!response.ok) throw new Error('Network response was not ok');
        
        allProjects = await response.json();
        renderFilteredProjects();
        initProjectFilters(allProjects);
        
    } catch (error) {
        console.error('Failed to load projects:', error);
        projectsGrid.innerHTML = `
            <div class="error-message">
                <p>⚠️ Failed to load projects. <a href="javascript:location.reload()">Try again</a></p>
            </div>
        `;
    } finally {
        projectsGrid.classList.remove('loading');
    }
}

function renderFilteredProjects(filterValue = 'all') {
    const filteredProjects = filterValue === 'all' 
        ? allProjects 
        : allProjects.filter(project => project.tags.includes(filterValue));
    
    const projectsToShow = filteredProjects.slice(0, visibleProjectsCount);
    renderProjects(projectsToShow, filteredProjects.length);
}

function renderProjects(projects, totalProjectsCount) {
    const grid = document.querySelector('.projects-grid');
    grid.innerHTML = projects.map(project => `
        <div class="project-card glass-card" data-tags="${project.tags.join(' ')}">
            <div class="project-img">${project.image || '[Project Image]'}</div>
            <div class="project-content">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="project-links">
                    ${project.links?.map(link => `
                        <a href="${link.url}" 
                           class="btn ${link.text.includes('View') ? 'btn-primary' : 'btn-secondary'}" 
                           ${link.url.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}
                           ${link.url === '#' ? 'onclick="return false;"' : ''}>
                            ${link.text}
                        </a>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');

    // Load More Button nur anzeigen wenn mehr Projekte vorhanden sind
    const container = document.querySelector('.projects-grid').parentElement;
    const existingBtn = container.querySelector('.load-more-btn');
    if (existingBtn) existingBtn.remove();

    if (projects.length < totalProjectsCount) {
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.className = 'btn load-more-btn';
        loadMoreBtn.textContent = 'Load More Projects';
        loadMoreBtn.addEventListener('click', () => {
            visibleProjectsCount += 6;
            renderFilteredProjects(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
        });
        container.appendChild(loadMoreBtn);
    }
}

function initProjectFilters(projects) {
    const filtersContainer = document.querySelector('.project-filters');
    if (!filtersContainer) return;

    // Get all unique tags from projects
    const allTags = [...new Set(projects.flatMap(p => p.tags))];
    
    // Create filter buttons
    filtersContainer.innerHTML = `
        <button class="filter-btn active" data-filter="all">All</button>
        ${allTags.map(tag => `
            <button class="filter-btn" data-filter="${tag}">
                ${tag.charAt(0).toUpperCase() + tag.slice(1)}
            </button>
        `).join('')}
    `;

    // Add event listeners
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Reset visible count when filter changes
            visibleProjectsCount = 6;
            renderFilteredProjects(btn.dataset.filter);
        });
    });
}

const initProjectPageAnimations = () => {
    const sections = document.querySelectorAll('.project-section');
    if (sections.length === 0) return; // Only run on project pages
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        observer.observe(section);
    });

    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();
};

// Reset when scrolling away
function handleScrollReset() {
    const projectsSection = document.getElementById('projects');
    if (!projectsSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                // Reset when scrolling away
                visibleProjectsCount = 6;
                renderFilteredProjects(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
            }
        });
    }, { threshold: 0.1 });

    observer.observe(projectsSection);
}

// Debounce für Resize/Scroll-Events
function debounce(func, wait = 100) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
}

// Bild-Lazy-Loading
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('[data-bg]');
    const imgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.background = img.dataset.bg;
                imgObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imgObserver.observe(img));
}

// Debounce für Resize/Scroll-Events
function debounce(func, wait = 100) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
}

// Bild-Lazy-Loading
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('[data-bg]');
    const imgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.background = img.dataset.bg;
                imgObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imgObserver.observe(img));
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    initTerminalEffect();
    initContactForm();
    loadAndRenderProjects();
    handleScrollReset();
    initProjectPageAnimations();
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});