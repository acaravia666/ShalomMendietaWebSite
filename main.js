/**
 * main.js
 * Core logic for editorial scroll animations and parallax.
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Cinematic Loader & Splash Screen
    const loader = document.getElementById('loader');
    
    // Smooth, slightly longer load for a "studio" feel
    setTimeout(() => {
        if(loader) loader.classList.add('hidden');
        document.body.classList.remove('loading');
        document.body.classList.add('loaded'); // Triggers cinematic hero sequences
        
        initScrollAnimations();
        initParallaxEffects();
    }, 1800);

    // 2. Intersection Observer for Smooth Reveals
    function initScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15 // Reveal when element is 15% visible
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Stop observing once revealed to retain the final state
                    observer.unobserve(entry.target); 
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll('.reveal-up');
        animatedElements.forEach(el => observer.observe(el));
    }

    // 3. Advanced Parallax for Images
    function initParallaxEffects() {
        const parallaxBgs = document.querySelectorAll('.parallax-bg');
        const parallaxImgs = document.querySelectorAll('.parallax-img');
        const heroBg = document.querySelector('.hero-image-placeholder');
        
        // Use requestAnimationFrame for smooth jank-free scrolling
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    
                    // Subtle hero parallax
                    if (heroBg && scrollY < window.innerHeight) {
                        heroBg.style.transform = `translateY(${scrollY * 0.25}px) scale(1.05)`;
                    }

                    // Gallery Background Parallax (Moves slower than scroll)
                    parallaxBgs.forEach(bg => {
                        const parent = bg.closest('.gallery-item');
                        if (!parent) return;

                        const rect = parent.getBoundingClientRect();
                        // Only animate if in viewport
                        if(rect.top < window.innerHeight && rect.bottom > 0) {
                            const offset = (window.innerHeight - rect.top) * 0.1;
                            bg.style.transform = `translateY(${offset}px) scale(1.15)`;
                        }
                    });

                    // Editorial Spread Image Parallax (Moves slightly up)
                    parallaxImgs.forEach(img => {
                        const rect = img.getBoundingClientRect();
                        if(rect.top < window.innerHeight && rect.bottom > 0) {
                            const offset = rect.top * 0.05;
                            img.style.transform = `translateY(${offset}px)`;
                        }
                    });

                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // 4. Smooth Scrolling for Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Adjust for fixed nav padding
                const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY - 100;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 5. Portfolio Carousel Drag to Scroll
    const slider = document.querySelector('.carousel-container');
    if (slider) {
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.style.cursor = 'grabbing';
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });
        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.style.cursor = 'grab';
        });
        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.style.cursor = 'grab';
        });
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2; // Scroll-fast multiplier
            slider.scrollLeft = scrollLeft - walk;
        });
    }

});
