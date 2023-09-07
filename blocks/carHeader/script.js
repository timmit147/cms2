// Create the circle and cursor divs
const circle = document.createElement('div');
circle.className = 'circle';
document.body.appendChild(circle);

const cursor = document.createElement('div');
cursor.className = 'cursor';
document.body.appendChild(cursor);

// Track whether the mouse is over the carHeader
let isMouseOverCarHeader = false;

// Function to update the position of circle and cursor
function updatePosition(event) {
    const { clientX, clientY } = event;

    cursor.style.left = `${clientX}px`;
    cursor.style.top = `${clientY}px`;

    if (isMouseOverCarHeader) {
        // Only update the position of the circle if the mouse is over the .carHeader
        circle.style.left = `${clientX}px`;
        circle.style.top = `${clientY}px`;
    }
}

// Function to hide the circle
function hideCircle() {
    circle.style.display = 'none';
}

// Function to show the circle
function showCircle() {
    circle.style.display = 'block';
}

// Add event listener to track mouse movement
document.addEventListener('mousemove', updatePosition);

// Select all clickable elements (buttons, links, and inputs)
const clickableElements = document.querySelectorAll('button, a, input');
const cursorElement = document.querySelector('.cursor');

// Add an event listener for mouseenter to each clickable element
clickableElements.forEach(function(clickableElement) {
    clickableElement.addEventListener('mouseenter', function(event) {
        cursorElement.classList.add('vinger');
    });

    // Add an event listener for mouseleave to each clickable element
    clickableElement.addEventListener('mouseleave', function(event) {
        cursorElement.classList.remove('vinger');
    });
});

// Get the .carHeader element
const carHeader = document.querySelector('.carHeader');

// Add an event listener for mouseenter to .carHeader
carHeader.addEventListener('mouseenter', function(event) {
    showCircle(); // Show the circle when the mouse enters .carHeader
    isMouseOverCarHeader = true; // Mouse is over .carHeader
});

carHeader.addEventListener('mouseleave', function(event) {
    hideCircle(); // Hide the circle when the mouse leaves .carHeader
    isMouseOverCarHeader = false; // Mouse is no longer over .carHeader
});

// Add an event listener to show the circle when moving the mouse inside .carHeader
carHeader.addEventListener('mousemove', function(event) {
    if (!isMouseOverCarHeader) {
        showCircle(); // Show the circle when moving the mouse inside .carHeader
        isMouseOverCarHeader = true; // Mouse is over .carHeader
    }
});

// Hide the mouse cursor
document.body.style.cursor = 'none';

const style = document.createElement('style');
style.innerHTML = '* { cursor: none !important; }'; // Set cursor to none for all elements
document.head.appendChild(style);

// Add scroll event listener to hide the circle when scrolling
window.addEventListener('scroll', function(event) {
    hideCircle(); // Hide the circle when scrolling
    isMouseOverCarHeader = false; // Mouse is no longer over .carHeader
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();

        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop,
                behavior: 'smooth'
            });
        }
    });
});
