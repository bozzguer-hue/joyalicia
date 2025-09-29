document.addEventListener('DOMContentLoaded', () => {
    // Quote Carousel Functionality
    const track = document.querySelector('.quote-track');
    const slides = Array.from(track.children);
    const dotsNav = document.querySelector('.carousel-dots');
    let slideInterval;

    if (track && slides.length > 0 && dotsNav) {
        // Create dots
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dotsNav.appendChild(dot);
        });

        const dots = Array.from(dotsNav.children);

        const slideWidth = slides[0].getBoundingClientRect().width;

        // Arrange slides next to one another
        const setSlidePosition = (slide, index) => {
            slide.style.left = slideWidth * index + 'px';
        };
        slides.forEach(setSlidePosition);

        const moveToSlide = (currentSlide, targetSlide) => {
            track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
            currentSlide.classList.remove('current-slide');
            targetSlide.classList.add('current-slide');
        };

        const updateDots = (currentDot, targetDot) => {
            currentDot.classList.remove('active');
            targetDot.classList.add('active');
        };

        const moveToSlideByIndex = (targetIndex) => {
            const currentSlide = track.querySelector('.current-slide') || slides[0];
            const currentDot = dotsNav.querySelector('.active') || dots[0];
            const targetSlide = slides[targetIndex];
            const targetDot = dots[targetIndex];

            track.style.transform = `translateX(-${targetIndex * 100}%)`;
            
            if (currentSlide) currentSlide.classList.remove('current-slide');
            slides[targetIndex].classList.add('current-slide');
            
            if (currentDot) currentDot.classList.remove('active');
            dots[targetIndex].classList.add('active');
        };

        // When I click a dot, move to that slide
        dotsNav.addEventListener('click', e => {
            const targetDot = e.target.closest('button.dot');
            if (!targetDot) return;

            const targetIndex = dots.findIndex(dot => dot === targetDot);
            moveToSlideByIndex(targetIndex);
            resetInterval();
        });

        // Auto-play functionality
        const startInterval = () => {
            slideInterval = setInterval(() => {
                const currentSlide = track.querySelector('.current-slide') || slides[0];
                const currentIndex = slides.findIndex(slide => slide === currentSlide);
                const nextIndex = (currentIndex + 1) % slides.length;
                moveToSlideByIndex(nextIndex);
            }, 6000); // Change slide every 6 seconds for longer reviews
        };

        const resetInterval = () => {
            clearInterval(slideInterval);
            startInterval();
        };

        // Initialize first slide and start auto-play
        slides[0].classList.add('current-slide');
        startInterval();
    }

    // Newsletter Form Submission
    const newsletterForm = document.querySelector('.newsletter-form');
    const formStatus = document.querySelector('.form-status');

    if (newsletterForm && formStatus) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(newsletterForm);
            const data = Object.fromEntries(formData.entries());

            // Basic honeypot check
            if (data._gotcha) {
                return;
            }

            formStatus.textContent = 'Submitting...';
            formStatus.style.color = 'inherit';

            try {
                const response = await fetch(newsletterForm.action, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    formStatus.textContent = "Thanks for subscribing! Check your inbox.";
                    formStatus.style.color = 'var(--accent-pink)';
                    newsletterForm.reset();
                } else {
                    const result = await response.json();
                    formStatus.textContent = `Error: ${result.error || 'Could not subscribe.'}`;
                    formStatus.style.color = '#ff0000';
                }
            } catch (error) {
                console.error('Form submission error:', error);
                formStatus.textContent = 'An error occurred. Please try again.';
                formStatus.style.color = '#ff0000';
            }
        });
    }

    // Contact Modal Functionality
    const contactModal = document.getElementById('contactModal');
    const openContactBtn = document.getElementById('openContactModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.cancel-btn');
    const contactForm = document.getElementById('contactForm');

    // Open modal
    if (openContactBtn && contactModal) {
        openContactBtn.addEventListener('click', () => {
            contactModal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    }

    // Close modal function
    const closeModal = () => {
        contactModal.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
        // Clear form
        if (contactForm) {
            contactForm.reset();
        }
    };

    // Close modal events
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside
    if (contactModal) {
        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                closeModal();
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && contactModal && contactModal.classList.contains('show')) {
            closeModal();
        }
    });

    // Contact Form Submission
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.contact-submit-btn');
            const originalText = submitBtn.textContent;
            
            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            
            // Add recipient email
            data.to = 'joythyology@gmail.com';
            data.formType = 'contact';

            try {
                const response = await fetch('/api/form-proxy', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    // Show success message
                    contactForm.innerHTML = `
                        <div class="success-message" style="text-align: center; padding: var(--space-lg);">
                            <h3 style="color: var(--primary-blue); margin-bottom: var(--space-md);">Message Sent! ✨</h3>
                            <p style="color: var(--text-dark); margin-bottom: var(--space-lg);">Thank you for reaching out! I'll get back to you within 24 hours.</p>
                            <button type="button" class="btn btn-primary" onclick="closeModal()">Close</button>
                        </div>
                    `;
                } else {
                    throw new Error('Failed to send message');
                }
            } catch (error) {
                console.error('Contact form submission error:', error);
                alert('Sorry, there was an error sending your message. Please try emailing me directly at joythyology@gmail.com');
                
                // Reset button
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    // Make closeModal function globally available
    window.closeModal = closeModal;

    // Cookie Consent Functionality
    const cookieConsent = document.getElementById('cookieConsent');
    const acceptCookiesBtn = document.getElementById('acceptCookies');
    const rejectCookiesBtn = document.getElementById('rejectCookies');

    // Check if user has already made a choice
    const cookieChoice = localStorage.getItem('cookieConsent');
    
    if (!cookieChoice) {
        // Show cookie banner after a short delay
        setTimeout(() => {
            if (cookieConsent) {
                cookieConsent.classList.add('show');
            }
        }, 1000);
    }

    // Accept all cookies
    if (acceptCookiesBtn) {
        acceptCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            localStorage.setItem('cookieConsentDate', new Date().toISOString());
            hideCookieBanner();
            
            // Initialize analytics or other tracking here
            console.log('Cookies accepted - Analytics can be initialized');
        });
    }

    // Reject non-essential cookies
    if (rejectCookiesBtn) {
        rejectCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'rejected');
            localStorage.setItem('cookieConsentDate', new Date().toISOString());
            hideCookieBanner();
            
            // Disable non-essential tracking
            console.log('Non-essential cookies rejected');
        });
    }

    function hideCookieBanner() {
        if (cookieConsent) {
            cookieConsent.classList.remove('show');
        }
    }

    // Check if consent is older than 1 year and show banner again
    function checkConsentExpiry() {
        const consentDate = localStorage.getItem('cookieConsentDate');
        if (consentDate) {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            
            if (new Date(consentDate) < oneYearAgo) {
                localStorage.removeItem('cookieConsent');
                localStorage.removeItem('cookieConsentDate');
                
                // Show banner again
                setTimeout(() => {
                    if (cookieConsent) {
                        cookieConsent.classList.add('show');
                    }
                }, 1000);
            }
        }
    }

    // Check consent expiry on page load
    checkConsentExpiry();

    // Helper function to check if analytics cookies are allowed
    window.isAnalyticsAllowed = function() {
        const consent = localStorage.getItem('cookieConsent');
        return consent === 'accepted';
    };

    // Helper function to check if marketing cookies are allowed
    window.isMarketingAllowed = function() {
        const consent = localStorage.getItem('cookieConsent');
        return consent === 'accepted';
    };
});
