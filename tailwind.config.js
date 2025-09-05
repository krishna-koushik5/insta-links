/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f9ff',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                },
                instagram: {
                    500: '#E4405F',
                    600: '#C13584',
                }
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}
