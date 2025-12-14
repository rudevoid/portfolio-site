// File: script.js (fixed)
// Static-friendly enhancements: reveal animations, floating badges, smooth scroll, mailto form.
// FIXED: Debounce resize, improved form feedback with class toggle.
// IMPROV: Adjusted reveal threshold to 0.15, mobile scroll offset.
(() => {
    document.documentElement.classList.remove('no-js');
    document.documentElement.classList.add('js');

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    // Delegated actions (no inline JS)
    document.addEventListener('click', (e) => {
        const el = e.target && e.target.closest ? e.target.closest('[data-action]') : null;
        if (!el) return;
        const action = el.getAttribute('data-action');
        if (action === 'reload') {
            e.preventDefault();
            location.reload();
        }
    });

    const header = $('.top');
    const availability = $('#availability');
    const bottomCta = $('#bottomCta');
    const yearEl = $('#year');
    const form = $('#contactForm');
    const note = $('#formNote');
    const contact = $('#contact');

    const langSwitcher = $('.lang-switcher');
    let langMenu, langBtn;
    if (langSwitcher) {
        langBtn = $('.lang-current', langSwitcher);
        langMenu = $('.lang-menu', langSwitcher);

        if (langBtn && langMenu) {
            const openMenu = () => {
                langSwitcher.classList.add('is-open');
                langBtn.setAttribute('aria-expanded', 'true');
            };
            const closeMenu = () => {
                langSwitcher.classList.remove('is-open');
                langBtn.setAttribute('aria-expanded', 'false');
            };
            const isOpen = () => langSwitcher.classList.contains('is-open') || langBtn.getAttribute('aria-expanded') === 'true';

            langBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (isOpen()) closeMenu();
                else openMenu();
            });

            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (!langSwitcher.contains(e.target)) closeMenu();
            });

            // Close on Escape
            langBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeMenu();
            });

            // Close after choosing a language
            langMenu.addEventListener('click', (e) => {
                const a = e.target && e.target.closest ? e.target.closest('a') : null;
                if (a) closeMenu();
            });
        }
    }


    // Year
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Debounce util for resize
    function debounce(fn, ms) {
        let timer;
        return () => {
            clearTimeout(timer);
            timer = setTimeout(fn, ms);
        };
    }

    // Smooth scroll with fixed-header offset (improved for mobile)
    function scrollToId(id) {
        const el = document.getElementById(id);
        if (!el) return;
        const headerH = header ? header.getBoundingClientRect().height : 0;
        const bottomH = window.innerWidth < 941 ? (bottomCta ? bottomCta.getBoundingClientRect().height + 32 : 0) : 0; // IMPROV: mobile offset
        const y = window.scrollY + el.getBoundingClientRect().top - headerH - 14 - bottomH;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }

    $$('a[href^="#"]').forEach(a => {
        const href = a.getAttribute('href') || '';
        const id = href.slice(1);
        if (!id) return;
        a.addEventListener('click', (e) => {
            // allow normal behavior if new tab etc.
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            scrollToId(id);
            history.replaceState(null, '', `#${id}`);
        });
    });

    // Reveal on scroll (improved threshold)
    const revealEls = $$('.reveal');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                if (en.isIntersecting) {
                    en.target.classList.add('is-in');
                    io.unobserve(en.target);
                }
            });
        }, { threshold: 0.15 }); // IMPROV: slightly higher for earlier trigger
        revealEls.forEach(el => io.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('is-in'));
    }

    // Floating availability + mobile CTA
    function updateFloating() {
        const y = window.scrollY || 0;
        const showAvail = y > 220;
        if (availability) availability.classList.toggle('is-visible', showAvail);

        // hide bottom CTA when near contact section
        if (!bottomCta || !contact) return;
        const contactTop = contact.getBoundingClientRect().top;
        const nearContact = contactTop < window.innerHeight * 0.65;
        bottomCta.classList.toggle('is-hidden', nearContact);
    }
    window.addEventListener('scroll', updateFloating, { passive: true });
    window.addEventListener('resize', debounce(updateFloating, 100)); // FIXED: debounce resize
    updateFloating();

    // Form -> mailto (static hosting friendly) + feedback
    function pickEmail() {
        const mailA = document.querySelector('a[href^="mailto:"]');
        if (!mailA) return 'roman@example.com';
        return (mailA.getAttribute('href') || '').replace(/^mailto:/, '') || 'roman@example.com';
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!form.checkValidity()) {
                if (note) {
                    note.textContent = 'Заполните, пожалуйста, обязательные поля.';
                    note.classList.remove('success');
                }
                form.reportValidity();
                return;
            }

            const data = new FormData(form);
            const name = (data.get('name') || '').toString().trim();
            const contactStr = (data.get('contact') || '').toString().trim();
            const role = (data.get('role') || '').toString().trim();
            const task = (data.get('task') || '').toString().trim();
            const msg = (data.get('message') || '').toString().trim();

            const email = pickEmail();
            const subject = `Запрос с сайта — ${task || 'задача'}${role ? ` (${role})` : ''}`;
            const body =
                `Имя: ${name || '-'}
Контакт: ${contactStr || '-'}
Роль: ${role || '-'}
Тип задачи: ${task || '-'}
--------------------------
Сообщение:
${msg || '-'}

(Отправлено со статического сайта)`;

            const url = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = url;

            if (note) {
                note.textContent = 'Открылось письмо. Если клиент не открылся — напишите в Telegram/WhatsApp (кнопки выше).';
                note.classList.add('success'); // IMPROV: visual feedback
                setTimeout(() => note.classList.remove('success'), 5000); // fade after 5s
            }
        });
    }

    // Lightweight toast (used for placeholder contacts, errors, etc.)
    const toast = (() => {
        let el, t;
        return (msg) => {
            if (!msg) return;
            if (!el) {
                el = document.createElement('div');
                el.id = 'toast';
                el.setAttribute('role', 'status');
                el.setAttribute('aria-live', 'polite');
                document.body.appendChild(el);
            }
            el.textContent = msg;
            el.classList.add('is-on');
            clearTimeout(t);
            t = setTimeout(() => el && el.classList.remove('is-on'), 2600);
        };
    })();

    // Placeholder contact buttons (Telegram/WhatsApp) — show a hint instead of dead links
    $$('a[data-soon]').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            toast('Ссылку на мессенджер можно быстро добавить в коде: найдите блок "Контакты" и замените # на реальный URL.');
        });
    });

    // Register Service Worker (PWA). Do not register on file:// to avoid confusing local preview.
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => { /* silent */ });
        });
    }


    // Language switcher: highlight active language and toggle dropdown
    (function () {
        const menu = document.querySelector('.lang-menu');
        const btn = document.querySelector('.lang-current');
        const currentCodeEl = document.querySelector('.lang-current__code');
        if (!menu || !btn || !currentCodeEl) return;

        const knownLangs = ['en','de','es','fr','it','tr','ar','zh','ja','hi'];

        function detectCurrentLang() {
            const path = (window.location && window.location.pathname) || '/';
            const trimmed = path.replace(/^\/+/,'').replace(/\/+$/,'');
            if (!trimmed) return 'ru';
            const first = trimmed.split('/')[0];
            return knownLangs.includes(first) ? first : 'ru';
        }

        const currentLang = detectCurrentLang();

        const items = Array.from(menu.querySelectorAll('a[href]'));
        items.forEach(a => {
            const href = a.getAttribute('href') || '';
            let code = 'ru';
            if (href === '/' || href === './') {
                code = 'ru';
            } else {
                const m = href.match(/^\/([a-z]{2})\/$/i);
                if (m) code = m[1].toLowerCase();
            }
            if (code === currentLang) {
                a.classList.add('is-active');
                currentCodeEl.textContent = code.toUpperCase() === 'RU' ? 'RU' : code.toUpperCase();
            } else {
                a.classList.remove('is-active');
            }
        });

        function closeMenu() {
            btn.setAttribute('aria-expanded', 'false');
            menu.setAttribute('hidden', '');
        }

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            if (expanded) {
                closeMenu();
            } else {
                btn.setAttribute('aria-expanded', 'true');
                menu.removeAttribute('hidden');
            }
        });

        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !btn.contains(e.target)) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMenu();
            }
        });
    })();
    
})();
