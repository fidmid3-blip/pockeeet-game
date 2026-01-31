// ====================
// СИСТЕМА ЕЖЕДНЕВНЫХ НАГРАД
// ====================

const DAILY_REWARDS = [
    { day: 1, coins: 100, gachaSpins: 1, items: [], message: "Добро пожаловать! 🎉" },
    { day: 2, coins: 150, gachaSpins: 1, items: ["energy_potion_small"], message: "Маленькое зелье энергии! ⚡" },
    { day: 3, coins: 200, gachaSpins: 2, items: [], message: "Двойные гачи! 🎰" },
    { day: 4, coins: 250, gachaSpins: 2, items: ["energy_potion_medium"], message: "Среднее зелье! 🧪" },
    { day: 5, coins: 300, gachaSpins: 3, items: ["random_common_hero"], message: "Случайный герой! 🦸" },
    { day: 6, coins: 400, gachaSpins: 3, items: ["crystals_small"], message: "Первые кристаллы! 💎" },
    { day: 7, coins: 500, gachaSpins: 5, items: ["random_rare_hero"], message: "Редкий герой! 🏆 Бонус x2!" }
];

class DailyRewardSystem {
    constructor() {
        this.loadProgress();
        this.updateTimer();
        setInterval(() => this.updateTimer(), 1000);
    }
    
    loadProgress() {
        const saved = localStorage.getItem('dailyRewardsData');
        if (saved) {
            const data = JSON.parse(saved);
            this.streak = data.streak || 0;
            this.totalDays = data.totalDays || 0;
            this.lastClaimDate = data.lastClaimDate ? new Date(data.lastClaimDate) : null;
        } else {
            this.streak = 0;
            this.totalDays = 0;
            this.lastClaimDate = null;
        }
    }
    
    saveProgress() {
        const data = {
            streak: this.streak,
            totalDays: this.totalDays,
            lastClaimDate: this.lastClaimDate ? this.lastClaimDate.toISOString() : null
        };
        localStorage.setItem('dailyRewardsData', JSON.stringify(data));
    }
    
    canClaimToday() {
        if (!this.lastClaimDate) return true;
        
        const today = new Date();
        const lastClaim = new Date(this.lastClaimDate);
        
        const daysDiff = Math.floor((today - lastClaim) / (1000 * 60 * 60 * 24));
        if (daysDiff > 1) {
            this.streak = 0;
            this.saveProgress();
        }
        
        return lastClaim.getDate() !== today.getDate() || 
               lastClaim.getMonth() !== today.getMonth() || 
               lastClaim.getFullYear() !== today.getFullYear();
    }
    
    claimDailyReward() {
        if (!this.canClaimToday()) {
            return {
                success: false,
                message: "Вы уже получили награду сегодня! ⏳"
            };
        }
        
        this.streak++;
        this.totalDays++;
        this.lastClaimDate = new Date();
        
        const cycleDay = ((this.streak - 1) % 7) + 1;
        const reward = DAILY_REWARDS.find(r => r.day === cycleDay);
        
        let bonusMultiplier = 1;
        if (this.streak >= 7) bonusMultiplier = 2;
        if (this.streak >= 14) bonusMultiplier = 3;
        
        const coinsEarned = reward.coins * bonusMultiplier;
        const spinsEarned = reward.gachaSpins * bonusMultiplier;
        
        playerData.coins += coinsEarned;
        if (!playerData.freeGachaSpins) playerData.freeGachaSpins = 0;
        playerData.freeGachaSpins += spinsEarned;
        
        this.saveProgress();
        updateUI();
        
        return {
            success: true,
            streak: this.streak,
            cycleDay: cycleDay,
            rewards: {
                coins: coinsEarned,
                spins: spinsEarned,
                items: reward.items,
                message: reward.message + (bonusMultiplier > 1 ? ` (x${bonusMultiplier} бонус!)` : "")
            },
            message: `🎉 День ${this.streak}! Получено: ${coinsEarned} монет, ${spinsEarned} гач`
        };
    }
    
