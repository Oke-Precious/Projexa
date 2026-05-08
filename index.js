// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already authenticated - redirect to dashboard
    const token = sessionStorage.getItem('projexa.token');
    if (token) {
        window.location.href = './dashboard.html';
        return;
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#login') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Update active navbar link based on scroll position
    function updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.navbar-nav a');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    // Handle all buttons on page
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const text = this.textContent.trim();
            
            if (text.includes('Get Started') || text.includes('Start Your Trial')) {
                e.preventDefault();
                window.location.href = './signup.html';
            } else if (text.includes('Log In')) {
                e.preventDefault();
                window.location.href = './signin.html';
            } else if (text.includes('Contact Sales')) {
                e.preventDefault();
                window.alert('Sales contact form coming soon!');
            } else if (text.includes('Watch Demo')) {
                e.preventDefault();
                window.location.href = './demo.html';
            }
        });
    });

    window.addEventListener('scroll', updateActiveLink);
    
    // Initialize active link on page load
    updateActiveLink();
});
