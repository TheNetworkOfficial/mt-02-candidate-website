document.addEventListener('DOMContentLoaded', () => {
  const listContainer = document.getElementById('creature-feature-list');
  if (!listContainer) return;

  fetch('/api/reptiles')
    .then(res => {
      if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
      return res.json();
    })
    .then(allReptiles => {
      // 1) Keep only “adoptable” or “for sale”
      const available = allReptiles.filter(
        animal => animal.status === 'adoptable' || animal.status === 'for sale'
      );

      // 2) Then take the first 9 of those
      const featured = available.slice(0, 9);

      featured.forEach(animal => {
        const tile = document.createElement('a');
        tile.href = `details.html?id=${animal.id}`;
        tile.className = 'animal-tile';

        // Use the first image if available, otherwise a placeholder
        const imgSrc =
          Array.isArray(animal.image_urls) && animal.image_urls.length > 0
            ? animal.image_urls[0]
            : '/path/to/defaultImage.jpg';

        tile.innerHTML = `
          <img src="${imgSrc}" alt="${animal.species}" />
          <div class="tile-info">
            <h3>${animal.name}</h3>
            <p>${animal.species}</p>
          </div>
        `;
        listContainer.appendChild(tile);
      });

      // “See All” tile
      const seeAll = document.createElement('a');
      seeAll.href = 'list.html';
      seeAll.className = 'animal-tile see-all';
      seeAll.innerHTML = `
        <div class="tile-info">
          <i class="fas fa-th-large see-all-icon"></i>
          <h3>See All</h3>
        </div>
      `;
      listContainer.appendChild(seeAll);
    })
    .catch(err => {
      console.error('Error loading featured reptiles:', err);
      // Optionally, show a user-facing error message here.
    });
});