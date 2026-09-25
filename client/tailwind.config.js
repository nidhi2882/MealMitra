/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                background: "#FAF8F3",   // soft porridge — page background
                surface: "#F3EFE4",      // warm card surface, one shade deeper than background
                ink: "#1F2E1C",          // deep forest — primary text, nav, headings
                accent: "#C98A3B",       // turmeric gold — primary actions, CTAs
                verified: "#4B7F52",     // herb green — verified/accepted/success states
                alert: "#B3492E",        // muted brick — rejected/expired/error states
                pending: "#B08D3E",      // muted amber — pending states (distinct from accent)
                line: "#E4DDC9",         // hairline border color on warm background
            },
            fontFamily: {
                display: ["Fraunces", "serif"],   // headings — warm editorial serif
                sans: ["Work Sans", "sans-serif"], // body/UI — clean grotesk
            },
        },
    },
    plugins: [],
};