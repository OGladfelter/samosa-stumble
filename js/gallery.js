let currentSlide = 0;
const totalSlides = document.querySelectorAll('.carousel-item').length;

function changeSlide(direction) {
  currentSlide += direction;

  if (currentSlide >= totalSlides) {
    currentSlide = 0;
  } else if (currentSlide < 0) {
    currentSlide = totalSlides - 1;
  }

  const carousel = document.querySelector('.carousel');
  carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
}
