const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContextClass();

const Sound = {
    init: () => {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    },
    playTone: (freq, type, duration, vol = 0.1) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, audioCtx.currentTime + duration);

        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    },
    playNoise: (duration) => {
        const bufferSize = audioCtx.sampleRate * duration;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        noise.connect(gain);
        gain.connect(audioCtx.destination);
        noise.start();
    },
    punch: () => {
        Sound.init();
        Sound.playTone(300, 'triangle', 0.15, 0.01);
    },
    kick: () => {
        Sound.init();
        Sound.playTone(200, 'square', 0.2, 0.01);
    },
    hit: () => {
        Sound.init();
        Sound.playNoise(0.15);

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(250, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    },
    beep: () => {
        Sound.init();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    }
};

let isMusicPlaying = false;
let musicInterval = null;

const Music = {
    start: () => {
        if (isMusicPlaying) return;
        isMusicPlaying = true;
        Sound.init();

        let note = 0;
        const sequence = [110, 110, 146, 130, 110, 110, 98, 130];

        musicInterval = setInterval(() => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(sequence[note], audioCtx.currentTime);

            gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.2);

            note = (note + 1) % sequence.length;
        }, 200);
    },
    stop: () => {
        if (musicInterval) {
            clearInterval(musicInterval);
            musicInterval = null;
        }
        isMusicPlaying = false;
    }
};

let state = 'MENU';
let level = 0;
let storyIndex = 0;
let p1, p2;
let shake = 0;
/** Persists across fights in a run; only resets on new game / title. */
let finisherMeter = 0;
const FINISHER_METER_MAX = 100;
const KEYS = { w: false, a: false, s: false, d: false, j: false, k: false, l: false, i: false, u: false, arrowup: false };

const startAudioContext = () => {
    if (state === 'MENU') {
        Music.start();
        document.removeEventListener('click', startAudioContext);
        document.removeEventListener('keydown', startAudioContext);
        document.removeEventListener('touchstart', startAudioContext);
    }
};

document.addEventListener('click', startAudioContext);
document.addEventListener('keydown', startAudioContext);
document.addEventListener('touchstart', startAudioContext);

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const portraitCanvas = document.getElementById('portraitCanvas');
const pCtx = portraitCanvas.getContext('2d');

const GAME_W = 640;
const GAME_H = 360;
const GROUND_Y = 300;

/** Player HP scales with durability; tuned up so runs are survivable vs boss HP pools. */
const PLAYER_HP_BASE = 130;
const PLAYER_HP_PER_DUR = 28;

/** Opponents at or above this max HP count as tanks for special-move damage rules. */
const TANK_HP_THRESHOLD = 500;
const SPECIAL_COOLDOWN_FRAMES = 150;
const INVINCIBILITY_FRAMES = 900;
const BURN_TICK_FRAMES = 45;
const BURN_DAMAGE = 6;
const BURN_DURATION_FRAMES = 270;
const SLOW_DURATION_FRAMES = 360;
const DOCILE_DURATION_FRAMES = 360;

const SPECIAL_MAP = {
    chris: 'body_slam',
    chandler: 'rhino_charge',
    kaden: 'speed_blitz',
    vaughn: 'ravenous_bite',
    isaiah: 'spider_monkey',
    christian: 'big_whack',
    marshall: 'choke_slam',
    joe: 'ratchet_tornado',
    alex: 'edible_throw',
    danny: 'cigarette_flick',
    jody: 'invincibility_star'
};

const SPECIAL_NAMES = {
    body_slam: 'Body Slam',
    rhino_charge: 'Rhino Charge',
    speed_blitz: 'Speed Blitz',
    ravenous_bite: 'Ravenous Bite',
    spider_monkey: 'Spider Monkey',
    big_whack: 'Big Whack',
    choke_slam: 'Choke Slam',
    ratchet_tornado: 'Ratchet Tornado',
    edible_throw: 'Edible Throw',
    cigarette_flick: 'Cigarette Flick',
    invincibility_star: 'Invincibility Star',
    power_surge: 'Power Surge'
};

const SPECIAL_ACTIONS = new Set([
    'BODY_SLAM', 'RHINO_CHARGE', 'SPEED_BLITZ', 'RAVENOUS_BITE', 'SPIDER_MONKEY',
    'BIG_WHACK', 'CHOKE_SLAM', 'RATCHET_TORNADO', 'INVINCIBILITY_STAR', 'POWER_SURGE',
    'EDIBLE_THROW', 'CIGARETTE_FLICK'
]);

let projectiles = [];
let specialBanner = '';
let specialBannerTimer = 0;

function getSpecialMoveId(charId) {
    return SPECIAL_MAP[charId] || 'power_surge';
}

function isTank(fighter) {
    return fighter.config.tank === true || fighter.maxHp >= TANK_HP_THRESHOLD;
}

function isInSpecial(fighter) {
    return SPECIAL_ACTIONS.has(fighter.action);
}

function facingRight(fighter, other) {
    return fighter.x < other.x;
}

function getSpecialMoveIdFor(fighter) {
    return getSpecialMoveId(fighter.config.id);
}

function showSpecialBanner(name) {
    specialBanner = name;
    specialBannerTimer = 90;
}

function gainFinisherMeter(damage, victimMaxHp) {
    if (damage <= 0 || !victimMaxHp) return;
    finisherMeter = Math.min(FINISHER_METER_MAX, finisherMeter + (damage / victimMaxHp) * 34);
    updateHUD();
}

function canUseFinisher(fighter) {
    return (
        fighter.isPlayer &&
        finisherMeter >= FINISHER_METER_MAX &&
        (fighter.action === 'IDLE' || fighter.action === 'WALK')
    );
}

function startFinisher(att) {
    att.action = 'FINISHER';
    att.timer = 85;
    att.hasHit = false;
    att.vx = 0;
    finisherMeter = 0;
    showSpecialBanner('FINISHER!');
    Sound.playTone(55, 'sawtooth', 0.35, 0.05);
    updateHUD();
}

function updateFinisher(att, def) {
    if (att.action !== 'FINISHER') return;

    const dist = Math.abs(att.x - def.x);
    if (att.timer > 35 && att.timer < 62) {
        def.x = att.x + (facingRight(att, def) ? 38 : -38);
        def.y = att.y - 12;
    }

    if (!att.hasHit && att.timer > 22 && att.timer < 48 && dist < 100 && Math.abs(att.y - def.y) < 90) {
        att.hasHit = true;
        if (def.config.id === 'jb') def.hp -= 1500;
        else def.hp = 0;
        def.hp = Math.max(0, def.hp);
        def.action = 'HURT';
        def.timer = 40;
        def.vx = (att.x < def.x ? 14 : -14);
        shake = 18;
        Sound.hit();
        updateHUD();
    }

    if (att.timer <= 0) {
        att.action = 'IDLE';
        att.hasHit = false;
        att.vx = 0;
    }
}

function applySpecialDamage(def, moveId, att) {
    if (def.invincibleTimer > 0) return;

    const hpBefore = def.hp;
    const max = def.maxHp;
    const tank = isTank(def);

    switch (moveId) {
        case 'body_slam':
            if (tank) def.hp -= max * 0.5;
            else def.hp = 0;
            break;
        case 'rhino_charge':
            if (tank) def.hp -= max * 0.5;
            else def.hp = 30;
            break;
        case 'speed_blitz':
            def.hp -= max * (tank ? 0.33 : 0.66);
            break;
        case 'ravenous_bite':
            if (tank) def.hp = max * 0.66;
            else def.hp = 0;
            break;
        case 'spider_monkey':
            if (def.hp > 50) def.hp = 50;
            else def.hp = 0;
            break;
        case 'big_whack':
            def.hp -= max * 0.8;
            break;
        case 'choke_slam':
            if (def.config.id === 'jb') def.hp -= 1200;
            else def.hp = 0;
            break;
        case 'ratchet_tornado':
            def.hp -= max * (tank ? 0.5 : 0.75);
            break;
        case 'edible_throw':
            if (tank) {
                def.hp -= max * 0.5;
                def.slowTimer = SLOW_DURATION_FRAMES;
                def.docileTimer = DOCILE_DURATION_FRAMES;
            } else {
                def.hp = 0;
            }
            break;
        case 'cigarette_flick':
            if (tank) def.hp -= max * 0.5;
            else def.hp -= max * 0.5;
            def.burnTimer = BURN_DURATION_FRAMES;
            def.burnTick = 0;
            break;
        case 'power_surge': {
            const dmg = 40 + (att.config.str || att.config.pwr || 5) * 4;
            def.hp -= dmg;
            break;
        }
        default:
            break;
    }

    def.hp = Math.max(0, def.hp);
    def.action = 'HURT';
    def.timer = 25;
    shake = 8;
    if (att && att.isPlayer) gainFinisherMeter(Math.max(0, hpBefore - def.hp), def.maxHp);
    updateHUD();
}

