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

        // Mouse interaction lerping
        this.targetX = this.mouseX * 0.5;
        this.targetY = this.mouseY * 0.5;

        // Slow idle rotation + mouse interaction for the particle mesh
        if (this.particleMesh) {
            this.particleMesh.rotation.y += 0.0005 + (this.targetX - this.particleMesh.rotation.y) * 0.02;
            this.particleMesh.rotation.x += (this.targetY - this.particleMesh.rotation.x) * 0.02;
        }

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

    // ── Video Gallery Logic ────────────────────────────────────────────────
    const videoData = {
        trigueno: {
            id: 'IpIGQGSRSVc',
            sinopsis: 'Obligado a abandonar la selva en la que nació, Luciano carga en sus manos su propio corazón. Desde lo profundo de la tierra, el canto de Eloísa despierta una criatura que ayuda a Luciano a atravesar la jungla. Ya en el límite del bosque, él entierra su corazón en agradecimiento. Aunque el dolor persiste, él comprende que dejar su hogar es el primer paso hacia una nueva vida.',
            letra: `En el mismo lugar te esperaré\nAunque te vayas hoy aquí estaré\n\nNo vayas lejos que aquí te espero\nTrigueño ven con tu pueblo\nNo vayas lejos que aquí te espero\nTrigueño ven con tu pueblo\n\nNo olvides de donde viniste\nPa' guiarte bien a dónde vas\nNo olvides del árbol sus raíces\nLa cosecha por ellas se da\n\nNo vayas lejos que aquí te espero\nTrigueño ven con tu pueblo\nNo vayas lejos que aquí te espero\nTrigueño ven con tu pueblo\n\nNo olvides de donde viniste\nPa' guiarte bien a dónde vas\nNo olvides del árbol sus raíces\nLa cosecha por ellas se da\n\nEn el mismo lugar te esperaré\nAunque te vayas hoy aquí estaré\n\nTrigueño de brazos fuertes\nme dicen que te dicen\nCosteño no vayas lejos que en la playa\nTú naciste`,
            agradecimientos: 'Joe Houldberg\nFabián Sempértegui\nJosué Córdova\nRamiro Alcocer\nJimmy Herrera\nJuan Simbaña (padre)\nJuan Simbaña (hijo)\n“Las Montañas” Reserva Ecoturística, Mindo, Pichincha\nCabañas “Roca Mía” Mindo, Pichincha',
            creditos: 'Composición: Shalom Mendieta\nProducción beat y synths: Daniel Espinosa\nArreglos: Daniel Espinosa, Andrés Cuartas\nMezcla y Máster: Javier Marín\nGrabación y edición: Jean Pierre Salazar\nGuitarras y cuatro venezolano: Andrés Cuartas\nBatería y percusiones: Bryan Hidalgo\nMarimba: Kevin Santos\nCoros: Gerson Eguiguren, Esther Chiriboga, Shalom Mendieta\n\nCréditos de la obra visual:\n\nJalea Films: @jaleafilms\n\nGuión y Dirección: Joaquín Proaño\nAsist. de Dirección: Diana Guanín\nProducción: Santiago Beltrán, Ricardo Sempértegui\nAsist. de Producción: David Geller\nProducción Ejecutiva: Paola Rodríguez\nDir. de Fotografía: Daniel Rosero\n1er Asist. de Cámara: Christian Terán\nGaffer: Isis Pazmiño\nDir. de Arte: César Cárdenas\n1er Asist. de Arte: Andree Escarlata\nMaquillaje y Vestuario: Zaffya Loza\nCast: Shalom Mendieta, Edison Galván, David Geller\nMontaje: Joaquín Proaño\nColorización: Daniel Rosero'
        },
        enmipiel: {
            id: '3pOaQZRvLXg',
            sinopsis: 'Encerrada en una casa deshabitada, cubierta por plástico como si fuera un mueble más, Eloísa parece suspendida en el tiempo, prisionera en su propio cuerpo. Al despertar, comienza su lucha por liberarse de una segunda piel que no le pertenece.\nCada intento de Eloísa por zafarse del velo que la envuelve, la aleja de la casa que la mantiene prisionera. El escape se convierte en un ritual de renacimiento doloroso, donde la sangre se mezcla con el plástico.',
            letra: `Déjame escribirte en papel\nDéjame guardar tu memoria\nTu olor sigue en mi piel\nSigue en pie nuestra historia\n\nEl miedo a perderte\nMe obliga a cantarte\n\nAhora vive en mi piel tu memoria\nSe siente en el aire\nNo es dueña de nadie\n\nSigue marcando un después tu historia\nEl silencio se rompe al escuchar tu nombre\n\nAhora vive en mi piel tu memoria\nSe siente en el aire\nNo es dueña de nadie\n\nSigue marcando un después tu historia\n\nUn recuerdo que olvidaré\nEl eterno adiós de tu boca\nY aunque tatuada esté mi piel\nEl olvido me sabe a gloria\n\nEl miedo a perderte\nMe obliga a cantarte\n\nEl miedo a perderme\nMe obliga a cantarme\n\nAhora vive en mi piel tu memoria\nSe siente en el aire\nNo es dueña de nadie\n\nSigue marcando un después tu historia\nEl silencio se rompe al escuchar tu nombre\n\nAhora vive en mi piel tu memoria\nSe siente en el aire\nNo es dueña de nadie\n\nSigue marcando un después tu historia\nEl silencio me rompe.`,
            agradecimientos: 'Joe Houlberg\nFabian Sempértegui\nJimmy Herrera\nAdrián Cevallos\nCruz',
            creditos: 'Composición, letra: Shalom Mendieta\nProducción y programación: Daniel Espinosa\nArreglos: Daniel Espinosa, Andrés Cuartas\nGrabación: Jean Pierre Salazar, Daniel Espinosa, Nacho Freire\nEdición: Jean Pierre Salazar, Daniel Espinosa\nMezcla y Máster: Javier Marín\nPercusión: Bryan Hidalgo\nBajo: Aryam Varona\nGuitarras: Andrés Cuartas\nCharango y quenas: Stalyn Aguirre\nCuerdas: Felipe Aizaga, Gerson Eguiguren, Emilia Vasquez, Mario Martínez.\nCoros: Gerson Eguiguren, Shalom Mendieta\nEstudios: Mz14 (GYE) Graba Estudio (UIO)\n\nCRÉDITOS DE LA OBRA VISUAL:\n\nDirección y guión: Joaquín Proaño\nAsist. de dirección: Diana Guanín\nProducción: Santiago Beltrán. Ricardo Sempértegui\nAsist. de producción: David Geller\nDir. de fotografía: Daniel Rosero\n1re Asist. de cámara: Christian Terán\nGaffer: Isis Pazmiño\nGrip: Tomás Cruz\nDir. de arte: César Crdenas\n1re Asist. de arte: Betsabé Almeida\nMaquillaje y Vestuario: Zaffya Loza\nAsist. Vestuario y Arte: Jenn Rojas\nCast: Shalom Mendieta\nMontaje: Joaquín Proaño\nColorización: Daniel Rosero'
        }


    };




    const videoCards = document.querySelectorAll('.video-side-card');
    const iframe = document.getElementById('mainVideoIframe');
    const tabBtns = document.querySelectorAll('.video-tab-btn');
    const tabContents = document.querySelectorAll('.video-tab-content');
    
    let currentVideo = 'trigueno';

    const updateGallery = (videoKey, isAutoInit = false) => {
        const data = videoData[videoKey];
        if (!data) return;

        currentVideo = videoKey;

        // Update active card
        videoCards.forEach(card => card.classList.toggle('active', card.dataset.video === videoKey));

        // Update Iframe (skip autoplay on auto initialization to save bandwidth/annoyance)
        if (!isAutoInit) {
            iframe.src = `https://www.youtube.com/embed/${data.id}?rel=0&autoplay=1`;
        } else {
            iframe.src = `https://www.youtube.com/embed/${data.id}?rel=0`;
        }

        // Update tab contents
        document.getElementById('tab-sinopsis').querySelector('p').textContent = data.sinopsis;
        document.getElementById('tab-letra').querySelector('p').textContent = data.letra;
        document.getElementById('tab-agradecimientos').querySelector('p').textContent = data.agradecimientos;
        document.getElementById('tab-creditos').querySelector('p').textContent = data.creditos;
    };




    videoCards.forEach(card => {
        card.addEventListener('click', () => {
            const videoKey = card.dataset.video;
            updateGallery(videoKey);
        });
    });

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // Switch button state
            tabBtns.forEach(b => b.classList.toggle('active', b === btn));
            
            // Switch content state
            tabContents.forEach(content => {
                const isActive = content.id === `tab-${targetTab}`;
                content.classList.toggle('active', isActive);
            });
        });
    });


    // Initialize with default video content
    updateGallery('trigueno', true);


    // ── Gallery Lightbox ────────────────────────────────────────────────────
    const lightbox         = document.getElementById('lightbox');
    const lightboxImg      = document.getElementById('lightboxImg');
    const lightboxDownload = document.getElementById('lightboxDownload');
    const lightboxClose    = document.getElementById('lightboxClose');

    document.querySelectorAll('.gallery-img').forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightboxDownload.href = img.src;
            lightbox.classList.add('active');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        });
    });

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeLightbox();
    });

    // ── Service Card Interaction ────────────────────────────────────────────
    const serviceSingle    = document.getElementById('serviceSingle');
    const serviceCardFront = document.getElementById('serviceCardFront');
    const serviceCardDetail = document.getElementById('serviceCardDetail');
    const serviceClose     = document.getElementById('serviceClose');

    if (serviceCardFront && serviceSingle && serviceCardDetail) {
        serviceCardFront.addEventListener('click', () => {
            if (serviceSingle.classList.contains('open')) return;
            serviceCardDetail.classList.add('is-open');
            serviceSingle.classList.add('open');
        });
    }

    if (serviceClose && serviceSingle && serviceCardDetail) {
        serviceClose.addEventListener('click', (e) => {
            e.stopPropagation();
            serviceSingle.classList.remove('open');
            serviceCardDetail.classList.remove('is-open');
        });
    }

    // ── Booking Card Interaction ────────────────────────────────────────────
    const bookingSingle     = document.getElementById('bookingSingle');
    const bookingCardFront  = document.getElementById('bookingCardFront');
    const bookingCardDetail = document.getElementById('bookingCardDetail');
    const bookingClose      = document.getElementById('bookingClose');

    if (bookingCardFront && bookingSingle && bookingCardDetail) {
        bookingCardFront.addEventListener('click', () => {
            if (bookingSingle.classList.contains('open')) return;
            bookingCardDetail.classList.add('is-open');
            bookingSingle.classList.add('open');
        });
    }

    if (bookingClose && bookingSingle && bookingCardDetail) {
        bookingClose.addEventListener('click', (e) => {
            e.stopPropagation();
            bookingSingle.classList.remove('open');
            bookingCardDetail.classList.remove('is-open');
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
            btn.classList.add('btn--success');
            input.value = '';
            setTimeout(() => {
                btn.textContent = 'Suscribirse';
                btn.classList.remove('btn--success');
            }, 3500);
        });
    }

});
