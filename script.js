const gameGrid = document.getElementById('gameGrid');
const searchBar = document.getElementById('searchBar');
const gameModal = document.getElementById('gameModal');
const gameFrame = document.getElementById('gameFrame');
const closeBtn = document.getElementById('closeBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');

let gamesData = [];

async function fetchGames() {
    try {
        const response = await fetch('games.json');
        gamesData = await response.json();
        displayGames(gamesData);
    } catch (err) {
        console.error("DATA PROTOCOL ERROR: Unable to load modules.", err);
    }
}

function displayGames(list) {
    gameGrid.innerHTML = "";
    list.forEach(game => {
        const card = document.createElement('div');
        card.classList.add('game-card');
        card.innerHTML = `
            <img src="${game.thumbnail}" alt="${game.title}">
            <h3>${game.title}</h3>
        `;
        card.addEventListener('click', () => launchFrame(game.attributes));
        gameGrid.appendChild(card);
    });
}

function launchFrame(attrs) {
    gameFrame.src = attrs.src;
    gameFrame.setAttribute('scrolling', attrs.scrolling);
    gameFrame.setAttribute('frameborder', attrs.frameborder);
    if (attrs.allowfullscreen === "true") {
        gameFrame.setAttribute('allowfullscreen', 'true');
    }
    gameModal.style.display = "flex";
}

function terminateFrame() {
    gameModal.style.display = "none";
    gameFrame.removeAttribute('src');
}

closeBtn.addEventListener('click', terminateFrame);

fullscreenBtn.addEventListener('click', () => {
    if (gameFrame.requestFullscreen) gameFrame.requestFullscreen();
    else if (gameFrame.webkitRequestFullscreen) gameFrame.webkitRequestFullscreen();
});

searchBar.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = gamesData.filter(g => g.title.toLowerCase().includes(term));
    displayGames(filtered);
});

fetchGames();
