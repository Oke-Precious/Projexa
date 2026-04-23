// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
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

    // Smooth scrolling for buttons that navigate
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const text = this.textContent.trim();
            
            if (text.includes('Get Started') || text.includes('Start Your Trial')) {
                e.preventDefault();
                const featuresSection = document.querySelector('#features');
                if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                console.log('Get Started clicked');
            } else if (text.includes('Log In')) {
                console.log('Log In clicked');
            } else if (text.includes('Contact Sales')) {
                console.log('Contact Sales clicked');
            }
        });
    });

    window.addEventListener('scroll', updateActiveLink);
    
    // Initialize active link on page load
    updateActiveLink();
});
