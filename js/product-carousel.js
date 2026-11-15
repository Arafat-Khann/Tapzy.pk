function bindProductCarousel() {
  const carousel = document.querySelector("[data-product-carousel]");
  if (!carousel) return;

  const track = carousel.querySelector("[data-carousel-track]");
  const slides = [...carousel.querySelectorAll(".review-hero__carousel-slide")];
  const dots = [...carousel.querySelectorAll("[data-carousel-dot]")];
  const previous = carousel.querySelector("[data-carousel-prev]");
  const next = carousel.querySelector("[data-carousel-next]");
  let activeIndex = 0;

  function updateDots() {
    dots.forEach((dot, dotIndex) => {
      dot.setAttribute("aria-current", dotIndex === activeIndex ? "true" : "false");
    });
  }

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    track.scrollTo({ left: slides[activeIndex].offsetLeft, behavior: "smooth" });
    updateDots();
  }

  previous.addEventListener("click", () => showSlide(activeIndex - 1));
  next.addEventListener("click", () => showSlide(activeIndex + 1));
  dots.forEach((dot) => dot.addEventListener("click", () => showSlide(Number(dot.dataset.carouselDot))));

  track.addEventListener("scroll", () => {
    const closestIndex = slides.reduce((closest, slide, index) => {
      const currentDistance = Math.abs(track.scrollLeft - slide.offsetLeft);
      const closestDistance = Math.abs(track.scrollLeft - slides[closest].offsetLeft);
      return currentDistance < closestDistance ? index : closest;
    }, 0);
    if (closestIndex !== activeIndex) {
      activeIndex = closestIndex;
      updateDots();
    }
  }, { passive: true });
}

document.addEventListener("DOMContentLoaded", bindProductCarousel);
