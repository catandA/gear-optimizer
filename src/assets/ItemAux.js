export class Item {
    constructor(id, name, slot, zone, level, props) {
        this.id = id;
        this.name = name;
        this.slot = slot;
        this.zone = zone;
        this.level = level;
        this.statnames = []
        this.base = {}
        this.disable = false;
        for (let i = 0; i < props.length; i++) {
            this.statnames.push(props[i][0]);
            this[props[i][0]] = props[i][1] * (1 + level / 100);
            this.base[props[i][0]] = props[i][1];
        }
    }
}

export function update_level(item, level) {
    for (let stat in item.base) {
        item[stat] = item.base[stat] * (1 + level / 100);
    }
    item.level = level;
}

/**
 * @return {string}
 */
export function EmptySlotName(slotname) {
    const slotNames = {
        'weapon': '武器',
        'head': '头部',
        'armor': '护甲',
        'pants': '裤子',
        'boots': '靴子',
        'accessory': '饰品',
        'other': '其他'
    };
    return '空' + (slotNames[slotname] || slotname[0].toUpperCase() + slotname.substring(1)) + '槽位';
}

/**
 * @return {number}
 */
export function EmptySlotId(slotname) {
    if (slotname === 'weapon') {
        return 10000 + 0;
    }
    if (slotname === 'head') {
        return 10000 + 1;
    }
    if (slotname === 'armor') {
        return 10000 + 2;
    }
    if (slotname === 'pants') {
        return 10000 + 3;
    }
    if (slotname === 'boots') {
        return 10000 + 4;
    }
    if (slotname === 'accessory') {
        return 10000 + 5;
    }
    if (slotname === 'other') {
        return 10000 + 6;
    }
    return 10000 - 1
}

export class EmptySlot extends Item {
    constructor(slot) {
        if (slot === undefined) {
            super('', 'Empty Slot', slot, SetName.SAFE, 100, []);
        } else {
            super(EmptySlotId(slot[0]), EmptySlotName(slot[0]), slot, SetName.SAFE, 100, []);
        }
        this.empty = true;
    }
}

export class Equip extends Item {
    constructor() {
        super(100000, 'total', undefined, undefined, 100, []);
        this.items = [];
        this.counts = {};
        Object.getOwnPropertyNames(Slot).map((x) => {
            this.counts[Slot[x][0]] = 0;
            return undefined;
        });
        Object.getOwnPropertyNames(Stat).map((x) => {
            this[Stat[x]] = 100;
            this.statnames.push(Stat[x]);
            return undefined;
        });
        // correct POWER, TOUGHNESS and RESPAWN since these are additive from 0 instead of 100%
        this[Stat.POWER] = 0;
        this[Stat.TOUGHNESS] = 0;
        this[Stat.RESPAWN] = 0;
    }
}

export class ItemContainer {
    constructor(items) {
        this.names = [];
        for (let i = 0; i < items.length; i++) {
            this.names.push(items[i][0]);
            this[items[i][0]] = items[i][1];
        }
    }
}

export const ItemNameContainer = (accslots, offhand) => {
    let container = {};
    const slotlist = Object.getOwnPropertyNames(Slot);
    for (let idx in slotlist) {
        const slot = slotlist[idx];
        const slotname = Slot[slot][0];
        let list = [];
        if (slot === 'ACCESSORY') {
            for (let jdx = 0; jdx < accslots; jdx++) {
                list.push(new EmptySlot(Slot[slot]).id);
            }
        } else if (slot === 'OTHER') {
            list.push(1000);
            list.push(1001);
        } else {
            list.push(new EmptySlot(Slot[slot]).id);
            if (slot === 'WEAPON' && offhand > 0) {
                list.push(new EmptySlot(Slot[slot]).id);
            }
        }
        container[slotname] = list;
    }
    return container;
};

export const Slot = {
    WEAPON: [
        'weapon', 0
    ],
    HEAD: [
        'head', 1
    ],
    CHEST: [
        'armor', 2
    ],
    PANTS: [
        'pants', 3
    ],
    BOOTS: [
        'boots', 4
    ],
    ACCESSORY: [
        'accessory', 5
    ],
    OTHER: [
        'other', 6
    ]
}

export const Stat = {
    // adventure
    POWER: '力量',
    TOUGHNESS: '韧性',
    MOVE_COOLDOWN: '技能冷却时间',
    RESPAWN: '敌人生成时间',
    DAYCARE_SPEED: '日托速度',
    // Drop
    GOLD_DROP: '黄金掉落',
    DROP_CHANCE: '掉率',
    QUEST_DROP: '任务掉落',
    // Ygg
    SEED_DROP: '种子获取数量',
    YGGDRASIL_YIELD: '世界树产量',
    // E
    ENERGY_BARS: '能量条',
    ENERGY_CAP: '能量上限',
    ENERGY_POWER: '能量强度',
    ENERGY_SPEED: '能量速度',
    // M
    MAGIC_BARS: '魔力条',
    MAGIC_CAP: '魔力上限',
    MAGIC_POWER: '魔力强度',
    MAGIC_SPEED: '魔力速度',
    // R
    RES3_BARS: '资源3条',
    RES3_CAP: '资源3上限',
    RES3_POWER: '资源3强度',
    // raw speed
    AT_SPEED: '高级训练速度',
    AUGMENT_SPEED: '挂件速度',
    BEARD_SPEED: '胡子速度',
    HACK_SPEED: '黑客速度',
    NGU_SPEED: 'NGU速度',
    WANDOOS_SPEED: 'Wandoos速度',
    WISH_SPEED: '许愿速度',
    // junk
    AP: '任意点',
    EXPERIENCE: '经验',
    COOKING: '烹饪'
}

