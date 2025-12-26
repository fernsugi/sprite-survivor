// Language System
const translations = {
    en: {
        title: "SPRITE SURVIVOR",
        subtitle: "Summon spirits, survive the horde",
        startGame: "START GAME",
        instructMove: "- Move",
        instructSummon: "- Summon sprites",
        instructSkill: "- Use skill (when available)",
        instructTip: "Collect orbs, summon sprites, survive!",
        hp: "HP",
        points: "POINTS",
        sprites: "SPRITES",
        skill: "SKILL",
        pressSpace: "[SPACE]",
        summonSprites: "SUMMON SPRITES",
        wave: "WAVE",
        nextWave: "Next wave",
        bossBattle: "BOSS BATTLE!",
        gameOver: "GAME OVER",
        finalScore: "Final Score",
        waveReached: "Wave Reached",
        restart: "RESTART",
        victory: "VICTORY!",
        victoryMsg: "You defeated the final boss!",
        playAgain: "PLAY AGAIN",
        language: "LANGUAGE",
        controlsHint: "WASD to move | 1-9, 0 to summon | SPACE for skill",
        skillDash: "DASH",
        skillHeal: "FULL HEAL",
        skillNuke: "SCREEN BLAST",
        skillMagnet: "ORB MAGNET",
        time: "Time",
        archer: "Archer",
        knight: "Knight",
        mage: "Mage",
        cleric: "Cleric",
        ninja: "Ninja",
        wizard: "Wizard",
        berserker: "Berserker",
        frost: "Frost",
        vampire: "Vampire",
        bomber: "Bomber",
        descArcher: "Shoots arrows",
        descKnight: "Sword slash",
        descMage: "AOE magic",
        descCleric: "Heals you",
        descNinja: "Fast attacks",
        descWizard: "Lightning",
        descBerserker: "Spin attack",
        descFrost: "Slows enemies",
        descVampire: "Lifesteal hits",
        descBomber: "Explosive shots",
        boss1: "Demon Lord",
        boss2: "Shadow King",
        boss3: "Void Emperor",
        boss4: "Death Titan"
    },
    ja: {
        title: "スプライトサバイバー",
        subtitle: "精霊を召喚し、群れを生き延びろ",
        startGame: "ゲームスタート",
        instructMove: "- 移動",
        instructSummon: "- スプライト召喚",
        instructSkill: "- スキル発動（所持時）",
        instructTip: "オーブを集め、スプライトを召喚し、生き残れ！",
        hp: "HP",
        points: "ポイント",
        sprites: "スプライト",
        skill: "スキル",
        pressSpace: "[スペース]",
        summonSprites: "スプライト召喚",
        wave: "ウェーブ",
        nextWave: "次のウェーブ",
        bossBattle: "ボス戦！",
        gameOver: "ゲームオーバー",
        finalScore: "最終スコア",
        waveReached: "到達ウェーブ",
        restart: "リスタート",
        victory: "勝利！",
        victoryMsg: "最終ボスを倒した！",
        playAgain: "もう一度",
        language: "言語",
        controlsHint: "WASD 移動 | 1-9, 0 召喚 | スペース スキル",
        skillDash: "ダッシュ",
        skillHeal: "全回復",
        skillNuke: "全画面攻撃",
        skillMagnet: "オーブ吸引",
        time: "タイム",
        archer: "アーチャー",
        knight: "ナイト",
        mage: "メイジ",
        cleric: "クレリック",
        ninja: "ニンジャ",
        wizard: "ウィザード",
        berserker: "バーサーカー",
        frost: "フロスト",
        vampire: "ヴァンパイア",
        bomber: "ボマー",
        descArcher: "矢を放つ",
        descKnight: "剣で斬る",
        descMage: "範囲魔法",
        descCleric: "回復",
        descNinja: "高速攻撃",
        descWizard: "雷撃",
        descBerserker: "回転攻撃",
        descFrost: "敵を減速",
        descVampire: "HP吸収",
        descBomber: "爆発弾",
        boss1: "魔王",
        boss2: "影の王",
        boss3: "虚空帝",
        boss4: "死の巨人"
    }
};

let currentLang = 'en';

function setLanguage(lang) {
    currentLang = lang;

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(lang === 'en' ? 'English' : '日本語')) {
            btn.classList.add('active');
        }
    });

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    initSpriteButtons();
    updateSkillDisplay();
    updateUI();
}

function t(key) {
    return translations[currentLang][key] || translations['en'][key] || key;
}