function hurtFromSpecial(def, att, knockback = 12, unblockable = true) {
    if (def.invincibleTimer > 0) return;
    if (def.action !== 'BLOCK' || unblockable) {
        def.vx = (att.x < def.x ? knockback : -knockback);
    } else {
        def.hp -= 2;
        updateHUD();
    }
}

function actionForMove(moveId) {
    const map = {
        body_slam: 'BODY_SLAM',
        rhino_charge: 'RHINO_CHARGE',
        speed_blitz: 'SPEED_BLITZ',
        ravenous_bite: 'RAVENOUS_BITE',
        spider_monkey: 'SPIDER_MONKEY',
        big_whack: 'BIG_WHACK',
        choke_slam: 'CHOKE_SLAM',
        ratchet_tornado: 'RATCHET_TORNADO',
        edible_throw: 'EDIBLE_THROW',
        cigarette_flick: 'CIGARETTE_FLICK',
        invincibility_star: 'INVINCIBILITY_STAR',
        power_surge: 'POWER_SURGE'
    };
    return map[moveId] || 'POWER_SURGE';
}

function startSpecial(attacker, defender) {
    const moveId = getSpecialMoveIdFor(attacker);
    attacker.specialMoveId = moveId;
    attacker.specialPhase = 0;
    attacker.specialHit = false;
    attacker.specialCooldown = SPECIAL_COOLDOWN_FRAMES;
    attacker.action = actionForMove(moveId);
    showSpecialBanner(SPECIAL_NAMES[moveId] || 'Special');

    const durations = {
        body_slam: 70,
        rhino_charge: 50,
        speed_blitz: 35,
        ravenous_bite: 45,
        spider_monkey: 55,
        big_whack: 55,
        choke_slam: 75,
        ratchet_tornado: 60,
        edible_throw: 25,
        cigarette_flick: 20,
        invincibility_star: 30,
        power_surge: 40
    };

    attacker.timer = durations[moveId] || 40;
    attacker.vx = 0;

    if (moveId === 'invincibility_star') {
        attacker.invincibleTimer = INVINCIBILITY_FRAMES;
    }

    if (moveId === 'edible_throw' || moveId === 'cigarette_flick') {
        const dir = facingRight(attacker, defender) ? 1 : -1;
        projectiles.push({
            x: attacker.x + dir * 30,
            y: attacker.y - 50,
            vx: dir * 14,
            vy: -2,
            type: moveId,
            owner: attacker,
            active: true
        });
    }

    Sound.playTone(180, 'sawtooth', 0.25, 0.04);
}

function updateProjectiles() {
    projectiles = projectiles.filter(p => p.active);
    projectiles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;

        const target = p.owner === p1 ? p2 : p1;
        if (!target || target.invincibleTimer > 0) return;

        const dist = Math.hypot(p.x - target.x, p.y - (target.y - 40));
        if (dist < 45) {
            p.active = false;
            applySpecialDamage(target, p.type, p.owner);
            hurtFromSpecial(target, p.owner, p.type === 'cigarette_flick' ? 6 : 4);
            Sound.hit();
        }

        if (p.x < 0 || p.x > GAME_W || p.y > GROUND_Y + 20) p.active = false;
    });
}

function updateStatusEffects(fighter) {
    if (fighter.burnTimer > 0) {
        fighter.burnTimer--;
        fighter.burnTick++;
        if (fighter.burnTick >= BURN_TICK_FRAMES) {
            fighter.burnTick = 0;
            if (fighter.invincibleTimer <= 0) {
                fighter.hp -= BURN_DAMAGE;
                fighter.hp = Math.max(0, fighter.hp);
                updateHUD();
            }
        }
    }
    if (fighter.slowTimer > 0) fighter.slowTimer--;
    if (fighter.docileTimer > 0) fighter.docileTimer--;
    if (fighter.invincibleTimer > 0) fighter.invincibleTimer--;
}

function updateSpecialMove(att, def) {
    if (!isInSpecial(att)) return;

    const moveId = att.specialMoveId || getSpecialMoveIdFor(att);
    const dist = Math.abs(att.x - def.x);
    const inRange = dist < 90 && Math.abs(att.y - def.y) < 80;

    if (moveId === 'rhino_charge') {
        const dir = facingRight(att, def) ? 1 : -1;
        att.vx = dir * 18;
        att.x += att.vx;
    } else if (moveId === 'speed_blitz') {
        const dir = facingRight(att, def) ? 1 : -1;
        att.vx = dir * 22;
        att.x += att.vx * 0.5;
    } else if (moveId === 'body_slam') {
        if (att.timer > 35 && att.timer < 55) {
            def.x = att.x + (facingRight(att, def) ? 40 : -40);
            def.y = att.y - Math.min(80, (55 - att.timer) * 4);
        }
    } else if (moveId === 'choke_slam') {
        if (att.timer > 25 && att.timer < 50) {
            def.x = att.x + (facingRight(att, def) ? 35 : -35);
            def.y = att.y - Math.min(100, (50 - att.timer) * 5);
        }
    } else if (moveId === 'spider_monkey') {
        if (att.timer > 20 && att.timer < 45) def.x = att.x;
    } else if (moveId === 'ratchet_tornado') {
        att.vx = 0;
    }

    const totalDur = { body_slam: 70, rhino_charge: 50, speed_blitz: 35, ravenous_bite: 45, spider_monkey: 55, big_whack: 55, choke_slam: 75, ratchet_tornado: 60, power_surge: 40 }[moveId] || 40;
    const elapsed = totalDur - att.timer;
    const hitWindow = elapsed > 12 && elapsed < 32;

    if (!att.specialHit && hitWindow && inRange) {
        att.specialHit = true;
        if (moveId !== 'edible_throw' && moveId !== 'cigarette_flick' && moveId !== 'invincibility_star') {
            applySpecialDamage(def, moveId, att);
            const kb = moveId === 'rhino_charge' ? 28 : moveId === 'power_surge' ? 18 : 12;
            hurtFromSpecial(def, att, kb, true);
            Sound.hit();
        }
    }

    if (att.timer <= 0) {
        att.action = 'IDLE';
        att.vx = 0;
        att.specialHit = false;
    }
}

function drawProjectiles() {
    projectiles.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        if (p.type === 'edible_throw') {
            ctx.fillStyle = '#5c3a1e';
            ctx.beginPath();
            ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#3d2817';
            ctx.fillRect(-8, -4, 16, 8);
        } else {
            ctx.fillStyle = '#fff';
            ctx.fillRect(-6, -2, 12, 4);
            ctx.fillStyle = '#f50';
            ctx.fillRect(6, -2, 4, 4);
        }
        ctx.restore();
    });
}

function drawSpecialBanner() {
    if (specialBannerTimer <= 0) return;
    specialBannerTimer--;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(GAME_W / 2 - 120, 24, 240, 28);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(GAME_W / 2 - 120, 24, 240, 28);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(specialBanner, GAME_W / 2, 43);
    ctx.restore();
}

function resize() {
    canvas.width = GAME_W;
    canvas.height = GAME_H;
}
resize();