let single_factors = {
    NONE: [
        '无', []
    ],
    DELETE: [
        '删除优先级', []
    ],
    INSERT: [
        '插入优先级', []
    ],
    POWER: [
        '力量',
        [Stat.POWER]
    ],
    TOUGHNESS: [
        '韧性',
        [Stat.TOUGHNESS]
    ],
    MOVE_COOLDOWN: [
        '技能冷却时间',
        [Stat.MOVE_COOLDOWN]
    ],
    RESPAWN: [
        '敌人生成时间',
        [Stat.RESPAWN]
    ],
    DAYCARE_SPEED: [
        '日托速度',
        [Stat.DAYCARE_SPEED]
    ],
    GOLD_DROP: [
        '黄金掉落',
        [Stat.GOLD_DROP]
    ],
    DROP_CHANCE: [
        '掉率',
        [Stat.DROP_CHANCE]
    ],
    QUEST_DROP: [
        '任务掉落',
        [Stat.QUEST_DROP]
    ]
}

let remaining_factors = {};

Object.keys(Stat).forEach(key => {
    if (single_factors[key] === undefined) {
        remaining_factors[key] = [
            Stat[key],
            [Stat[key]]
        ];
    }
});

export const multiple_factors = {
    ENGU: [
        '能量NGU',
        [
            Stat.ENERGY_CAP, Stat.ENERGY_POWER, Stat.NGU_SPEED
        ]
    ],
    MNGU: [
        '魔力NGU',
        [
            Stat.MAGIC_CAP, Stat.MAGIC_POWER, Stat.NGU_SPEED
        ]
    ],
    NGUS: [
        'NGUs',
        [
            Stat.ENERGY_CAP, Stat.ENERGY_POWER, Stat.MAGIC_CAP, Stat.MAGIC_POWER, Stat.NGU_SPEED
        ],
        [
            1 / 2,
            1 / 2,
            1 / 2,
            1 / 2,
            1
        ]
    ],
    HACK: [
        '黑客',
        [
            Stat.RES3_CAP, Stat.RES3_POWER, Stat.HACK_SPEED
        ]
    ],
    WISHES: [
        '许愿',
        [
            Stat.ENERGY_CAP,
            Stat.ENERGY_POWER,
            Stat.MAGIC_CAP,
            Stat.MAGIC_POWER,
            Stat.RES3_CAP,
            Stat.RES3_POWER,
            Stat.WISH_SPEED
        ],
        [
            0.17,
            0.17,
            0.17,
            0.17,
            0.17,
            0.17,
            1
        ]
    ],
    NGUSHACK: [
        'NGU和黑客',
        [
            Stat.ENERGY_CAP,
            Stat.ENERGY_POWER,
            Stat.MAGIC_CAP,
            Stat.MAGIC_POWER,
            Stat.NGU_SPEED,
            Stat.RES3_CAP,
            Stat.RES3_POWER,
            Stat.HACK_SPEED
        ],
        [
            1 / 3,
            1 / 3,
            1 / 3,
            1 / 3,
            2 / 3,
            1 / 3,
            1 / 3,
            1 / 3
        ]
    ],
    NGUWISH: [
        'NGU和许愿',
        [
            Stat.ENERGY_CAP,
            Stat.ENERGY_POWER,
            Stat.MAGIC_CAP,
            Stat.MAGIC_POWER,
            Stat.NGU_SPEED,
            Stat.RES3_CAP,
            Stat.RES3_POWER,
            Stat.WISH_SPEED
        ],
        [
            1.17 / 3,
            1.17 / 3,
            1.17 / 3,
            1.17 / 3,
            2 / 3,
            0.17 / 3,
            0.17 / 3,
            1 / 3
        ]
    ],
    WISHHACK: [
        '许愿和黑客',
        [
            Stat.ENERGY_CAP,
            Stat.ENERGY_POWER,
            Stat.MAGIC_CAP,
            Stat.MAGIC_POWER,
            Stat.RES3_CAP,
            Stat.RES3_POWER,
            Stat.HACK_SPEED,
            Stat.WISH_SPEED
        ],
        [
            0.17 / 2,
            0.17 / 2,
            0.17 / 2,
            0.17 / 2,
            1.17 / 2,
            1.17 / 2,
            1 / 2,
            1 / 2
        ]
    ],
    ETIMEMACHINE: [
        '能量时间机器',
        [
            Stat.ENERGY_CAP, Stat.ENERGY_POWER
        ]
    ],
    MTIMEMACHINE: [
        '魔力时间机器',
        [
            Stat.MAGIC_CAP, Stat.MAGIC_POWER
        ]
    ],
    TIMEMACHINE: [
        '时间机器',
        [
            Stat.ENERGY_CAP, Stat.ENERGY_POWER, Stat.MAGIC_CAP, Stat.MAGIC_POWER
        ],
        [
            1 / 2,
            1 / 2,
            1 / 2,
            1 / 2
        ]
    ],
    BLOOD: [
        'Blood Rituals',
        [
            Stat.MAGIC_CAP, Stat.MAGIC_POWER
        ]
    ],
    EWANDOOS: [
        '能量Wandoos',
        [
            Stat.ENERGY_CAP, Stat.WANDOOS_SPEED
        ]
    ],
    MWANDOOS: [
        '魔力Wandoos',
        [
            Stat.MAGIC_CAP, Stat.WANDOOS_SPEED
        ]
    ],
    WANDOOS: [
        'Wandoos',
        [
            Stat.ENERGY_CAP, Stat.WANDOOS_SPEED, Stat.MAGIC_CAP, Stat.WANDOOS_SPEED
        ],
        [
            1 / 2,
            1 / 2,
            1 / 2,
            1 / 2
        ]
    ],
    AUGMENTATION: [
        '挂件',
        [
            Stat.ENERGY_CAP, Stat.ENERGY_POWER, Stat.AUGMENT_SPEED
        ]
    ],
    AT: [
        '高级训练',
        [
            Stat.ENERGY_POWER, Stat.ENERGY_CAP, Stat.AT_SPEED
        ],
        [
            1 / 2,
            1,
            1
        ]
    ],
    EBEARD: [
        '能量胡子',
        [
            Stat.ENERGY_POWER, Stat.ENERGY_BARS, Stat.BEARD_SPEED
        ],
        [
            1 / 2,
            1,
            1
        ]
    ],
    MBEARD: [
        '魔力胡子',
        [
            Stat.MAGIC_POWER, Stat.MAGIC_BARS, Stat.BEARD_SPEED
        ],
        [
            1 / 2,
            1,
            1
        ]
    ],
    BEARD: [
        '胡子',
        [
            Stat.ENERGY_POWER, Stat.ENERGY_BARS, Stat.MAGIC_POWER, Stat.MAGIC_BARS, Stat.BEARD_SPEED
        ],
        [
            1 / 4,
            1 / 2,
            1 / 4,
            1 / 2,
            1
        ]
    ],
    ECAPSPEED: [
        '能量上限速度',
        [
            Stat.ENERGY_CAP, Stat.ENERGY_BARS
        ],
        [
            -1, 1
        ]
    ],
    MCAPSPEED: [
        '魔力上限速度',
        [
            Stat.MAGIC_CAP, Stat.MAGIC_BARS
        ],
        [
            -1, 1
        ]
    ],
    XCAPSPEED: [
        '资源3上限速度',
        [
            Stat.RES3_CAP, Stat.RES3_BARS
        ],
        [
            -1, 1
        ]
    ],
    EMPC: [
        'EMPC',
        [
            Stat.ENERGY_POWER, Stat.ENERGY_CAP, Stat.MAGIC_POWER, Stat.MAGIC_CAP
        ]
    ]
}

