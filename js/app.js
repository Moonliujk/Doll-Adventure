/*
*  TODO：
    2018/1/4
    - 修复开始界面在出现‘故事介绍’的时候，界面按键依旧可以单击的bug
    - 在开始界面的角色选择框，初始人物有两个，随后可解锁新人物，
    - 对于游戏中的“死亡”及“过关”的popup上的按键添加事件
    - 添加“血量”显示，初始为3点血量，每次触碰到敌人会减少一点血量，并退回到初始位置；血量为0时，游戏结束
    2018/1/5
    - 完成昨日原来没有完成的项目
    - 通过cancelAnimationFrame()来取消动画重绘[通过修改碰撞检测函数达到同样的效果]
    - 实现多关口模式，先设置3关
    -设置障碍物，玩家无法跨越障碍物
    2018/1/6
    - 设置宝石，玩家可以通过获取宝石赚取积分
    - 设置钥匙，玩家可以通过获取钥匙赚取人物皮肤（在获得钥匙后，地图上任意地点显示一个星星，玩家获取星星后，才能获得皮肤）[doestn't finish]
    - 设置不稳定传送门，当玩家进入时，传送到地图的任意可移动地方（传送门会在初次碰到时显示，再次进入时生效，传送后玩家离开时隐藏）[doestn't finish]
    - 设置血量补充剂，玩家可以通过这个装备恢复1点血量（最大血量为5）
    - 完成游戏界面玩家信息的显示[doestn't finish]
    - 将相似的类写成父子类的形式
    2018/1/7
    - 游戏体验的细化
    - 总共10关，根据不同level，设定不同的难度
    - 会有宝石数折合成积分，星星对应解救的人偶
    - 人物会有5点血，会有随机概率生成补血包
    2018/1/8
    - 完成信息显示部分的样式设计
    - 发现bug：当传送门在石头的最后一行时，玩家经过时，可能会触发两种状态，赢；弹出对话框
    2018/1/9
    - 完成物品的分数核算，时间显示，血量显示
    - 完成游戏界面的调整
*/


//define the enemies. init locations
const INIT_Y = [60, 71*2, 75*3, 78*4, 78*5],
      INIT_X = [0, 101, 101*2, 101*3, 101*4],
      ROLES = [
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png'
      ];

var allEnemies = [],
    player = new Player(),
    allBarriers = [],
    greenGem = [],
    canGetStuff = [],
    score = 0,
    //roleHeart = 5,
    totalRoleNum = 2,
    time = 0,
    timeFlag,
    curPageNum = 0;  //定义当前显示的页码
    isContinue = false,
    isPause = false,
    rankListInBoard = [],
    passGameNum = 0, //记录排名编号
    totalTime = [],
    totalScore = [],  //每一关的得分，定义为数组是为了在最后计算总得分
    replayNum = 3;  //重新玩游戏的次数

//必要的节点，用以插入显示的相关信息以及相应的动画效果
let modalMask = document.getElementsByClassName('modal-mask')[0],
    container = document.getElementsByClassName('container')[0],
    modalTitle = document.getElementById('title'),
    modalContent = document.getElementById('content'),
    undeterminedBtn = document.getElementById('undetermined');
    backtoBtn = document.getElementById('backto'),
    startInterface = document.getElementsByClassName('start-interface')[0],
    startBtn = document.getElementById('start'),
    introductionBtn = document.getElementById('introduction'),
    lastBtn = document.getElementById('last-role'),
    nextBtn = document.getElementById('next-role'),
    roleImg = document.getElementsByClassName('role-img')[0];
    getGreenGemNum = document.getElementsByClassName('green-gem-num')[0];
    getBlueGemNum = document.getElementsByClassName('blue-gem-num')[0];
    getYellowGemNum = document.getElementsByClassName('yellow-gem-num')[0];
    getKeyNum = document.getElementsByClassName('key-num')[0];
    getTreasureNum = document.getElementsByClassName('treasure-num')[0];
    getTotalScore = document.getElementsByClassName('get-score')[0];
    getCurrentLevel = document.getElementsByClassName('current-level')[0],
    minInBoard = document.getElementById('min-in-board'),
    secInBoard = document.getElementById('sec-in-board'),
    replayGameBtn = document.getElementById('replay'),
    pauseGameBtn = document.getElementById('pause'),
    replayNumShow = document.getElementById('replay-num-show'),
    showRankBtn = document.getElementById('rank-list-control'),
    nextPageBtn = document.getElementById('next-page'),
    lastPageBtn = document.getElementById('last-page'),
    synopsisContent = document.getElementsByClassName('synopsis')[0];


