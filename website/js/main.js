// GistPreview Website Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                if (navLinks) navLinks.classList.remove('active');
                if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
            }
        });
    });
    
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe feature cards, content cards, and steps
    document.querySelectorAll('.feature-card, .content-card, .step, .tech-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
    
    // Add visible class styles
    const style = document.createElement('style');
    style.textContent = `
        .feature-card.visible,
        .content-card.visible,
        .step.visible,
        .tech-item.visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
    
    // Demo animation - typing effect
    const demoCommands = [
        { cmd: 'git psuh', error: 'git: \'psuh\' is not a git command.', suggestion: 'git push' },
        { cmd: 'npm instal', error: 'Unknown command: "instal"', suggestion: 'npm install' },
        { cmd: 'cta /etc/hosts', error: 'command not found: cta', suggestion: 'cat /etc/hosts' }
    ];
    
    let currentDemo = 0;
    const demoCommand = document.getElementById('demoCommand');
    const demoError = document.getElementById('demoError');
    const demoSuggestion = document.getElementById('demoSuggestion');
    
    // File tab interaction in demo
    const fileTabs = document.querySelectorAll('.file-tab');
    fileTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            fileTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
    
    // Copy code functionality (if any code blocks with copy buttons are added later)
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const text = btn.getAttribute('data-copy');
            if (text) {
                try {
                    await navigator.clipboard.writeText(text);
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
                    setTimeout(() => {
                        btn.innerHTML = originalHTML;
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy:', err);
                }
            }
        });
    });
    
    // Performance: Lazy load images
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
    
    // Console welcome message
    console.log('%c🔍 GistPreview', 'font-size: 24px; font-weight: bold; color: #14b8a6;');
    console.log('%cTransform GitHub Gists into beautiful web pages', 'font-size: 14px; color: #94a3b8;');
    console.log('%chttps://github.com/animeshkundu/gist-preview', 'font-size: 12px; color: #64748b;');
});