function extend(obj, src) {
    Object.keys(src).forEach(function (key) {
        obj[key] = src[key];
    });
    return obj;
}

export const Factors = extend(extend(single_factors, multiple_factors), remaining_factors);

export const SetName = {
    MISC: [
        '杂项', -4
    ],
    HEART: [
        '我的心 <3', -3
    ],
    FOREST_PENDANT: [
        '森林吊坠', -2
    ],
    LOOTY: [
        '战利品者', -1
    ],
    ITOPOD: [
        '无尽之怒塔', 0
    ],
    SAFE: [
        '安全区', 1
    ],
    TRAINING: [
        '教程区域', 2
    ],
    SEWERS: [
        '下水道', 3
    ],
    FOREST: [
        '森林', 4
    ],
    CAVE: [
        '杂物洞穴', 5
    ],
    SKY: [
        '高空', 6
    ],
    HSB: [
        '高度安全基地', 7
    ],
    GRB: [
        '戈登·拉姆齐·波顿', 8
    ],
    CLOCK: [
        '时之维度', 9
    ],
    GCT: [
        '大腐化树', 10
    ],
    TWO_D: [
        '二次元宇宙', 11
    ],
    SPOOPY: [
        '远古战场', 12
    ],
    JAKE: [
        '会计詹克', 13
    ],
    GAUDY: [
        '奇怪的地方', 14
    ],
    MEGA: [
        'Mega 大陆', 15
    ],
    UUG_RINGS: [
        'UUG, 不可名状者', 16
    ],
    BEARDVERSE: [
        '胡子宇宙', 17
    ],
    WANDERER: [
        '沃尔德', 18
    ],
    WANDERER2: [
        '沃尔德', 18
    ],
    BADLY_DRAWN: [
        '涂鸦世界', 19
    ],
    STEALTH: [
        '无聊至极的地球', 20
    ],
    SLIMY: [
        '虫兽', 21, 1
    ],
    SLIMY2: [
        '虫兽', 21, 2
    ],
    SLIMY3: [
        '虫兽', 21, 3
    ],
    SLIMY4: [
        '虫兽', 21, 4
    ],
    CHOCO: [
        '巧克力世界', 22
    ],
    EDGY: [
        '邪恶宇宙', 23
    ],
    PINK: [
        '粉红公主领', 24
    ],
    NERD: [
        '油腻的肥宅', 25, 1
    ],
    NERD2: [
        '油腻的肥宅', 25, 2
    ],
    NERD3: [
        '油腻的肥宅', 25, 3
    ],
    NERD4: [
        '油腻的肥宅', 25, 4
    ],
    META: [
        '机甲领土', 26
    ],
    PARTY: [
        '跨维度派对', 27
    ],
    MOBSTER: [
        '教母', 28, 1
    ],
    MOBSTER2: [
        '教母', 28, 2
    ],
    MOBSTER3: [
        '教母', 28, 3
    ],
    MOBSTER4: [
        '教母', 28, 4
    ],
    TYPO: [
        '打字错误区域', 29
    ],
    FAD: [
        '潮流之地', 30
    ],
    JRPG: [
        'JRPG小镇', 31
    ],
    EXILE: [
        '流放者', 32, 1
    ],
    EXILE2: [
        '流放者', 32, 2
    ],
    EXILE3: [
        '流放者', 32, 3
    ],
    EXILE4: [
        '流放者', 32, 4
    ],
    RADLANDS: [
        '辐射之地', 33
    ],
    BACKTOSCHOOL: [
        '重返校园', 34
    ],
    WESTWORLD: [
        '西部世界', 35
    ],
    ITHUNGERS: [
        '饥饿之物', 36, 1
    ],
    ITHUNGERS2: [
        '饥饿之物', 36, 2
    ],
    ITHUNGERS3: [
        '饥饿之物', 36, 3
    ],
    ITHUNGERS4: [
        '饥饿之物', 36, 4
    ],
    BREADVERSE: [
        '面包宇宙', 37
    ],
    SEVENTIES: [
        '70年代区域', 38
    ],
    HALLOWEEN: [
        '万圣节区', 39
    ],
    ROCKLOBSTER: [
        '摇滚龙虾', 40, 1
    ],
    ROCKLOBSTER2: [
        '摇滚龙虾', 40, 2
    ],
    ROCKLOBSTER3: [
        '摇滚龙虾', 40, 3
    ],
    ROCKLOBSTER4: [
        '摇滚龙虾', 40, 4
    ],
    CONSTRUCTION: [
        '建筑工地', 41
    ],
    DUCK: [
        '鸭子鸭子区域', 42
    ],
    NETHER: [
        '地狱领域', 43
    ],
    AMALGAMATE: [
        '融合怪', 44, 1
    ],
    AMALGAMATE2: [
        '融合怪', 44, 2
    ],
    AMALGAMATE3: [
        '融合怪', 44, 3
    ],
    AMALGAMATE4: [
        '融合怪', 44, 4
    ],
    PIRATE: [
        '以太之海 第1部分', 45
    ],
}

