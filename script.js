// ── WAIT FOR DOM ──
document.addEventListener('DOMContentLoaded', () => {

    // ── LOADING SCREEN ──
    const loader = document.getElementById('loader');
    const progressBar = document.getElementById('loaderProgressBar');
    const percentageText = document.getElementById('loaderPercentage');

    if (loader) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 1;
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (percentageText) percentageText.innerText = `${progress}%`;

            if (progress >= 100) {
                clearInterval(interval);
                playSound('success');
                setTimeout(() => {
                    loader.classList.add('hidden');
                    document.body.style.overflow = 'auto';
                }, 500);
            }
        }, 22); // Reaches 100 in ~2.2s + 0.5s buffer
    }

    // ── ADVANCED AUDIO SYSTEM ──
    const bgMusic = document.getElementById('bgMusic');
    const playerPanel = document.getElementById('musicPanel');
    const toggleGlobal = document.getElementById('musicToggleGlobal');
    const panelClose = document.getElementById('panelClose');
    const trackItems = document.querySelectorAll('.track-item');
    const progressFill = document.getElementById('progressFill');
    const playerProgressBar = document.getElementById('playerProgressBar');
    const seekPrev = document.getElementById('seekPrev');
    const seekNext = document.getElementById('seekNext');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeStatus = document.querySelector('.volume-status');

    const soundToggle = document.getElementById('uiSoundToggle');

    let musicActive = false;
    let uiSoundsEnabled = true;
    let audioCtx = null;

    const getAudioCtx = (forceCreate = false) => {
        try {
            if (!audioCtx && forceCreate) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            return audioCtx;
        } catch (e) {
            console.warn('AudioContext failed to initialize:', e);
            return null;
        }
    };

    const updateMusicUI = (active) => {
        musicActive = active;
        const mainIcon = toggleGlobal?.querySelector('.music-note-icon');
        if (mainIcon) {
            mainIcon.innerText = active ? '🎶' : '🎵';
            toggleGlobal.style.animation = active ? 'pulse 2s infinite' : 'none';
        }
    };

    const toggleUISounds = () => {
        uiSoundsEnabled = !uiSoundsEnabled;
        const soundIcon = soundToggle?.querySelector('.sound-icon');
        if (soundToggle && soundIcon) {
            if (uiSoundsEnabled) {
                soundToggle.classList.remove('off');
                soundIcon.innerText = '🔊';
            } else {
                soundToggle.classList.add('off');
                soundIcon.innerText = '🔇';
            }
        }
        if (soundToggle) {
            soundToggle.classList.add('toggle-flicker');
            setTimeout(() => soundToggle.classList.remove('toggle-flicker'), 300);
        }
        playSound('toggle');
    };

    if (soundToggle) {
        soundToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleUISounds();
        });
        soundToggle.addEventListener('mouseenter', () => playSound('hover'));
    }

    const fadeAudio = (audio, targetVol, duration = 0.5) => {
        const startVol = audio.volume;
        const startTime = Date.now();

        const internalFade = () => {
            const now = Date.now();
            const elapsed = (now - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);

            audio.volume = startVol + (targetVol - startVol) * progress;

            if (progress < 1) {
                requestAnimationFrame(internalFade);
            }
        };
        internalFade();
    };

    const playSound = (type) => {
        if (!uiSoundsEnabled) return;
        try {
            // Only play if context exists (lazy initialization)
            const ctx = getAudioCtx();
            if (!ctx || ctx.state === 'suspended') return;

            const masterGain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            masterGain.connect(filter);
            filter.connect(ctx.destination);

            if (ctx.state === 'suspended') ctx.resume();

            if (type === 'hover') {
                // High-end chime
                const osc = ctx.createOscillator();
                const g = ctx.createGain();
                filter.type = 'highpass';
                filter.frequency.setValueAtTime(1000, ctx.currentTime);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(1500, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.1);

                g.gain.setValueAtTime(0.015, ctx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

                osc.connect(g);
                g.connect(masterGain);
                osc.start();
                osc.stop(ctx.currentTime + 0.1);
            } else if (type === 'scroll') {
                // Premium mechanical scroll tick
                const osc = ctx.createOscillator();
                const g = ctx.createGain();
                filter.type = 'highpass';
                filter.frequency.setValueAtTime(800, ctx.currentTime);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

                g.gain.setValueAtTime(0.012, ctx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

                osc.connect(g);
                g.connect(masterGain);
                osc.start();
                osc.stop(ctx.currentTime + 0.05);
            } else if (type === 'wanted') {
                // Cinematic sweep
                const osc1 = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const g = ctx.createGain();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(500, ctx.currentTime);
                filter.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.4);

                osc1.type = 'sawtooth';
                osc2.type = 'sine';
                osc1.frequency.setValueAtTime(55, ctx.currentTime);
                osc2.frequency.setValueAtTime(57, ctx.currentTime); // Slight detune

                g.gain.setValueAtTime(0.025, ctx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

                osc1.connect(g);
                osc2.connect(g);
                g.connect(masterGain);
                osc1.start(); osc2.start();
                osc1.stop(ctx.currentTime + 0.4); osc2.stop(ctx.currentTime + 0.4);
            } else if (type === 'gallery') {
                // Glimmer sound
                const osc = ctx.createOscillator();
                const g = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(2500, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(3500, ctx.currentTime + 0.2);

                g.gain.setValueAtTime(0.01, ctx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

                osc.connect(g);
                g.connect(masterGain);
                osc.start();
                osc.stop(ctx.currentTime + 0.2);
            } else if (type === 'success') {
                // Harmonic resolution
                const osc1 = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const g = ctx.createGain();
                osc1.type = 'sine';
                osc2.type = 'sine';
                osc1.frequency.setValueAtTime(440, ctx.currentTime);
                osc2.frequency.setValueAtTime(880, ctx.currentTime);
                g.gain.setValueAtTime(0.02, ctx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
                osc1.connect(g);
                osc2.connect(g);
                g.connect(masterGain);
                osc1.start(); osc2.start();
                osc1.stop(ctx.currentTime + 0.6); osc2.stop(ctx.currentTime + 0.6);
            } else if (type === 'scan') {
                // High-tech scanning hum
                const osc = ctx.createOscillator();
                const g = ctx.createGain();
                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(400, ctx.currentTime);
                filter.Q.value = 10;

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, ctx.currentTime);
                osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.5);

                g.gain.setValueAtTime(0.015, ctx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

                osc.connect(g);
                g.connect(masterGain);
                osc.start();
                osc.stop(ctx.currentTime + 0.5);
            } else if (type === 'click' || type === 'toggle') {
                // Premium tactile click
                const osc = ctx.createOscillator();
                const g = ctx.createGain();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(2000, ctx.currentTime);

                osc.type = 'square';
                osc.frequency.setValueAtTime(type === 'toggle' ? 600 : 900, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

                g.gain.setValueAtTime(0.03, ctx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

                osc.connect(g);
                g.connect(masterGain);
                osc.start();
                osc.stop(ctx.currentTime + 0.1);
            }
        } catch (e) { }
    };

    // Scroll sound logic - Re-optimized for smoothness
    let lastScrollY = window.scrollY;
    let scrollLevel = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        const diff = Math.abs(currentScroll - lastScrollY);

        if (diff > 40) { // Reduced threshold slightly for more feedback
            playSound('scroll');
            lastScrollY = currentScroll;
        }
    }, { passive: true });

    // Card Hover sounds
    const attachHoverSounds = () => {
        const cards = document.querySelectorAll('.crime-card, .reason-card, .mood-card, .stat-card, .analysis-metric');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => playSound('hover'));
        });

        const wantedCard = document.querySelector('.poster-card');
        if (wantedCard) {
            wantedCard.addEventListener('mouseenter', () => playSound('wanted'));
        }

        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            item.addEventListener('mouseenter', () => playSound('gallery'));
        });
    };
    attachHoverSounds();

    // Audio is unlocked via the initAudio gesture listeners at the bottom

    // Toggle Panel
    if (toggleGlobal) {
        toggleGlobal.addEventListener('click', (e) => {
            e.stopPropagation();
            playerPanel.classList.toggle('active');
            toggleGlobal.classList.add('toggle-flicker');
            setTimeout(() => toggleGlobal.classList.remove('toggle-flicker'), 300);
            playSound('toggle');
        });
        toggleGlobal.addEventListener('mouseenter', () => playSound('hover'));
    }

    if (panelClose) {
        panelClose.addEventListener('click', () => {
            playerPanel.classList.remove('active');
            playSound('click');
        });
    }

    // Track Selection
    trackItems.forEach(item => {
        item.addEventListener('click', () => {
            const src = item.getAttribute('data-src');
            const playBtn = item.querySelector('.track-play-btn');

            const targetVol = volumeSlider ? parseFloat(volumeSlider.value) : 0.75;

            if (bgMusic.src.includes(encodeURI(src.replace('./', '')))) {
                if (bgMusic.paused) {
                    bgMusic.volume = 0;
                    bgMusic.play().then(() => {
                        fadeAudio(bgMusic, targetVol);
                        updateMusicUI(true);
                    });
                    if (playBtn) playBtn.innerText = '⏸';
                } else {
                    fadeAudio(bgMusic, 0, 0.3);
                    setTimeout(() => {
                        bgMusic.pause();
                        updateMusicUI(false);
                    }, 300);
                    if (playBtn) playBtn.innerText = '▶';
                }
            } else {
                fadeAudio(bgMusic, 0, 0.2);
                setTimeout(() => {
                    trackItems.forEach(i => {
                        i.classList.remove('active');
                        const btn = i.querySelector('.track-play-btn');
                        if (btn) btn.innerText = '▶';
                    });
                    item.classList.add('active');
                    bgMusic.src = src;
                    bgMusic.volume = 0;
                    bgMusic.play().then(() => {
                        fadeAudio(bgMusic, targetVol);
                        updateMusicUI(true);
                    });
                    if (playBtn) playBtn.innerText = '⏸';
                }, 200);
            }
            playSound('click');
        });
    });

    // Seek Controls
    if (seekPrev) {
        seekPrev.addEventListener('click', () => {
            bgMusic.currentTime = Math.max(0, bgMusic.currentTime - 10);
            playSound('click');
        });
    }

    if (seekNext) {
        seekNext.addEventListener('click', () => {
            bgMusic.currentTime = Math.min(bgMusic.duration, bgMusic.currentTime + 10);
            playSound('click');
        });
    }

    if (playerProgressBar) {
        playerProgressBar.addEventListener('click', (e) => {
            const rect = playerProgressBar.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            const percent = x / width;
            bgMusic.currentTime = percent * bgMusic.duration;
            playSound('click');
        });
    }

    // Volume Control
    if (volumeSlider) {
        bgMusic.volume = volumeSlider.value;
        volumeSlider.addEventListener('input', (e) => {
            const vol = e.target.value;
            bgMusic.volume = vol;
            if (volumeStatus) {
                if (vol == 0) volumeStatus.innerText = '🔇';
                else if (vol < 0.5) volumeStatus.innerText = '🔉';
                else volumeStatus.innerText = '🔊';
            }
        });
    }

    // Update Progress Bar
    if (bgMusic) {
        bgMusic.addEventListener('timeupdate', () => {
            if (bgMusic.duration) {
                const percent = (bgMusic.currentTime / bgMusic.duration) * 100;
                if (progressFill) progressFill.style.width = `${percent}%`;
            }
        });

        bgMusic.addEventListener('play', () => updateMusicUI(true));
        bgMusic.addEventListener('pause', () => updateMusicUI(false));

        bgMusic.addEventListener('ended', () => {
            // Find current active track
            let currentTrackIndex = -1;
            trackItems.forEach((item, index) => {
                if (item.classList.contains('active')) currentTrackIndex = index;
            });

            // Calculate next track index
            let nextTrackIndex = (currentTrackIndex + 1) % trackItems.length;
            const nextTrack = trackItems[nextTrackIndex];

            // Trigger click on next track to use existing play logic (with fade)
            if (nextTrack) {
                nextTrack.click();
            }
        });
    }

    const initAudio = () => {
        // Resume/Initialize AudioContext for UI sounds - force creation on valid gesture
        const ctx = getAudioCtx(true);
        if (ctx && ctx.state === 'suspended') {
            ctx.resume();
        }

        if (!bgMusic || !bgMusic.paused) return;
        bgMusic.play().then(() => updateMusicUI(true)).catch(() => { });
    };

    // Valid gestures for audio activation: click, touch, keypress
    ['click', 'touchstart', 'keydown'].forEach(evt => {
        document.addEventListener(evt, initAudio, { once: true });
    });

    // ── CUSTOM CURSOR ──
    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursorRing');
    const cursorDot = document.getElementById('cursorDot');

    // Check for touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice && cursor && ring && cursorDot) {
        let mx = 0, my = 0, dx = 0, dy = 0;

        // Heart Trail Logic
        let lastHeartTime = 0;
        document.addEventListener('mousemove', e => {
            mx = e.clientX;
            my = e.clientY;

            cursor.style.left = mx + 'px';
            cursor.style.top = my + 'px';
            cursorDot.style.left = mx + 'px';
            cursorDot.style.top = my + 'px';

            // Create heart flare every 100ms
            const now = Date.now();
            if (now - lastHeartTime > 100) {
                createHeartFlare(mx, my);
                lastHeartTime = now;
            }
        });

        function createHeartFlare(x, y) {
            const heart = document.createElement('div');
            heart.className = 'heart-flare';
            heart.innerHTML = '❤️';
            heart.style.left = x + 'px';
            heart.style.top = y + 'px';
            document.body.appendChild(heart);
            setTimeout(() => heart.remove(), 1000);
        }

        // Smooth ring animation with spring physics
        let rx = 0, ry = 0;
        let ringEase = 0.15;

        function animateRing() {
            const dx = mx - rx;
            const dy = my - ry;
            rx += dx * ringEase;
            ry += dy * ringEase;
            ring.style.left = rx + 'px';
            ring.style.top = ry + 'px';
            requestAnimationFrame(animateRing);
        }
        animateRing();

        // Cursor & Interactive Events
        const interactiveElements = document.querySelectorAll('a, button, .nav-link, .crime-card, .reason-card, .mood-card, .stat-box, .letter-paper, .poster-card, .gallery-item, .modal-close, .advanced-music-player, .footer-back-top');

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1.8)';
                ring.style.transform = 'translate(-50%, -50%) scale(1.5)';
                cursor.style.background = 'var(--gold)';
                ring.style.borderColor = 'var(--gold)';
                playSound('hover');
            });

            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                ring.style.transform = 'translate(-50%, -50%) scale(1)';
                cursor.style.background = 'var(--red)';
                ring.style.borderColor = 'rgba(192, 39, 45, 0.5)';
            });

            el.addEventListener('click', () => {
                playSound('click');
            });
        });
    } else {
        // Hide cursor on touch devices
        [cursor, ring, cursorDot].forEach(el => {
            if (el) el.style.display = 'none';
        });
    }

    // ── NAVIGATION SCROLL & TOGGLE ──
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const backToTop = document.getElementById('backToTop');
    const navIndicator = document.getElementById('navIndicator');
    const scrollBar = document.getElementById('scrollBar');
    const sections = document.querySelectorAll('section[id]');
    const navLinkEls = document.querySelectorAll('.nav-link');

    if (nav) {
        function updateNavOrder() {
            // Back to top button
            const scrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
            if (backToTop) {
                backToTop.classList.toggle('visible', scrollPos > 500);
            }

            // Nav background effect
            nav.classList.toggle('scrolled', scrollPos > 80);

            // Scroll Progress
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            if (scrollBar) scrollBar.style.width = scrolled + "%";

            // Section Highlighting (Scroll Spy)
            sections.forEach(current => {
                const sectionHeight = current.offsetHeight;
                const sectionTop = current.offsetTop - 120;
                const sectionId = current.getAttribute('id');
                const link = document.querySelector(`.nav-links a[href*=${sectionId}]`);

                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    if (link) {
                        navLinkEls.forEach(l => l.classList.remove('active'));
                        link.classList.add('active');

                        // Move indicator
                        if (navIndicator && window.innerWidth > 992) {
                            const rect = link.getBoundingClientRect();
                            const navRect = nav.getBoundingClientRect();
                            navIndicator.style.width = (rect.width * 0.8) + 'px';
                            // Center indicator under the link
                            const leftPos = rect.left - navRect.left + (rect.width * 0.1);
                            navIndicator.style.left = leftPos + 'px';
                            navIndicator.style.opacity = '1';
                        }
                    }
                }
            });

            // Initial or Out of section state
            if (scrollY < 300) {
                navLinkEls.forEach(l => l.classList.remove('active'));
                if (navIndicator) navIndicator.style.opacity = '0';
            }
        }

        window.addEventListener('scroll', updateNavOrder);
        window.addEventListener('resize', updateNavOrder);
        updateNavOrder(); // Initial call
    }

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Back to top functionality
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ── PARTICLE SYSTEM ──
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let W, H, particles = [];

        function resize() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * W;
                this.y = Math.random() * H;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.speedY = (Math.random() - 0.5) * 0.4;
                this.life = Math.random();
                this.maxLife = 0.5 + Math.random() * 0.5;
                this.char = Math.random() > 0.7 ? '♥' : (Math.random() > 0.5 ? '·' : '✦');
                // Assign color once to prevent flickering
                const colors = ['#c9a84c', '#c0272d', '#e8cc80'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.baseAlpha = 0.3 + Math.random() * 0.3;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.life += 0.003;

                // Wrap around screen
                if (this.x > W) this.x = 0;
                if (this.x < 0) this.x = W;
                if (this.y > H) this.y = 0;
                if (this.y < 0) this.y = H;

                if (this.life > this.maxLife) this.reset();
            }

            draw() {
                const alpha = Math.sin(this.life / this.maxLife * Math.PI) * this.baseAlpha;
                ctx.globalAlpha = alpha;
                ctx.fillStyle = this.color;
                ctx.font = this.size * 10 + 'px serif';
                ctx.fillText(this.char, this.x, this.y);
            }
        }

        // Create particles
        const particleCount = Math.min(100, Math.floor((W * H) / 15000));
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animateParticles() {
            ctx.clearRect(0, 0, W, H);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            ctx.globalAlpha = 1;
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // ── SCROLL REVEAL ANIMATIONS ──
    const reveals = document.querySelectorAll('.reveal');
    const timelineItems = document.querySelectorAll('.timeline-item');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => revealObserver.observe(el));
    timelineItems.forEach(el => revealObserver.observe(el));

    // ── NUMBER COUNTER ANIMATION ──
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const count = target.getAttribute('data-count');

                if (count !== '∞') {
                    animateCounter(target, parseInt(count));
                }

                counterObserver.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(num => counterObserver.observe(num));

    // Removed automatic metric value observer, now handled by scan button

    function animateCounter(element, target) {
        let current = 0;
        const increment = target / 50;
        const duration = 2000;
        const stepTime = duration / 50;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + (target === 100 ? '%' : '');
        }, stepTime);
    }

    // ── SMOOTH SCROLL FOR ANCHOR LINKS ──
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ── PARALLAX EFFECT FOR HERO ──
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');

    if (hero && heroContent) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroHeight = hero.offsetHeight;

            if (scrolled < heroHeight) {
                heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                heroContent.style.opacity = 1 - (scrolled / heroHeight);
            }
        });
    }

    // ── PREMIUM 3D TILT & GLARE EFFECT ──
    const tiltElements = document.querySelectorAll('.crime-card, .reason-card, .mood-card, .gallery-item, .poster-card');

    tiltElements.forEach(el => {
        // Add glare overlay dynamically if not exists
        if (!el.querySelector('.card-glare')) {
            const glare = document.createElement('div');
            glare.className = 'card-glare';
            el.appendChild(glare);
        }

        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
            const rotateY = ((x - centerX) / centerX) * 10; // Max 10 deg

            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;

            // Move glare
            const glare = el.querySelector('.card-glare');
            if (glare) {
                const percentX = (x / rect.width) * 100;
                const percentY = (y / rect.height) * 100;
                glare.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(255, 255, 255, 0.15) 0%, transparent 70%)`;
                glare.style.opacity = '1';
            }
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            const glare = el.querySelector('.card-glare');
            if (glare) glare.style.opacity = '0';
        });
    });

    // ── GALLERY MODAL LOGIC ──
    const galleryModal = document.getElementById('galleryModal');
    const modalImg = document.getElementById('modalImg');
    const modalTag = document.getElementById('modalTag');
    const modalMsg = document.getElementById('modalMsg');
    const modalClose = document.getElementById('modalClose');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (galleryItems.length && galleryModal && modalImg) {
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img').src;
                const type = item.getAttribute('data-type');
                const msg = item.getAttribute('data-msg');
                const danger = item.getAttribute('data-danger');
                const weapon = item.getAttribute('data-weapon');
                const emoji = item.getAttribute('data-emoji') || '💋';
                const index = item.getAttribute('data-index') || '01';
                const love = item.getAttribute('data-love') || '143/10';

                modalImg.src = img;
                modalTag.textContent = type;
                modalMsg.textContent = msg;
                document.getElementById('modalDanger').textContent = danger;
                document.getElementById('modalWeapon').textContent = weapon;

                // New cute fields
                const modalEmoji = document.getElementById('modalEmoji');
                const modalIndex = document.getElementById('modalIndex');
                const modalLove = document.getElementById('modalLove');
                if (modalEmoji) modalEmoji.textContent = emoji;
                if (modalIndex) modalIndex.textContent = '#' + index;
                if (modalLove) modalLove.textContent = love;

                galleryModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });


        const closeModal = () => {
            galleryModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        };

        if (modalClose) modalClose.addEventListener('click', closeModal);
        galleryModal.addEventListener('click', (e) => {
            if (e.target === galleryModal) closeModal();
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && galleryModal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // ── FORENSIC ANALYSIS LOGIC ──
    const startScanBtn = document.getElementById('startScan');
    const scanStatusText = document.getElementById('scanStatus');
    const scanTerminal = document.getElementById('scanTerminal');
    const metricBars = document.querySelectorAll('.metric-bar');
    const counters = document.querySelectorAll('.counter');

    const logToTerminal = (msg) => {
        if (!scanTerminal) return;
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerText = msg;
        scanTerminal.appendChild(line);
        scanTerminal.scrollTop = scanTerminal.scrollHeight;
    };

    if (startScanBtn) {
        startScanBtn.addEventListener('click', () => {
            if (startScanBtn.classList.contains('scanning')) return;

            const analysisSection = document.getElementById('analysis');
            if (analysisSection) analysisSection.classList.add('scanning-active');

            playSound('scan');
            startScanBtn.classList.add('scanning');

            if (scanStatusText) scanStatusText.innerText = 'INITIALIZING SYSTEM...';
            logToTerminal('ACCESSING ENCRYPTED EMOTIONAL LAYERS...');

            let overallProgress = 0;
            const totalDuration = 4000;
            const startTime = Date.now();
            const milestones = new Set();

            const updateOverallProgress = () => {
                const elapsed = Date.now() - startTime;
                overallProgress = Math.min((elapsed / totalDuration) * 100, 100);

                startScanBtn.innerHTML = `<span class="scan-icon spin">⚙️</span> PROCESSING: ${Math.ceil(overallProgress)}%`;

                // Staged Logging
                if (overallProgress >= 10 && !milestones.has(10)) { milestones.add(10); logToTerminal('BYPASSING HEART-WALL SEGMENTS...'); }
                if (overallProgress >= 30 && !milestones.has(30)) { milestones.add(30); logToTerminal('EXTRACTING MEMORY FRAGMENTS...'); }
                if (overallProgress >= 50 && !milestones.has(50)) { milestones.add(50); logToTerminal('MEASURING COGNITIVE RADIANCE...'); }
                if (overallProgress >= 75 && !milestones.has(75)) { milestones.add(75); logToTerminal('CALIBRATING NAUGHTINESS INDEX...'); }
                if (overallProgress >= 90 && !milestones.has(90)) { milestones.add(90); logToTerminal('FINAL SECTOR ANALYSIS...'); }

                // Sync metric bars and counters to the overall progress
                metricBars.forEach(bar => {
                    const target = parseInt(bar.getAttribute('data-target'));
                    const currentWidth = (overallProgress / 100) * target;
                    bar.style.width = currentWidth + '%';
                });

                counters.forEach(counter => {
                    const dataVal = counter.getAttribute('data-val');
                    const unit = counter.getAttribute('data-unit') || '';
                    const target = dataVal === '∞' ? 100 : parseInt(dataVal);
                    const currentVal = (overallProgress / 100) * target;

                    if (dataVal === '∞') {
                        if (overallProgress >= 100) {
                            counter.innerText = '∞' + unit;
                        } else {
                            counter.innerText = Math.ceil(currentVal) + unit;
                        }
                    } else {
                        counter.innerText = Math.ceil(currentVal) + unit;
                    }
                });

                if (overallProgress < 100) {
                    requestAnimationFrame(updateOverallProgress);
                } else {
                    playSound('success');
                    if (scanStatusText) scanStatusText.innerText = 'ANALYSIS COMPLETE';
                    logToTerminal('VERDICT: ABSOLUTELY PERFECT. NO DEFENSE POSSIBLE.');
                    startScanBtn.innerHTML = '<span class="scan-icon">✅</span> SCAN COMPLETE';
                    startScanBtn.style.borderColor = 'var(--gold)';
                    startScanBtn.style.color = 'var(--gold)';
                    if (analysisSection) analysisSection.classList.remove('scanning-active');
                }
            };

            updateOverallProgress();
        });
    }

    // ── CONSOLE EASTER EGG ──
    console.log('%c💋 Made with Love for Lyraa by Yuki 💋',
        'font-size: 20px; color: #c0272d; font-weight: bold;');
    console.log('%cAll crimes listed are real. All love is realer.',
        'font-size: 12px; color: #c9a84c;');
});

// ── PAGE VISIBILITY ──
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.title = '💋 Come Back...';
    } else {
        document.title = 'LYRAA — The Most Wanted Woman Alive';
    }
});