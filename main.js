/**
 * Main JavaScript functionality for the business website
 * - Smooth anchor scrolling
 * - Mobile navigation toggle
 * - Form validation and handling
 * - Local storage for form persistence
 */

(function() {
    'use strict';
    
    // DOM Elements
    const navToggle = document.querySelector('.nav__toggle');
    const navMenu = document.querySelector('.nav__menu');
    const contactForm = document.querySelector('.contact-form');
    const formInputs = document.querySelectorAll('.form-input, .form-textarea');
    const formSubmit = document.querySelector('.form-submit');
    
    // Initialize all functionality when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initSmoothScrolling();
        initMobileNavigation();
        initFormHandling();
        initFormPersistence();
        initAnimations();
    });
    
    /**
     * Smooth scrolling for anchor links
     */
    function initSmoothScrolling() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const offsetTop = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    closeMobileNav();
                    
                    // Focus target element for accessibility
                    targetElement.focus();
                }
            });
        });
    }
    
    /**
     * Mobile navigation toggle functionality
     */
    function initMobileNavigation() {
        if (!navToggle || !navMenu) return;
        
        navToggle.addEventListener('click', function() {
            const isOpen = navMenu.classList.contains('nav__menu--open');
            
            if (isOpen) {
                closeMobileNav();
            } else {
                openMobileNav();
            }
        });
        
        // Close mobile nav when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                closeMobileNav();
            }
        });
        
        // Close mobile nav on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeMobileNav();
            }
        });
        
        // Close mobile nav on window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                closeMobileNav();
            }
        });
    }
    
    function openMobileNav() {
        navMenu.classList.add('nav__menu--open');
        navToggle.setAttribute('aria-expanded', 'true');
        
        // Animate hamburger lines
        const lines = navToggle.querySelectorAll('.nav__toggle-line');
        lines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        lines[1].style.opacity = '0';
        lines[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    }
    
    function closeMobileNav() {
        navMenu.classList.remove('nav__menu--open');
        navToggle.setAttribute('aria-expanded', 'false');
        
        // Reset hamburger lines
        const lines = navToggle.querySelectorAll('.nav__toggle-line');
        lines[0].style.transform = '';
        lines[1].style.opacity = '';
        lines[2].style.transform = '';
    }
    
    /**
     * Form validation and submission handling
     */
    function initFormHandling() {
        if (!contactForm) return;
        
        // Real-time validation
        formInputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
        
        // Form submission
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm()) {
                submitForm();
            }
        });
    }
    
    function validateField(field) {
        const fieldName = field.getAttribute('name');
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required.';
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address.';
            }
        }
        
        // Textarea minimum length
        if (field.tagName === 'TEXTAREA' && value && value.length < 10) {
            isValid = false;
            errorMessage = 'Please provide more details (at least 10 characters).';
        }
        
        showFieldError(field, isValid ? '' : errorMessage);
        return isValid;
    }
    
    function validateForm() {
        let isFormValid = true;
        
        formInputs.forEach(input => {
            if (!validateField(input)) {
                isFormValid = false;
            }
        });
        
        return isFormValid;
    }
    
    function showFieldError(field, message) {
        const errorElement = document.getElementById(field.name + '-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.toggle('form-error--show', !!message);
        }
        
        field.classList.toggle('form-input--error', !!message);
    }
    
    function clearFieldError(field) {
        showFieldError(field, '');
    }
    
    async function submitForm() {
        const formData = new FormData(contactForm);
        const submitButton = contactForm.querySelector('.form-submit');
        const originalText = submitButton.textContent;
        
        // Update submit button state
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                showFormMessage('success', 'Thank you! We\'ll get back to you within 24 hours.');
                contactForm.reset();
                clearFormStorage();
            } else {
                throw new Error('Form submission failed');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            showFormMessage('error', 'Something went wrong. Please try again or email us directly.');
        } finally {
            // Reset submit button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }
    
    function showFormMessage(type, message) {
        const successElement = document.getElementById('form-success');
        const errorElement = document.getElementById('form-error');
        
        // Hide all messages first
        successElement.classList.remove('form-success--show');
        errorElement.classList.remove('form-error-general--show');
        
        // Show appropriate message
        if (type === 'success') {
            successElement.textContent = message;
            successElement.classList.add('form-success--show');
        } else {
            errorElement.textContent = message;
            errorElement.classList.add('form-error-general--show');
        }
        
        // Scroll to message
        document.getElementById('form-' + (type === 'success' ? 'success' : 'error')).scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
    
    /**
     * Form field persistence using localStorage
     */
    function initFormPersistence() {
        const STORAGE_KEY = 'contactFormData';
        
        // Load saved form data
        loadFormData();
        
        // Save form data on input
        formInputs.forEach(input => {
            input.addEventListener('input', saveFormData);
        });
        
        function saveFormData() {
            const formData = {};
            formInputs.forEach(input => {
                if (input.value.trim()) {
                    formData[input.name] = input.value;
                }
            });
            
            if (Object.keys(formData).length > 0) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
            }
        }
        
        function loadFormData() {
            try {
                const savedData = localStorage.getItem(STORAGE_KEY);
                if (savedData) {
                    const formData = JSON.parse(savedData);
                    formInputs.forEach(input => {
                        if (formData[input.name]) {
                            input.value = formData[input.name];
                        }
                    });
                }
            } catch (error) {
                console.error('Error loading form data:', error);
            }
        }
        
        function clearFormStorage() {
            localStorage.removeItem(STORAGE_KEY);
        }
        
        // Expose clearFormStorage globally for form reset
        window.clearFormStorage = clearFormStorage;
    }
    
    /**
     * Intersection Observer for animations
     */
    function initAnimations() {
        // Only add animations if user doesn't prefer reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        const elementsToAnimate = document.querySelectorAll(
            '.service-card, .project-showcase, .benefit-item, .section__title'
        );
        
        elementsToAnimate.forEach(el => {
            observer.observe(el);
        });
    }
    
    /**
     * Utility function to debounce events
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Export for testing purposes
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            initSmoothScrolling,
            initMobileNavigation,
            initFormHandling,
            validateField,
            validateForm
        };
    }
    
})();