export const Hacks = [
    [
        '属性',
        1.00E+08,
        2.5000,
        1.0250,
        10,
        7720
    ],
    [
        '冒险',
        2.00E+08,
        0.1000,
        1.0200,
        50,
        7632
    ],
    [
        '时间机器',
        4.00E+08,
        0.2000,
        1.0200,
        50,
        7544
    ],
    [
        '掉率',
        4.00E+08,
        0.2500,
        1.0300,
        40,
        7544
    ],
    [
        '挂件',
        8.00E+08,
        0.2000,
        1.0100,
        20,
        7456
    ],
    [
        '能量NGU',
        2.00E+09,
        0.1000,
        1.0150,
        30,
        7340
    ],
    [
        '魔力NGU',
        2.00E+09,
        0.1000,
        1.0150,
        30,
        7340
    ],
    [
        'Blood',
        4.00E+09,
        0.1000,
        1.0400,
        50,
        7252
    ],
    [
        '怪癖点',
        8.00E+09,
        0.0500,
        1.0080,
        50,
        7164
    ],
    [
        '日托',
        2.00E+10,
        0.0200,
        1.0050,
        45,
        7048
    ],
    [
        '经验',
        4.00E+10,
        0.0250,
        1.0100,
        75,
        6960
    ],
    [
        '增数',
        8.00E+10,
        5.0000,
        1.0400,
        40,
        6873
    ],
    [
        '特权点',
        2.00E+11,
        0.0500,
        1.0050,
        25,
        6757
    ],
    [
        '黑客',
        2.00E+11,
        0.0500,
        1.1000,
        100,
        6757
    ],
    [
        '许愿',
        1.00E+13,
        0.0100,
        1.0050,
        50,
        6262
    ]
];

