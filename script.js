document.addEventListener('DOMContentLoaded', () => {

    /* 1. Mobile Hamburger Menu Toggle */
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links li a');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('toggle');
    });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    /* 2. Navbar background on scroll */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(6, 7, 10, 0.92)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.4)';
        } else {
            navbar.style.background = 'rgba(6, 7, 10, 0.75)';
            navbar.style.boxShadow = 'none';
        }
    }, { passive: true });

    /* 3. Reveal elements on scroll */
    const sections = document.querySelectorAll('.section, .stats-strip');
    const observerOptions = { root: null, threshold: 0.12, rootMargin: "0px" };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.style.opacity = 0;
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        sectionObserver.observe(section);
    });

    /* 4. Contact form handling (Web3Forms Integration) */
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const btn = contactForm.querySelector('button');
            const originalText = btn.textContent;

            // UI feedback while sending
            btn.textContent = 'Sending...';
            btn.disabled = true;

            const formData = new FormData(contactForm);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            })
            .then(async (response) => {
                let res = await response.json();
                if (response.status === 200) {
                    btn.textContent = 'Message sent! ✓';
                    btn.style.background = 'var(--secondary)';
                    contactForm.reset();
                } else {
                    btn.textContent = 'Failed to send';
                    console.error(res.message);
                }
            })
            .catch(error => {
                console.error('Error submitting form:', error);
                btn.textContent = 'Error sending';
            })
            .finally(() => {
                // Reset button state after 3 seconds
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = 'var(--accent)';
                    btn.disabled = false;
                }, 3000);
            });
        });
    }

    /* 5. 3D tilt effect for cards */
    const tiltEls = document.querySelectorAll('.tilt-card, .tilt-card-strong');
    tiltEls.forEach(el => {
        const strength = el.classList.contains('tilt-card-strong') ? 12 : 6;

        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const midX = rect.width / 2;
            const midY = rect.height / 2;
            const rotateY = ((x - midX) / midX) * strength;
            const rotateX = -((y - midY) / midY) * strength;
            el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
        });
    });

    /* 6. Animated stat counters */
    const statEls = document.querySelectorAll('.stat-num');
    const statObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCount(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statEls.forEach(el => statObserver.observe(el));

    function animateCount(el) {
        const target = parseInt(el.dataset.target, 10);
        const duration = 1400;
        const start = performance.now();

        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    /* 7. Terminal boot-sequence typewriter */
    const terminalBody = document.getElementById('terminal-body');
    const bootLines = [
        '$ whoami',
        'velocity_studios — Fast. Scalable. Velocity.',
        '$ ./run --projects',
        '[ok] KLM & Aditya Foundation (live) .......... compiled',
        '[ok] Dream Computer Institute (live) ...... compiled',
        '[ok] sticker-storefront ... compiled',
        '[ok] circuit-sentinel ..... compiled',
        '$ status: all systems shipped'
    ];

    function typeTerminal() {
        let lineIdx = 0;
        let charIdx = 0;
        terminalBody.textContent = '';

        function typeChar() {
            if (lineIdx >= bootLines.length) {
                terminalBody.innerHTML += '<span class="cursor"></span>';
                return;
            }
            const line = bootLines[lineIdx];
            if (charIdx < line.length) {
                terminalBody.textContent += line.charAt(charIdx);
                charIdx++;
                setTimeout(typeChar, 18);
            } else {
                terminalBody.textContent += '\n';
                lineIdx++;
                charIdx = 0;
                setTimeout(typeChar, 120);
            }
        }
        typeChar();
    }

    if (terminalBody) typeTerminal();

    /* 8. Interactive circuit-board canvas background for hero */
    const canvas = document.getElementById('circuit-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const hero = document.getElementById('hero');
        let width, height, nodes = [];
        const mouse = { x: null, y: null };

        function resize() {
            width = canvas.width = hero.offsetWidth;
            height = canvas.height = hero.offsetHeight;
            initNodes();
        }

        function initNodes() {
            nodes = [];
            const count = Math.min(70, Math.floor((width * height) / 18000));
            for (let i = 0; i < count; i++) {
                nodes.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.25,
                    vy: (Math.random() - 0.5) * 0.25,
                    r: Math.random() * 1.5 + 0.8
                });
            }
        }

        function step() {
            ctx.clearRect(0, 0, width, height);
            const maxDist = 150;

            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                n.x += n.vx;
                n.y += n.vy;

                if (n.x < 0 || n.x > width) n.vx *= -1;
                if (n.y < 0 || n.y > height) n.vy *= -1;

                for (let j = i + 1; j < nodes.length; j++) {
                    const o = nodes[j];
                    const dx = n.x - o.x;
                    const dy = n.y - o.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < maxDist) {
                        ctx.strokeStyle = `rgba(0, 229, 160, ${(1 - dist / maxDist) * 0.18})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(n.x, n.y);
                        ctx.lineTo(o.x, o.y);
                        ctx.stroke();
                    }
                }

                if (mouse.x !== null) {
                    const dx = n.x - mouse.x;
                    const dy = n.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 180) {
                        ctx.strokeStyle = `rgba(0, 229, 160, ${(1 - dist / 180) * 0.35})`;
                        ctx.beginPath();
                        ctx.moveTo(n.x, n.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }

                ctx.fillStyle = 'rgba(0, 229, 160, 0.55)';
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fill();
            }

            requestAnimationFrame(step);
        }

        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        hero.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        window.addEventListener('resize', resize, { passive: true });
        resize();
        step();
    }
});
