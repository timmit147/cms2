document.addEventListener("DOMContentLoaded", () => {
    const textElement = document.querySelector(".carHeader sub");
    const originalText = textElement.textContent;
    const randomChars = "*&^%$#@?{!/.><=";
    const delay = 100;
    let animationInterval;

    function animateText(replaceWith, callback) {
        let currentIndex = 0;

        animationInterval = setInterval(() => {
            if (currentIndex >= originalText.length) {
                clearInterval(animationInterval);
                if (typeof callback === "function") {
                    callback();
                }
            } else {
                const currentText = originalText.substring(0, currentIndex);
                let newText = "";

                for (let i = 0; i < currentText.length; i++) {
                    const currentChar = currentText[i];
                    if (currentChar === " " || currentChar === "," || currentChar === "." || currentChar === "=") {
                        newText += currentChar;
                    } else {
                        newText += replaceWith[i % replaceWith.length];
                    }
                }

                textElement.textContent = newText + originalText.substring(currentIndex);
                currentIndex++;
            }
        }, delay);
    }

    // Trigger the animation once on page load
    animateText(randomChars, () => {
        setTimeout(() => {
            // After 2 seconds, revert each letter individually
            const originalChars = originalText.split('');
            let currentIndex = 0;
            
            const restoreInterval = setInterval(() => {
                if (currentIndex >= originalChars.length) {
                    clearInterval(restoreInterval);
                } else {
                    textElement.textContent = textElement.textContent.substring(0, currentIndex) + originalChars[currentIndex] + textElement.textContent.substring(currentIndex + 1);
                    currentIndex++;
                }
            }, delay);
        }, 500);
    });
});

let carHeader = document.querySelector('.carHeader');
let linksInsideCarHeader = carHeader.querySelectorAll('.content'); // select all links
let circle = document.createElement('div');
circle.style.cssText = 'position: absolute; width: 40px; height: 40px; border-radius: 50%; background-color: #F8CD09; filter: blur(3px);';
let isHoveringContent = false; // Flag to track if mouse is hovering over .content elements

carHeader.addEventListener('mouseenter', function() {
    carHeader.appendChild(circle);
    carHeader.style.cursor = 'none';
});

carHeader.addEventListener('mousemove', function(e) {
    let rect = carHeader.getBoundingClientRect();
    let x = e.clientX - rect.left - circle.offsetWidth / 2;
    let y = e.clientY - rect.top - circle.offsetHeight / 2;

    // Ensure the circle stays within 50px of the border
    x = Math.max(40, Math.min(rect.width - 40, x));
    y = Math.max(40, Math.min(rect.height - 40, y));

    circle.style.left = x + 'px';
    circle.style.top = y + 'px';

    // Show cursor and hide circle when it's within 50px of the border
    if (x <= 40 || x >= rect.width - 40 || y <= 40 || y >= rect.height - 40 || isHoveringContent) {
        carHeader.style.cursor = 'auto';
        circle.style.display = 'none';
    } else {
        carHeader.style.cursor = 'none';
        circle.style.display = 'block';
    }
});

carHeader.addEventListener('mouseleave', function() {
    carHeader.removeChild(circle);
    carHeader.style.cursor = '';
});

// add event listeners to all links
linksInsideCarHeader.forEach(function(link) {
    link.addEventListener('mouseenter', function() {
        isHoveringContent = true;
        carHeader.style.cursor = 'auto';
        circle.style.display = 'none';
    });

    link.addEventListener('mouseleave', function() {
        isHoveringContent = false;
        carHeader.style.cursor = 'none';
        circle.style.display = 'block';
    });
});
