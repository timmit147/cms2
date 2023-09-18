if (window.innerWidth >= 768) {
    const circle = document.createElement('div');
    circle.className = 'circle';
    document.body.appendChild(circle);

    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    document.body.appendChild(cursor);

    let isMouseOverCarHeader = false;
    let isCursorOutside = false;

    function updatePosition(event) {
        const { clientX, clientY } = event;

        cursor.style.left = `${clientX}px`;
        cursor.style.top = `${clientY}px`;

        if (isMouseOverCarHeader) {
            circle.style.left = `${clientX}px`;
            circle.style.top = `${clientY}px`;
        }

        if (clientX <= 10 || clientX >= window.innerWidth - 10 || clientY <= 10 || clientY >= window.innerHeight - 10) {
            if (!isCursorOutside) {
                isCursorOutside = true;
                document.body.style.cursor = 'none';
                cursor.style.display = 'none';
            }
        } else {
            if (isCursorOutside) {
                isCursorOutside = false;
                document.body.style.cursor = 'auto';
                cursor.style.display = 'block';
            }
        }
    }

    function hideCircle() {
        circle.style.display = 'none';
    }

    function showCircle() {
        circle.style.display = 'block';
    }

    document.addEventListener('mousemove', updatePosition);

    const clickableElements = document.querySelectorAll('button, a, input');
    const cursorElement = document.querySelector('.cursor');

    clickableElements.forEach(function (clickableElement) {
        clickableElement.addEventListener('mouseenter', function (event) {
            cursorElement.classList.add('vinger');
        });

        clickableElement.addEventListener('mouseleave', function (event) {
            cursorElement.classList.remove('vinger');
        });
    });

    const carHeader = document.querySelector('.carHeader');
    
    if (carHeader) { // Check if .carHeader element exists
        carHeader.addEventListener('mouseenter', function (event) {
            showCircle();
            isMouseOverCarHeader = true;
        });
    
        carHeader.addEventListener('mouseleave', function (event) {
            hideCircle();
            isMouseOverCarHeader = false;
        });
    
        carHeader.addEventListener('mousemove', function (event) {
            if (!isMouseOverCarHeader && !circleIsShown()) { // Check if the circle is not already shown
                showCircle();
                isMouseOverCarHeader = true;
            }
        });
    } else {
        console.error(".carHeader element not found in the DOM");
    }
    
    document.body.style.cursor = 'none';

    const style = document.createElement('style');
    style.innerHTML = '* { cursor: none !important; }';
    document.head.appendChild(style);

    window.addEventListener('scroll', function (event) {
        hideCircle();
        isMouseOverCarHeader = false;
    });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            const viewportHeight = window.innerHeight;
            const targetHeight = targetElement.offsetHeight;
            const targetPosition = targetElement.offsetTop - (viewportHeight / 2) + (targetHeight / 2);

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});


var elements = document.querySelectorAll('body > *');

var observer = new IntersectionObserver(function(entries, observer) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add('common-transition');
            entry.target.style.opacity = '1';
        } else {
            entry.target.style.opacity = '0';
        }
    });
});

elements.forEach(function(element) {
    observer.observe(element);
});
