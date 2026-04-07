document.addEventListener("DOMContentLoaded", () => {
  // === ELEMEN DOM ===
  const locationDisplay = document.getElementById("lokasi");
  const dateDisplay = document.getElementById("tanggal-hari-ini");
  const clockDisplay = document.getElementById("live-clock");

  const prayerTimeElements = {
    subuh: document.getElementById("subuh"),
    dzuhur: document.getElementById("dzuhur"),
    ashar: document.getElementById("ashar"),
    maghrib: document.getElementById("maghrib"),
    isya: document.getElementById("isya"),
  };

  const nextPrayerNameEl = document.getElementById("next-prayer-name");
  const countdownTimerEl = document.getElementById("countdown-timer");

  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const detectLocationButton = document.getElementById(
    "detect-location-button"
  );
  const searchResultsContainer = document.getElementById("search-results");

  const prayerCards = document.querySelectorAll(".card");

  // === VARIABEL GLOBAL ===
  let countdownInterval;
  const KEMENAG_API_BASE_URL = "https://api.myquran.com/v2";

  // === FUNGSI UTAMA ===

  /**
   * Memulai jam digital yang berjalan setiap detik.
   */
  function startLiveClock() {
    setInterval(() => {
      const now = new Date();
      clockDisplay.textContent = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }, 1000);
  }

  /**
   * Menampilkan tanggal hari ini dalam format Bahasa Indonesia.
   */
  function displayCurrentDate() {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    dateDisplay.textContent = now.toLocaleDateString("id-ID", options);
  }

  /**
   * Fungsi utama untuk mengambil jadwal sholat berdasarkan ID kota.
   * @param {string} cityId
   * @param {string} cityName
   */
  async function getPrayerTimes(cityId, cityName) {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      const response = await fetch(
        `${KEMENAG_API_BASE_URL}/sholat/jadwal/${cityId}/${year}/${month}/${day}`
      );
      if (!response.ok) throw new Error("Gagal mengambil data jadwal sholat.");

      const result = await response.json();

      if (result.status && result.data && result.data.jadwal) {
        const prayerData = result.data.jadwal;
        updateUIPrayerTimes(prayerData, cityName);
        startCountdown(prayerData);
      } else {
        throw new Error("Format data tidak sesuai.");
      }
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      alert("Tidak dapat memuat jadwal sholat. Silakan coba lagi.");
      locationDisplay.textContent = "Gagal Memuat";
    }
  }

  /**
   * Memperbarui antarmuka pengguna (UI) dengan jadwal sholat yang diterima.
   * @param {object} prayerData
   * @param {string} cityName
   */
  function updateUIPrayerTimes(prayerData, cityName) {
    locationDisplay.textContent = cityName;
    prayerTimeElements.subuh.textContent = prayerData.subuh;
    prayerTimeElements.dzuhur.textContent = prayerData.dzuhur;
    prayerTimeElements.ashar.textContent = prayerData.ashar;
    prayerTimeElements.maghrib.textContent = prayerData.maghrib;
    prayerTimeElements.isya.textContent = prayerData.isya;
  }

  /**
   * Memulai hitung mundur ke waktu sholat berikutnya.
   * @param {object} prayerData -
   */
  function startCountdown(prayerData) {
    if (countdownInterval) clearInterval(countdownInterval);

    const prayerSchedule = [
      { name: "Subuh", time: prayerData.subuh },
      { name: "Dzuhur", time: prayerData.dzuhur },
      { name: "Ashar", time: prayerData.ashar },
      { name: "Maghrib", time: prayerData.maghrib },
      { name: "Isya", time: prayerData.isya },
    ];

    countdownInterval = setInterval(() => {
      const now = new Date();
      let nextPrayer = null;

      for (const prayer of prayerSchedule) {
        const [hour, minute] = prayer.time.split(":");
        const prayerTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hour,
          minute
        );

        if (prayerTime > now) {
          nextPrayer = { name: prayer.name, time: prayerTime };
          break;
        }
      }

      if (!nextPrayer) {
        const [hour, minute] = prayerSchedule[0].time.split(":");
        const nextDayPrayerTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
          hour,
          minute
        );
        nextPrayer = { name: prayerSchedule[0].name, time: nextDayPrayerTime };
      }

      updateCountdownDisplay(nextPrayer);
      highlightNextPrayerCard(nextPrayer.name);
    }, 1000);
  }

  /**
   * Memperbarui tampilan hitung mundur.
   * @param {object} nextPrayer
   */
  function updateCountdownDisplay(nextPrayer) {
    const now = new Date();
    const diff = nextPrayer.time - now;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    nextPrayerNameEl.textContent = nextPrayer.name;
    countdownTimerEl.textContent = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  /**
   * Memberi sorotan pada kartu waktu sholat berikutnya.
   * @param {string} nextPrayerName
   */
  function highlightNextPrayerCard(nextPrayerName) {
    prayerCards.forEach((card) => {
      if (card.getAttribute("data-prayer") === nextPrayerName) {
        card.classList.add("next-prayer-highlight");
      } else {
        card.classList.remove("next-prayer-highlight");
      }
    });
  }

  /**
   * Mencari kota berdasarkan kata kunci dari input pengguna.
   */
  async function searchCity() {
    const query = searchInput.value.trim();
    if (query.length < 3) {
      alert("Masukkan minimal 3 karakter untuk mencari kota.");
      return;
    }

    try {
      const response = await fetch(
        `${KEMENAG_API_BASE_URL}/sholat/kota/cari/${query}`
      );
      if (!response.ok) throw new Error("Gagal mencari kota.");

      const result = await response.json();
      displaySearchResults(result.data);
    } catch (error) {
      console.error("Error searching city:", error);
      alert("Gagal mencari kota. Periksa koneksi Anda.");
    }
  }

  /**
   * @param {Array} cities
   */
  function displaySearchResults(cities) {
    searchResultsContainer.innerHTML = "";
    if (!cities || cities.length === 0) {
      searchResultsContainer.innerHTML =
        '<p class="result-item">Kota tidak ditemukan.</p>';
      return;
    }

    cities.forEach((city) => {
      const item = document.createElement("div");
      item.classList.add("result-item");
      item.textContent = city.lokasi;
      item.addEventListener("click", () => {
        getPrayerTimes(city.id, city.lokasi);
        searchResultsContainer.innerHTML = "";
        searchInput.value = "";
      });
      searchResultsContainer.appendChild(item);
    });
  }

  /**
   * Menggunakan Geolocation API untuk mendapatkan lokasi pengguna saat ini.
   */
  function useCurrentLocation() {
    if ("geolocation" in navigator) {
      locationDisplay.textContent = "Mendeteksi lokasi...";
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const city =
              data.address.city || data.address.state || "Lokasi Tidak Dikenal";

            const searchResponse = await fetch(
              `${KEMENAG_API_BASE_URL}/sholat/kota/cari/${city.split(" ")[0]}`
            );
            const searchData = await searchResponse.json();

            if (searchData.data && searchData.data.length > 0) {
              const cityId = searchData.data[0].id;
              const cityName = searchData.data[0].lokasi;
              getPrayerTimes(cityId, cityName);
            } else {
              getPrayerTimes("1301", "Kota Jakarta");
              alert(
                "Tidak dapat menemukan kota Anda, menampilkan jadwal untuk Jakarta."
              );
            }
          } catch (error) {
            console.error(
              "Error with reverse geocoding or city search:",
              error
            );
            getPrayerTimes("1301", "Kota Jakarta");
            alert(
              "Gagal mendapatkan nama lokasi, menampilkan jadwal untuk Jakarta."
            );
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert(
            "Gagal mengakses lokasi. Pastikan Anda mengizinkan akses lokasi. Menampilkan jadwal untuk Jakarta."
          );
          getPrayerTimes("1301", "Kota Jakarta");
        }
      );
    } else {
      alert(
        "Browser Anda tidak mendukung Geolocation. Menampilkan jadwal untuk Jakarta."
      );
      getPrayerTimes("1301", "Kota Jakarta");
    }
  }

  // === EVENT LISTENERS ===
  searchButton.addEventListener("click", searchCity);
  searchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      searchCity();
    }
  });
  detectLocationButton.addEventListener("click", useCurrentLocation);

  // === INISIALISASI APLIKASI ===
  function initialize() {
    startLiveClock();
    displayCurrentDate();
    useCurrentLocation();
  }

  initialize();
});
