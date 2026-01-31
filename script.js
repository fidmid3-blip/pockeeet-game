// Данные игрока
let playerData = {
    coins: 100,
    gems: 10,
    monsters: []
};

// База монстров
const monstersDatabase = [
    { id: 1, name: "Огнедыш", rarity: "common", type: "fire", emoji: "🔥" },
    { id: 2, name: "Водяной", rarity: "common", type: "water", emoji: "💧" },
    { id: 3, name: "Листовик", rarity: "common", type: "grass", emoji: "🍃" },
    { id: 4, name: "Громозуб", rarity: "rare", type: "electric", emoji: "⚡" },
    { id: 5, name: "Ледяной дух", rarity: "rare", type: "ice", emoji: "❄️" },
    { id: 6, name: "Каменный страж", rarity: "epic", type: "rock", emoji: "🪨" },
    { id: 7, name: "Теневой клинок", rarity: "epic", type: "dark", emoji: "🌑" },
    { id: 8, name: "Золотой дракон", rarity: "legendary", type: "dragon", emoji: "🐉" }
];

// Функция крутки гачи
function openGacha() {
    if (playerData.coins < 10) {
        showResult("❌ Недостаточно монет! Нужно 10 монет.");
        return;
    }
    
    playerData.coins -= 10;
    updateUI();
    showResult("🌀 Крутим...");
    
    setTimeout(() => {
        const monster = spinGacha();
        playerData.monsters.push(monster);
        
        showResult(`
            🎉 Вы получили:
            <br><br>
            <div style="font-size: 48px">${monster.emoji}</div>
            <strong>${monster.name}</strong>
            <br>
            Редкость: <span class="rarity-${monster.rarity}">${getRarityName(monster.rarity)}</span>
        `);
        
        saveProgress();
    }, 1500);
}

function spinGacha() {
    const random = Math.random() * 100;
    
    let rarity;
    if (random < 50) rarity = "common";
    else if (random < 80) rarity = "rare";
    else if (random < 95) rarity = "epic";
    else rarity = "legendary";
    
    const possibleMonsters = monstersDatabase.filter(m => m.rarity === rarity);
    const randomMonster = possibleMonsters[Math.floor(Math.random() * possibleMonsters.length)];
    
    return { ...randomMonster };
}

function openCollection() {
    if (playerData.monsters.length === 0) {
        showResult("📭 Ваша коллекция пуста. Покрутите гачу!");
        return;
    }
    
    let collectionHTML = "<h3>📖 Ваша коллекция:</h3><br>";
    
    playerData.monsters.forEach((monster) => {
        collectionHTML += `
            <div class="monster-item">
                ${monster.emoji} <strong>${monster.name}</strong> 
                (${getRarityName(monster.rarity)})
            </div>
        `;
    });
    
    showResult(collectionHTML);
}

function showResult(text) {
    document.getElementById('result').innerHTML = text;
}

function updateUI() {
    document.getElementById('coins').textContent = playerData.coins;
    document.getElementById('gems').textContent = playerData.gems;
}

function getRarityName(rarity) {
    const names = {
        common: "Обычный",
        rare: "Редкий",
        epic: "Эпический",
        legendary: "Легендарный"
    };
    return names[rarity] || rarity;
}

function saveProgress() {
    localStorage.setItem('pockeeetMonsterData', JSON.stringify(playerData));
}

function loadProgress() {
    const saved = localStorage.getItem('pockeeetMonsterData');
    if (saved) {
        playerData = JSON.parse(saved);
        updateUI();
    }
}

window.onload = function() {
    loadProgress();
    updateUI();
};