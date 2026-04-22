// ===== SMOOTH SCROLL FOR NAVBAR LINKS =====
document.querySelectorAll('.navbar-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ===== HERO VIDEO INTERACTIONS =====
const playButton = document.querySelector('.play-button');
const videoPlaceholder = document.querySelector('.video-placeholder');
const videoText = document.querySelector('.video-text');
let isPlaying = false;

playButton.addEventListener('click', () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
        videoText.textContent = 'Video Loading...';
        videoPlaceholder.style.opacity = '0.5';
        playButton.style.opacity = '0.3';
        setTimeout(() => {
            videoText.textContent = 'Video Loaded ✓';
            videoPlaceholder.style.opacity = '1';
            playButton.style.opacity = '1';
        }, 2000);
    }
});

// Play button hover scale
playButton.addEventListener('mouseenter', () => {
    playButton.style.transform = 'scale(1.15)';
});

playButton.addEventListener('mouseleave', () => {
    playButton.style.transform = 'scale(1)';
});

// ===== KANBAN CARDS FLOATING ANIMATION =====
const kanbanCards = document.querySelectorAll('.kanban-card');
kanbanCards.forEach((card, index) => {
    card.style.animation = `float 3s ease-in-out ${index * 0.2}s infinite`;
});

// Add float animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
    }
    
    @keyframes slideInStaggered {
        0% {
            opacity: 0;
            transform: translateY(20px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes pulseBar {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
    }
    
    @keyframes glowPulse {
        0%, 100% {
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
        }
        50% {
            box-shadow: 0 0 40px rgba(99, 102, 241, 0.8);
        }
    }
`;
document.head.appendChild(style);

// ===== ACTIVITY FEED STAGGERED ANIMATION =====
const activityItems = document.querySelectorAll('.activity-item');
activityItems.forEach((item, index) => {
    item.style.animation = `slideInStaggered 0.6s ease-out ${index * 0.1}s backwards`;
});

// ===== LIVE ANALYTICS BARS ANIMATION =====
const bars = document.querySelectorAll('.bar');
const animateBars = () => {
    bars.forEach((bar, index) => {
        bar.style.animation = `pulseBar 2s ease-in-out ${index * 0.15}s infinite`;
    });
};

// Trigger animation on scroll
const analyticsCard = document.querySelector('.analytics-card');
const observerOptions = {
    threshold: 0.3,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateBars();
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

if (analyticsCard) {
    observer.observe(analyticsCard);
}

// ===== CTA BUTTON GLOW INTENSIFY HOVER =====
const trialButton = document.querySelector('.btn-trial');

trialButton.addEventListener('mouseenter', () => {
    trialButton.style.animation = 'glowPulse 0.6s ease-in-out';
    trialButton.style.animationIterationCount = 'infinite';
});

trialButton.addEventListener('mouseleave', () => {
    trialButton.style.animation = 'none';
    trialButton.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.5)';
});

// ===== KANBAN CARDS CLICK EFFECT =====
kanbanCards.forEach(card => {
    card.addEventListener('mousedown', (e) => {
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.pointerEvents = 'none';
        ripple.style.animation = 'ripple 0.6s ease-out';
        
        card.style.position = 'relative';
        card.style.overflow = 'hidden';
        
        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        card.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// ===== NAVBAR ACTIVE LINK STATE =====
const navLinks = document.querySelectorAll('.navbar-links a');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.style.color = '#d1d5db';
        if (link.getAttribute('href') === '#' + current) {
            link.style.color = '#6366f1';
            link.style.fontWeight = '600';
        }
    });
});

// ===== PAGE LOAD ANIMATIONS =====
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});