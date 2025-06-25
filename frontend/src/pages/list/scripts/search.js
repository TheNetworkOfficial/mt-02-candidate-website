document.addEventListener('DOMContentLoaded', function () {
    const searchBtn = document.getElementById('search-btn');
    const searchNameInput = document.getElementById('search-name');
    const filterSpeciesSelect = document.getElementById('filter-species');
    const animalTiles = document.querySelectorAll('.animal-tile');
  
    searchBtn.addEventListener('click', function() {
      const searchName = searchNameInput.value.trim().toLowerCase();
      const filterSpecies = filterSpeciesSelect.value.trim().toLowerCase();
  
      animalTiles.forEach(function(tile) {
        const name = tile.querySelector('.tile-info h3').innerText.toLowerCase();
        const species = tile.querySelector('.tile-info p').innerText.toLowerCase();
  
        // Check for matches (if no search value is entered, consider it a match)
        const matchesName = !searchName || name.includes(searchName);
        const matchesSpecies = !filterSpecies || species.includes(filterSpecies);
  
        if (matchesName && matchesSpecies) {
          tile.style.display = 'flex'; // Use flex to maintain layout structure
        } else {
          tile.style.display = 'none';
        }
      });
    });
  });
  