const lang = navigator.language.startsWith("es") ? "es" : "en";

async function loadJSON(path) {
  const res = await fetch(path);
  return res.json();
}

function loadMenu(text) {
  document.getElementById("menu").innerHTML = `
    <a href="index.html">${text.menu.home}</a>
    <a href="equipos.html">${text.menu.teams}</a>
    <a href="patrocinadores.html">${text.menu.sponsors}</a>
  `;
}

function loadHome(text) {
  const el = document.getElementById("home-description");
  if (!el) return;
  el.textContent = text.home.description;
}

function loadTeamsPage(text) {
  const el = document.getElementById("teams-list");
  if (!el) return;
  const title = document.getElementById("bandits-font");
  if (title) title.textContent = text.teams.title;
}

function loadSponsorsPage(text) {
  const el = document.getElementById("sponsors-list");
  if (!el) return;
  const title = document.getElementById("bandits-font");
  if (title) title.textContent = text.sponsors.title;
}

async function loadTeamsList() {
  const container = document.getElementById("teams-list");
  if (!container) return;
 
  const data = await loadJSON("equipos/equipos.json");
 
  // Build HTML string before setting innerHTML to improve performance
  const teamsHtml = data.teams.map(team => `
      <div class="team-card">
        <a href="equipo.html?team=${team.id}">
          ${team.name}
        </a>
      </div>
    `).join('');
 
  container.innerHTML = teamsHtml;
}

async function loadSponsorsList(text) {
  const container = document.getElementById("sponsors-list");
  if (!container) return;

  const data = await loadJSON("patrocinadores/patrocinadores.json");

  const sponsorsHtml = data.sponsors.map(sponsor => `
      <div class="team-card">
        <span style="font-size: 1.5rem; display: block; margin-bottom: 15px;">${sponsor.name}</span>
        <a href="${sponsor.website}" target="_blank">${text.sponsors.website}</a> | 
        <a href="${sponsor.socials.twitter}" target="_blank">${text.sponsors.twitter}</a>
      </div>
    `).join('');

  container.innerHTML = sponsorsHtml;
}
 
async function loadTeam() {
  const container = document.getElementById("team-content");
  if (!container) return;
 
  const params = new URLSearchParams(window.location.search);
  const teamId = params.get("team");
  if (!teamId) return;
 
  try {
    // Fetch data in parallel for efficiency
    const [template, data] = await Promise.all([
      loadJSON("templates/equipos.json"),
      loadJSON(`equipos/${teamId}/${lang}.json`)
    ]);
  
    // Use a map for rendering sections. It's cleaner and more scalable.
    const sectionRenderers = {
      teamName: (d) => `<h1 id="bandits-font">${d.teamName}</h1>`,
      description: (d) => `<p>${d.description}</p>`,
      players: (d) => `<ul>${d.players.map(p => `<li>${p}</li>`).join("")}</ul>`,
      socials: (d) => `
          <p>
            <a href="${d.socials.twitter}">Twitter</a> |
            <a href="${d.socials.discord}">Discord</a>
          </p>
        `
    };
  
    const teamHtml = template.layout
      .map(section => sectionRenderers[section] ? sectionRenderers[section](data) : '')
      .join('');
  
    container.innerHTML = teamHtml;
  } catch (error) {
    console.error("Failed to load team data:", error);
    container.innerHTML = `
      <h1 id="bandits-font">Error</h1>
      <p>No se pudo cargar la información del equipo. Es posible que el equipo no exista o que haya un problema con los archivos de datos.</p>
      <a href="equipos.html">Volver a la lista de equipos</a>
    `;
  }
}
 
// Main function to orchestrate all loading operations
async function main() {
  // Load shared translation file once to avoid multiple network requests
  const i18nText = await loadJSON(`lang/${lang}.json`);
  loadMenu(i18nText);
  loadHome(i18nText);
  loadTeamsPage(i18nText);
  loadSponsorsPage(i18nText);
 
  // Load other parts of the page. They can run in parallel.
  Promise.all([
    loadTeamsList(),
    loadTeam(),
    loadSponsorsList(i18nText)
  ]);
}
 
main();
