let rotateInterval;
const images = document.querySelectorAll('.header2 .image');
let currentIndex = 0;

function updatePrimaryColor() {
  const currentImage = document.querySelector('.visible');
  const colorAttribute = currentImage.getAttribute('color');
  if (colorAttribute) {
    document.documentElement.style.setProperty('--primary-color', colorAttribute);
  }
}

function hideAllImages() {
  images.forEach(image => {
    image.classList.remove('visible');
  });
}

function showNextImage() {
  hideAllImages();
  images[currentIndex].classList.add('visible');
  currentIndex = (currentIndex + 1) % images.length;
  updatePrimaryColor();
}

function rotateImages() {
  showNextImage();
}

function startRotation() {
  rotateInterval = setInterval(rotateImages, 5000);
}

function pauseRotation() {
  clearInterval(rotateInterval);
}

function resumeRotation() {
  startRotation();
}

// Attach event listeners to images
images.forEach(image => {
  image.addEventListener('mouseenter', pauseRotation);
  image.addEventListener('mouseleave', resumeRotation);
});

// Start the rotation initially
startRotation();