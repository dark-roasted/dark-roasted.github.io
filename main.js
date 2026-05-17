document.addEventListener('DOMContentLoaded', () => {
    const initCards = () => {
        const cards = document.querySelectorAll('.interactive-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    };
    initCards();
    const initNavigation = () => {
        const nav = document.querySelector('.premium-nav');
        const toggle = document.querySelector('.menu-toggle');
        const navLinks = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('section, header');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
            let currentId = '';
            const scrollPos = window.scrollY + 120;
            sections.forEach(section => {
                const top = section.offsetTop;
                const height = section.clientHeight;
                if (scrollPos >= top && scrollPos < top + height) {
                    currentId = section.getAttribute('id');
                }
            });
            navLinks.forEach(link => {
                link.classList.remove('active-link');
                if (link.getAttribute('href') === `#${currentId}`) {
                    link.classList.add('active-link');
                }
            });
        });
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('open');
            nav.classList.toggle('menu-active');
            if (nav.classList.contains('menu-active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'initial';
            }
        });
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (toggle.classList.contains('open')) {
                    toggle.classList.remove('open');
                    nav.classList.remove('menu-active');
                    document.body.style.overflow = 'initial';
                }
                const offsetTop = targetSection.offsetTop - 60;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            });
        });
    };
    initNavigation();
    const initScrollAnimations = () => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('section-visible');
                }
            });
        }, observerOptions);
        const hiddenElements = document.querySelectorAll('.section-hidden');
        hiddenElements.forEach(el => observer.observe(el));
    };
    initScrollAnimations();
    const initParallaxEffect = () => {
        const hero = document.querySelector('.hero-viewport');
        const avatarStage = document.querySelector('.avatar-interactive-stage');
        const mainTitle = document.querySelector('.giant-display-text');
        if (!hero || window.innerWidth < 768) return;
        hero.addEventListener('mousemove', (e) => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const mouseX = (e.clientX - width / 2) / (width / 2);
            const mouseY = (e.clientY - height / 2) / (height / 2);
            if (avatarStage) {
                avatarStage.style.transform = `translate(${mouseX * 15}px, ${mouseY * 15}px)`;
            }
            if (mainTitle) {
                mainTitle.style.transform = `translate(${mouseX * -8}px, ${mouseY * -8}px)`;
            }
        });
        hero.addEventListener('mouseleave', () => {
            if (avatarStage) avatarStage.style.transform = 'translate(0px, 0px)';
            if (mainTitle) mainTitle.style.transform = 'translate(0px, 0px)';
        });
    };
    initParallaxEffect();
    const addDynamicGlowPulse = () => {
        const orbs = document.querySelectorAll('.glow-orb');
        window.addEventListener('scroll', () => {
            const scrollPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
            orbs.forEach((orb, index) => {
                const factor = (index + 1) * 30;
                orb.style.transform = `translateY(${scrollPct * factor}px)`;
            });
        });
    };
    addDynamicGlowPulse();
});
