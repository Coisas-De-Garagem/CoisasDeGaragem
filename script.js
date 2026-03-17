// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// DOM Elements
const navbar = document.querySelector('.navbar');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const pdfModal = document.getElementById('pdf-modal');
const pdfFrame = document.getElementById('pdf-frame');
const modalTitle = document.getElementById('modal-title');
let currentPDF = '';

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initHeroAnimations();
    initNavbarScroll();
    initDocumentCardsAnimation();
    initAboutSectionAnimation();
    initFloatingShapes();
    initMobileMenu();
    initFooterYear();
});

// Hero Section Animations
function initHeroAnimations() {
    const tl = gsap.timeline();

    tl.to('.hero-title', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power4.out'
    })
    .to('.hero-subtitle', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out'
    }, '-=0.6')
    .to('.cta-button', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'elastic.out(1, 0.8)'
    }, '-=0.6');
}

// Navbar scroll effect
function initNavbarScroll() {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Document Cards Animation
function initDocumentCardsAnimation() {
    const cards = document.querySelectorAll('.document-card');
    
    // Set initial state for animations
    gsap.set(cards, { opacity: 0, y: 40 });

    ScrollTrigger.batch(cards, {
        onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: 'back.out(1.7)' }),
        onLeaveBack: batch => gsap.set(batch, { opacity: 0, y: 40 }),
        start: 'top 95%'
    });

    // Add individual hover effects
    cards.forEach(card => {
        const icon = card.querySelector('.card-icon');
        card.addEventListener('mouseenter', () => {
            gsap.to(icon, {
                scale: 1.15,
                rotate: 8,
                duration: 0.4,
                ease: 'power2.out'
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(icon, {
                scale: 1,
                rotate: 0,
                duration: 0.4,
                ease: 'power2.out'
            });
        });
    });
}

// About Section Animation
function initAboutSectionAnimation() {
    gsap.from('.about-text', {
        scrollTrigger: {
            trigger: '.about-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        x: -50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });

    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const finalValue = stat.textContent;
        const isPercentage = finalValue.includes('%');
        const numericValue = parseInt(finalValue) || 0;
        
        stat.textContent = '0' + (isPercentage ? '%' : '');

        gsap.to(stat, {
            scrollTrigger: {
                trigger: '.about-stats',
                start: 'top 90%',
                toggleActions: 'play none none reverse'
            },
            innerText: numericValue,
            duration: 2.5,
            ease: 'power2.out',
            snap: { innerText: 1 },
            onUpdate: function() {
                const val = Math.floor(stat.innerText);
                stat.textContent = val + (isPercentage ? '%' : '');
            }
        });
    });
}

// Floating Background Shapes Animation
function initFloatingShapes() {
    const shapes = document.querySelectorAll('.shape');
    
    shapes.forEach((shape, index) => {
        gsap.to(shape, {
            x: 'random(-60, 60)',
            y: 'random(-60, 60)',
            scale: 'random(0.9, 1.3)',
            duration: 'random(5, 8)',
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: index * 0.7
        });
    });
}

// Mobile Menu Toggle
function initMobileMenu() {
    if (!menuToggle) return;
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const spans = menuToggle.querySelectorAll('span');
        if (navLinks.classList.contains('active')) {
            gsap.to(spans[0], { rotation: 45, y: 8, duration: 0.3 });
            gsap.to(spans[1], { opacity: 0, duration: 0.3 });
            gsap.to(spans[2], { rotation: -45, y: -8, duration: 0.3 });
        } else {
            gsap.to(spans[0], { rotation: 0, y: 0, duration: 0.3 });
            gsap.to(spans[1], { opacity: 1, duration: 0.3 });
            gsap.to(spans[2], { rotation: 0, y: 0, duration: 0.3 });
        }
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const spans = menuToggle.querySelectorAll('span');
            gsap.to(spans[0], { rotation: 0, y: 0, duration: 0.3 });
            gsap.to(spans[1], { opacity: 1, duration: 0.3 });
            gsap.to(spans[2], { rotation: 0, y: 0, duration: 0.3 });
        });
    });
}

// PDF Viewer Functions
function viewPDF(pdfPath) {
    currentPDF = pdfPath;
    modalTitle.textContent = pdfPath.replace('.pdf', '').replace(/_/g, ' ').replace(/-/g, ' ');
    
    pdfFrame.src = pdfPath;
    
    pdfModal.style.display = 'flex';
    gsap.fromTo(pdfModal, 
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power2.out' }
    );
    
    gsap.fromTo('.modal-content',
        { scale: 0.9, y: 30, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.4)' }
    );
    
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    gsap.to(pdfModal, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
            pdfModal.style.display = 'none';
            pdfFrame.src = '';
            document.body.style.overflow = '';
        }
    });
}

function downloadPDF(pdfPath) {
    const link = document.createElement('a');
    link.href = pdfPath;
    link.download = pdfPath;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function downloadCurrentPDF() {
    if (currentPDF) downloadPDF(currentPDF);
}

// Close modal triggers
if (pdfModal) {
    pdfModal.addEventListener('click', (e) => {
        if (e.target === pdfModal) closeModal();
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && pdfModal && pdfModal.style.display === 'flex') closeModal();
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            gsap.to(window, {
                duration: 1.2,
                scrollTo: { y: target, offsetY: 80 },
                ease: 'power4.inOut'
            });
        }
    });
});

// Footer Year
function initFooterYear() {
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// Console branding
console.log('%c🚀 Coisas de Garagem - Documentação Central', 'color: #0A2463; font-size: 20px; font-weight: bold;');
console.log('%cPowered by Wolfex Design System', 'color: #3BCEAC; font-size: 14px;');