const TECHS = [
    {
        id: 'chandler', name: "CHANDLER", str: 8, spd: 8, dur: 8,
        skin: '#ffccaa', hair: '#420', style: 'glasses',
        suit: '#0033aa', pants: '#111',
        desc: "THE ADVISOR. Balanced.",
        h_mod: 100, w_mod: 40,
        jump_power: -14
    },
    {
        id: 'alex', name: "ALEX", str: 7, spd: 9, dur: 7,
        skin: '#ffdbac', hair: '#964B00', style: 'cap_back',
        suit: '#111', pants: '#111',
        desc: "THE STRIKER. Fast.",
        h_mod: 82, w_mod: 40,
        weapon: 'alex_ratchet'
    },
    {
        id: 'kaden', name: "KADEN", str: 6, spd: 10, dur: 6,
        skin: '#ffdbac', hair: '#333', style: 'messy',
        suit: '#111', pants: '#111',
        desc: "SPEED DEMON. Fast but Fragile.",
        h_mod: 96, w_mod: 30
    },
    {
        id: 'eddy', name: "EDDY", str: 9.5, spd: 1, dur: 9.5,
        skin: '#dcb', hair: '#222', style: 'eddy_style',
        suit: '#111', pants: '#111',
        desc: "THE TANK. Heavy Hitter.",
        h_mod: 90, w_mod: 38,
        jump_power: -9,
        weapon: 'wrench'
    },
    {
        id: 'christian', name: "CHRISTIAN", str: 8.5, spd: 5, dur: 9,
        skin: '#ffccaa', hair: '#222', style: 'short',
        suit: '#111', pants: '#111',
        desc: "THE BRAWLER. Tough.",
        body: 'fat',
        h_mod: 105, w_mod: 65,
        weapon: 'wrench',
        jump_power: -11.5
    },
    {
        id: 'isaiah', name: "ISAIAH", str: 8, spd: 9.5, dur: 8,
        skin: '#ffccaa', hair: '#222', style: 'short',
        suit: '#0033aa', pants: '#111',
        desc: "THE ATHLETE. High Jump.",
        h_mod: 95, w_mod: 40,
        jump_power: -16
    },
    {
        id: 'joe', name: "JOE", str: 7, spd: 7, dur: 9.5,
        skin: '#ffdbac', hair: '#222', style: 'cap_beard',
        suit: '#111', pants: '#111',
        desc: "THE VETERAN. Durable.",
        h_mod: 91, w_mod: 60,
        jump_power: -11.5,
        weapon: 'ratchet'
    },
    {
        id: 'danny', name: "DANNY", str: 7, spd: 9.5, dur: 7,
        skin: '#ffdbac', hair: '#8B4513', style: 'mustache_cig',
        suit: '#111', pants: '#111',
        desc: "BREAKBAR MASTER. Fast.",
        h_mod: 95, w_mod: 48,
        weapon: 'breaker_bar'
    },
    {
        id: 'rob', name: "ROB", str: 9, spd: 9, dur: 9,
        skin: '#ffdbac', hair: '#444', style: 'thinning_stubble',
        suit: '#111', pants: '#111',
        desc: "BALANCED. TATTOOED.",
        h_mod: 112,
        w_mod: 42,
        weapon: 'wrench',
        tattoos: true
    },
    {
        id: 'alberto', name: "ALBERTO", str: 5, spd: 5, dur: 5,
        skin: '#e0ac69',
        hair: '#000',
        style: 'simple_mustache',
        suit: '#111', pants: '#111',
        desc: "DETAIL MGR. Hates Brett.",
        h_mod: 75,
        w_mod: 68,
        jump_power: -9
    },
    {
        id: 'chris', name: "CHRIS", str: 17, spd: 6, dur: 10,
        skin: '#eeb', hair: '#444', style: 'beard',
        suit: '#0033aa', pants: '#111',
        desc: "THE BEAST. Strongest.",
        body: 'huge',
        h_mod: 110, w_mod: 130,
        jump_power: -11
    },
    {
        id: 'jody', name: "JODY", str: 12, spd: 12, dur: 12,
        skin: '#ffdbac', hair: '#222', style: 'goatee',
        suit: '#111', pants: '#111',
        desc: "THE BEST. Unstoppable.",
        h_mod: 90,
        w_mod: 48,
        tattoos: true,
        weapon: 'wrench',
        jump_power: -15
    },
    {
        id: 'marshall', name: "MARSHALL", str: 15, spd: 4, dur: 10,
        skin: '#ffdbac', hair: '#654321', style: 'hat_mustache',
        suit: '#111', pants: '#111',
        desc: "THE ONE TO FEAR.",
        h_mod: 120,
        w_mod: 120,
        weapon: 'giant_breaker_bar',
        jump_power: -8
    },
    {
        id: 'vince', name: "VINCE", str: 13, spd: 3, dur: 13,
        skin: '#ffdbac', hair: '#111', style: 'forward_cap',
        suit: '#444',
        pants: '#004488',
        desc: "MATCO GUY. Tank.",
        h_mod: 165,
        w_mod: 105,
        jump_power: -9,
        weapon: 'matco_ratchet'
    },
    {
        id: 'byron', name: "BYRON", str: 7.5, spd: 15, dur: 7,
        skin: '#ffdbac', hair: '#111', style: 'long_goatee',
        suit: '#111', pants: '#111',
        desc: "SNAP-ON GUY. Fast.",
        h_mod: 91,
        w_mod: 68,
        jump_power: -15,
        weapon: 'ratchet'
    },
    {
        id: 'vaughn', name: "VAUGHN", str: 6, spd: 6, dur: 6,
        skin: '#eccfa0',
        hair: '#000', style: 'beanie_hoodie',
        suit: '#00274c',
        pants: '#111',
        desc: "MICHIGAN FAITHFUL. Go Blue.",
        h_mod: 95,
        w_mod: 65
    }
];

let selectedTech = TECHS[0];

const ROSTER = [
    { id: 'erica', name: 'ERICA', hp: 200, spd: 4, pwr: 1.2, skin: '#ffdbac', hair: '#4a3121', style: 'long', suit: '#0033aa', pants: '#111', text: "Get off your phone! I have a waiter oil change!", body: 'skinny' },
    { id: 'johnny', name: 'JOHNNY', hp: 250, spd: 8, pwr: 1.5, skin: '#ffdbac', hair: '#d4a017', style: 'spiky', suit: '#0033aa', pants: '#111', text: "Customer is staring. Look busy.", body: 'skinny' },
    { id: 'jj', name: 'JJ', hp: 280, spd: 1, pwr: 1.8, skin: '#ffaaaa', hair: '#222', style: 'short', suit: '#0033aa', pants: '#111', body: 'fat', weapon: 'wrench', h_mod: 90, w_mod: 75, text: "Ticket #404 needs a rotation." },
    { id: 'chris', name: 'CHRIS', hp: 560, spd: 4, pwr: 3.7, skin: '#eeb', hair: '#654321', style: 'beard', suit: '#0033aa', pants: '#111', body: 'huge', h_mod: 110, w_mod: 130, text: "GRRAAAH! DO THE BRAKES!", aggro: 6.0 },
    { id: 'brett', name: 'BRETT', hp: 500, spd: 30, pwr: 2.5, skin: '#ffccaa', hair: '#da2', style: 'short', suit: '#FF69B4', pants: '#111', text: "Efficiency is down! Move it!", h_mod: 95 },
    { id: 'jason', name: 'JASON', hp: 920, spd: 2, pwr: 6.8, skin: '#dcb', hair: '#444', style: 'short', suit: '#d0d0d0', pants: '#111', body: 'huge', h_mod: 115, w_mod: 130, text: "I am the service lane." },
    { id: 'dennis', name: 'DENNIS', hp: 680, spd: 10, pwr: 4.2, skin: '#eaa', hair: '#888', style: 'bald', suit: '#111', pants: '#111', body: 'fat', text: "This is my house. You're fired." },
    { id: 'clint', name: 'CLINT', hp: 1020, spd: 6, pwr: 5.5, skin: '#ffdbac', hair: '#eee', style: 'short', suit: '#111', pants: '#111', body: 'skinny', h_mod: 130, w_mod: 35, text: "I can sell ice to an eskimo. Get back to work." },
    { id: 'matt', name: 'MATT', hp: 1180, spd: 14, pwr: 6.0, skin: '#ffccaa', hair: '#420', style: 'short', suit: '#111', pants: '#111', h_mod: 110, w_mod: 60, text: "I learned from the best. You're done." },
    { id: 'jb', name: 'JB', hp: 1750, spd: 5, pwr: 7.2, skin: '#5c3a1e', hair: '#888', style: 'beard', suit: '#ff6600', pants: '#ff6600', body: 'huge', h_mod: 160, w_mod: 145, text: "I broke out of prison just to fire you myself.", aggro: 11.0 },
    { id: 'joe', name: 'JOE', hp: 400, spd: 7, pwr: 2.5, skin: '#ffdbac', hair: '#222', style: 'cap_beard', suit: '#111', pants: '#111', body: 'fat', weapon: 'ratchet', h_mod: 91, w_mod: 60, text: "I just wanna go home." }
];

const STORY_SCENES = [
    { speaker: "KADEN", text: "Theres so many cars out there", img: null },
    { speaker: "JOE", text: "I just wanna go home", img: null },
    { speaker: "CHANDLER", text: "Fuck these customers. You got your pen let me get a hit", img: null },
    { speaker: "ALEX", text: "Here bro", img: null },
    { speaker: "NARRATOR", text: "Today... you fight back.", img: null }
];

