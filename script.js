document.addEventListener('DOMContentLoaded', () => {
    // 1. Header Scroll Effect
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 3. Scroll Animations (Intersection Observer)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        observer.observe(el);
    });

    // 4. Modal and Multi-step Form Logic
    const modal = document.getElementById('leadModal');
    const openBtns = document.querySelectorAll('.open-form-btn');
    const closeBtn = document.getElementById('closeModal');
    const closeSuccessBtn = document.getElementById('closeSuccessBtnFinal');

    // Open Modal
    openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    });

    // Close Modal function
    const closeModalFunc = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset form after closing (delayed for animation)
        setTimeout(() => {
            if (currentStep >= 8) {
                resetForm();
            }
        }, 300);
    };

    if(closeBtn) closeBtn.addEventListener('click', closeModalFunc);
    if(closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeModalFunc);

    // Close on outside click
    if(modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModalFunc();
            }
        });
    }

    // Option Cards selection styling
    const optionCards = document.querySelectorAll('.option-card');
    optionCards.forEach(card => {
        card.addEventListener('click', function() {
            const siblings = this.parentElement.querySelectorAll('.option-card');
            siblings.forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
});

// Global Multi-step Form Logic
let currentStep = 1;
const totalInputSteps = 6; // Steps with user inputs

function showError(msg) {
    alert(msg);
}

function validateCurrentStep(targetStep) {
    // If going backwards, allow it
    if (targetStep < currentStep) return true;

    // Validate Step 5
    if (currentStep === 5 && targetStep === 6) {
        const c1 = document.querySelector('input[name="c1"]:checked');
        const c2 = document.querySelector('input[name="c2"]:checked');
        const c3 = document.querySelector('input[name="c3"]:checked');
        const c4 = document.querySelector('input[name="c4"]:checked');
        if (!c1 || !c2 || !c3 || !c4) {
            showError("Bitte bewerten Sie alle 4 Kriterien, bevor Sie fortfahren.");
            return false;
        }
    }
    return true;
}

function nextStep(step) {
    if (!validateCurrentStep(step)) return;

    document.getElementById(`step${currentStep}`).classList.remove('active');
    currentStep = step;
    document.getElementById(`step${currentStep}`).classList.add('active');
    updateProgress();
    
    // Scroll modal to top
    document.querySelector('.modal-content').scrollTop = 0;
}

function prevStep(step) {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    currentStep = step;
    document.getElementById(`step${currentStep}`).classList.add('active');
    updateProgress();
    document.querySelector('.modal-content').scrollTop = 0;
}

function updateProgress() {
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        // Calculate progress percentage
        let percent = (currentStep / totalInputSteps) * 100;
        if (currentStep > totalInputSteps) percent = 100; // Success steps
        if (percent > 100) percent = 100;
        progressBar.style.width = `${percent}%`;
    }
}

// Handle Loading Screen (Step 6 -> 7 -> 8)
function startLoading() {
    // Validate Step 6
    const addr = document.getElementById('loc_adresse').value.trim();
    const plz = document.getElementById('loc_plz').value.trim();
    const ort = document.getElementById('loc_ort').value.trim();

    if (!addr || !plz || !ort) {
        showError("Bitte füllen Sie Adresse, PLZ und Ort aus.");
        return;
    }

    nextStep(7); // Show loading screen
    
    const loadingBar = document.getElementById('searchLoadingBar');
    const loadingText = document.getElementById('loadingText');
    
    // Reset bar
    loadingBar.style.width = '0%';
    
    // Simulate searching process
    setTimeout(() => { loadingBar.style.width = '30%'; loadingText.textContent = "Analysiere Immobilienwerte..."; }, 500);
    setTimeout(() => { loadingBar.style.width = '60%'; loadingText.textContent = "Gleiche Maklerprofile ab..."; }, 1500);
    setTimeout(() => { loadingBar.style.width = '90%'; loadingText.textContent = "Wähle besten Experten aus..."; }, 2500);
    
    setTimeout(() => {
        loadingBar.style.width = '100%';
        setTimeout(() => {
            nextStep(8); // Move to contact details
        }, 500);
    }, 3500);
}

// Final Submit
function submitFinal() {
    // Validate Step 8
    const vorname = document.getElementById('contact_vorname').value.trim();
    const nachname = document.getElementById('contact_nachname').value.trim();
    const telefon = document.getElementById('contact_telefon').value.trim();
    const email = document.getElementById('contact_email').value.trim();

    if (!vorname || !nachname || !telefon || !email) {
        showError("Bitte füllen Sie alle Kontaktfelder vollständig aus.");
        return;
    }
    
    // Basic email validation
    if (!email.includes('@') || !email.includes('.')) {
        showError("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
        return;
    }

    const btn = document.querySelector('#step8 .btn-primary');
    const originalText = btn.textContent;
    btn.textContent = 'Wird gesendet...';
    btn.disabled = true;

    // Gather all data
    const data = {
        Immobilientyp: document.getElementById('property_type')?.value || 'Nicht angegeben',
        Zeitrahmen: document.querySelector('input[name="timeframe"]:checked')?.nextElementSibling?.textContent || 'Nicht angegeben',
        Wohnflaeche: document.querySelector('input[name="size"]:checked')?.nextElementSibling?.textContent || 'Nicht angegeben',
        Nutzung: document.querySelector('input[name="usage"]:checked')?.nextElementSibling?.textContent || 'Nicht angegeben',
        PreisFokus: getMatrixLabel('c1'),
        ProvisionFokus: getMatrixLabel('c2'),
        SchnelligkeitFokus: getMatrixLabel('c3'),
        MarketingFokus: getMatrixLabel('c4'),
        Adresse: document.getElementById('loc_adresse').value,
        Zusatz: document.getElementById('loc_zusatz').value,
        PLZ: document.getElementById('loc_plz').value,
        Ort: document.getElementById('loc_ort').value,
        Vorname: vorname,
        Nachname: nachname,
        Telefon: telefon,
        Email: email
    };

    // Send data to FormSubmit
    fetch("https://formsubmit.co/ajax/kontakt@immoverkaufsservice.de", {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        nextStep(9); // Show final success message
        btn.textContent = originalText;
        btn.disabled = false;
    })
    .catch(error => {
        console.error(error);
        showError("Es gab ein Problem beim Senden. Bitte versuchen Sie es später erneut.");
        btn.textContent = originalText;
        btn.disabled = false;
    });
}

function getMatrixLabel(name) {
    const val = document.querySelector(`input[name="${name}"]:checked`)?.value;
    if (val === '1') return 'Sehr wichtig';
    if (val === '2') return 'Wichtig';
    if (val === '3') return 'Eher unwichtig';
    return 'Nicht bewertet';
}

function resetForm() {
    // Reset to step 1
    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    currentStep = 1;
    document.getElementById('step1').classList.add('active');
    updateProgress();
    
    // Clear inputs
    document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="hidden"]').forEach(input => {
        input.value = '';
    });
    
    // Reset selections
    document.querySelectorAll('.option-card').forEach(card => card.classList.remove('selected'));
    document.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
}
