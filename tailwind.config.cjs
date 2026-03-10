/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#0F4C81",
                "secondary": "#00B4D8"
            },
            fontFamily: {
                "display": ["Inter", "sans-serif"],
            },
        },
    },
    plugins: [],
}
