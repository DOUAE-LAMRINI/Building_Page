document.addEventListener('DOMContentLoaded', function() {
    const lightModeBtn = document.getElementById('light-mode-btn');
    const darkModeBtn = document.getElementById('dark-mode-btn');
    const body = document.body;
    const themeStyle = document.getElementById('theme-style');

    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.setAttribute('data-theme', savedTheme);
        themeStyle.href = savedTheme === 'dark' ? "{{ url_for('static', filename='CSS/color_2.css') }}" : "{{ url_for('static', filename='CSS/color.css') }}";
    }

    lightModeBtn.addEventListener('click', function() {
        body.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        themeStyle.href = "{{ url_for('static', filename='CSS/color.css') }}";
    });

    darkModeBtn.addEventListener('click', function() {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeStyle.href = "{{ url_for('static', filename='CSS/color_2.css') }}";
    });
});