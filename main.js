// ==========================================================================
// SHALOM MENDIETA — main.js
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // ── Loader ──────────────────────────────────────────────────────────────
    const loader = document.getElementById('loader');
    const body   = document.body;

    const hideLoader = () => {
        loader.classList.add('hidden');
        body.classList.remove('loading');
    };

    // Wait for fonts + min time
    Promise.all([
        document.fonts.ready,
        new Promise(res => setTimeout(res, 1800))
    ]).then(hideLoader);

    // ── Nav scroll state ────────────────────────────────────────────────────
    const nav = document.getElementById('mainNav');

    const tickNav = () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
    };

    window.addEventListener('scroll', tickNav, { passive: true });
    tickNav();

    // ── Hero Parallax ───────────────────────────────────────────────────────
    const heroBg = document.querySelector('.hero-bg');

    window.addEventListener('scroll', () => {
        if (!heroBg || window.scrollY > window.innerHeight) return;
        heroBg.style.transform = `translateY(${window.scrollY * 0.3}px)`;
    }, { passive: true });

    // ── Scroll Reveal ───────────────────────────────────────────────────────
    const revealEls = document.querySelectorAll('.fade-up, .reveal-left, .reveal-right');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealEls.forEach(el => observer.observe(el));

    // ── Smooth Scroll ───────────────────────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const target = document.querySelector(link.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const y = target.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: 'smooth' });
        });
    });

    // ── Mobile Menu ─────────────────────────────────────────────────────────
    const toggle  = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    let mobileOpen = false;

    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            mobileOpen = !mobileOpen;
            if (mobileOpen) {
                navLinks.style.cssText = `
                    display: flex;
                    flex-direction: column;
                    position: absolute;
                    top: 100%;
                    left: 0; right: 0;
                    background: var(--c-bg);
                    padding: 2rem var(--gutter);
                    gap: 1.5rem;
                    border-top: 1px solid rgba(0,0,0,0.07);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.06);
                `;
            } else {
                navLinks.removeAttribute('style');
            }
        });
    }

    // ── Newsletter ──────────────────────────────────────────────────────────
    const form = document.getElementById('newsletterForm');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const input = form.querySelector('input');
            btn.textContent = '¡Suscrito!';
            btn.style.background = '#2d7a45';
            input.value = '';
            setTimeout(() => {
                btn.textContent = 'Suscribirse';
                btn.style.background = '';
            }, 3500);
        });
    }

});