let imgNum = 0;   //定义用户选择的图片编号

// 现在实例化你的所有对象
// 把所有敌人的对象都放进一个叫 allEnemies 的数组里面
// 把玩家对象放进一个叫 player 的变量里面

//to regist relavent events
startBtn.addEventListener("click", startGame, false);
introductionBtn.addEventListener("click", showIntroduction, false);
lastBtn.addEventListener("click", chooseRoles, false);
nextBtn.addEventListener("click", chooseRoles, false);
backtoBtn.addEventListener("click", backtoMain, false);
undeterminedBtn.addEventListener("click", chooseEvents, false);
replayGameBtn.addEventListener("click", replayGame, false);
pauseGameBtn.addEventListener("click", pauseGame, false);
showRankBtn.addEventListener("click", controlRankList,false);
lastPageBtn.addEventListener("click", pageChange, false);
nextPageBtn.addEventListener("click", pageChange, false);

//从游戏中回到开始界面
function backtoMain() {
    hidePopup();
    if (undeterminedBtn.style.display !== "none") {
      isContinue = true;
    }
    setTimeout("backtoStart()", 400);
}

function controlRankList() {
    showRankList();  //首先触发显示排名事件

    if (!showRankBtn.parentNode.classList.contains("open")) {
        showRankBtn.parentNode.classList.add("open");
        showRankBtn.firstElementChild.className = "fa fa-chevron-up";
    } else {
        showRankBtn.parentNode.classList.remove("open");
        showRankBtn.firstElementChild.className = "fa fa-chevron-down";
    }
}


function chooseEvents() {
    hidePopup();
    switch (this.innerHTML) {
      case "Play again":
        //hidePopup();
        Engine.resetGame();
        break;
      case "Next level":
        //hidePopup();
        player.inital();
        Engine.continueGame();
        break;
      case "Continue":
        setTimeout("continueToPlay()", 500);  //动画结束后，在进行相关回复操作
    }
}

function continueToPlay() {   //恢复相关操作
    isPause = false;
    Engine.countTime();
    document.addEventListener('keyup', keyEvents);
}

 function backtoStart() {
     container.style.display = "none";
     startInterface.style.display = "block";
     if (undeterminedBtn.style.display === "none") {
       undeterminedBtn.style.display = "block";
     }
 }

//begin to play the game
function startGame() {
    showRankBtn.parentNode.classList.remove("open");
    startInterface.classList.add("zoomOutDown");
    container.style.display = "flex";
    startInterface.addEventListener("animationend", showGameInterface, false);
    replayNumShow.innerHTML = replayNum;
    if (!isContinue) {
      Engine.initGame();
    } else {
      isContinue = false;
      let roleHeart = player.hearts;
      player = new Player(ROLES[imgNum], roleHeart);
      Engine.continueGame();
    }
    showLife();
}

function showGameInterface() {
    startInterface.classList.remove("zoomOutDown");
    startInterface.style.display = "none";
    startInterface.removeEventListener("animationend", showGameInterface, false);
}

function showIntroduction() {
    curPageNum = 0;

    startInterface.classList.add("animation-in");
    lastPageBtn.style.display = "none";
    synopsisContent.innerHTML = PAGECONTENT[curPageNum];
    nextPageBtn.style.display = "block";
    startInterface.addEventListener("animationend", registerCloseIntroduction, false);
}

