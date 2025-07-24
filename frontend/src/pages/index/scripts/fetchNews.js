export default async function fetchNews() {
  const list = document.querySelector(".news-list");
  if (!list) return;
  try {
    const res = await fetch("/api/news");
    if (res.ok) {
      const data = await res.json();
      data.forEach((n) => {
        const li = document.createElement("li");
        li.style.backgroundImage = `url(${n.thumbnailImage || "../../assets/images/hero/hero.jpg"})`;
        li.innerHTML = `<a href="${n.url}" target="_blank"><h3>${n.title}</h3></a>`;
        list.appendChild(li);
      });
    }
  } catch (err) {
    console.error("Load news error", err);
  }
}