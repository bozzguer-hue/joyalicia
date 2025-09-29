document.addEventListener('DOMContentLoaded', () => {
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