function registerCloseIntroduction() {
    startInterface.firstElementChild.addEventListener("click", closeIntroduction, false);
    startInterface.removeEventListener("animationend", registerCloseIntroduction, false);
}

function closeIntroduction() {
    startInterface.classList.add("animation-out");
    startInterface.classList.remove("animation-in");
    startInterface.firstElementChild.removeEventListener("click", closeIntroduction, false);
    startInterface.addEventListener("animationend", closeAnimation, false);
}

function closeAnimation() {
    startInterface.classList.remove("animation-out");
    startInterface.removeEventListener("animationend", closeAnimation, false);
}

function chooseRoles() {
    let source;

    switch (this.id) {
      case "last-role":
        if (--imgNum >= 0) {
          source = ROLES[imgNum];
        } else {
          source = ROLES[totalRoleNum-1];
          imgNum = totalRoleNum-1;
        }
        break;
      case "next-role":
        if (++imgNum >= totalRoleNum) {
          source = ROLES[0];
          imgNum = 0;
        } else {
          source = ROLES[imgNum];
        }
        break;
    }
    roleImg.src = source;
}

//控制翻页
function pageChange() {
    let content = '',
        pageNum;

    pageNum = curPageNum;

    switch (this.id) {
      case "next-page":
        if(++pageNum < 5) {
          curPageNum = pageNum;
          lastPageBtn.style.display = "block";
          if (pageNum === 4) {
            nextPageBtn.style.display = "none";
          }
        }
        break;
      case "last-page":
        if(--pageNum >= 0) {
          curPageNum = pageNum;
          nextPageBtn.style.display = "block";
          if (pageNum === 0) {
            lastPageBtn.style.display = "none";
          }
        }
        break;
    }

    synopsisContent.innerHTML = PAGECONTENT[curPageNum];
}


// 这段代码监听游戏玩家的键盘点击事件并且代表将按键的关键数字送到 Player.handleInput()
// 方法里面。你不需要再更改这段代码了。
document.addEventListener('keyup', keyEvents);

function keyEvents(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
}
//to judge whether the player meets any enemy througn the enmies and player's 'row' property and their diffrence of 'x';
//判断思路：通过比较人物所在行与x坐标，判断是否碰撞；每次碰撞后，人物回到初始位置
function checkCollisions() {
    for (let i=0;i<allEnemies.length;i++) {
        if (allEnemies[i].row === player.row && Math.abs(allEnemies[i].x - player.x) <= 70) {
            if (--player.hearts === 0) {
              lostGame();
              return;
            }
            player.inital();  //人偶回归到初始点

            showLife();
        }
    }
}

//检测人物是否会触碰到障碍物，通过行列点坐标（col，row变量）检测来进行判断
function checkBarriers(key) {
    for (let i=0;i<allBarriers.length;i++) {
      let row = player.row,
          col = player.col;

      switch (key) {
        case "up":
          if (allBarriers[i].col === col) {
            if (allBarriers[i].row === --row) {
              return false;
            }
          }
          break;
        case "down":
          if (allBarriers[i].col === col) {
            if (allBarriers[i].row === ++row) {
              return false;
            }
          }
          break;
        case "left":
          if (allBarriers[i].row === row) {
            if (allBarriers[i].col === --col) {
              return false;
            }
          }
          break;
        case "right":
          if (allBarriers[i].row === row) {
            if (allBarriers[i].col === ++col) {
              return false;
            }
          }
          break;
      }
    }
    return true;
}

//用于存放单独一点的坐标值
function coordinateUnit(col, row) {
    this.col = col;
    this.row = row;
}

//用于存放全部物品的坐标集合, 生成要求数目且互不相同的坐标值
function coordinate() {
    let col = randNumGenerator(0, 4),
        row = randNumGenerator(1, 5);

    while (col === 2 && row === 5) {
      col = randNumGenerator(0, 4);
      row = randNumGenerator(1, 5);
    }

    allStuff.push(new coordinateUnit(col, row));

    while (allStuff.length < stuffNum) {
        col = randNumGenerator(0, 4);
        row = randNumGenerator(1, 5);

        let num = allStuff.length;
        for (var i=0; i<num; i++) {
          if (col === 2 && row === 5)
            break;
          if(allStuff[i].col === col && allStuff[i].row === row) {
            break;
          }
        }
        if(i === num) {
          allStuff.push(new coordinateUnit(col, row));
        }
    }

}

