import defaultImg from '../../../assets/images/icons/defaultAvatar.png';

document.addEventListener('DOMContentLoaded', function () {
    // Array of image URLs – add as many as you like
    const images = [
        defaultImg,
        defaultImg,
        defaultImg
    ];
  
    let currentIndex = 1; // Start with the second image as center
  
    // Cache DOM elements
    const leftImg = document.querySelector('.carousel-img.left');
    const centerImg = document.querySelector('.carousel-img.center');
    const rightImg = document.querySelector('.carousel-img.right');
    const leftArrow = document.querySelector('.arrow.left-arrow');
    const rightArrow = document.querySelector('.arrow.right-arrow');
    const dotsContainer = document.querySelector('.carousel-dots');
  
    // Create dots based on number of images
    function createDots() {
      dotsContainer.innerHTML = '';
      images.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (index === currentIndex) dot.classList.add('active');
        dot.addEventListener('click', () => {
          currentIndex = index;
          updateCarousel();
        });
        dotsContainer.appendChild(dot);
      });
    }
  
    // Update the carousel images and dots
    function updateCarousel() {
      // Calculate indexes with wrap-around
      const leftIndex = (currentIndex - 1 + images.length) % images.length;
      const rightIndex = (currentIndex + 1) % images.length;
  
      // Update src attributes
      leftImg.src = images[leftIndex];
      centerImg.src = images[currentIndex];
      rightImg.src = images[rightIndex];
  
      // Update dots
      const dots = document.querySelectorAll('.carousel-dots .dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });
    }
  
    // Handlers for navigating the carousel
    function showPrev() {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateCarousel();
    }
  
    function showNext() {
      currentIndex = (currentIndex + 1) % images.length;
      updateCarousel();
    }
  
    // Add event listeners for left/right images and arrow overlays
    leftImg.addEventListener('click', showPrev);
    leftImg.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') showPrev();
    });
    rightImg.addEventListener('click', showNext);
    rightImg.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') showNext();
    });
    leftArrow.addEventListener('click', showPrev);
    leftArrow.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') showPrev();
    });
    rightArrow.addEventListener('click', showNext);
    rightArrow.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') showNext();
    });
  
    // Initialize carousel
    createDots();
    updateCarousel();
});