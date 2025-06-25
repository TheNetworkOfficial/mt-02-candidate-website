const form = document.getElementById("profile-form");
const editBtn = document.getElementById("edit-btn");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");
const inputs = form.querySelectorAll("input");
const avatarImg = document.getElementById("profile-avatar");
const avatarInput = document.getElementById("avatar-input");
const dropZone = document.getElementById("avatar-dropzone");
let newAvatarFile = null;
let initialData = {};

import defaultAvatar from "../../../assets/images/icons/defaultAvatar.png";
const DEFAULT_AVATAR = defaultAvatar;

// start with editing disabled
dropZone.classList.add("disabled");

async function loadProfile() {
  try {
    const res = await fetch("/api/auth/profile", { credentials: "include" });
    if (res.status === 401) {
      window.location.href = "login.html";
      return;
    }
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    initialData = data;

    inputs.forEach((input) => {
      const name = input.name;
      if (data[name] !== undefined && data[name] !== null) {
        input.value = data[name];
      } else {
        input.value = "";
      }
    });

    avatarImg.src = data.avatarUrl || DEFAULT_AVATAR;
  } catch (err) {
    console.error("Load profile failed:", err);
  }
}

function toggleEdit(editing) {
  inputs.forEach((input) => {
    input.disabled = !editing;
  });
  dropZone.classList.toggle("disabled", !editing);

  editBtn.style.display = editing ? "none" : "inline-block";
  saveBtn.style.display = editing ? "inline-block" : "none";
  cancelBtn.style.display = editing ? "inline-block" : "none";
}

cancelBtn.addEventListener("click", () => {
  inputs.forEach((input) => {
    const name = input.name;
    input.value = initialData[name] || "";
    input.disabled = true;
  });
  avatarImg.src = initialData.avatarUrl || DEFAULT_AVATAR;
  newAvatarFile = null;
  toggleEdit(false);
});

saveBtn.addEventListener("click", async () => {
  const payload = {};
  inputs.forEach((input) => {
    payload[input.name] = input.value;
  });

  try {
    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    initialData = data;

    // exit edit mode
    toggleEdit(false);
    inputs.forEach((i) => (i.disabled = true));

    // if avatar changed, upload it
    if (newAvatarFile) {
      const fd = new FormData();
      fd.append("avatar", newAvatarFile);
      const avatarRes = await fetch("/api/auth/profile/avatar", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      if (avatarRes.ok) {
        const avatarData = await avatarRes.json();
        initialData.avatarUrl = avatarData.avatarUrl;
        avatarImg.src = avatarData.avatarUrl;
        const headerPic = document.querySelector(".profile-pic");
        if (headerPic) headerPic.src = avatarData.avatarUrl;
        newAvatarFile = null;
      }
    }
  } catch (err) {
    console.error("Save profile failed:", err);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  loadProfile();

  // wire up the Edit button
  editBtn.addEventListener("click", () => toggleEdit(true));

  // avatar click/drop handlers
  dropZone.addEventListener("click", () => {
    if (dropZone.classList.contains("disabled")) return;
    avatarInput.click();
  });

  avatarInput.addEventListener("change", (e) => {
    handleFile(e.target.files[0]);
  });

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (!dropZone.classList.contains("disabled")) {
      dropZone.classList.add("dragover");
    }
  });

  dropZone.addEventListener("dragleave", () =>
    dropZone.classList.remove("dragover")
  );

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if (dropZone.classList.contains("disabled")) return;
    handleFile(e.dataTransfer.files[0]);
  });
});

function handleFile(file) {
  if (!file) return;
  newAvatarFile = file;
  avatarImg.src = URL.createObjectURL(file);
}