    getTimeUntilNextClaim() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const diffMs = tomorrow - now;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        return {
            hours: hours.toString().padStart(2, '0'),
            minutes: minutes.toString().padStart(2, '0'),
            seconds: seconds.toString().padStart(2, '0'),
            totalMs: diffMs
        };
    }
    
    updateTimer() {
        const timer = this.getTimeUntilNextClaim();
        const timerElement = document.getElementById('nextResetTimer');
        if (timerElement) {
            timerElement.textContent = `${timer.hours}:${timer.minutes}:${timer.seconds}`;
        }
        
        const claimBtn = document.getElementById('claimRewardBtn');
        const statusElement = document.getElementById('claimStatus');
        
        if (this.canClaimToday()) {
            if (claimBtn) {
                claimBtn.disabled = false;
                claimBtn.innerHTML = '<i class="fas fa-gift"></i> Получить сегодняшнюю награду';
            }
            if (statusElement) {
                statusElement.textContent = "Готово к получению! 🎁";
                statusElement.className = "status-message status-ready";
            }
        } else {
            if (claimBtn) {
                claimBtn.disabled = true;
                claimBtn.innerHTML = `<i class="fas fa-clock"></i> Ждите до завтра (${timer.hours}:${timer.minutes})`;
            }
            if (statusElement) {
                statusElement.textContent = `Уже получено сегодня! Следующая через: ${timer.hours}:${timer.minutes}:${timer.seconds}`;
                statusElement.className = "status-message status-waiting";
            }
        }
    }
    
    renderCalendar() {
        const calendarElement = document.getElementById('rewardsCalendar');
        if (!calendarElement) return;
        
        calendarElement.innerHTML = '';
        
        const currentCycleDay = ((this.streak) % 7) + 1;
        
        for (let i = 1; i <= 7; i++) {
            const reward = DAILY_REWARDS.find(r => r.day === i);
            const dayElement = document.createElement('div');
            dayElement.className = 'day-reward';
            
            let dayStatus = 'future';
            let dayText = `День ${i}`;
            
            if (i < currentCycleDay) {
                dayStatus = 'claimed';
                dayText = `✓ День ${i}`;
            } else if (i === currentCycleDay) {
                dayStatus = 'today';
                dayText = `🎁 День ${i}`;
            }
            
            let bonusText = '';
            if (this.streak >= 7 && i === currentCycleDay) bonusText = ' x2';
            if (this.streak >= 14 && i === currentCycleDay) bonusText = ' x3';
            
            dayElement.classList.add(dayStatus);
            
            dayElement.innerHTML = `
                <div class="reward-day">${dayText}</div>
                <div class="reward-content">
                    <div class="reward-amount">${reward.coins}💰</div>
                    <div>${reward.gachaSpins}🎰${bonusText}</div>
                    ${reward.items.length > 0 ? '<div>+ предмет</div>' : ''}
                </div>
            `;
            
            calendarElement.appendChild(dayElement);
        }
        
        const streakElement = document.getElementById('currentStreak');
        const totalDaysElement = document.getElementById('totalDays');
        
        if (streakElement) streakElement.textContent = this.streak;
        if (totalDaysElement) totalDaysElement.textContent = this.totalDays;
    }
}

const dailyRewardSystem = new DailyRewardSystem();

function claimDailyReward() {
    const result = dailyRewardSystem.claimDailyReward();
    
    if (result.success) {
        showResult(`
            <div style="text-align: center;">
                <div style="font-size: 48px; margin: 20px 0;">🎉</div>
                <h3>${result.message}</h3>
                <p>Получено:</p>
                <div style="font-size: 24px;">
                    <span style="color: gold;">${result.rewards.coins} 💰</span><br>
                    <span style="color: #4CAF50;">${result.rewards.spins} 🎰</span>
                </div>
                <p>${result.rewards.message}</p>
                <p>Серия: <strong>${result.streak} дней</strong> подряд!</p>
            </div>
        `);
        
        dailyRewardSystem.renderCalendar();
        updateUI();
        saveProgress();
    } else {
        showResult(`<div style="color: #ff6b6b; text-align: center;">${result.message}</div>`);
    }
}

// ====================
// БАЗОВАЯ ИГРА
// ====================

let playerData = {
    coins: 100,
    gems: 10,
    monsters: [],
    freeGachaSpins: 0
};

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

function openGacha() {
    if (playerData.coins < 10 && (!playerData.freeGachaSpins || playerData.freeGachaSpins <= 0)) {
        showResult("❌ Недостаточно монет и нет бесплатных гач!");
        return;
    }
    
    let useFreeSpin = false;
    if (playerData.freeGachaSpins && playerData.freeGachaSpins > 0) {
        playerData.freeGachaSpins--;
        useFreeSpin = true;
    } else {
        playerData.coins -= 10;
    }
    
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
            <br>
            ${useFreeSpin ? '🆓 Использована бесплатная гача!' : '💰 Потрачено 10 монет'}
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
    
    const freeGachaElement = document.getElementById('freeGachaCount');
    if (freeGachaElement) {
        freeGachaElement.textContent = playerData.freeGachaSpins || 0;
    }
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
    
    setTimeout(() => {
        dailyRewardSystem.renderCalendar();
        dailyRewardSystem.updateTimer();
    }, 100);
}

window.onload = function() {
    loadProgress();
    updateUI();
};
