export const sidebar = `

    <div class=" btn-group  mt-3">
        <div class="nav btn-group text-start">
            <a href="/managers-workspace/pages/laser.html" class="btn btn-outline-dark text-start" data-content="laser">Калькулятор часу лазерної порізки</a>
            <a href="/managers-workspace/pages/widePrint.html" class="btn btn-outline-dark text-start" data-content="widePrint">Калькулятор ШФ</a>
            <a href="/managers-workspace/pages/canvas.html" class="btn btn-outline-dark text-start" data-content="canvas">Калькулятор холстів</a>
        </div>
    </div>
    <div id="alertContainer"></div>
`;

document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('#sidebar .btn');

    const currentPath = window.location.pathname;

    links.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath.includes(linkPath)) {
            link.classList.add('active');
        }
    });

    links.forEach(link => {
        link.addEventListener('click', function(event) {
            links.forEach(link => link.classList.remove('active'));

            this.classList.add('active');

            localStorage.setItem('active-link', this.getAttribute('data-content'));
        });
    });

    window.addEventListener('beforeunload', () => {
        localStorage.removeItem('active-link');
    });
});


