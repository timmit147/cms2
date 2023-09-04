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

carHeader.addEventListener('mouseenter', function() {
    carHeader.appendChild(circle);
    carHeader.style.cursor = 'none';
});

carHeader.addEventListener('mousemove', function(e) {
    let rect = carHeader.getBoundingClientRect();
    circle.style.left = e.clientX - rect.left - circle.offsetWidth / 2 + 'px';
    circle.style.top = e.clientY - rect.top - circle.offsetHeight / 2 + 'px';
});

carHeader.addEventListener('mouseleave', function() {
    carHeader.removeChild(circle);
    carHeader.style.cursor = '';
});

// add event listeners to all links
linksInsideCarHeader.forEach(function(link) {
    link.addEventListener('mouseenter', function() {
        carHeader.removeChild(circle);
        carHeader.style.cursor = 'auto';
    });

    link.addEventListener('mouseleave', function() {
        carHeader.appendChild(circle);
        carHeader.style.cursor = 'none';
    });
});
