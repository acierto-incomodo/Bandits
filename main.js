const lang = navigator.language.startsWith("es") ? "es" : "en";

async function loadJSON(path) {
  const res = await fetch(path);
  return res.json();
}

function loadMenu(text) {
  document.getElementById("menu").innerHTML = `
    <a href="index.html" class="btn-apple">${text.menu.home}</a>
    <a href="equipos.html" class="btn-apple">${text.menu.teams}</a>
    <a href="patrocinadores.html" class="btn-apple">${text.menu.sponsors}</a>
    <a href="tienda.html" class="btn-apple">${text.menu.shop}</a>
    <a href="social.html" class="btn-apple">${text.menu.social}</a>
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
  const el = document.getElementById("partners-list");
  if (!el) return;
  const title = document.getElementById("bandits-font");
  if (title) title.textContent = text.sponsors.title;
}

function loadShopPage(text) {
  const title = document.getElementById("shop-title");
  if (title) title.textContent = text.shop.title;

  const description = document.getElementById("shop-description");
  if (description) description.textContent = text.shop.description;
}

function loadSocialPage(text) {
  const container = document.getElementById("social-content");
  if (!container) return;

  const title = document.getElementById("bandits-font");
  if (title) title.textContent = text.social.title;

  const ytTitle = document.getElementById("youtube-title");
  if (ytTitle) ytTitle.textContent = text.social.youtube;

  const twTitle = document.getElementById("twitter-title");
  if (twTitle) twTitle.textContent = text.social.twitter;

  const ytList = document.getElementById("youtube-list");
  if (ytList) {
    ytList.innerHTML = `
      <div class="video-card">
        <iframe src="https://www.youtube.com/embed/videoseries?listType=user_uploads&list=bandits_g_g" title="Últimos videos de Bandits" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    `;
  }

  const twFeed = document.getElementById("twitter-feed");
  if (twFeed) {
    twFeed.innerHTML = `<a class="twitter-timeline" data-theme="dark" data-height="600" data-tweet-limit="4" href="https://x.com/Bandits_GG_?ref_src=twsrc%5Etfw">Tweets by Bandits</a>`;
    
    const script = document.createElement("script");
    script.src = "https://platform.x.com/widgets.js";
    script.async = true;
    document.body.appendChild(script);
  }
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
  const container = document.getElementById("partners-list");
  if (!container) return;

  const data = await loadJSON("patrocinadores/patrocinadores.json");

  const sponsorsHtml = data.partners.map(partner => `
      <div class="team-card">
        <img src="${partner.background}" alt="${partner.name}" class="partner-bg">
        <div class="partner-overlay"></div>
        <div class="partner-content">
          <span class="partner-name">${partner.name}</span>
          <div class="partner-actions">
            <a href="${partner.website}" target="_blank" class="btn-apple">
              <i class="fas fa-globe"></i> ${text.sponsors.website}
            </a>
            <a href="${partner.socials.twitter}" target="_blank" class="btn-apple">
              <i class="fab fa-twitter"></i> ${text.sponsors.twitter}
            </a>
          </div>
        </div>
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
          <div class="partner-actions" style="justify-content: flex-start;">
            <a href="${d.socials.twitter}" target="_blank" class="btn-apple">
              <i class="fab fa-twitter"></i> Twitter
            </a>
            <a href="${d.socials.discord}" target="_blank" class="btn-apple">
              <i class="fab fa-discord"></i> Discord
            </a>
          </div>
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
      <div style="margin-top: 16px;">
        <a href="equipos.html" class="btn-apple">Volver a la lista de equipos</a>
      </div>
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
  loadShopPage(i18nText);
  loadSocialPage(i18nText);
 
  // Load other parts of the page. They can run in parallel.
  Promise.all([
    loadTeamsList(),
    loadTeam(),
    loadSponsorsList(i18nText)
  ]);
}
 
main();