export const Wishes = [
    //page 1
    [
        '超酷', 1e15, 1
    ],
    [
        '许愿速度 I', 1e15, 10
    ],
    [
        '麦高芬掉落', 2e15, 5
    ],
    [
        'V2/3/4 泰坦奖励', 8e15, 3
    ],
    [
        '钱坑很烂', 6e15, 1
    ],
    [
        '属性 I', 3e15, 10
    ],
    [
        '冒险属性 I', 3e15, 10
    ],
    [
        '背包空间 I', 4e15, 12
    ],
    [
        '超究强化', 6e15, 1
    ],
    [
        '能量强度 I', 5e15, 10
    ],
    [
        '能量上限 I', 5e15, 10
    ],
    [
        '能量条 I', 5e15, 10
    ],
    [
        '魔力强度 I', 5e15, 10
    ],
    [
        '魔力上限 I', 5e15, 10
    ],
    [
        '魔力条 I', 5e15, 10
    ],
    [
        '资源3强度 I', 5e15, 10
    ],
    [
        '资源3上限 I', 5e15, 10
    ],
    [
        '资源3条 I', 5e15, 10
    ],
    [
        '黑客速度 I', 1e16, 10
    ],
    [
        '活跃任务奖励 I', 2e16, 10
    ],
    [
        '最小重生时间', 3e16, 6
    ],
    //page 2
    [
        '许愿速度 II', 5e16, 10
    ],
    [
        '背包空间 II', 8e16, 12
    ],
    [
        '更快的基础训练', 1e17, 1
    ],
    [
        '血麦高芬 α 目标', 6e16, 1
    ],
    [
        '果麦高芬 α 目标', 6e16, 1
    ],
    [
        'Oscar Meyer Weiner', 1e18, 1
    ],
    [
        '日托猫咪快乐度', 5e16, 10
    ],
    [
        '双持 I', 3e17, 10
    ],
    [
        '冒险属性 II', 2e17, 10
    ],
    [
        '属性 II', 2e17, 10
    ],
    [
        '能量强度 II', 1e17, 10
    ],
    [
        '能量上限 II', 1e17, 10
    ],
    [
        '能量条 II', 1e17, 10
    ],
    [
        '魔力强度 II', 1e17, 10
    ],
    [
        '魔力上限 II', 1e17, 10
    ],
    [
        '魔力条 II', 1e17, 10
    ],
    [
        '资源3强度 II', 1e17, 10
    ],
    [
        '资源3上限 II', 1e17, 10
    ],
    [
        '资源3条 II', 1e17, 10
    ],
    [
        '教母怪癖点', 1e19, 1
    ],
    [
        '流放者怪癖点', 3e20, 1
    ],
    // page 3
    [
        '黑客速度 II', 7e17, 10
    ],
    [
        '许愿速度 III', 2e18, 10
    ],
    [
        '日托猫咪艺术', 3e19, 1
    ],
    [
        '双持 II', 1e19, 10
    ],
    [
        '重生速度', 6e18, 10
    ],
    [
        '更多怪癖点', 3e18, 10
    ],
    [
        '能量强度 III', 5e18, 10
    ],
    [
        '能量上限 III', 5e18, 10
    ],
    [
        '能量条 III', 5e18, 10
    ],
    [
        '魔力强度 III', 5e18, 10
    ],
    [
        '魔力上限 III', 5e18, 10
    ],
    [
        '魔力条 III', 5e18, 10
    ],
    [
        '资源3强度 III', 5e18, 10
    ],
    [
        '资源3上限 III', 5e18, 10
    ],
    [
        '资源3条 III', 5e18, 10
    ],
    [
        '背包空间 III', 8e19, 12
    ],
    [
        '糟糕', 3e21, 1
    ],
    [
        '血之麦高芬 α 很烂', 4e20, 10
    ],
    [
        '果之麦高芬 α 很烂', 4e20, 10
    ],
    [
        '经验加成', 8e19, 10
    ],
    [
        '活跃任务 II', 8e20, 10
    ],
    // page 4
    [
        '黑客速度 III', 5e20, 10
    ],
    [
        '能量强度 IV', 3e20, 10
    ],
    [
        '能量上限 IV', 3e20, 10
    ],
    [
        '能量条 IV', 3e20, 10
    ],
    [
        '魔力强度 IV', 3e20, 10
    ],
    [
        '魔力上限 IV', 3e20, 10
    ],
    [
        '魔力条 IV', 3e20, 10
    ],
    [
        '资源3强度 IV', 3e20, 10
    ],
    [
        '资源3上限 IV', 3e20, 10
    ],
    [
        '资源3条 IV', 3e20, 10
    ],
    [
        '野兽怪癖点', 2e16, 1
    ],
    [
        '油腻的肥宅怪癖点', 5.00E+17, 1
    ],
    [
        '寻求帮助', 5.00E+21, 1
    ],
    [
        '怪癖点黑客里程碑 I', 2.00E+17, 5
    ],
    [
        '数字黑客里程碑 I', 1.00E+19, 5
    ],
    [
        '黑客黑客里程碑 I', 6.00E+20, 10
    ],
    [
        '更多基础 PP', 2.00E+21, 10
    ],
    [
        '更高等级任务掉落 I', 5.00E+17, 2
    ],
    [
        '更高等级任务掉落 II', 1.00E+22, 2
    ],
    [
        '能量强度 V', 5.00E+21, 10
    ],
    [
        '能量条 V', 5.00E+21, 10
    ],
    [
        '能量上限 V', 5.00E+21, 10
    ],
    [
        '魔力强度 V', 5.00E+21, 10
    ],
    [
        '魔力条 V', 5.00E+21, 10
    ],
    [
        '魔力上限 V', 5.00E+21, 10
    ],
    [
        '资源3强度 V', 5.00E+21, 10
    ],
    [
        '资源3条 V', 5.00E+21, 10
    ],
    [
        '资源3上限 V', 5.00E+21, 10
    ],
    [
        '能量强度 VI', 1.00E+23, 10
    ],
    [
        '能量条 VI', 1.00E+23, 10
    ],
    [
        '能量上限 VI', 1.00E+23, 10
    ],
    [
        '魔力强度 VI', 1.00E+23, 10
    ],
    [
        '魔力条 VI', 1.00E+23, 10
    ],
    [
        '魔力上限 VI', 1.00E+23, 10
    ],
    [
        '资源3强度 VI', 1.00E+23, 10
    ],
    [
        '资源3条 VI', 1.00E+23, 10
    ],
    [
        '资源3上限 VI', 1.00E+23, 10
    ],
    [
        '泰坦10怪癖点', 5.00E+22, 1
    ],
    [
        '主要任务基础怪癖点', 1.00E+22, 10
    ],
    [
        '次要任务基础怪癖点', 1.80E+23, 2
    ],
    [
        '冒险属性 III', 1.00E+19, 10
    ],
    [
        '冒险属性 IV', 3.00E+21, 10
    ],
    [
        '属性 III', 2.00E+19, 10
    ],
    [
        '属性 IV', 1.00E+21, 10
    ],
    [
        '虐待狂Boss倍率 I', 2.00E+22, 10
    ],
    [
        '虐待狂Boss倍率 II', 5.00E+23, 10
    ],
    [
        '饰品槽位', 5.00E+24, 1
    ],
    [
        '立方体强化 I', 4.00E+19, 20
    ],
    [
        '能量NGU速度 I', 7.00E+20, 10
    ],
    [
        '能量NGU速度 II', 2.00E+22, 10
    ],
    [
        '魔力NGU速度 I', 7.00E+20, 10
    ],
    [
        '魔力NGU速度 II', 2.00E+22, 10
    ],

    [
        '能量NGU卡片 I', 4.00E+19, 1
    ],
    [
        '掉率卡片 I', 4.00E+19, 1
    ],
    [
        'Wandoos卡片 I', 2.00E+19, 1
    ],
    [
        '冒险属性卡片 I', 8.00E+19, 1
    ],
    [
        '黑客卡片 I', 5.00E+19, 1
    ],
    [
        '挂件卡片 I', 6.00E+19, 1
    ],
    [
        '黄金掉落卡片 I', 8.00E+19, 1
    ],
    [
        'PP卡片 I', 1.00E+20, 1
    ],
    [
        '攻防卡片 I', 9.00E+19, 1
    ],
    [
        '魔力NGU卡片 I', 1.90E+20, 1
    ],
    [
        '时间机器速度卡片 I', 1.70E+20, 1
    ],
    [
        'QP卡片 I', 2.20E+20, 1
    ],
    [
        '日托卡片 I', 2.50E+20, 1
    ],
    [
        '能量NGU卡片 II', 1.20E+21, 1
    ],
    [
        '掉落率卡片 II', 1.20E+21, 1
    ],
    [
        'Wandoos卡片 II', 1.00E+21, 1
    ],
    [
        '冒险属性卡片 II', 1.50E+21, 1
    ],
    [
        '黑客卡片 II', 1.80E+21, 1
    ],
    [
        '挂件卡片 II', 1.80E+21, 1
    ],
    [
        '黄金掉落卡片 II', 2.00E+21, 1
    ],
    [
        '特权点卡片 II', 2.50E+21, 1
    ],
    [
        '攻防卡片 II', 2.00E+21, 1
    ],
    [
        '魔力NGU卡片 II', 3.00E+21, 1
    ],
    [
        '时间机器速度卡片 II', 2.50E+21, 1
    ],
    [
        '怪癖点Tier II', 4.00E+21, 1
    ],
    [
        '日托卡片 II', 5.00E+21, 1
    ],
    [
        '能量NGU卡片 III', 2.00E+22, 1
    ],
    [
        '掉率卡片 III', 1.80E+22, 1
    ],
    [
        'Wandoos卡片 III', 1.50E+22, 1
    ],
    [
        '冒险属性卡片 III', 5.00E+22, 1
    ],
    [
        '黑客卡片 III', 4.00E+22, 1
    ],
    [
        'Augment Card III', 6.00E+22, 1
    ],
    [
        'Gold Drop Card III', 7.50E+22, 1
    ],
    [
        '特权点卡片 III', 1.00E+23, 2
    ],
    [
        '攻防卡片 III', 8.00E+22, 1
    ],
    [
        '魔力NGU卡片 III', 1.30E+23, 1
    ],
    [
        '时间机器速度卡片 III', 1.20E+23, 1
    ],
    [
        '怪癖点卡片 III', 1.50E+23, 2
    ],
    [
        '日托卡片 III', 1.60E+23, 1
    ],
    [
        'Faster Mayo I', 5.00E+20, 10
    ],
    [
        'Faster Cards I', 5.00E+20, 10
    ],
    [
        'Faster Mayo II', 1.00E+22, 10
    ],
    [
        'Faster Cards II', 1.00E+22, 10
    ],
    [
        'Faster Mayo III', 2.00E+23, 10
    ],
    [
        'Faster Cards III', 2.00E+23, 10
    ],
    [
        'Faster Mayo IV', 4.00E+24, 10
    ],
    [
        'Faster Cards IV', 4.00E+24, 10
    ],
    [
        'BEEFY I', 4.00E+24, 1
    ],
    [
        'WIMPY I', 4.00E+24, 1
    ],
    [
        'Bigger Deck I', 1.00E+20, 5
    ],
    [
        'Bigger Deck II', 5.00E+21, 5
    ],
    [
        'Bigger Deck III', 2.50E+23, 5
    ],
    [
        'Mayo Generator', 5.00E+21, 1
    ],
    [
        'Bonus Tag', 3.00E+22, 1
    ],
    [
        'Better Tags I', 2.00E+19, 10
    ],
    [
        'Better Tags II', 6.00E+20, 10
    ],
    [
        'Better Tags III', 1.80E+22, 10
    ],
    [
        'Better Tags IV', 5.00E+23, 10
    ],
    [
        'Better Tags V', 1.50E+25, 10
    ],
    [
        '能量NGU卡片 IV', 2.50E+23, 2
    ],
    [
        '掉率卡片 IV', 2.20E+23, 2
    ],
    [
        'Wandoos卡片 IV', 2.00E+23, 2
    ],
    [
        '冒险属性卡片 IV', 5.00E+23, 2
    ],
    [
        'Hacks Card IV', 4.00E+23, 2
    ],
    [
        'Augment Card IV', 6.00E+23, 2
    ],
    [
        'Gold Drop Card IV', 7.50E+23, 2
    ],
    [
        '特权点卡片 IV', 1.00E+24, 2
    ],
    [
        '攻防卡片 IV', 8.00E+23, 2
    ],
    [
        '魔力NGU卡片 IV', 1.30E+24, 2
    ],
    [
        '时间机器速度卡片 IV', 1.20E+24, 2
    ],
    [
        '怪癖点卡片 IV', 1.50E+24, 2
    ],
    [
        '日托卡片 IV', 1.60E+24, 2
    ],
    [
        'Titan 11 QP', 2.00E+25, 1
    ],
    [
        'Adventure Stats V', 1.00E+24, 20
    ],
    [
        'Stats V', 1.00E+24, 20
    ],
    [
        '高级训练完成了', 1.00E+18, 1
    ],
    [
        'Stats VI', 2.00E+25, 20
    ],
    [
        'Stats VII', 4.00E+26, 20
    ],
    [
        'Energy Power VII', 2.00E+24, 10
    ],
    [
        'Energy Bars VII', 2.00E+24, 10
    ],
    [
        'Energy Cap VII', 2.00E+24, 10
    ],
    [
        'Magic Power VII', 2.00E+24, 10
    ],
    [
        'Magic Bars VII', 2.00E+24, 10
    ],
    [
        'Magic Cap VII', 2.00E+24, 10
    ],
    [
        'Resource 3 Power VII', 2.00E+24, 10
    ],
    [
        'Resource 3 Bars VII', 2.00E+24, 10
    ],
    [
        'Resource 3 Cap VII', 2.00E+24, 10
    ],
    [
        '先睹为快', 1.00E+24, 1
    ],
    [
        '关闭', 1.00E+27, 1
    ],
    [
        'Titan 12 QP', 3.00E+26, 1
    ],
    [
        '能量NGU卡片 V', 4.00E+25, 2
    ],
    [
        '掉率卡片 V', 5.00E+25, 2
    ],
    [
        'Wandoos卡片 V', 4.00E+25, 2
    ],
    [
        '冒险属性卡片 V', 1.00E+26, 2
    ],
    [
        'Hacks Card V', 8.00E+25, 2
    ],
    [
        'Augment Card V', 1.00E+26, 2
    ],
    [
        '黄金掉落卡片 V', 1.30E+26, 2
    ],
    [
        '特权点卡片 V', 2.00E+26, 2
    ],
    [
        '攻防卡片 V', 2.50E+26, 2
    ],
    [
        '魔力NGU卡片 V', 2.00E+26, 2
    ],
    [
        '时间机器速度卡片 V', 3.00E+26, 2
    ],
    [
        '怪癖点卡片 V', 5.00E+26, 2
    ],
    [
        '日托卡片 V', 4.00E+26, 2
    ],
    [
        '冒险属性卡片 VI', 5.00E+25, 20
    ],
    [
        'Stats VIII', 1.80E+26, 20
    ],
    [
        'BEEFY II', 1.00E+26, 1
    ],
    [
        'WIMPY II', 1.00E+26, 1
    ],
    [
        'Faster Mayo V', 8.00E+25, 10
    ],
    [
        'Faster CardsV', 8.00E+25, 10
    ],
    [
        'Faster Mayo VI', 1.00E+27, 10
    ],
    [
        'Faster Cards VI', 1.00E+27, 10
    ],
    [
        'Adventure Stats VI (part 2)', 3.30E+26, 10
    ],
    [
        'BEEFY III', 3.80E+26, 2
    ],
    [
        'WIMPY III', 3.50E+26, 2
    ],
    [
        'CHONKIER', 3.40E+26, 5
    ],
    [
        'LESS NOT CHONKIER', 3.70E+26, 5
    ],
];

