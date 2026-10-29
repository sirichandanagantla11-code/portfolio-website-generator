const form = document.querySelector("#portfolioForm");
const projectsContainer = document.querySelector("#projectsContainer");
const preview = document.querySelector("#preview");
const statusBox = document.querySelector("#status");
const saveButton = document.querySelector("#savePortfolio");
const downloadButton = document.querySelector("#downloadPortfolio");
const savedList = document.querySelector("#savedList");

let currentPortfolio = null;
let projectCount = 0;

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function addProject(project = {}) {
  if (projectsContainer.children.length >= 10) {
    showStatus("You can add up to 10 projects.", true);
    return;
  }

  projectCount += 1;
  const card = document.createElement("div");
  card.className = "project-editor";
  card.innerHTML = `
    <div class="project-top">
      <strong>Project ${projectsContainer.children.length + 1}</strong>
      <button class="remove-project" type="button">Remove</button>
    </div>
    <label>Project name
      <input class="project-name" maxlength="120" placeholder="e.g. Smart ECE Lab Monitor">
    </label>
    <label>Description
      <textarea class="project-description" rows="2" maxlength="1000" placeholder="What did you build?"></textarea>
    </label>
    <label>Project URL (optional)
      <input class="project-url" type="url" maxlength="1000" placeholder="https://github.com/username/project">
    </label>`;
  card.querySelector(".project-name").value = project.name || "";
  card.querySelector(".project-description").value = project.description || "";
  card.querySelector(".project-url").value = project.url || "";
  card.querySelector(".remove-project").addEventListener("click", () => {
    card.remove();
    renumberProjects();
  });
  projectsContainer.appendChild(card);
}

function renumberProjects() {
  [...projectsContainer.children].forEach((card, index) => {
    card.querySelector(".project-top strong").textContent = `Project ${index + 1}`;
  });
}

function showStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.className = `status ${isError ? "error" : "success"}`;
}

function getFormPortfolio() {
  const fd = new FormData(form);
  const projects = [...projectsContainer.querySelectorAll(".project-editor")]
    .map(card => ({
      name: card.querySelector(".project-name").value.trim(),
      description: card.querySelector(".project-description").value.trim(),
      url: card.querySelector(".project-url").value.trim()
    }))
    .filter(project => project.name || project.description || project.url);

  return {
    name: String(fd.get("name") || "").trim(),
    title: String(fd.get("title") || "").trim(),
    email: String(fd.get("email") || "").trim(),
    bio: String(fd.get("bio") || "").trim(),
    photo: String(fd.get("photo") || "").trim(),
    skills: String(fd.get("skills") || "").split(",").map(s => s.trim()).filter(Boolean).slice(0, 50),
    education: String(fd.get("education") || "").split("\n").map(s => s.trim()).filter(Boolean).slice(0, 50),
    projects,
    linkedin: String(fd.get("linkedin") || "").trim(),
    github: String(fd.get("github") || "").trim()
  };
}

