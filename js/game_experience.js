//define the game level, it will increase when passing game, the MAX level = 5;
const MAXLEVEL = 10;   //最大level数

let level = 1;         //初始

let stuffNum,      //总物品数量
    enemiesNum,    //敌人数量
    enemiesSpeedRate,  //敌人运动速度系数
    blocksNum,     //障碍物数量
    yellowGemNum,
    blueGemNum,
    greenGemNum,
    isYellowGemCreate,
    isBlueGemCreate,
    isGreenGemCreate,
    isPortalCreate,
    isTreasureCreate,
    isHeartCreate;

const YELLOWPRO = 0.15;  //黄宝石出现概率(稀有)
const BLUEPRO = 0.6;  //蓝宝石出现概率（珍贵）
const GREENPRO = 0.9;  //绿宝石出现概率（普通）


//设置敌人的速度及障碍物数量
function difficulitySetting() {
    enemiesNum = Math.min(Math.floor(1.5 * level), 7);//randNumGenerator(level, level + 2);
    enemiesSpeedRate = (Math.min(Math.floor(1.5 * level), 8) / enemiesNum) * 50;

    blocksNum = Math.min(level, 5);
}


//设置物品的情况，设置的主要内容：是否生成相应的物品，生成多少个
function setStuff() {
    stuffNum = 0;
    yellowGemNum = 0;
    blueGemNum = 0;
    greenGemNum = 0;
    isYellowGemCreate = false;
    isBlueGemCreate = false;
    isGreenGemCreate = false;
    isPortalCreate = false;
    isTreasureCreate = false;
    isHeartCreate = false;

    //产生宝石
    gemNum = 0;  //初始化宝石数量
    if (level >= 3) {  //level>=3，都会进行判断；下同
        if (YELLOWPRO * randNumGenerator(level * 2, level * 4) >= 5) {  //产生黄宝石
            isYellowGemCreate = true;
            yellowGemNum = 1;
        }
        if (BLUEPRO * randNumGenerator(level, level * 1.5) >= 5) {  //产生蓝宝石
            isBlueGemCreate = true;
            blueGemNum = 1;
        }
        //产生绿宝石
        greenGemNum = randNumGenerator(1, 3);
        isGreenGemCreate = true;
        gemNum = yellowGemNum + blueGemNum + greenGemNum;
    }

    //产生不稳定传送门
    if (level >= 4) {
        isPortalCreate = true;
        stuffNum++;
    }

    //设置钥匙及匹配的星星
    if (level === 3 || level === 6) {
        isTreasureCreate = true;
        stuffNum += 2;
    }

    //设置补血袋
    if (level === 4 || level === 7) {
        isHeartCreate = true;
        stuffNum++;
    }

    stuffNum = stuffNum + gemNum + blocksNum;
}