export const resource_priorities = [
    [
        1, 0, 2
    ],
    [
        1, 2, 0
    ],
    [
        2, 1, 0
    ],
    [
        0, 1, 2
    ],
    [
        2, 0, 1
    ],
    [
        0, 2, 1
    ]
];

const vngu = (cost, bonus, softcap, scbonus, scexponent) => {
    return {cost: cost, bonus: bonus, softcap: softcap, scbonus: scbonus, scexponent: scexponent};
};
const ngu = (name, nc, nb, nsc, nscb, nsce, ec, eb, esc, escb, esce, sc, sb, ssc, sscb, ssce) => {
    return {
        name: name,
        normal: vngu(nc, nb, nsc, nscb, nsce),
        evil: vngu(ec, eb, esc, escb, esce),
        sadistic: vngu(sc, sb, ssc, sscb, ssce)
    };
};

export const NGUs = {
    energy: [
        ngu('挂件', 1.00E+13, 1.00E-02, 1.00E+09, 0, 0.00E+00, 1.00E+22, 5.00E-03, 1.00E+09, 0, 0.00E+00, 1.00E+33, 4.00E-03, 1.00E+09, 0, 0.00E+00),
        ngu('Wandoos', 1.00E+13, 1.00E-03, 1.00E+09, 0, 0.00E+00, 1.00E+22, 1.00E-03, 1.00E+03, 177.9, 2.50E-01, 1.00E+33, 6.00E-04, 1.00E+03, 354.81, 1.50E-01),
        ngu('生成时间', 1.00E+13, 5.00E-04, 4.00E+02, 5, 2.00E-01, 1.00E+22, 5.00E-06, 1.00E+04, 20, 5.00E-02, 1.00E+33, 5.00E-06, 1.00E+04, 20, 5.00E-02),
        ngu('黄金', 1.00E+13, 1.00E-02, 1.00E+09, 0, 0.00E+00, 1.00E+23, 5.00E-03, 1.00E+09, 0, 0.00E+00, 1.00E+33, 5.00E-03, 1.00E+03, 31.63, 5.00E-01),
        ngu('冒险α', 1.00E+13, 1.00E-03, 1.00E+03, 31.7, 5.00E-01, 1.00E+24, 5.00E-04, 1.00E+03, 177.9, 2.50E-01, 1.00E+34, 4.00E-04, 1.00E+03, 251.19, 2.00E-01),
        ngu('攻防α', 1.00E+13, 5.00E-02, 1.00E+09, 0, 0.00E+00, 1.00E+25, 2.00E-02, 1.00E+09, 0, 0.00E+00, 1.00E+35, 1.60E-02, 1.00E+09, 0, 0.00E+00),
        ngu('掉率', 1.00E+15, 1.00E-03, 1.00E+03, 31.7, 5.00E-01, 1.00E+26, 5.00E-04, 1.00E+03, 125.9, 3.00E-01, 1.00E+36, 4.00E-04, 1.00E+03, 251.2, 2.00E-01),
        ngu('魔力NGU', 2.00E+16, 1.00E-03, 1.00E+03, 125.9, 3.00E-01, 1.00E+27, 5.00E-04, 1.00E+03, 125.9, 3.00E-01, 1.00E+37, 4.00E-04, 1.00E+03, 501.19, 1.00E-01),
        ngu('特权点', 5.00E+17, 5.00E-04, 1.00E+03, 125.9, 3.00E-01, 1.01E+28, 2.00E-04, 1.00E+03, 251.2, 2.00E-01, 1.00E+38, 1.60E-04, 1.00E+03, 501.21, 1.00E-01)
    ],
    magic: [
        ngu('世界树', 2.00E+13, 1.00E-03, 4.00E+02, 55.4, 3.30E-01, 1.00E+22, 5.00E-04, 4.00E+02, 219.72, 1.00E-01, 1.00E+33, 4.00E-04, 4.00E+02, 247.69, 8.00E-02),
        ngu('经验', 6.00E+13, 1.00E-04, 2.00E+03, 95.66, 4.00E-01, 1.00E+23, 5.00E-05, 2.00E+03, 437.35, 2.00E-01, 1.00E+33, 5.00E-05, 2.00E+03, 639.56, 1.50E-01),
        ngu('攻防β', 2.00E+14, 1.00E-02, 1.00E+09, 0, 0.00E+00, 1.00E+24, 5.00E-03, 1.00E+09, 0, 0.00E+00, 1.00E+34, 5.00E-03, 1.00E+09, 0, 0.00E+00),
        ngu('增数', 6.00E+14, 1.00E-02, 1.00E+03, 31.7, 5.00E-01, 1.00E+25, 5.00E-03, 1.00E+03, 125.9, 3.00E-01, 1.00E+35, 5.00E-03, 1.00E+03, 251.2, 2.00E-01),
        ngu('时间机器', 5.00E+15, 2.00E-03, 1.00E+03, 3.981, 8.00E-01, 1.00E+26, 1.00E-03, 1.00E+03, 3.981, 8.00E-01, 1.00E+36, 1.00E-03, 1.00E+03, 3.981, 8.00E-01),
        ngu('能量NGU', 5.00E+16, 1.00E-03, 1.00E+03, 125.9, 3.00E-01, 1.00E+27, 5.00E-04, 1.00E+03, 251.2, 2.00E-01, 1.00E+37, 5.00E-04, 1.00E+03, 354.82, 1.50E-01),
        ngu('冒险β', 5.00E+17, 3.00E-04, 1.00E+03, 63.13, 4.00E-01, 1.01E+28, 1.50E-04, 1.00E+03, 177.83, 2.50E-01, 1.00E+38, 1.50E-04, 1.00E+03, 436.53, 1.20E-01)
    ]
};