function renderPortfolio(data) {
  const photo = safeUrl(data.photo);
  const avatar = photo
    ? `<img class="avatar" src="${escapeHTML(photo)}" alt="Profile photo" referrerpolicy="no-referrer">`
    : `<div class="initial-avatar">${escapeHTML((data.name || "P").trim().charAt(0).toUpperCase())}</div>`;

  const skills = (data.skills || []).map(skill =>
    `<span class="skill-chip">${escapeHTML(skill)}</span>`).join("");

  const education = (data.education || []).map(item =>
    `<div class="generated-card"><p>${escapeHTML(item)}</p></div>`).join("");

  const projects = (data.projects || []).map(project => {
    const url = safeUrl(project.url);
    return `<div class="generated-card">
      <strong>${escapeHTML(project.name || "Untitled project")}</strong>
      <p>${escapeHTML(project.description || "Project description not provided.")}</p>
      ${url ? `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">View project ↗</a>` : ""}
    </div>`;
  }).join("");

  const links = [
    data.email ? `<a href="mailto:${escapeHTML(data.email)}">Email ↗</a>` : "",
    safeUrl(data.linkedin) ? `<a href="${escapeHTML(safeUrl(data.linkedin))}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>` : "",
    safeUrl(data.github) ? `<a href="${escapeHTML(safeUrl(data.github))}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>` : ""
  ].filter(Boolean).join("");

  preview.innerHTML = `
    <article class="generated">
      <nav class="generated-nav"><strong>${escapeHTML(data.name || "Your Name")}</strong><span>PORTFOLIO / 2026</span></nav>
      <section class="generated-hero">
        ${avatar}
        <div class="mini-label">HELLO, I'M</div>
        <h2>${escapeHTML(data.name || "Your Name")}<br><span>${escapeHTML(data.title || "Your Professional Title")}</span></h2>
        <p>${escapeHTML(data.bio || "Add a short introduction about yourself using the form.")}</p>
        <div class="generated-links">${links}</div>
      </section>
      <section><h3>Skills</h3><div class="skill-list">${skills || '<span class="muted">Add your skills to display them here.</span>'}</div></section>
      <section><h3>Education</h3>${education || '<p class="muted">Add your education details.</p>'}</section>
      <section><h3>Featured projects</h3>${projects || '<p class="muted">Add your projects to showcase your work.</p>'}</section>
      <div class="generated-footer">Designed with Portfolio Studio · ${escapeHTML(data.name || "Your Name")}</div>
    </article>`;
}

function createStandaloneHTML(data) {
  const doc = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHTML(data.name)} — Portfolio</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#101024;color:#fff;font:16px/1.7 Arial,sans-serif}
main{max-width:850px;margin:auto;padding:40px 24px}header{border-bottom:1px solid #39334f;padding-bottom:18px}
h1{font-size:clamp(32px,7vw,56px);line-height:1.15}h1 span{color:#b6a6ff}h2{margin-top:34px;color:#c6b9ff}
p,li{color:#d0cde1;white-space:pre-line}.chip{display:inline-block;padding:5px 12px;margin:4px;background:#2c2450;border-radius:20px}
.card{padding:14px;margin:10px 0;background:#ffffff0c;border:1px solid #ffffff20;border-radius:12px}
a{color:#c6b9ff;margin-right:14px;overflow-wrap:anywhere}img{width:90px;height:90px;object-fit:cover;border-radius:20px}
footer{margin-top:35px;border-top:1px solid #39334f;padding-top:15px;color:#aaa}
</style></head><body><main>
<header><strong>${escapeHTML(data.name)}</strong><p>${escapeHTML(data.title)}</p></header>
<section>${safeUrl(data.photo) ? `<p><img src="${escapeHTML(safeUrl(data.photo))}" alt="Profile photo"></p>` : ""}
<h1>Hi, I'm ${escapeHTML(data.name)}<br><span>${escapeHTML(data.title)}</span></h1>
<p>${escapeHTML(data.bio || "")}</p>
${data.email ? `<a href="mailto:${escapeHTML(data.email)}">Email</a>` : ""}
${safeUrl(data.linkedin) ? `<a href="${escapeHTML(safeUrl(data.linkedin))}" target="_blank" rel="noopener noreferrer">LinkedIn</a>` : ""}
${safeUrl(data.github) ? `<a href="${escapeHTML(safeUrl(data.github))}" target="_blank" rel="noopener noreferrer">GitHub</a>` : ""}
</section>
<section><h2>Skills</h2>${(data.skills || []).map(s => `<span class="chip">${escapeHTML(s)}</span>`).join("")}</section>
<section><h2>Education</h2>${(data.education || []).map(e => `<div class="card">${escapeHTML(e)}</div>`).join("")}</section>
<section><h2>Projects</h2>${(data.projects || []).map(p => `<div class="card"><strong>${escapeHTML(p.name || "Project")}</strong><p>${escapeHTML(p.description || "")}</p>${safeUrl(p.url) ? `<a href="${escapeHTML(safeUrl(p.url))}" target="_blank" rel="noopener noreferrer">View project</a>` : ""}</div>`).join("")}</section>
<footer>Portfolio created with Portfolio Studio.</footer>
</main></body></html>`;
  return doc;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  currentPortfolio = getFormPortfolio();
  renderPortfolio(currentPortfolio);
  saveButton.disabled = false;
  downloadButton.disabled = false;
  showStatus("Portfolio generated! Review the preview, then save or download it.");
  document.querySelector("#previewSection").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#addProject").addEventListener("click", () => addProject());

form.addEventListener("reset", () => {
  setTimeout(() => {
    projectsContainer.innerHTML = "";
    addProject();
    currentPortfolio = null;
    preview.innerHTML = `<div class="preview-placeholder"><div class="placeholder-icon">✦</div><h2>Your story starts here.</h2><p>Fill in the form and click Generate portfolio to see your personal website.</p></div>`;
    saveButton.disabled = true;
    downloadButton.disabled = true;
    showStatus("");
  }, 0);
});

saveButton.addEventListener("click", async () => {
  if (!currentPortfolio) return;
  saveButton.disabled = true;
  showStatus("Saving portfolio...");
  try {
    const response = await fetch("/api/portfolios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentPortfolio)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not save portfolio.");
    showStatus(`Saved successfully! ID: ${result.portfolio.id}`);
    await loadSavedPortfolios();
  } catch (error) {
    showStatus(error.message || "Could not connect to the server.", true);
  } finally {
    saveButton.disabled = false;
  }
});

downloadButton.addEventListener("click", () => {
  if (!currentPortfolio) return;
  const blob = new Blob([createStandaloneHTML(currentPortfolio)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(currentPortfolio.name || "my").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "my"}-portfolio.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});

async function loadSavedPortfolios() {
  savedList.innerHTML = '<p class="hint">Loading portfolios...</p>';
  try {
    const response = await fetch("/api/portfolios");
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not load saved portfolios.");
    if (!result.length) {
      savedList.innerHTML = '<p class="hint">No saved portfolios yet. Generate one and click Save to database.</p>';
      return;
    }
    savedList.innerHTML = "";
    result.forEach(item => {
      const card = document.createElement("article");
      card.className = "saved-card";
      const heading = document.createElement("h3");
      heading.textContent = item.name;
      const detail = document.createElement("p");
      detail.textContent = `${item.title} · ${new Date(item.created_at).toLocaleString()}`;
      const actions = document.createElement("div");
      actions.className = "saved-card-actions";
      const loadBtn = document.createElement("button");
      loadBtn.className = "btn btn-primary";
      loadBtn.textContent = "Open";
      loadBtn.addEventListener("click", () => openPortfolio(item.id));
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-secondary";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => deletePortfolio(item.id));
      actions.append(loadBtn, deleteBtn);
      card.append(heading, detail, actions);
      savedList.appendChild(card);
    });
  } catch (error) {
    savedList.innerHTML = "";
    const message = document.createElement("p");
    message.className = "status error";
    message.textContent = error.message;
    savedList.appendChild(message);
  }
}

async function openPortfolio(id) {
  try {
    const response = await fetch(`/api/portfolios/${encodeURIComponent(id)}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not open portfolio.");
    currentPortfolio = result.portfolio_data;
    renderPortfolio(currentPortfolio);
    saveButton.disabled = false;
    downloadButton.disabled = false;
    showStatus("Saved portfolio loaded into the preview. You can download it or save a new copy.");
    document.querySelector("#previewSection").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    showStatus(error.message, true);
  }
}

async function deletePortfolio(id) {
  if (!confirm("Delete this saved portfolio? This cannot be undone.")) return;
  try {
    const response = await fetch(`/api/portfolios/${encodeURIComponent(id)}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not delete portfolio.");
    showStatus("Portfolio deleted.");
    await loadSavedPortfolios();
  } catch (error) {
    showStatus(error.message, true);
  }
}

document.querySelector("#refreshSaved").addEventListener("click", loadSavedPortfolios);
addProject();
