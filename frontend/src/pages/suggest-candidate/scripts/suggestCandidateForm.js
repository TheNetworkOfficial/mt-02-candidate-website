const statusMessages = {
  success:
    "Thanks for the submission! We'll review it shortly and follow up if we have questions.",
  error: "We couldn't submit that candidate right now. Please try again soon.",
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("suggest-candidate-form");
  if (!form) return;

  const socialLinksContainer = document.getElementById("suggest-social-links");
  const addSocialLinkButton = document.getElementById("add-social-link");
  const fileInput = form.querySelector('input[type="file"][name="headshot"]');

  function createSocialLinkRow(data = {}) {
    const row = document.createElement("div");
    row.className = "social-links__row";

    const labelWrap = document.createElement("label");
    const labelSpan = document.createElement("span");
    labelSpan.textContent = "Label";
    labelWrap.appendChild(labelSpan);
    const labelInput = document.createElement("input");
    labelInput.type = "text";
    labelInput.name = "socialLabel";
    labelInput.placeholder = "e.g., Website";
    labelInput.value = data.label || "";
    labelWrap.appendChild(labelInput);

    const urlWrap = document.createElement("label");
    const urlSpan = document.createElement("span");
    urlSpan.textContent = "URL";
    urlWrap.appendChild(urlSpan);
    const urlInput = document.createElement("input");
    urlInput.type = "url";
    urlInput.name = "socialUrl";
    urlInput.placeholder = "https://";
    urlInput.value = data.url || "";
    urlWrap.appendChild(urlInput);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "social-links__remove";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      socialLinksContainer.removeChild(row);
      if (!socialLinksContainer.childElementCount) {
        socialLinksContainer.appendChild(createSocialLinkRow());
      }
    });

    row.appendChild(labelWrap);
    row.appendChild(urlWrap);
    row.appendChild(removeButton);
    return row;
  }

  function ensureInitialRow() {
    if (!socialLinksContainer.childElementCount) {
      socialLinksContainer.appendChild(createSocialLinkRow());
    }
  }

  ensureInitialRow();

  if (addSocialLinkButton) {
    addSocialLinkButton.addEventListener("click", () => {
      socialLinksContainer.appendChild(createSocialLinkRow());
      const lastRow = socialLinksContainer.lastElementChild;
      const firstInput = lastRow?.querySelector("input");
      if (firstInput) firstInput.focus();
    });
  }

  async function submitForm(event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const originalLabel = submitButton ? submitButton.textContent : "";
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting…";
    }

    try {
      const formData = new FormData();
      const formElements = form.elements;

      const fields = [
        "name",
        "jurisdictionLevel",
        "office",
        "region",
        "websiteUrl",
        "description",
        "sortOrder",
        "submittedByName",
        "submittedByEmail",
        "submittedByPhone",
        "submittedByZip",
      ];

      fields.forEach((field) => {
        const element = formElements.namedItem(field);
        if (!element) return;
        const value = element.value.trim();
        if (field === "sortOrder" && value === "") {
          formData.append(field, "0");
        } else {
          formData.append(field, value);
        }
      });

      const levelField = formElements.namedItem("jurisdictionLevel");
      formData.set("jurisdictionLevel", levelField.value);

      const tagsField = formElements.namedItem("tags");
      const tags = tagsField.value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      formData.append("tags", JSON.stringify(tags));

      const socialLinks = Array.from(
        socialLinksContainer.querySelectorAll(".social-links__row"),
      )
        .map((row) => {
          const labelInput = row.querySelector('input[name="socialLabel"]');
          const urlInput = row.querySelector('input[name="socialUrl"]');
          const label = labelInput?.value.trim();
          const url = urlInput?.value.trim();
          if (label && url) {
            return { label, url };
          }
          return null;
        })
        .filter(Boolean);
      formData.append("socialLinks", JSON.stringify(socialLinks));

      if (fileInput && fileInput.files && fileInput.files[0]) {
        formData.append("headshot", fileInput.files[0]);
      }

      const response = await fetch("/api/coalition/suggest", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorMessage = payload.error || statusMessages.error;
        alert(errorMessage);
        return;
      }

      alert(statusMessages.success);
      form.reset();
      if (fileInput) fileInput.value = "";
      socialLinksContainer.innerHTML = "";
      ensureInitialRow();
    } catch (err) {
      console.error("Suggest candidate submission error", err);
      alert(statusMessages.error);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel || "Submit Candidate";
      }
    }
  }

  form.addEventListener("submit", submitForm);
});
