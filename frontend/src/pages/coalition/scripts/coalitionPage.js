const LEVEL_ORDER = ["federal", "state", "county", "city"];
const LEVEL_LABELS = {
  federal: "Federal",
  state: "State",
  county: "County",
  city: "City",
  other: "Community",
};

const SOCIAL_ICON_MAP = [
  { match: /facebook|meta/, icon: "fa-brands fa-facebook-f" },
  { match: /instagram/, icon: "fa-brands fa-instagram" },
  { match: /twitter|x\b/, icon: "fa-brands fa-x-twitter" },
  { match: /bluesky/, icon: "fa-brands fa-bluesky" },
  { match: /threads/, icon: "fa-brands fa-threads" },
  { match: /mastodon/, icon: "fa-brands fa-mastodon" },
  { match: /tiktok/, icon: "fa-brands fa-tiktok" },
  { match: /youtube|video/, icon: "fa-brands fa-youtube" },
  { match: /linkedin/, icon: "fa-brands fa-linkedin-in" },
  { match: /email|contact/, icon: "fa-solid fa-envelope" },
];

function getSocialIcon(label) {
  const lower = label.toLowerCase();
  const matched = SOCIAL_ICON_MAP.find(({ match }) => match.test(lower));
  if (matched) return matched.icon;
  if (lower.includes("website") || lower.includes("site")) {
    return "fa-solid fa-globe";
  }
  return "fa-solid fa-arrow-up-right-from-square";
}

function formatLevel(level) {
  if (!level) return LEVEL_LABELS.other;
  return LEVEL_LABELS[level] || LEVEL_LABELS.other;
}

function getPrimaryTag(candidate) {
  if (!candidate.tags || candidate.tags.length === 0) return "zzzz";
  const copy = [...candidate.tags];
  copy.sort((a, b) => a.localeCompare(b));
  return copy[0];
}

function normalizeCandidates(rawCandidates) {
  return rawCandidates.map((candidate) => {
    const normalizedId =
      candidate && candidate.id !== undefined && candidate.id !== null
        ? String(candidate.id)
        : null;

    return {
      ...candidate,
      id: normalizedId,
      tags: Array.isArray(candidate.tags)
        ? candidate.tags.map((tag) => String(tag))
        : [],
      socialLinks: Array.isArray(candidate.socialLinks)
        ? candidate.socialLinks
            .filter((link) => link && link.url)
            .map((link) => ({
              label: link.label ? String(link.label) : "Follow",
              url: String(link.url),
            }))
        : [],
      sortOrder: Number(candidate.sortOrder) || 0,
      websiteUrl: candidate.websiteUrl ? String(candidate.websiteUrl) : "",
    };
  });
}