function drawPortrait(c) {
    const w = 256;
    const h = 256;
    const grd = pCtx.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, '#001133');
    grd.addColorStop(1, '#000011');
    pCtx.fillStyle = grd;
    pCtx.fillRect(0, 0, w, h);

    if (!c.name) return;

    const cx = 128;
    const cy = 150;

    pCtx.fillStyle = c.skin;
    pCtx.beginPath();
    if (c.body === 'huge' || c.w_mod > 50) {
        pCtx.ellipse(cx, cy, 90, 100, 0, 0, Math.PI * 2);
    } else if (c.name === 'CLINT') {
        pCtx.ellipse(cx, cy, 50, 90, 0, 0, Math.PI * 2);
    } else {
        pCtx.ellipse(cx, cy, 60, 80, 0, 0, Math.PI * 2);
    }
    pCtx.fill();

    pCtx.fillStyle = c.skin;
    const earOffset = (c.body === 'huge' || c.w_mod > 50) ? 90 : 60;
    pCtx.beginPath(); pCtx.arc(cx - earOffset, cy, 15, 0, Math.PI * 2); pCtx.fill();
    pCtx.beginPath(); pCtx.arc(cx + earOffset, cy, 15, 0, Math.PI * 2); pCtx.fill();

    pCtx.fillStyle = '#fff';
    pCtx.beginPath(); pCtx.arc(cx - 25, cy - 10, 12, 0, Math.PI * 2); pCtx.fill();
    pCtx.beginPath(); pCtx.arc(cx + 25, cy - 10, 12, 0, Math.PI * 2); pCtx.fill();

    pCtx.fillStyle = '#000';
    const pSize = c.name === 'BRETT' ? 4 : 5;
    pCtx.beginPath(); pCtx.arc(cx - 25, cy - 10, pSize, 0, Math.PI * 2); pCtx.fill();
    pCtx.beginPath(); pCtx.arc(cx + 25, cy - 10, pSize, 0, Math.PI * 2); pCtx.fill();

    pCtx.strokeStyle = c.hair;
    pCtx.lineWidth = 5;
    pCtx.beginPath();
    const angry = (c.name === 'CHRIS' || c.name === 'DENNIS' || c.name === 'JASON' || c.name === 'CLINT' || c.name === 'MATT' || c.name === 'JB');
    pCtx.moveTo(cx - 40, cy - (angry ? 25 : 30));
    pCtx.lineTo(cx - 10, cy - (angry ? 20 : 30));
    pCtx.moveTo(cx + 40, cy - (angry ? 25 : 30));
    pCtx.lineTo(cx + 10, cy - (angry ? 20 : 30));
    pCtx.stroke();

    pCtx.fillStyle = c.hair;

    if (c.style === 'long') {
        pCtx.beginPath(); pCtx.arc(cx, cy - 50, 62, Math.PI, 0); pCtx.fill();
        pCtx.beginPath();
        pCtx.moveTo(cx - 60, cy - 40);
        pCtx.quadraticCurveTo(cx, cy - 100, cx + 60, cy - 40);
        pCtx.lineTo(cx + 80, 256);
        pCtx.lineTo(cx + 40, 256);
        pCtx.lineTo(cx + 40, cy - 20);
        pCtx.lineTo(cx - 40, cy - 20);
        pCtx.lineTo(cx - 40, 256);
        pCtx.lineTo(cx - 80, 256);
        pCtx.fill();
        pCtx.fillStyle = '#cc4444';
        pCtx.beginPath(); pCtx.ellipse(cx, cy + 50, 15, 6, 0, 0, Math.PI * 2); pCtx.fill();
    } else if (c.style === 'beard') {
        pCtx.beginPath(); pCtx.arc(cx, cy - 40, 80, Math.PI, 0); pCtx.fill();
        pCtx.fillStyle = '#221100';
        pCtx.beginPath(); pCtx.arc(cx, cy + 20, 80, 0, Math.PI); pCtx.fill();
        pCtx.fillRect(cx - 30, cy + 20, 60, 10);
    } else if (c.style === 'hat_beard') {
        pCtx.fillStyle = '#111';
        pCtx.beginPath(); pCtx.arc(cx, cy - 50, 65, Math.PI, 0); pCtx.fill();
        pCtx.fillRect(cx - 70, cy - 50, 140, 15);
        pCtx.fillStyle = '#443322';
        pCtx.beginPath(); pCtx.arc(cx, cy + 30, 65, 0, Math.PI); pCtx.fill();
        pCtx.fillRect(cx - 30, cy + 20, 60, 10);
    } else if (c.style === 'eddy_style') {
        pCtx.fillStyle = '#111';
        pCtx.beginPath(); pCtx.arc(cx, cy - 50, 65, Math.PI, 0); pCtx.fill();
        pCtx.fillRect(cx - 70, cy - 50, 140, 15);
    } else if (c.style === 'curly') {
        pCtx.beginPath();
        for (let i = 0; i < 10; i++) {
            pCtx.arc(cx - 50 + (i * 12), cy - 60 + Math.random() * 10, 15, 0, Math.PI * 2);
        }
        pCtx.fill();
        pCtx.fillStyle = '#111';
        pCtx.beginPath(); pCtx.arc(cx, cy - 40, 60, Math.PI, 0); pCtx.fill();
        pCtx.fillRect(cx - 70, cy - 40, 140, 10);
    } else if (c.style === 'messy') {
        pCtx.beginPath(); pCtx.arc(cx, cy - 40, 60, Math.PI, 0); pCtx.fill();
        pCtx.beginPath();
        pCtx.moveTo(cx - 60, cy - 30);
        pCtx.lineTo(cx, cy - 90);
        pCtx.lineTo(cx + 60, cy - 30);
        pCtx.lineTo(cx + 70, cy - 50);
        pCtx.lineTo(cx - 70, cy - 50);
        pCtx.fill();
    } else if (c.style === 'glasses') {
        pCtx.beginPath(); pCtx.arc(cx, cy - 40, 65, Math.PI, 0); pCtx.fill();
        pCtx.fillStyle = '#443322';
        pCtx.beginPath(); pCtx.arc(cx, cy + 40, 50, 0, Math.PI); pCtx.fill();
        pCtx.strokeStyle = '#111';
        pCtx.lineWidth = 3;
        pCtx.strokeRect(cx - 45, cy - 20, 40, 20);
        pCtx.strokeRect(cx + 5, cy - 20, 40, 20);
        pCtx.beginPath(); pCtx.moveTo(cx - 5, cy - 10); pCtx.lineTo(cx + 5, cy - 10); pCtx.stroke();
    } else if (c.style === 'bald') {
        pCtx.fillRect(cx - 70, cy - 40, 10, 60);
        pCtx.fillRect(cx + 60, cy - 40, 10, 60);
    } else if (c.style === 'cap_beard') {
        pCtx.fillStyle = '#000';
        pCtx.beginPath(); pCtx.arc(cx, cy - 50, 65, Math.PI, 0); pCtx.fill();
        pCtx.fillRect(cx - 70, cy - 50, 140, 15);
        pCtx.fillStyle = c.hair;
        pCtx.beginPath(); pCtx.arc(cx, cy + 25, 60, 0, Math.PI); pCtx.fill();
        pCtx.fillRect(cx - 60, cy, 15, 40);
        pCtx.fillRect(cx + 45, cy, 15, 40);
    } else if (c.style === 'mustache_cig') {
        pCtx.beginPath(); pCtx.arc(cx, cy - 40, 65, Math.PI, 0); pCtx.fill();
        pCtx.fillStyle = c.hair;
        pCtx.fillRect(cx - 20, cy + 15, 40, 10);
        pCtx.save();
        pCtx.translate(cx + 15, cy + 24);
        pCtx.rotate(0.2);
        pCtx.fillStyle = '#fff';
        pCtx.fillRect(0, 0, 35, 4);
        pCtx.fillStyle = '#f50';
        pCtx.fillRect(33, 0, 5, 4);
        pCtx.restore();
    } else if (c.style === 'goatee') {
        pCtx.beginPath(); pCtx.arc(cx, cy - 40, 65, Math.PI, 0); pCtx.fill();
        pCtx.fillStyle = c.hair;
        pCtx.beginPath(); pCtx.arc(cx, cy + 30, 10, 0, Math.PI * 2); pCtx.fill();
        pCtx.fillRect(cx - 5, cy + 28, 10, 10);
    } else if (c.style === 'hat_mustache') {
        pCtx.fillStyle = '#000';
        pCtx.beginPath(); pCtx.arc(cx, cy - 50, 65, Math.PI, 0); pCtx.fill();
        pCtx.fillRect(cx - 70, cy - 50, 140, 15);
        pCtx.fillStyle = c.hair;
        pCtx.beginPath();
        pCtx.moveTo(cx - 30, cy + 30);
        pCtx.quadraticCurveTo(cx, cy + 15, cx + 30, cy + 30);
        pCtx.quadraticCurveTo(cx, cy + 40, cx - 30, cy + 30);
        pCtx.fill();
    } else if (c.style === 'thinning_stubble') {
        pCtx.fillStyle = c.hair;
        pCtx.beginPath(); pCtx.arc(cx, cy - 40, 65, 0, Math.PI * 2); pCtx.fill();
        pCtx.fillStyle = c.skin;
        pCtx.beginPath(); pCtx.ellipse(cx, cy - 55, 55, 40, 0, 0, Math.PI * 2); pCtx.fill();
        pCtx.fillStyle = 'rgba(0,0,0,0.1)';
        pCtx.beginPath(); pCtx.arc(cx, cy + 30, 20, 0, Math.PI * 2); pCtx.fill();
    } else if (c.style === 'simple_mustache') {
        pCtx.beginPath(); pCtx.arc(cx, cy - 40, 65, Math.PI, 0); pCtx.fill();
        pCtx.fillStyle = c.hair;
        pCtx.fillRect(cx - 20, cy + 20, 40, 8);
    } else if (c.style === 'long_goatee') {
        pCtx.beginPath(); pCtx.arc(cx, cy - 40, 65, Math.PI, 0); pCtx.fill();
        pCtx.fillStyle = c.hair;
        pCtx.beginPath(); pCtx.arc(cx, cy + 30, 10, 0, Math.PI * 2); pCtx.fill();
        pCtx.fillRect(cx - 5, cy + 28, 10, 25);
    } else if (c.style === 'forward_cap') {
        pCtx.fillStyle = '#000';
        pCtx.beginPath(); pCtx.arc(cx, cy - 50, 65, Math.PI, 0); pCtx.fill();
        pCtx.fillRect(cx - 70, cy - 50, 140, 15);
    } else if (c.style === 'cap_back') {
        pCtx.fillStyle = '#000';
        pCtx.beginPath(); pCtx.arc(cx, cy - 50, 65, Math.PI, 0); pCtx.fill();
        pCtx.fillRect(cx - 70, cy - 50, 140, 5);
        pCtx.fillStyle = c.hair;
        pCtx.fillRect(cx - 65, cy - 40, 10, 20);
        pCtx.fillRect(cx + 55, cy - 40, 10, 20);
    } else if (c.style === 'beanie_hoodie') {
        pCtx.fillStyle = '#00274c';
        pCtx.beginPath(); pCtx.arc(cx, cy - 55, 63, Math.PI, 0); pCtx.fill();
        pCtx.fillRect(cx - 65, cy - 55, 130, 20);
        pCtx.fillStyle = c.hair;
        pCtx.fillRect(cx - 65, cy - 35, 10, 20);
        pCtx.fillRect(cx + 55, cy - 35, 10, 20);
    } else {
        pCtx.beginPath(); pCtx.arc(cx, cy - 40, 65, Math.PI, 0); pCtx.fill();
    }

    if (c.isPlayer) {
        pCtx.fillStyle = c.suit || '#003366';
        pCtx.fillRect(cx - 50, 230, 100, 40);
    } else {
        pCtx.fillStyle = c.suit;
        pCtx.fillRect(cx - 50, 230, 100, 40);

        if (c.name === 'DENNIS') {
            pCtx.fillStyle = '#fff';
            pCtx.beginPath();
            pCtx.moveTo(cx, 220);
            pCtx.lineTo(cx - 30, 256);
            pCtx.lineTo(cx + 30, 256);
            pCtx.fill();
            pCtx.fillStyle = '#d00';
            pCtx.fillRect(cx - 4, 230, 8, 36);
        }

        if (c.name === 'MATT') {
            pCtx.fillStyle = '#fff';
            pCtx.beginPath();
            pCtx.moveTo(cx - 12, 230);
            pCtx.lineTo(cx, 245);
            pCtx.lineTo(cx + 12, 230);
            pCtx.fill();
            pCtx.fillStyle = '#cc0000';
            pCtx.beginPath();
            pCtx.moveTo(cx - 6, 230);
            pCtx.lineTo(cx + 6, 230);
            pCtx.lineTo(cx, 256);
            pCtx.fill();
        }

        if (c.name === 'BYRON') {
            pCtx.fillStyle = '#cc0000';
            pCtx.fillRect(cx - 50, 230, 10, 40);
            pCtx.fillRect(cx + 40, 230, 10, 40);
            pCtx.font = "10px sans-serif";
            pCtx.fillStyle = "white";
            pCtx.fillText("S", cx - 5, 250);
        }

        if (c.name === 'VINCE') {
            pCtx.font = "10px sans-serif";
            pCtx.fillStyle = "#ccc";
            pCtx.fillText("MATCO", cx - 20, 250);
        }
    }

    if (c.name === 'VAUGHN') {
        pCtx.fillStyle = '#FFCB05';
        pCtx.font = "bold 20px monospace";
        pCtx.fillText("M", cx - 8, 255);
        pCtx.strokeStyle = '#fff';
        pCtx.lineWidth = 2;
        pCtx.beginPath(); pCtx.moveTo(cx - 15, 230); pCtx.lineTo(cx - 15, 260); pCtx.stroke();
        pCtx.beginPath(); pCtx.moveTo(cx + 15, 230); pCtx.lineTo(cx + 15, 260); pCtx.stroke();
    }
}