//弹出窗口样式设计
function showPopup({title, content, btnContent}) {

    container.classList.add('empersized');
    modalMask.style.display = "flex";
    modalMask.firstElementChild.classList.add('fadeInDown');

    modalTitle.innerHTML = title;
    if (title === "Sorry!") {
        modalTitle.classList.add("lost-game");
    } else if (title === "Pause") {
        modalTitle.classList.add("pause-game");
    } else {
        modalTitle.classList.add("win-game");
    }
    modalTitle.addEventListener("animationend", closeTitleAnimation, false);
    modalContent.innerHTML = content;
    undeterminedBtn.innerHTML = btnContent;

}

function closeTitleAnimation() {
    modalTitle.classList.remove("lost-game", "win-game", "pause-game");
    modalTitle.removeEventListener("animationend", closeTitleAnimation, false);
}


//隐藏弹出窗口
function hidePopup() {

    modalMask.firstElementChild.classList.remove('fadeInDown');
    modalMask.firstElementChild.classList.add('fadeOutUp');
    modalMask.firstElementChild.addEventListener("animationend", hideMask, false);

    container.classList.add('empersized');
    modalMask.style.display = "flex";
}

function hideMask() {
    modalMask.firstElementChild.classList.remove('fadeOutUp');
    container.classList.remove('empersized');
    modalMask.style.display = "none";
    modalMask.firstElementChild.removeEventListener("animationend", hideMask, false);
}

function showLife() {
    let heartNum = player.hearts,
        roleLift = document.getElementsByClassName('role-life')[0],
        spanNode = '<span class="role-heart"></span>';

    roleLift.innerHTML = "";

    for (let i=0;i<heartNum;i++) {
      roleLift.innerHTML += spanNode;
    }
}

function scoreCal(stuff) {
    if (level<2) return;
    //计算总分
    score += stuff.score;
    getTotalScore.innerHTML = score;
}

function record(saveTime, saveScore) {  //记录通关信息
    if (sessionStorage.length !== 0 || rankListInBoard.length === 0) {   //如果存有记录，则将记录读入rankListInBoard数组中
        passGameNum = sessionStorage.length;
        for (let i=0;i<sessionStorage.length;i++) {
            rankListInBoard[i] = JSON.parse(sessionStorage[i]);
        }
    }

    if (passGameNum < 6) {
        rankListInBoard[passGameNum] = {
            time: saveTime,
            score: saveScore,
        }
    }

    rankListInBoard.sort(compare);   //以分数为主要标准进行排序，得分大的，排名靠前

    function compare(a, b){    //比较函数写法
        if (a.score > b.score) {  //按照分数进行比较
          return -1;
        } else if (a.score < b.score) {
          return 1;
        } else {
          if (a.time > b.time) {   //按照耗时进行比较
            return 1;
          } else if (a.time < b.time) {
            return -1;
          }
        }
    }

    if (rankListInBoard.length === 6) {
      rankListInBoard.pop()
    };     //只保留排名前五的数据

    rankListInBoard.forEach(function(item, index) {
        sessionStorage.setItem(index, JSON.stringify(item));  //将数组中的每一项转化为JSON存入localStorage
    });

    passGameNum = passGameNum > 5 ? 0 : ++passGameNum;  //最多存储5组数据

}