function debounce(fn, delay = 180) {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export default function initCoalitionPage() {
  const groupsContainer = document.querySelector("[data-coalition-groups]");
  if (!groupsContainer) return;

  const statusEl = document.querySelector("[data-coalition-status]");
  const tagContainer = document.querySelector("[data-filter-tags]");
  const tagsEmptyEl = document.querySelector("[data-tags-empty]");
  const clearTagsBtn = document.querySelector("[data-clear-tags]");
  const levelSelect = document.querySelector("[data-filter-level]");
  const sortSelect = document.querySelector("[data-filter-sort]");
  const searchInput = document.querySelector("[data-filter-search]");

  const state = {
    candidates: [],
    tags: [],
  };
  const filters = {
    level: "all",
    sort: "featured",
    search: "",
    tags: new Set(),
  };

  function updateStatus(message, tone = "default") {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.dataset.tone = tone;
  }

  function renderTagControls() {
    if (!tagContainer) return;
    tagContainer.innerHTML = "";

    if (!state.tags.length) {
      if (tagsEmptyEl) tagsEmptyEl.hidden = false;
      if (clearTagsBtn) clearTagsBtn.hidden = true;
      return;
    }

    if (tagsEmptyEl) tagsEmptyEl.hidden = true;
    state.tags.forEach((tag) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "coalition-tag-pill";
      button.textContent = tag;
      button.setAttribute(
        "aria-pressed",
        filters.tags.has(tag) ? "true" : "false",
      );
      button.addEventListener("click", () => {
        if (filters.tags.has(tag)) filters.tags.delete(tag);
        else filters.tags.add(tag);
        applyFilters();
      });
      tagContainer.appendChild(button);
    });

    if (clearTagsBtn) {
      clearTagsBtn.hidden = filters.tags.size === 0;
    }
  }

  function sortEntries(entries) {
    const cloned = [...entries];
    cloned.sort((a, b) => {
      if (filters.sort === "name") {
        const nameCompare = a.name.localeCompare(b.name);
        if (nameCompare !== 0) return nameCompare;
        return a.sortOrder - b.sortOrder;
      }
      if (filters.sort === "tag") {
        const tagA = getPrimaryTag(a);
        const tagB = getPrimaryTag(b);
        if (tagA !== tagB) return tagA.localeCompare(tagB);
        return a.name.localeCompare(b.name);
      }
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.name.localeCompare(b.name);
    });
    return cloned;
  }

  function renderCandidates(filtered) {
    groupsContainer.innerHTML = "";
    const grouped = {};
    filtered.forEach((candidate) => {
      const level = LEVEL_ORDER.includes(candidate.jurisdictionLevel)
        ? candidate.jurisdictionLevel
        : "other";
      if (!grouped[level]) grouped[level] = [];
      grouped[level].push(candidate);
    });

    const orderedLevels = LEVEL_ORDER.filter((level) => grouped[level]?.length);
    if (grouped.other && grouped.other.length) orderedLevels.push("other");

    const fragment = document.createDocumentFragment();
    orderedLevels.forEach((level) => {
      const levelCandidates = sortEntries(grouped[level]);
      const wrapper = document.createElement("section");
      wrapper.className = "coalition-group";

      const heading = document.createElement("div");
      heading.className = "coalition-group__heading";

      const title = document.createElement("h2");
      title.textContent = formatLevel(level);
      heading.appendChild(title);

      const count = document.createElement("span");
      count.className = "coalition-group__count";
      count.textContent = `${levelCandidates.length} candidate${levelCandidates.length === 1 ? "" : "s"}`;
      heading.appendChild(count);

      wrapper.appendChild(heading);

      const grid = document.createElement("div");
      grid.className = "coalition-group__grid";
      levelCandidates.forEach((candidate) => {
        grid.appendChild(createCandidateCard(candidate));
      });
      wrapper.appendChild(grid);
      fragment.appendChild(wrapper);
    });

    groupsContainer.appendChild(fragment);
  }

  function createCandidateCard(candidate) {
    const card = document.createElement("article");
    card.className = "coalition-card";

    const top = document.createElement("div");
    top.className = "coalition-card__top";

    if (candidate.headshotImage) {
      const img = document.createElement("img");
      img.src = candidate.headshotImage;
      img.alt = `${candidate.name} headshot`;
      img.className = "coalition-card__photo";
      top.appendChild(img);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "coalition-card__photo-placeholder";
      placeholder.textContent = candidate.name
        ? candidate.name.charAt(0).toUpperCase()
        : "?";
      top.appendChild(placeholder);
    }

    const identity = document.createElement("div");
    identity.className = "coalition-card__identity";

    const badge = document.createElement("span");
    badge.className = "coalition-card__badge";
    badge.textContent = formatLevel(candidate.jurisdictionLevel);
    identity.appendChild(badge);

    const name = document.createElement("h3");
    name.className = "coalition-card__name";
    name.textContent = candidate.name;
    identity.appendChild(name);

    const officeLine = [candidate.office, candidate.region].filter(Boolean).join(" • ");
    if (officeLine) {
      const office = document.createElement("p");
      office.className = "coalition-card__office";
      office.textContent = officeLine;
      identity.appendChild(office);
    }

    top.appendChild(identity);
    card.appendChild(top);

    if (candidate.description) {
      const description = document.createElement("p");
      description.className = "coalition-card__description";
      description.textContent = candidate.description;
      card.appendChild(description);
    }

    if (candidate.tags.length) {
      const tagsWrapper = document.createElement("div");
      tagsWrapper.className = "coalition-card__tags";
      candidate.tags.forEach((tag) => {
        const pill = document.createElement("span");
        pill.className = "coalition-card__tag";
        pill.textContent = tag;
        tagsWrapper.appendChild(pill);
      });
      card.appendChild(tagsWrapper);
    }

    const linksWrapper = document.createElement("div");
    linksWrapper.className = "coalition-card__links";

    if (candidate.websiteUrl) {
      linksWrapper.appendChild(createLink("Website", candidate.websiteUrl));
    }

    candidate.socialLinks.forEach((link) => {
      if (!link.url) return;
      linksWrapper.appendChild(createLink(link.label || "Follow", link.url));
    });

    if (linksWrapper.childElementCount) {
      card.appendChild(linksWrapper);
    }

    return card;
  }

  function createLink(label, url) {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    const icon = document.createElement("i");
    icon.className = getSocialIcon(label);
    anchor.appendChild(icon);
    const text = document.createElement("span");
    text.textContent = label;
    anchor.appendChild(text);
    return anchor;
  }

  function applyFilters() {
    if (!state.candidates.length) {
      updateStatus("No coalition members published yet. Check back soon.");
      groupsContainer.innerHTML = "";
      renderTagControls();
      return;
    }

    let filtered = state.candidates;

    if (filters.level !== "all") {
      filtered = filtered.filter(
        (candidate) => candidate.jurisdictionLevel === filters.level,
      );
    }

    if (filters.tags.size) {
      filtered = filtered.filter((candidate) => {
        if (!candidate.tags || !candidate.tags.length) return false;
        return [...filters.tags].every((tag) => candidate.tags.includes(tag));
      });
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((candidate) => {
        const haystack = [
          candidate.name,
          candidate.office,
          candidate.region,
          candidate.description,
          (candidate.tags || []).join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(searchLower);
      });
    }

    if (!filtered.length) {
      updateStatus(
        "No candidates match those filters yet. Try selecting fewer tags.",
        "warning",
      );
      groupsContainer.innerHTML = "";
      renderTagControls();
      return;
    }

    const total = state.candidates.length;
    if (
      filters.level === "all" &&
      !filters.tags.size &&
      !filters.search &&
      filters.sort === "featured"
    ) {
      updateStatus(`${filtered.length} coalition candidates ready to explore.`);
    } else {
      updateStatus(
        `${filtered.length} of ${total} candidates match your filters.`,
      );
    }

    renderCandidates(filtered);
    renderTagControls();
  }

  function hydrateFiltersFromData() {
    const tagSet = new Set();
    state.candidates.forEach((candidate) => {
      (candidate.tags || []).forEach((tag) => {
        tagSet.add(tag);
      });
    });
    state.tags = [...tagSet].sort((a, b) => a.localeCompare(b));
    renderTagControls();
  }

  async function fetchCandidates() {
    try {
      updateStatus("Loading coalition candidates…");
      const res = await fetch("/api/coalition");
      if (!res.ok) throw new Error(`Request failed with ${res.status}`);
      const data = await res.json();
      state.candidates = normalizeCandidates(data);
      hydrateFiltersFromData();
      applyFilters();
    } catch (err) {
      console.error("Coalition fetch error", err);
      updateStatus("We couldn't load the coalition right now. Please try again soon.", "error");
      groupsContainer.innerHTML = "";
    }
  }

  if (levelSelect) {
    levelSelect.addEventListener("change", () => {
      filters.level = levelSelect.value;
      applyFilters();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      filters.sort = sortSelect.value;
      applyFilters();
    });
  }

  if (searchInput) {
    const updateSearch = debounce((value) => {
      filters.search = value.trim();
      applyFilters();
    }, 200);
    searchInput.addEventListener("input", (event) => {
      updateSearch(event.target.value);
    });
  }

  if (clearTagsBtn) {
    clearTagsBtn.addEventListener("click", () => {
      filters.tags.clear();
      applyFilters();
    });
  }

  fetchCandidates();
}
