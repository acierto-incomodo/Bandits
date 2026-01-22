const lang = navigator.language.startsWith("es") ? "es" : "en";

async function loadJSON(path) {
  const res = await fetch(path);
  return res.json();
}

async function loadMenu() {
  const text = await loadJSON(`lang/${lang}.json`);
  document.getElementById("menu").innerHTML = `
    <a href="index.html">${text.menu.home}</a>
    <a href="equipos.html">${text.menu.teams}</a>
  `;
}

async function loadHome() {
  const el = document.getElementById("home-description");
  if (!el) return;
  const text = await loadJSON(`lang/${lang}.json`);
  el.textContent = text.home.description;
}

async function loadTeamsList() {
  const container = document.getElementById("teams-list");
  if (!container) return;

  const data = await loadJSON("equipos/equipos.json");

  data.teams.forEach(team => {
    container.innerHTML += `
      <div class="team-card">
        <a href="equipo.html?team=${team.id}">
          ${team.name}
        </a>
      </div>
    `;
  });
}

async function loadTeam() {
  const container = document.getElementById("team-content");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const teamId = params.get("team");
  if (!teamId) return;

  const template = await loadJSON("templates/equipos.json");
  const data = await loadJSON(`equipos/${teamId}/${lang}.json`);

  template.layout.forEach(section => {
    if (section === "teamName")
      container.innerHTML += `<h1 id="bandits-font">${data.teamName}</h1>`;

    if (section === "description")
      container.innerHTML += `<p>${data.description}</p>`;

    if (section === "players")
      container.innerHTML += `<ul>${data.players.map(p => `<li>${p}</li>`).join("")}</ul>`;

    if (section === "socials")
      container.innerHTML += `
        <p>
          <a href="${data.socials.twitter}">Twitter</a> |
          <a href="${data.socials.discord}">Discord</a>
        </p>
      `;
  });
}

loadMenu();
loadHome();
loadTeamsList();
loadTeam();