function drawSprite(c, x, y, facingRight) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    if (!facingRight) ctx.scale(-1, 1);

    let w = c.config.w_mod || 35;
    let h = c.config.h_mod || 90;
    if (!c.config.h_mod && (c.config.body === 'huge' || c.config.body === 'fat')) {
        w = 55;
    }

    if (c.y < GROUND_Y) ctx.translate(0, -10);

    ctx.fillStyle = c.config.pants || '#111';
    if (c.action === 'WALK') {
        const legO = Math.sin(Date.now() / 100) * 10;
        ctx.fillRect(-w / 2 + legO, -30, 12, 30);
        ctx.fillRect(w / 2 - 12 - legO, -30, 12, 30);
    } else if (c.y < GROUND_Y) {
        ctx.fillRect(-w / 2, -40, 12, 25);
        ctx.fillRect(w / 2 - 12, -35, 12, 20);
    } else {
        ctx.fillRect(-w / 2, -30, w, 30);
    }

    ctx.fillStyle = c.config.suit;
    ctx.fillRect(-w / 2, -h, w, h - 30);

    if (c.config.name === 'MATT') {
        ctx.fillStyle = '#fff';
        ctx.fillRect(-3, -h + 1, 6, 4);
        ctx.fillStyle = '#cc0000';
        ctx.fillRect(-2, -h + 1, 4, 12);
    }

    if (c.config.name === 'VINCE') {
        ctx.fillStyle = '#ccc';
        ctx.fillRect(-8, -h + 15, 16, 4);
    }

    if (c.config.name === 'VAUGHN') {
        ctx.fillStyle = '#FFCB05';
        ctx.fillRect(-6, -h + 20, 12, 10);
    }

    ctx.fillStyle = c.config.skin;
    ctx.fillRect(-15, -h - 25, 30, 25);
    ctx.fillStyle = c.config.hair;

    if (c.config.style === 'long') {
        ctx.fillRect(-16, -h - 30, 32, 10);
        ctx.fillRect(-16, -h - 30, 10, 35);
    } else if (c.config.style === 'bald') {
        ctx.fillRect(-16, -h - 15, 4, 10);
    } else if (c.config.style === 'hat_beard' || c.config.style === 'eddy_style') {
        ctx.fillStyle = '#111';
        ctx.fillRect(-16, -h - 32, 32, 8);
    } else if (c.config.style === 'cap_back') {
        ctx.fillStyle = '#000';
        ctx.fillRect(-16, -h - 32, 32, 10);
        ctx.fillRect(-24, -h - 30, 10, 4);
    } else if (c.config.style === 'beard') {
    } else if (c.config.style === 'cap_beard') {
        ctx.fillStyle = '#000';
        ctx.fillRect(-16, -h - 35, 32, 10);
        ctx.fillRect(10, -h - 30, 12, 4);
        ctx.fillStyle = c.config.hair;
        ctx.fillRect(-12, -h - 10, 24, 10);
    } else if (c.config.style === 'mustache_cig') {
        ctx.fillRect(-16, -h - 30, 32, 10);
        ctx.fillStyle = c.config.hair;
        ctx.fillRect(-6, -h - 5, 12, 3);
        ctx.fillStyle = '#fff';
        ctx.fillRect(4, -h - 4, 8, 2);
        ctx.fillStyle = '#f50';
        ctx.fillRect(12, -h - 4, 2, 2);
    } else if (c.config.style === 'goatee') {
        ctx.fillRect(-16, -h - 30, 32, 10);
        ctx.fillStyle = c.config.hair;
        ctx.fillRect(-3, -h - 3, 6, 3);
    } else if (c.config.style === 'hat_mustache') {
        ctx.fillStyle = '#000';
        ctx.fillRect(-16, -h - 35, 32, 10);
        ctx.fillRect(10, -h - 30, 12, 4);
        ctx.fillStyle = c.config.hair;
        ctx.fillRect(-12, -h - 6, 24, 6);
    } else if (c.config.style === 'thinning_stubble') {
        ctx.fillStyle = c.config.hair;
        ctx.fillRect(-16, -h - 25, 4, 15);
        ctx.fillStyle = '#ccbbaa';
        ctx.fillRect(-10, -h - 10, 20, 5);
    } else if (c.config.style === 'simple_mustache') {
        ctx.fillRect(-16, -h - 30, 32, 10);
        ctx.fillStyle = c.config.hair;
        ctx.fillRect(-6, -h - 5, 12, 4);
    } else if (c.config.style === 'long_goatee') {
        ctx.fillRect(-16, -h - 15, 4, 10);
        ctx.fillStyle = c.config.hair;
        ctx.fillRect(-3, -h - 3, 6, 8);
    } else if (c.config.style === 'forward_cap') {
        ctx.fillStyle = '#000';
        ctx.fillRect(-16, -h - 35, 32, 10);
        ctx.fillRect(10, -h - 30, 12, 4);
    } else if (c.config.style === 'beanie_hoodie') {
        ctx.fillStyle = '#00274c';
        ctx.fillRect(-16, -h - 35, 32, 12);
    } else {
        ctx.fillRect(-16, -h - 30, 32, 10);
    }

    if (
        (c.config.style === 'short' || c.config.style === 'long' || c.config.style === 'spiky' || c.config.style === 'glasses' || c.config.style === 'mustache_cig' || c.config.style === 'goatee' || c.config.style === 'hat_mustache' || c.config.style === 'thinning_stubble' || c.config.style === 'simple_mustache' || c.config.style === 'long_goatee' || c.config.style === 'forward_cap' || c.config.style === 'cap_back' || c.config.style === 'beanie_hoodie') &&
        c.config.name !== 'JASON' &&
        c.config.name !== 'DENNIS' &&
        c.config.name !== 'CLINT' &&
        c.config.name !== 'MATT' &&
        c.config.name !== 'JB' &&
        !c.isPlayer
    ) {
        ctx.fillStyle = c.config.skin;
    }

    let armW = 20;
    if (c.action === 'BIG_WHACK' || c.action === 'POWER_SURGE' || c.action === 'FINISHER') {
        armW = 60;
    } else if (c.action === 'PUNCH') {
        armW = 40;
        if (c.config.tattoos) {
            ctx.fillStyle = '#556677';
        } else {
            ctx.fillStyle = c.config.skin;
        }
    }

    ctx.fillRect(0, -h + 20, armW, 8);

    const hasWeapon = (c.config.weapon && !c.isPlayer) || (c.isPlayer && c.hasWeapon);
    if (hasWeapon) {
        if (c.config.weapon === 'breaker_bar') {
            ctx.fillStyle = '#ccc';
            let wx = 5, wy = -h + 30, wRot = -0.5;
            if (c.action === 'PUNCH') {
                wx = armW;
                wy = -h + 16;
                wRot = 0;
            }

            ctx.save();
            ctx.translate(wx, wy);
            ctx.rotate(wRot);
            ctx.fillRect(0, 0, 50, 5);
            ctx.fillStyle = '#888';
            ctx.fillRect(45, -2, 8, 8);
            ctx.restore();
        } else if (c.config.weapon === 'giant_breaker_bar') {
            ctx.fillStyle = '#bbb';
            let wx = 5, wy = -h + 30, wRot = -0.5;
            if (c.action === 'PUNCH') {
                wx = armW;
                wy = -h + 16;
                wRot = 0;
            }

            ctx.save();
            ctx.translate(wx, wy);
            ctx.rotate(wRot);
            ctx.fillRect(0, 0, 75, 7);
            ctx.fillStyle = '#666';
            ctx.fillRect(70, -3, 12, 12);
            ctx.restore();
        } else if (c.config.weapon === 'ratchet' || c.config.weapon === 'matco_ratchet' || c.config.weapon === 'alex_ratchet') {
            let wx = 5, wy = -h + 30, wRot = -0.5;
            if (c.action === 'PUNCH') {
                wx = armW;
                wy = -h + 16;
                wRot = 0;
            }

            ctx.save();
            ctx.translate(wx, wy);
            ctx.rotate(wRot);

            if (c.config.weapon === 'matco_ratchet') {
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(0, -1, 15, 6);
                ctx.fillStyle = '#ccc';
                ctx.fillRect(15, 0, 45, 4);
                ctx.fillStyle = '#999';
                ctx.fillRect(60, -2, 8, 8);
            } else if (c.config.weapon === 'alex_ratchet') {
                ctx.fillStyle = '#d00';
                ctx.fillRect(0, -1, 12, 5);
                ctx.fillStyle = '#111';
                ctx.fillRect(10, -1, 2, 5);
                ctx.fillStyle = '#ccc';
                ctx.fillRect(12, 0, 20, 3);
                ctx.fillStyle = '#888';
                ctx.fillRect(32, -2, 6, 6);
            } else {
                ctx.fillStyle = '#d00';
                ctx.fillRect(0, -1, 15, 6);
                ctx.fillStyle = '#111';
                ctx.fillRect(12, -1, 3, 6);
                ctx.fillStyle = '#ccc';
                ctx.fillRect(15, 0, 25, 4);
                ctx.fillStyle = '#999';
                ctx.fillRect(40, -2, 8, 8);
            }

            ctx.restore();
        } else {
            ctx.fillStyle = '#bbb';
            let wx = 5, wy = -h + 30, wRot = -0.5;
            if (c.action === 'PUNCH') {
                wx = armW;
                wy = -h + 16;
                wRot = 0;
            }

            ctx.save();
            ctx.translate(wx, wy);
            ctx.rotate(wRot);

            if (c.config.id === 'jody') {
                ctx.fillRect(0, 0, 60, 6);
                ctx.fillRect(50, -2, 12, 10);
            } else {
                ctx.fillRect(0, 0, 30, 6);
                ctx.fillRect(25, -2, 10, 10);
            }

            ctx.restore();
        }
    }

    if (c.action === 'KICK') {
        ctx.fillStyle = '#000';
        ctx.fillRect(20, -40, 30, 15);
    }

    if (c.action === 'RHINO_CHARGE') {
        ctx.fillStyle = c.config.suit || '#0033aa';
        ctx.fillRect(-w / 2 - 8, -h - 18, w + 16, 14);
    }

    if (c.action === 'RAVENOUS_BITE') {
        ctx.fillStyle = '#fff';
        ctx.fillRect(armW + 8, -h + 8, 10, 8);
        ctx.fillStyle = '#c00';
        ctx.fillRect(armW + 10, -h + 14, 6, 4);
    }

    if (c.action === 'SPIDER_MONKEY') {
        ctx.strokeStyle = c.config.suit || '#0033aa';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(25, -h + 10, 28, 0, Math.PI * 2);
        ctx.stroke();
    }

    if (c.action === 'RATCHET_TORNADO') {
        ctx.save();
        ctx.translate(10, -h + 35);
        ctx.rotate(Date.now() / 40);
        ctx.fillStyle = '#ccc';
        ctx.fillRect(-25, -3, 50, 6);
        ctx.restore();
    }

    if (c.action === 'FINISHER') {
        ctx.fillStyle = '#fc0';
        ctx.globalAlpha = 0.55;
        ctx.fillRect(-w / 2 - 10, -h - 30, w + 20, h + 8);
        ctx.globalAlpha = 1;
    }

    if (c.action === 'INVINCIBILITY_STAR' || c.invincibleTimer > 0) {
        const hue = (Date.now() / 15) % 360;
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = `hsl(${hue}, 100%, 55%)`;
        ctx.fillRect(-w / 2 - 8, -h - 28, w + 16, h + 10);
        ctx.globalAlpha = 1;
    }

    if (c.burnTimer > 0) {
        ctx.fillStyle = `rgba(255,${80 + Math.random() * 80 | 0},0,0.7)`;
        ctx.fillRect(-8, -h - 5, 16, 20);
    }

    if (c.slowTimer > 0) {
        ctx.fillStyle = 'rgba(100,180,255,0.35)';
        ctx.fillRect(-w / 2, -h, w, h);
    }

    ctx.restore();
}

