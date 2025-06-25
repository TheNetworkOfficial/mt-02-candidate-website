document.addEventListener("DOMContentLoaded", () => {
  // 1) Get `id` from query string
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    console.error("No id provided in URL");
    return;
  }

  // 2) Fetch all reptiles, then pick the one with matching id
  fetch("/api/reptiles")
    .then((res) => {
      if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
      return res.json();
    })
    .then((allReptiles) => {
      const animal = allReptiles.find((item) => String(item.id) === id);
      if (!animal) {
        console.error("Reptile not found with id:", id);
        return;
      }

      // 3) Populate header‐info
      const headerContainer = document.querySelector(
        ".header-information-container",
      );
      if (headerContainer) {
        headerContainer.innerHTML = `
          <h2>${animal.name}</h2>
          <div class="info-row">
            <div class="info-item"><strong>Species:</strong> ${animal.species}</div>
            <div class="info-item"><strong>Age:</strong> ${animal.age || "N/A"}</div>
          </div>
          <h3><strong>Location:</strong> ${animal.location || "N/A"}</h3>
          <h4>
            <strong>
              ${animal.sex || ""}${animal.sex && animal.traits ? " • " : ""}
              ${animal.traits || ""}
            </strong>
          </h4>
        `;
      }

      // 4) Populate the two <p> tags
      const paragraphs = document.querySelectorAll(
        ".bio-adoption-container > p",
      );
      if (paragraphs.length >= 1) {
        paragraphs[0].innerHTML = `<strong>Bio:</strong> ${
          animal.bio || "No biography available."
        }`;
      }
      if (paragraphs.length >= 2) {
        paragraphs[1].innerHTML = `<strong>Adoption Information:</strong> ${
          animal.requirements || "No additional adoption notes."
        }`;
      }

      // 5) Build carousel from `animal.image_urls`
      // build an array of fully-qualified URLs pointing at /uploads
      const images =
        Array.isArray(animal.image_urls) && animal.image_urls.length > 0
          ? animal.image_urls.map((u) => `${window.location.origin}${u}`)
          : ["/assets/images/defaultImage.jpg"];

      let currentIndex = 0;
      const leftImg = document.querySelector(".carousel-img.left");
      const centerImg = document.querySelector(".carousel-img.center");
      const rightImg = document.querySelector(".carousel-img.right");
      const leftArrow = document.querySelector(".arrow.left-arrow");
      const rightArrow = document.querySelector(".arrow.right-arrow");
      const dotsContainer = document.querySelector(".carousel-dots");

      function createDots() {
        dotsContainer.innerHTML = "";
        images.forEach((_, idx) => {
          const dot = document.createElement("span");
          dot.classList.add("dot");
          if (idx === currentIndex) dot.classList.add("active");
          dot.addEventListener("click", () => {
            currentIndex = idx;
            updateCarousel();
          });
          dotsContainer.appendChild(dot);
        });
      }

      function updateCarousel() {
        const leftIndex = (currentIndex - 1 + images.length) % images.length;
        const rightIndex = (currentIndex + 1) % images.length;

        if (leftImg) leftImg.src = images[leftIndex];
        if (centerImg) centerImg.src = images[currentIndex];
        if (rightImg) rightImg.src = images[rightIndex];

        // Update dots
        const allDots = dotsContainer.querySelectorAll(".dot");
        allDots.forEach((dot, idx) => {
          dot.classList.toggle("active", idx === currentIndex);
        });
      }

      // Attach event listeners
      if (leftImg) {
        leftImg.addEventListener("click", () => {
          currentIndex = (currentIndex - 1 + images.length) % images.length;
          updateCarousel();
        });
        leftImg.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateCarousel();
          }
        });
      }
      if (rightImg) {
        rightImg.addEventListener("click", () => {
          currentIndex = (currentIndex + 1) % images.length;
          updateCarousel();
        });
        rightImg.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            currentIndex = (currentIndex + 1) % images.length;
            updateCarousel();
          }
        });
      }
      if (leftArrow) {
        leftArrow.addEventListener("click", () => {
          currentIndex = (currentIndex - 1 + images.length) % images.length;
          updateCarousel();
        });
      }
      if (rightArrow) {
        rightArrow.addEventListener("click", () => {
          currentIndex = (currentIndex + 1) % images.length;
          updateCarousel();
        });
      }

      // ❶ Find the “Begin Your Application” button
      const applyBtn = document.querySelector(".application-button");

      if (applyBtn) {
        // ❷ When the user clicks it, redirect to adoptionForm.html
        applyBtn.addEventListener("click", () => {
          // Pass the animal’s name, id, and first image via query parameters
          const encodedName = encodeURIComponent(animal.name);
          const encodedId = encodeURIComponent(animal.id);
          const encodedImg = encodeURIComponent(images[0]);
          window.location.href = `adoptionForm.html?reptileDescription=${encodedName}&reptileId=${encodedId}&reptileImage=${encodedImg}`;
        });
      }

      // Initialize
      createDots();
      updateCarousel();
    })
    .catch((err) => {
      console.error("Error loading reptile details:", err);
      // Optionally show a user‐facing error here.
    });
});