//排名显示函数
function showRankList() {    //在浏览器上显示出排名
    let rankList = document.getElementsByClassName('rank-list')[0],
        rankListContent = '';

    let recordRank = [];

    for (var i=0;i<sessionStorage.length;i++) {
        recordRank[i] = JSON.parse(sessionStorage[i]);
    }

    console.log(recordRank.length);
    console.log(recordRank.toLocalString);

    if (recordRank.length === 0) {
        rankListContent = '<li>There is no ranking! Go and Play the game!</li>';
    } else {
        let rankNum = Math.min(5, recordRank.length); //最多显示前五名排名
        for (let i=0;i<rankNum;i++) {
            rankListContent += `<li> <span class="rank-num">${i+1}.</span><span class="rank-score">${recordRank[i].score}</span> <span class="rank-time">${recordRank[i].time}</span> </li>`;
        }
    }

    rankList.innerHTML = rankListContent;
}

//时间输出格式， eg: '00min04sec';
function timeOutput(spendingTime) {
    let min = formatting(parseInt(spendingTime / 60)),
        sec = formatting(spendingTime % 60);

    return min + "min" + sec + "sec";
}

function formatting(time) {
  return (time>=0 && time<=9) ? "0" + time : time;
}

//重新刷新界面，解决障碍物将小人包围无法进行游戏的情况
function replayGame() {
    if (--replayNum >= 0) {   //刷新游戏机会只有三次
      player.inital();
      Engine.continueGame();
      replayNumShow.innerHTML = replayNum;
    }
}

//暂停游戏
function pauseGame() {
    clearTimeout(timeFlag);
    showPopup({title: "Pause", content: "Waitting for you coming back!", btnContent: "Continue"});
    isPause = true;
    document.removeEventListener('keyup', keyEvents);
}

//全部通关后，执行的函数
function winGame() {
    let winContent,
        showTime,    //存储要显示的分数以及耗时
        showScore;

    container.classList.add('empersized');
    modalMask.style.display = "flex";
    modalMask.firstElementChild.classList.add('fadeInDown');

    modalTitle.innerHTML = title;
    modalContent.innerHTML = content;

    //将每一关耗时及得分记录下来
    getScore = score;
    totalScore[level - 1] = score;
    totalTime[level - 1] = time;


    if (level === MAXLEVEL) {   //完成10关后，具体的样式设置
        undeterminedBtn.style.display = "none";
        let allTime = totalTime.reduce(function(prev, cur) {
          return prev + cur;
        });

        showScore = totalScore.reduce(function(prev, cur) {
          return prev + cur;
        });

        showTime = timeOutput(allTime);

        record(showTime, showScore);  //将通关信息保存至sessionStorage

        winContent = `You passed all game with <span id="time-in-dialog" class="empersized"></span>, and get
                          <span id="score-in-dialog" class="empersized"></span>! `;
        showPopup({title: "Brilliance!", content: winContent, btnContent: "Play again"});
        roleImg.src = ROLES[0];
        totalRoleNum = 2;
        level = 1;
        replayNum = 3;
    } else {   //通过每一小关后，样式设置
        winContent = `You passed the <span class="empersized">level ${level}</span> with <span id="time-in-dialog" class="empersized"></span>, and get
                          <span id="score-in-dialog" class="empersized"></span>!`;
        showPopup({title: "Congraculations!", content: winContent, btnContent: "Next level"});
        level++;

        showTime = timeOutput(time);
        showScore = score;
    }
    let timeInDialog = document.getElementById('time-in-dialog'),
        scoreInDialog = document.getElementById('score-in-dialog'),
        rank = document.getElementById('rankNum');

    //在对话框中显示具体信息
    timeInDialog.innerHTML = showTime;
    scoreInDialog.innerHTML = showScore;
}
//生命值为0时，执行的函数
function lostGame() {
    replayNum = 3;
    totalRoleNum = 2;
    level = 1;
    roleImg.src = ROLES[0];  //将开始界面人偶形象初始化

    container.classList.add('empersized');
    modalMask.style.display = "flex";
    modalMask.firstElementChild.classList.add('fadeInDown');

    modalTitle.innerHTML = title;
    modalContent.innerHTML = content;
    undeterminedBtn.style.display = "none";
    showPopup({title: "Sorry!", content: "You lost game!<br /> Maybe you can try it again and good luck!", btnContent: "Play again"});
  }
