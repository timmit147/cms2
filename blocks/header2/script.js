function updatePrimaryColor() {
    const currentImage = document.querySelector('.visible');
    const colorAttribute = currentImage.getAttribute('color');
    if (colorAttribute) {
      document.documentElement.style.setProperty('--primary-color', colorAttribute);
    }
  }
  
  const images = document.querySelectorAll('.image');
  let currentIndex = 0;
  
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
    setTimeout(rotateImages, 5000);
  }
  
  // Start the rotation
  rotateImages();