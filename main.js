// ==========================================================================
// SHALOM MENDIETA — main.js
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // ── Loader ──────────────────────────────────────────────────────────────
    const loader = document.getElementById('loader');
    const body   = document.body;

    setTimeout(() => {
        loader.classList.add('hidden');
        body.classList.remove('loading');
    }, 1800);

    // ── Navigation (scroll state) ───────────────────────────────────────────
    const nav = document.getElementById('mainNav');

    const updateNav = () => {
        nav.classList.toggle('scrolled', window.scrollY > 60);
    };

    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();

    // ── Hero Parallax ───────────────────────────────────────────────────────
    const heroBg = document.getElementById('heroBg');

    window.addEventListener('scroll', () => {
        if (!heroBg) return;
        const scrollY = window.scrollY;
        if (scrollY < window.innerHeight) {
            heroBg.style.transform = `translateY(${scrollY * 0.35}px)`;
        }
    }, { passive: true });

    // ── Scroll Reveal (Intersection Observer) ───────────────────────────────
    const revealEls = document.querySelectorAll('.fade-up');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(el => revealObserver.observe(el));

    // ── Smooth Scroll for anchor links ──────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ── Mobile Menu Toggle ──────────────────────────────────────────────────
    const menuToggle = document.getElementById('menuToggle');
    const navLinks   = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const open = navLinks.style.display === 'flex';
            navLinks.style.display = open ? '' : 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.right = '0';
            navLinks.style.background = 'var(--c-bg)';
            navLinks.style.padding = '1.5rem 2rem';
            navLinks.style.gap = '1.2rem';
            navLinks.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
            if (open) navLinks.removeAttribute('style');
        });
    }

    // ── Newsletter Form ─────────────────────────────────────────────────────
    const form = document.getElementById('newsletterForm');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const input = form.querySelector('input');
            const btn   = form.querySelector('button');
            btn.textContent = '¡Listo!';
            btn.style.background = '#2d7a45';
            input.value = '';
            setTimeout(() => {
                btn.textContent = 'Suscribirse';
                btn.style.background = '';
            }, 3000);
        });
    }

});