function drawBackground() {
    ctx.fillStyle = '#ddd';
    ctx.fillRect(0, 0, GAME_W, GROUND_Y);

    ctx.fillStyle = '#999';
    ctx.fillRect(0, GROUND_Y, GAME_W, GAME_H - GROUND_Y);

    ctx.fillStyle = '#888';
    ctx.beginPath(); ctx.ellipse(200, 320, 40, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(500, 340, 50, 15, 0, 0, Math.PI * 2); ctx.fill();

    const winY = 50;
    const winH = 160;
    ctx.fillStyle = '#cceeff';
    ctx.fillRect(250, winY, 200, winH);
    ctx.strokeStyle = '#88a';
    ctx.lineWidth = 4;
    ctx.strokeRect(250, winY, 200, winH);

    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(350, 150, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(330, 170, 40, 30);

    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(345, 145, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(355, 145, 5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(345, 145, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(355, 145, 2, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#cc0000';
    ctx.fillRect(20, 180, 80, 120);
    ctx.fillRect(580, 180, 80, 120);

    ctx.fillStyle = '#000';
    for (let y = 190; y < 300; y += 20) {
        ctx.fillRect(25, y, 70, 2);
        ctx.fillRect(585, y, 70, 2);
    }

    ctx.fillStyle = '#0033aa';
    ctx.fillRect(120, 80, 30, 220);
    ctx.fillRect(510, 80, 30, 220);

    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(150, 250, 60, 10);
    ctx.fillRect(450, 250, 60, 10);
}

class Fighter {
    constructor(isPlayer, config) {
        this.isPlayer = isPlayer;
        this.config = config;
        this.x = isPlayer ? 150 : 450;
        this.y = GROUND_Y;
        this.vx = 0;
        this.vy = 0;
        this.maxHp = isPlayer
            ? PLAYER_HP_BASE + Math.floor(config.dur * PLAYER_HP_PER_DUR)
            : config.hp;
        this.hp = this.maxHp;
        this.action = 'IDLE';
        this.timer = 0;
        this.hasHit = false;
        this.isJumping = false;
        this.speedBuff = false;
        this.specialCooldown = 0;
        this.specialHit = false;
        this.specialMoveId = null;
        this.invincibleTimer = 0;
        this.burnTimer = 0;
        this.burnTick = 0;
        this.slowTimer = 0;
        this.docileTimer = 0;
        this.hasWeapon = (
            config.weapon === 'wrench' ||
            config.weapon === 'breaker_bar' ||
            config.weapon === 'giant_breaker_bar' ||
            config.weapon === 'ratchet' ||
            config.weapon === 'matco_ratchet' ||
            config.weapon === 'alex_ratchet'
        );
    }

    update() {
        if (this.y < GROUND_Y) {
            this.vy += 0.8;
            this.isJumping = true;
        } else {
            this.vy = 0;
            this.y = GROUND_Y;
            this.isJumping = false;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 20) this.x = 20;
        if (this.x > GAME_W - 20) this.x = GAME_W - 20;

        if (this.specialCooldown > 0) this.specialCooldown--;

        if (this.timer > 0) {
            this.timer--;
            if (this.timer <= 0 && !isInSpecial(this) && this.action !== 'FINISHER') {
                this.action = 'IDLE';
                this.vx = 0;
            }
        }

        updateStatusEffects(this);
    }

    canAct() {
        return this.action !== 'HURT' && !isInSpecial(this) && this.action !== 'FINISHER';
    }

    canUseSpecial() {
        return (
            this.isPlayer &&
            this.specialCooldown <= 0 &&
            (this.action === 'IDLE' || this.action === 'WALK') &&
            this.action !== 'HURT'
        );
    }

    jump() {
        if (!this.isJumping) {
            this.vy = this.config.jump_power || -13;
            this.y -= 5;
        }
    }
}

function toSelect() {
    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('select-screen').style.display = 'flex';

    const grid = document.getElementById('char-grid');
    grid.innerHTML = '';

    TECHS.forEach((tech, i) => {
        const btn = document.createElement('div');
        btn.className = 'char-btn';

        const dispDur = Math.min(100, tech.dur * 10);
        const dispStr = Math.min(100, tech.str * 10);
        const dispSpd = Math.min(100, tech.spd * 10);

        btn.innerHTML = `
            <div class="char-header">${tech.name}</div>
            <div class="char-desc">${tech.desc}</div>
            <div class="stat-row"><div class="stat-label">STR</div><div class="stat-track"><div class="stat-val" style="width:${dispStr}%"></div></div></div>
            <div class="stat-row"><div class="stat-label">SPD</div><div class="stat-track"><div class="stat-val" style="width:${dispSpd}%"></div></div></div>
            <div class="stat-row"><div class="stat-label">DUR</div><div class="stat-track"><div class="stat-val" style="width:${dispDur}%"></div></div></div>
        `;

        btn.onclick = () => {
            selectedTech = TECHS[i];
            startStoryMode();
        };

        grid.appendChild(btn);
    });

    Music.start();
}

function startStoryMode() {
    document.getElementById('select-screen').style.display = 'none';
    state = 'STORY';
    storyIndex = 0;
    showStoryScene();
    Music.stop();
}

function showStoryScene() {
    if (storyIndex >= STORY_SCENES.length) {
        startGame();
        return;
    }

    const scene = STORY_SCENES[storyIndex];
    const screen = document.getElementById('cutscene-screen');
    const portraitBox = document.getElementById('cs-portrait');

    screen.style.display = 'flex';
    document.getElementById('ui-layer').style.display = 'none';
    document.getElementById('cs-header').innerText = "PROLOGUE";
    document.getElementById('cs-name').innerText = scene.speaker;
    document.getElementById('dialogue-box').innerText = scene.text;

    if (scene.speaker !== 'NARRATOR') {
        portraitBox.style.display = 'flex';
        const char = TECHS.find(t => t.name === scene.speaker) || ROSTER.find(r => r.name === scene.speaker);
        if (char) {
            pCtx.fillStyle = '#222';
            pCtx.fillRect(0, 0, 256, 256);
            drawPortrait({
                ...char,
                isPlayer: ['CHANDLER', 'ALEX', 'KADEN', 'EDDY', 'ISAIAH', 'CHRISTIAN', 'JOE', 'DANNY', 'ROB', 'ALBERTO', 'CHRIS', 'JODY', 'MARSHALL', 'VINCE', 'VAUGHN'].includes(scene.speaker)
            });
            document.getElementById('cs-img').src = portraitCanvas.toDataURL();
        }
    } else {
        portraitBox.style.display = 'none';
    }
}

function startGame() {
    level = 0;
    finisherMeter = 0;
    startLevel();
}

function startLevel() {
    if (level >= ROSTER.length) {
        document.getElementById('go-msg').innerText = "CONGRATS! YOU RUN THE SERVICE DRIVE!";
        document.getElementById('go-msg').style.color = "#FFD700";
        document.getElementById('go-msg').style.fontSize = "16px";
        document.getElementById('game-over-screen').style.display = 'flex';
        return;
    }

    const data = ROSTER[level];
    projectiles = [];
    specialBannerTimer = 0;
    p1 = new Fighter(true, selectedTech);
    document.getElementById('p1-name').innerText = selectedTech.name;
    p2 = new Fighter(false, data);

    drawPortrait(data);
    document.getElementById('cs-img').src = portraitCanvas.toDataURL();
    document.getElementById('cs-portrait').style.display = 'flex';

    state = 'CUTSCENE';
    document.getElementById('cs-header').innerText = "NEXT TICKET";
    document.getElementById('cutscene-screen').style.display = 'flex';
    document.getElementById('ui-layer').style.display = 'none';
    document.getElementById('cs-name').innerText = data.name;
    document.getElementById('dialogue-box').innerText = data.text;
}

function nextText() {
    Sound.beep();

    if (state === 'STORY') {
        storyIndex++;
        showStoryScene();
    } else {
        document.getElementById('cutscene-screen').style.display = 'none';
        document.getElementById('ui-layer').style.display = 'block';
        document.getElementById('p2-name').innerText = ROSTER[level].name;
        updateHUD();
        state = 'FIGHT';
        gameLoop();
    }
}

function resetGame() {
    document.getElementById('game-over-screen').style.display = 'none';
    document.getElementById('title-screen').style.display = 'flex';
    state = 'MENU';
    finisherMeter = 0;
    updateHUD();
    Music.start();
}

function togglePause() {
    if (state === 'FIGHT') {
        state = 'PAUSED';
        document.getElementById('pause-screen').style.display = 'flex';
    } else if (state === 'PAUSED') {
        state = 'FIGHT';
        document.getElementById('pause-screen').style.display = 'none';
        gameLoop();
    }
}

function quitToTitle() {
    state = 'MENU';
    document.getElementById('pause-screen').style.display = 'none';
    document.getElementById('title-screen').style.display = 'flex';
    document.getElementById('ui-layer').style.display = 'none';
    finisherMeter = 0;
    updateHUD();
    Music.start();
}

function gameLoop() {
    if (state === 'FIGHT' || state === 'WAIT') {
        updatePhysics();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

function updatePhysics() {
    if (p1.action === 'FINISHER') {
        updateFinisher(p1, p2);
    } else if (!isInSpecial(p1) && p1.action !== 'HURT') {
        p1.vx = 0;
        let speed = 1 + (p1.config.spd * 0.5);
        if (p1.speedBuff) speed *= 2.0;

        if (p1.action === 'IDLE' || p1.action === 'WALK' || p1.action === 'BLOCK') {
            if (KEYS.a) {
                p1.vx = -speed;
                p1.action = 'WALK';
            } else if (KEYS.d) {
                p1.vx = speed;
                p1.action = 'WALK';
            } else if (p1.action !== 'BLOCK') {
                p1.action = 'IDLE';
            }

            if ((KEYS.w || KEYS.arrowup) && !p1.isJumping) {
                p1.jump();
            }

            if (KEYS.j) {
                p1.action = 'PUNCH';
                p1.timer = 20;
                p1.hasHit = false;
                Sound.punch();
            }

            if (KEYS.k) {
                p1.action = 'KICK';
                p1.timer = 30;
                p1.hasHit = false;
                Sound.kick();
            }

            if (KEYS.l) {
                p1.action = 'BLOCK';
            } else if (p1.action === 'BLOCK' && !KEYS.l) {
                p1.action = 'IDLE';
            }

            if (KEYS.i && p1.canUseSpecial()) {
                startSpecial(p1, p2);
            }

            if (KEYS.u && canUseFinisher(p1)) {
                startFinisher(p1);
            }
        }
    }

    if (p2.action !== 'HURT' && !isInSpecial(p2)) {
        const dist = Math.abs(p1.x - p2.x);
        if (p2.action === 'IDLE' || p2.action === 'WALK') {
            let aiSpeed = 1 + (p2.config.spd * 0.5);
            if (p2.slowTimer > 0) aiSpeed *= 0.45;

            if (dist > 60) {
                p2.vx = (p1.x > p2.x ? 1 : -1) * aiSpeed;
                p2.action = 'WALK';
            } else {
                p2.vx = 0;
                p2.action = 'IDLE';

                let aggro = p2.config.aggro || 8.0;
                if (p2.docileTimer > 0) aggro *= 0.25;

                if (Math.random() < 0.06 * aggro) {
                    p2.action = 'PUNCH';
                    p2.timer = 20;
                    p2.hasHit = false;
                    Sound.punch();
                } else if (Math.random() < 0.04 * aggro) {
                    p2.action = 'KICK';
                    p2.timer = 30;
                    p2.hasHit = false;
                    Sound.kick();
                }
            }
        }
    }

    p1.update();
    p2.update();

    if (isInSpecial(p1)) updateSpecialMove(p1, p2);

    updateProjectiles();

    checkCollision(p1, p2);
    checkCollision(p2, p1);

    if (p2.hp <= 0 && state === 'FIGHT') {
        state = 'WAIT';
        level++;
        setTimeout(startLevel, 2000);
    }

    if (p1.hp <= 0 && state === 'FIGHT') {
        state = 'OVER';
        document.getElementById('game-over-screen').style.display = 'flex';
    }
}

function checkCollision(att, def) {
    if (def.invincibleTimer > 0) return;

    if ((att.action === 'PUNCH' || att.action === 'KICK') && !att.hasHit) {
        if (att.timer < 25 && att.timer > 5) {
            const dist = Math.abs(att.x - def.x);
            const yDist = Math.abs(att.y - def.y);

            let hitRange = 70;
            if (att.config.id === 'jody' && att.action === 'PUNCH') hitRange = 95;

            if (dist < hitRange && yDist < 80) {
                att.hasHit = true;
                Sound.hit();

                let baseDmg = 6;
                if (att.action === 'KICK') {
                    if (!att.hasWeapon) baseDmg = 16;
                    else baseDmg = 10;
                }

                if (att.isPlayer) {
                    baseDmg += (att.config.str * 2.5);
                } else {
                    baseDmg += (att.config.pwr * 6);
                }

                if ((att.config.weapon === 'wrench' || att.hasWeapon) && att.action === 'PUNCH') baseDmg *= 1.5;
                if (att.config.weapon === 'giant_breaker_bar' && att.action === 'PUNCH') baseDmg *= 2.0;

                if (def.action === 'BLOCK') {
                    baseDmg *= 0.1;
                } else {
                    def.action = 'HURT';
                    def.timer = 15;
                    shake = 5;
                    def.vx = (att.x < def.x ? 5 : -5);
                }

                const hpBefore = def.hp;
                def.hp -= baseDmg;
                if (att.isPlayer) gainFinisherMeter(Math.max(0, hpBefore - def.hp), def.maxHp);
                updateHUD();
            }
        }
    }
}

function updateHUD() {
    const hp1El = document.getElementById('hp1');
    const hp2El = document.getElementById('hp2');
    const finEl = document.getElementById('finisher-fill');
    const finBar = document.getElementById('finisher-bar');

    if (p1 && hp1El) {
        const p1p = Math.max(0, p1.hp / p1.maxHp * 100);
        hp1El.style.width = p1p + '%';
    }
    if (p2 && hp2El) {
        const p2p = Math.max(0, p2.hp / p2.maxHp * 100);
        hp2El.style.width = p2p + '%';
    }
    if (finEl) {
        finEl.style.width = Math.min(100, finisherMeter) + '%';
    }
    if (finBar) {
        finBar.classList.toggle('ready', finisherMeter >= FINISHER_METER_MAX);
    }
}

function draw() {
    drawBackground();

    ctx.save();
    if (shake > 0) {
        ctx.translate(Math.random() * shake - shake / 2, Math.random() * shake - shake / 2);
        shake *= 0.9;
        if (shake < 0.5) shake = 0;
    }

    const p1Face = p1.x < p2.x;
    drawSprite(p1, p1.x, p1.y, p1Face);
    drawSprite(p2, p2.x, p2.y, !p1Face);
    drawProjectiles();
    drawSpecialBanner();
    ctx.restore();
}

window.addEventListener('keydown', e => {
    if (e.code === 'Space') nextText();
    if (e.key === 'ArrowUp') KEYS.arrowup = true;

    if (e.key.toLowerCase() === 'p' || e.key === 'Escape') togglePause();

    KEYS[e.key.toLowerCase()] = true;

    if (e.key.toLowerCase() === 'j') Sound.punch();
    if (e.key.toLowerCase() === 'k') Sound.kick();
    if (e.key.toLowerCase() === 'i') Sound.playTone(220, 'square', 0.12, 0.03);
    if (e.key.toLowerCase() === 'u') Sound.playTone(90, 'triangle', 0.2, 0.04);
});

window.addEventListener('keyup', e => {
    if (e.key === 'ArrowUp') KEYS.arrowup = false;
    KEYS[e.key.toLowerCase()] = false;
});

const touchBind = (id, k) => {
    const el = document.getElementById(id);
    el.addEventListener('touchstart', e => {
        e.preventDefault();
        KEYS[k] = true;
        if (k === 'j') Sound.punch();
        if (k === 'k') Sound.kick();
        if (k === 'i') Sound.playTone(220, 'square', 0.12, 0.03);
        if (k === 'u') Sound.playTone(90, 'triangle', 0.2, 0.04);
    });
    el.addEventListener('touchend', e => {
        e.preventDefault();
        KEYS[k] = false;
    });
};

touchBind('btn-left', 'a');
touchBind('btn-right', 'd');
touchBind('btn-up', 'w');
touchBind('btn-down', 'l');
touchBind('btn-a', 'j');
touchBind('btn-b', 'k');
touchBind('btn-start', 'i');
touchBind('btn-finisher', 'u');

window.toSelect = toSelect;
window.nextText = nextText;
window.resetGame = resetGame;
window.togglePause = togglePause;
window.quitToTitle = quitToTitle;
