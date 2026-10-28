(() => {
    const W = window, FILE = location.protocol === "file:";

    W.API_URL = "https://vishal-car-rental-backend.vercel.app";
    W.WA = "916367000635";

    W.esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);

    W.money = n => new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(n);

    W.slugify = t => String(t || "").toLowerCase()
        .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    W.L = p => {
        if (!FILE) return p;
        if (p === "/") return "index.html";

        let m;
        if (m = p.match(/^\/#(.+)/)) return "index.html#" + m[1];
        if (m = p.match(/^\/cars\/(.+)/)) return "car.html?slug=" + m[1];
        if (m = p.match(/^\/blog\/(.+)/)) return "blog-post.html?slug=" + m[1];

        return p.replace(/^\//, "") + ".html";
    };

    W.getSlug = k => {
        const m = location.pathname.match(new RegExp("/" + k + "/([^/?#]+)"));
        return decodeURIComponent(
            m ? m[1] : new URLSearchParams(location.search).get("slug") || ""
        );
    };

    W.api = async (p, o) => {
        const r = await fetch(API_URL + p, o);
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || r.status);
        return d;
    };

    W.post = (p, b) => api(p, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(b)
    });

    W.fmtDate = d => new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric"
    });

    W.stars = n =>
        `<span class="tracking-widest text-amber-400" aria-label="${n} out of 5 stars">${"★".repeat(n)}<span class="text-white/20">${"★".repeat(5 - n)}</span></span>`;

    W.md = t => String(t || "").split(/\n\s*\n/).map(b => {
        b = b.trim();

        if (b.startsWith("## ")) {
            return `<h2 class="mt-8 mb-3 text-2xl font-bold text-white">${esc(b.slice(3))}</h2>`;
        }

        const ls = b.split("\n");

        if (ls.every(l => l.trim().startsWith("- "))) {
            return `<ul class="my-4 space-y-2">${ls.map(l =>
                `<li class="flex gap-3 rounded-xl border border-white/10 bg-navy/60 px-4 py-3 text-sm"><span class="text-gold">●</span><span>${esc(l.trim().slice(2))}</span></li>`
            ).join("")}</ul>`;
        }

        return `<p class="my-4">${esc(b)}</p>`;
    }).join("");

    W.H = (tag, title, sub) =>
        `<header class="max-w-4xl mx-auto px-6 pt-14 pb-8 text-center up"><p class="inline-block rounded-full border border-gold/40 bg-violet-600/10 text-gold px-4 py-1 text-xs font-bold tracking-widest">${tag}</p><h1 class="mt-4 text-4xl sm:text-5xl font-extrabold">${title}</h1><p class="mt-4 text-steel text-lg">${sub}</p></header>`;

    W.seo = o => {
        document.title = o.title;

        const set = (sel, mk, v) => {
            let e = document.querySelector(sel);
            if (!e) {
                e = mk();
                document.head.appendChild(e);
            }
            e.setAttribute(e.tagName === "LINK" ? "href" : "content", v);
        };

        set('meta[name="description"]',
            () => Object.assign(document.createElement("meta"), { name: "description" }),
            o.desc
        );

        set('link[rel="canonical"]',
            () => Object.assign(document.createElement("link"), { rel: "canonical" }),
            o.url
        );

        [["og:title", o.title], ["og:description", o.desc],
         ["og:url", o.url], ["og:image", o.image || ""]].forEach(([p, v]) => {
            if (!v) return;

            let e = document.querySelector(`meta[property="${p}"]`);
            if (!e) {
                e = document.createElement("meta");
                e.setAttribute("property", p);
                document.head.appendChild(e);
            }
            e.content = v;
        });

        if (o.ld) {
            const s = document.createElement("script");
            s.type = "application/ld+json";
            s.textContent = JSON.stringify(o.ld);
            document.head.appendChild(s);
        }
    };

    W.submitJSON = async (f, path, ok, after) => {
        const st = f.querySelector(".st");
        const b = f.querySelector('button[type="submit"]');
        const d = Object.fromEntries(new FormData(f));

        b.disabled = true;
        st.className = "st text-sm text-steel";
        st.textContent = "Sending…";

        try {
            await post(path, d);
            f.reset();
            st.className = "st text-sm text-emerald-400";
            st.textContent = ok;
            after && after(d);
        } catch (e) {
            st.className = "st text-sm text-red-400";
            st.textContent = e.message || "Something went wrong. Please try again.";
        }

        b.disabled = false;
    };

    W.reveal = (r = document) => {
        const io = new IntersectionObserver(e => e.forEach(x => {
            if (x.isIntersecting) {
                x.target.classList.add("on");
                io.unobserve(x.target);
            }
        }), { threshold: .1 });

        r.querySelectorAll(".rv:not(.on)").forEach((el, i) => {
            el.style.transitionDelay = (i % 3) * 80 + "ms";
            io.observe(el);
        });
    };

    if (W.tailwind) {
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        navy: "#0B0714",
                        gold: "#A78BFA",
                        snow: "#100A1D",
                        steel: "#B3A8D1",
                        card: "#150E26"
                    },
                    fontFamily: {
                        display: ["Manrope", "sans-serif"],
                        body: ["Inter", "sans-serif"]
                    }
                }
            }
        };
    }

    const lk = document.createElement("link");
    lk.rel = "stylesheet";
    lk.href = "https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(lk);

    const st = document.createElement("style");
    st.textContent = `
        html {
            scroll-behavior: smooth;
            scroll-padding-top: 5rem;
        }

        #hdr { display: contents; }

        body {
            font-family: Inter, sans-serif;
            color: #F3EEFF;
            color-scheme: dark;
            background: #0B0714;
        }

        h1, h2, h3, .font-display {
            font-family: Manrope, sans-serif;
            letter-spacing: -.02em;
        }

        @keyframes rise {
            from { opacity: 0; transform: translateY(24px); }
            to { opacity: 1; transform: none; }
        }

        @keyframes ring {
            0% { box-shadow: 0 0 0 0 rgba(139,92,246,.6); }
            100% { box-shadow: 0 0 0 18px rgba(139,92,246,0); }
        }

        @keyframes shine {
            to { background-position: -200% 0; }
        }

        .up > *, .up {
            animation: rise .7s cubic-bezier(.2,.7,.2,1) both;
        }

        .up > *:nth-child(2) { animation-delay: .1s; }
        .up > *:nth-child(3) { animation-delay: .2s; }

        .rv {
            opacity: 0;
            transform: translateY(24px);
            transition: opacity .7s, transform .7s;
        }

        .rv.on {
            opacity: 1;
            transform: none;
        }

        .fab { animation: ring 2.2s infinite; }

        .card {
            transition: transform .35s, box-shadow .35s, border-color .35s;
        }

        .card:hover {
            transform: translateY(-6px);
            box-shadow: 0 24px 50px -20px rgba(124,58,237,.55);
            border-color: #8B5CF6;
        }

        .sk {
            background: linear-gradient(90deg, #150E26 25%, #241A3F 50%, #150E26 75%);
            background-size: 200% 100%;
            animation: shine 1.4s linear infinite;
        }

        .inp {
            width: 100%;
            border-radius: .6rem;
            border: 1px solid rgba(255,255,255,.15);
            background: #0F0A1C;
            color: #fff;
            padding: .75rem 1rem;
            font-size: .9rem;
        }

        .inp::placeholder { color: #8277a3; }

        .tab.on { background: #7C3AED; color: #fff; }

        .hp {
            position: absolute;
            left: -9999px;
            height: 0;
            width: 0;
            opacity: 0;
        }

        details summary { list-style: none; cursor: pointer; }

        details summary::-webkit-details-marker { display: none; }

        details[open] .plus { transform: rotate(45deg); }

        .plus { transition: transform .3s; }

        details[open] > div { animation: rise .4s both; }

        :focus-visible {
            outline: 3px solid #A78BFA;
            outline-offset: 3px;
        }

        /* Compact responsive navbar */
        .nav-inner {
            min-width: 0;
        }

        .nav-brand {
            min-width: 0;
            flex-shrink: 1;
        }

        .nav-brand-name {
            white-space: nowrap;
        }

        .nav-actions {
            margin-left: auto;
            flex-shrink: 0;
        }

        .nav-book {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 36px;
            padding: 0 10px;
            white-space: nowrap;
            font-size: 12px;
            font-weight: 700;
            border-radius: 9px;
        }

        .nav-menu-btn {
            display: grid;
            place-items: center;
            flex-shrink: 0;
            width: 36px;
            height: 36px;
            border-radius: 9px;
        }

        @media (min-width: 640px) {
            .nav-book {
                height: 40px;
                padding: 0 16px;
                font-size: 14px;
            }

            .nav-menu-btn {
                width: 40px;
                height: 40px;
            }
        }

        @media (max-width: 359px) {
            .nav-brand-name { font-size: 12px; }
            .nav-book { padding: 0 8px; }
            .nav-inner { gap: 6px; }
        }

        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation: none !important;
                transition: none !important;
            }

            .rv {
                opacity: 1;
                transform: none;
            }
        }
    `;
    document.head.appendChild(st);

    const NAV = [
        ["home", "Home", "/"],
        ["fleet", "Fleet", "/#fleet"],
        ["about", "About", "/about"],
        ["reviews", "Reviews", "/reviews"],
        ["blog", "Blog", "/blog"],
        ["faq", "FAQ", "/faq"],
        ["contact", "Contact", "/contact"]
    ];

    const cur = () => document.body.dataset.page;

    /* Updated compact navbar */
    const header = () => `
        <div class="bg-black text-slate-300 text-xs hidden md:block border-b border-white/10">
            <div class="max-w-7xl mx-auto px-6 py-1.5 flex justify-between">
                <span>232, Sector 7, Keshavpura, Mahaveer Nagar, Kota, Rajasthan 324005</span>
                <span>
                    Open 24/7 |
                    <a class="text-gold font-semibold" href="tel:+916367000635">
                        +91 63670 00635
                    </a>
                </span>
            </div>
        </div>

        <header class="sticky top-0 z-40 bg-navy/95 backdrop-blur border-b border-white/10">
            <nav class="nav-inner max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 h-14 sm:h-16 flex items-center gap-2 sm:gap-3"
                 aria-label="Main">

                <a href="${L("/")}"
                   class="nav-brand flex items-center gap-2"
                   aria-label="Vishal Car Rental Home">

                    <span class="grid place-items-center w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-lg bg-violet-600 text-white">
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="21"
        height="21"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11"/>
        <path d="M3 11.5A1.5 1.5 0 0 1 4.5 10h15a1.5 1.5 0 0 1 1.5 1.5V17H3z"/>
        <path d="M3 14h18M6 17v2m12-2v2"/>
        <circle cx="6.5" cy="13" r="1"/>
        <circle cx="17.5" cy="13" r="1"/>
    </svg>
</span>

                    <span class="nav-brand-name font-display font-extrabold text-sm sm:text-lg leading-tight">
                        Vishal<span class="text-gold">Car Rental</span>
                        <span class="hidden sm:block text-[9px] font-semibold tracking-wide text-steel mt-0.5">
                            TOUR & TRAVELS · KOTA
                        </span>
                    </span>
                </a>

                <ul class="hidden lg:flex items-center gap-5 xl:gap-7 text-sm font-medium mx-auto">
                    ${NAV.map(n => `
                        <li>
                            <a class="${cur() === n[0] ? "text-gold" : "hover:text-gold"} whitespace-nowrap"
                               href="${L(n[2])}">
                                ${n[1]}
                            </a>
                        </li>
                    `).join("")}
                </ul>

                <div class="nav-actions flex items-center gap-1.5 sm:gap-2">

                    <a href="${L("/#book")}"
                       class="nav-book bg-violet-600 hover:bg-violet-400 hover:text-navy transition">
                        <span class="sm:hidden">Book</span>
                        <span class="hidden sm:inline">Book a Car</span>
                    </a>

                   

                    <button id="mb"
                            type="button"
                            aria-label="Toggle navigation menu"
                            aria-controls="mn"
                            aria-expanded="false"
                            class="nav-menu-btn lg:hidden border border-white/15 bg-card text-base">
                        ☰
                    </button>
                </div>
            </nav>

            <ul id="mn"
                class="hidden lg:hidden border-t border-white/10 bg-navy px-4 py-2 space-y-1">
                ${NAV.map(n => `
                    <li>
                        <a class="block rounded-lg px-3 py-2.5 text-sm hover:bg-card hover:text-gold ${cur() === n[0] ? "text-gold" : ""}"
                           href="${L(n[2])}">
                            ${n[1]}
                        </a>
                    </li>
                `).join("")}
            </ul>
        </header>
    `;

    const footer = () => `
        <section class="max-w-7xl mx-auto px-6 py-14">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-5 rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-900/50 to-card p-6 md:p-8">

                <div>
                    <h2 class="text-2xl font-bold">Ready to explore Kota & Rajasthan?</h2>
                    <p class="text-steel mt-1">
                        We believe in customer experience and our service speaks for it.
                        Rent your next self drive car with us.
                    </p>
                </div>

                <div class="flex gap-3 flex-wrap">
                    <a href="tel:+916367000635"
                       class="rounded-lg border border-white/15 bg-card px-6 py-3 font-semibold hover:border-violet-400 transition">
                        +91 63670 00635
                    </a>

                    <a href="${L("/#fleet")}"
                       class="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 font-bold hover:brightness-110 transition">
                        Rent Your Next Car
                    </a>
                </div>
            </div>
        </section>

        <footer class="bg-black text-slate-300 pt-12 pb-6 border-t border-white/10">
            <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10 text-sm">

                <div>
                    <p class="font-display font-extrabold text-lg text-white">Vishal Car Rental</p>
                    <p class="mt-3 text-steel">
                        Self drive cars, chauffeur-driven taxis and Rajasthan tour packages in Kota.
                        Well-maintained cars, verified documents and transparent pricing.
                    </p>
                    <p class="mt-3 inline-block rounded-lg border border-white/15 px-3 py-1.5 text-gold">
                        ✓ Verified & Insured Fleet
                    </p>
                </div>

                <div>
                    <p class="font-bold text-white mb-3">Quick Links</p>
                    <ul class="space-y-2">
                        ${[
                            ["All Cars & Pricing", "/#fleet"],
                            ["About Us", "/about"],
                            ["Customer Reviews", "/reviews"],
                            ["Travel Blogs & Guides", "/blog"],
                            ["Help Center & FAQs", "/faq"],
                            ["Contact", "/contact"]
                        ].map(x => `
                            <li><a class="hover:text-gold" href="${L(x[1])}">→ ${x[0]}</a></li>
                        `).join("")}
                    </ul>
                </div>

                <div>
                    <p class="font-bold text-white mb-3">Head Office</p>
                    <p class="text-steel">
                        232, Sector 7, Keshavpura, Mahaveer Nagar, Kota, Rajasthan 324005
                    </p>
                    <p class="mt-2">
                        Phone:
                        <a class="text-gold" href="tel:+916367000635">6367000635</a>
                    </p>
                    <p class="mt-2 text-steel">Bookings & support: 24/7</p>
                </div>

                <div>
                    <p class="font-bold text-white mb-3">Get travel offers</p>
                    <form id="subf" class="flex rounded-xl border border-white/10 bg-card p-1">
                        <input type="email" name="email" required
                               placeholder="Enter your email"
                               class="w-full min-w-0 bg-transparent px-3 text-white outline-none"
                               aria-label="Email">
                        <button type="submit"
                                class="rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white whitespace-nowrap">
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>

            <p class="max-w-7xl mx-auto px-6 mt-10 pt-5 border-t border-white/10 text-xs text-steel">
                © 2026 Vishal Car Rental & Tour and Travels, Kota. All rights reserved.
            </p>
        </footer>
    `;

    document.addEventListener("DOMContentLoaded", () => {
        const h = document.getElementById("hdr");
        const f = document.getElementById("ftr");

        if (h) h.innerHTML = header();
        if (f) f.innerHTML = footer();

        if (!document.querySelector(".fab")) {
            document.body.insertAdjacentHTML("beforeend", `
                <a href="https://wa.me/${WA}"
                   aria-label="Chat on WhatsApp"
                   class="fab fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-violet-600 text-white grid place-items-center text-2xl">
                    ✆
                </a>
            `);
        }

        /* Mobile menu open/close */
        const mb = document.getElementById("mb");
        const mn = document.getElementById("mn");

        if (mb && mn) {
            mb.onclick = () => {
                const isOpen = !mn.classList.contains("hidden");

                mn.classList.toggle("hidden", isOpen);
                mb.setAttribute("aria-expanded", String(!isOpen));
                mb.textContent = isOpen ? "☰" : "✕";
            };

            mn.querySelectorAll("a").forEach(link => {
                link.addEventListener("click", () => {
                    mn.classList.add("hidden");
                    mb.setAttribute("aria-expanded", "false");
                    mb.textContent = "☰";
                });
            });
        }

        reveal();
    });

    /* Newsletter subscription */
    document.addEventListener("submit", async e => {
        const f = e.target.closest("#subf");
        if (!f) return;

        e.preventDefault();

        const b = f.querySelector('button[type="submit"]');
        const i = f.querySelector('input[type="email"]');
        const originalText = b.textContent;

        b.disabled = true;
        b.textContent = "Sending…";

        try {
            await post("/api/subscribe", { email: i.value });
            i.value = "";
            b.textContent = "Subscribed ✓";
        } catch (x) {
            b.textContent = "Try again";
        }

        b.disabled = false;

        if (b.textContent === "Try again") {
            setTimeout(() => {
                if (b.isConnected) b.textContent = originalText;
            }, 2500);
        }
    });
})();
