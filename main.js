// ==========================================================================
// SHALOM MENDIETA — main.js
// ==========================================================================
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Three.js Scene setup ────────────────────────────────────────────────
class SceneManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error("Canvas element not found");
            return;
        }

        // Setup Scene, Camera, Renderer
        this.scene = new THREE.Scene();
        // Transparent scene so CSS backgrounds and images show through
        this.scene.background = null; 
        // Optional subtle fog to fade out particles far away
        this.scene.fog = new THREE.FogExp2('#0A0906', 0.02);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.z = 15;
        this.camera.position.y = 5;
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Use standard clock to avoid deprecation warnings
        this.clock = new THREE.Clock();
        this.objects = [];

        this.initScene();
        this.setupScrollAnimation();

        // Mouse interaction
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetX = 0;
        this.targetY = 0;

        document.addEventListener('mousemove', (event) => {
            // Normalize mouse coordinates from -1 to 1
            this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        // Handle Resize
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        
        // Start Render Loop
        this.animate();
    }

    initScene() {
        // Create an organic particle system (Tierra vibe)
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 2000;
        
        const posArray = new Float32Array(particleCount * 3);
        const colorArray = new Float32Array(particleCount * 3);
        
        // Tierra / Madera / Agua Color Palette
        const colors = [
            new THREE.Color('#D4AF37'), // Gold
            new THREE.Color('#8B5A2B'), // Wood/Leather
            new THREE.Color('#1E3A5F'), // Deep Agua Blue (Hero Mask)
            new THREE.Color('#4682B4'), // Steel Blue
            new THREE.Color('#F5DEB3')  // Wheat/Sand
        ];

        for(let i = 0; i < particleCount * 3; i+=3) {
            // Distribute particles in a wide, wavy cylinder/terrain
            const radius = 20 + Math.random() * 15;
            const theta = Math.random() * Math.PI * 2;
            const y = (Math.random() - 0.5) * 40;
            
            posArray[i] = Math.cos(theta) * radius;     // x
            posArray[i+1] = y;                          // y
            posArray[i+2] = Math.sin(theta) * radius;   // z

            const color = colors[Math.floor(Math.random() * colors.length)];
            colorArray[i] = color.r;
            colorArray[i+1] = color.g;
            colorArray[i+2] = color.b;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.08, // Smaller, more delicate size
            vertexColors: true,
            transparent: true,
            opacity: 0.8, // Reverted to elegant opacity
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.particleMesh = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.particleMesh);
        this.objects.push(this.particleMesh);

        // Add some floating organic shapes (Stacked Square Pyramids)
        const pyramidColors = ['#1B4332', '#1E3A5F']; // Tierra Green and Agua Blue
        
        for(let i = 0; i < 6; i++) {
            const stackGroup = new THREE.Group();
            
            // Create a small stack of 2 pyramids
            for(let j = 0; j < 2; j++) {
                const size = 1.2 - (j * 0.4);
                const geo = new THREE.ConeGeometry(size, size * 1.5, 4); // 4 segments = square base
                const mat = new THREE.MeshBasicMaterial({ 
                    color: pyramidColors[(i + j) % pyramidColors.length],
                    wireframe: true,
                    transparent: true,
                    opacity: 0.25 
                });
                
                const pyramid = new THREE.Mesh(geo, mat);
                pyramid.position.y = j * (size * 0.8);
                stackGroup.add(pyramid);
            }

            stackGroup.position.set(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 20
            );
            
            stackGroup.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            // Random floating speed factor
            stackGroup.userData = {
                speedY: (Math.random() - 0.5) * 0.012,
                speedX: (Math.random() - 0.5) * 0.012,
                rotSpeed: (Math.random() - 0.5) * 0.008
            };
            
            this.scene.add(stackGroup);
            this.objects.push(stackGroup);
        }


    }

    setupScrollAnimation() {
        const isMobile = window.innerWidth <= 768;
        
        // Hero Image Parallax - Preserving final ultra-refined scale and position
        gsap.to(".hero-img", {
            y: 40 + (window.innerHeight * 0.1), // Base 40px offset + parallax movement
            scale: isMobile ? 1.05 : 1.02,
            xPercent: isMobile ? 0 : 25, 
            ease: "none",
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });







        // 3D Particles Scroll Interaction
        gsap.to(this.particleMesh.rotation, {
            y: Math.PI * 2,
            ease: "none",
            scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "bottom bottom",
                scrub: 1 // Smooth scrubbing
            }
        });

        gsap.to(this.camera.position, {
            y: -10, // Move camera down subtly as page scrolls
            ease: "none",
            scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5
            }
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        const elapsedTime = this.clock.getElapsedTime();

        // Mouse interaction lerping
        this.targetX = this.mouseX * 0.5;
        this.targetY = this.mouseY * 0.5;

        // Slow idle rotation + mouse interaction for the particle mesh
        if (this.particleMesh) {
            this.particleMesh.rotation.y += 0.0005 + (this.targetX - this.particleMesh.rotation.y) * 0.02;
            this.particleMesh.rotation.x += (this.targetY - this.particleMesh.rotation.x) * 0.02;
        }

        // Idle animation for floating objects
        this.objects.forEach(obj => {
            if (obj.type === 'Mesh' || obj.type === 'Group') {
                obj.rotation.x += obj.userData.speedX || 0;
                obj.rotation.y += obj.userData.speedY || 0;
                obj.rotation.z += obj.userData.rotSpeed || 0;
                obj.position.y += Math.sin(elapsedTime * (obj.userData.speedY || 0.01) * 50) * 0.01;
            }
        });

        
        this.renderer.render(this.scene, this.camera);
    }
}

// ── DOM Logic ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // Initialize 3D Scene
    const sceneManager = new SceneManager('webgl-canvas');

    // ── Loader ──────────────────────────────────────────────────────────────
    const loader = document.getElementById('loader');
    const body   = document.body;

    const hideLoader = () => {
        if(loader) loader.classList.add('hidden');
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
        if(nav) nav.classList.toggle('scrolled', window.scrollY > 50);
    };

    window.addEventListener('scroll', tickNav, { passive: true });
    tickNav();

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
            const href = link.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            // If menu is open, we need to wait for the scroll lock to be released
            // before calculating the target's position.
            const timeout = (navLinks && navLinks.classList.contains('active')) ? 100 : 0;

            setTimeout(() => {
                const y = target.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }, timeout);
        });
    });


    // ── Mobile Menu ─────────────────────────────────────────────────────────
    const toggle  = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            const isActive = navLinks.classList.toggle('active');
            toggle.classList.toggle('active');
            document.documentElement.classList.toggle('no-scroll');
            document.body.classList.toggle('no-scroll');
            
            // Aggressive scroll lock for mobile
            if (isActive) {
                document.body.style.top = `-${window.scrollY}px`;
                document.body.style.position = 'fixed';
                document.body.style.width = '100%';
            } else {
                const scrollY = document.body.style.top;
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        });

        // Close when clicking links
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                // Remove fixed body first to allow immediate scroll calculation
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.classList.remove('no-scroll');
                document.documentElement.classList.remove('no-scroll');
                
                navLinks.classList.remove('active');
                toggle.classList.remove('active');
            });
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
