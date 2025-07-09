import { marked } from "marked";
import DOMPurify from "dompurify";
import aboutMarkdown from "../../../assets/content/about/about.md";

// our default hero (used as fallback)
import defaultHero from "../../../assets/images/hero/hero.jpg";

// import each “about” image
import section0Img from "../../../assets/images/about/section0.png";
import section1Img from "../../../assets/images/about/section1.png";
import section2Img from "../../../assets/images/about/section2.png";
// …and so on for however many you have…

// collect them into an array
const sectionImages = [
  section0Img,
  section1Img,
  section2Img,
  // …
];

const rawHtml = marked.parse(aboutMarkdown);
const temp = document.createElement("div");
temp.innerHTML = rawHtml;

// split out each H2‐block
const sections = [];
let current = null;
Array.from(temp.childNodes).forEach((node) => {
  if (node.tagName === "H2") {
    current = document.createElement("div");
    current.appendChild(node.cloneNode(true));
    sections.push(current);
  } else if (current) {
    current.appendChild(node.cloneNode(true));
  }
});

const bio = document.getElementById("bio");

sections.forEach((chunk, i) => {
  const sectionEl = document.createElement("section");
  sectionEl.className = `section about-section ${i % 2 === 0 ? "odd" : "even"}`;

  // pick the right image (or fallback)
  const imgSrc = sectionImages[i] || defaultHero;

  // create the image node
  const imgDiv = document.createElement("div");
  imgDiv.className = "about-image";
  const img = document.createElement("img");
  img.src = imgSrc;
  img.alt = "";  
  imgDiv.appendChild(img);

  // sanitize & create the text node
  const textDiv = document.createElement("div");
  textDiv.className = "about-text";
  textDiv.innerHTML = DOMPurify.sanitize(chunk.innerHTML);

  // alternate left/right
  if (i % 2 === 0) {
    sectionEl.append(imgDiv, textDiv);
  } else {
    sectionEl.append(textDiv, imgDiv);
  }

  bio.appendChild(sectionEl);
});
