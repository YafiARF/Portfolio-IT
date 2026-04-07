/**
 * Logika Interaksi Portofolio Elegan
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Menangani Loader
  const loader = document.getElementById("loader");
  window.addEventListener("load", () => {
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.style.display = "none";
      }, 800);
    }
  });

  // 2. Efek Scroll (Navbar & Animasi Reveal)
  const navbar = document.getElementById("navbar");
  const revealElements = document.querySelectorAll(".reveal");

  const handleScroll = () => {
    // Efek Navbar Sticky
    if (window.scrollY > 100) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

    // Trigger Animasi Muncul (Scroll Reveal)
    revealElements.forEach((el) => {
      const elementTop = el.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      // Aktifkan elemen jika sudah masuk dalam viewport
      if (elementTop < windowHeight - 150) {
        el.classList.add("active");
      }
    });
  };

  // Dengarkan event scroll
  window.addEventListener("scroll", handleScroll);

  // Jalankan sekali saat load untuk elemen di atas
  handleScroll();

  // 3. Smooth Scrolling untuk Link Navigasi
  const navLinks = document.querySelectorAll(".nav-links a, .btn");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");

      // Cek apakah target adalah anchor link di halaman yang sama
      if (targetId.startsWith("#")) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          // Gulir halus ke elemen target
          window.scrollTo({
            top: targetElement.offsetTop - 80, // Offset untuk navbar
            behavior: "smooth",
          });
        }
      }
    });
  });

  // 4. Efek Interaktif Tambahan (Opsional)
  // Menambahkan deteksi arah mouse untuk efek overlay yang lebih dinamis bisa ditambahkan di sini
});
