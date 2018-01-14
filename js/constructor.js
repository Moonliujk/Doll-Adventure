// 这是我们的玩家要躲避的敌人
//create random number to init the enemies' location and speed.
function randNumGenerator(lowerNum, upperNum) {
  return Math.floor(Math.random() * (upperNum - lowerNum + 1) + lowerNum);
}

var Enemy = function(num) {
    // 要应用到每个敌人的实例的变量写在这里
    // 我们已经提供了一个来帮助你实现更多
    //set the enemy's location in the screen
    this.row = randNumGenerator(1, 3);

    this.x = - 101 * randNumGenerator(1, 5);
    this.y = INIT_Y[this.row - 1];

    this.speed = enemiesSpeedRate * randNumGenerator(level, 2 * level);

    // 敌人的图片，用一个我们提供的工具函数来轻松的加载文件
    this.sprite = 'images/enemy-bug.png';
};

// 此为游戏必须的函数，用来更新敌人的位置
// 参数: dt ，表示时间间隙
Enemy.prototype.update = function(dt) {
    // 你应该给每一次的移动都乘以 dt 参数，以此来保证游戏在所有的电脑上
    // 都是以同样的速度运行的
    if (this.x < 650) {
      this.x += (this.speed * dt);
    } else {
      this.inital();
      this.speed = enemiesSpeedRate * randNumGenerator(2, 15) ;
    }

};

Enemy.prototype.inital = function() {
    this.x = - 101 * randNumGenerator(1, 5);
    this.row = randNumGenerator(1, 3);
    this.y = INIT_Y[this.row - 1];
}

// 此为游戏必须的函数，用来在屏幕上画出敌人，
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// 现在实现你自己的玩家类
// 这个类需要一个 update() 函数， render() 函数和一个 handleInput()函数
var Player = function(sprite, heart) {
    // 要应用到每个敌人的实例的变量写在这里
    // 我们已经提供了一个来帮助你实现更多
    //set the enemy's location in the screen

    this.inital();
    this.hearts = heart;

    // 敌人的图片，用一个我们提供的工具函数来轻松的加载文件
    this.sprite = sprite;
};

Player.prototype.update = function(dt) {

};

Player.prototype.inital = function() {
    this.row = 5;
    this.y = INIT_Y[this.row - 1];

    this.col = 2;
    this.x = INIT_X[this.col];

    this.transmitting = false;
}

// 此为游戏必须的函数，用来在屏幕上画出敌人，
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.handleInput = function(key) {
  switch (key) {
    case 'down':
      if (this.row < 5 && checkBarriers(key)) {
        this.y = this.y + 83;
        this.row++;
        checkGetStuff();
      }
      break;
    case 'up':
      if (this.row > 0 && checkBarriers(key)) {
        --this.row;
        checkGetStuff();
        if (this.row === 0) {
          clearTimeout(timeFlag);  //停止计时

          if (level === 3 || level === 6) {
            if (treasure.get) {
              totalRoleNum++;
            }
          }

          if (level === MAXLEVEL) {
              winGame();
              return;
          }

          winGame();

          return;  //及时跳出函数，防止出现多余渲染的情况！
        }

        this.y -= 83;
      }
      break;
    case 'left':
      if (this.col > 0 && checkBarriers(key)) {
        this.x -= 101;
        this.col--;
        checkGetStuff();
      }
      break;
    case 'right':
      if (this.col < 4 && checkBarriers(key)) {
        this.x += 101;
        this.col++;
        checkGetStuff();
      }
      break;
  }
};

//检测是否获得物品
function checkGetStuff() {
    canGetStuff.forEach(function(stuff) {
        if (stuff.isGettingItem()) {
          if (stuff.code) {
            showGetNum(stuff.code);
          }
          scoreCal(stuff);
        }
    });
    if (isPortalCreate && portal.get) {
      portal.get = false;
      setTimeout("transmit()",200);
    }
    if (isHeartCreate && heart.get) {
      heart.get = false;
      if(player.hearts < 5) {
        player.hearts++;
      } else {
        score += 100;
        getTotalScore.innerHTML = score;
      }
      showLife();
    }
    if (isTreasureCreate && !keyRing.show && !treasure.get) {
        treasure.show = true;
    }
}

//触发传送效果，保证玩家可以看到小人在传送门之上发生传送;
//不能传送到障碍物之上，也不能传送到传送门之上
function transmit() {
    let col = 0,
        row = 0,
        continueFlag = true;

    player.transmitting = true;

    while (continueFlag) {
      row = randNumGenerator(1, 5);
      col = randNumGenerator(0, 4);

      for (var i=0;i<allBarriers.length;i++) {

        if (row === portal.row && col === portal.col) {
          break;
        }

        if(allBarriers[i].row === row && allBarriers[i].col === col) {
          break;
        }
      }

      if(i === allBarriers.length) {
        continueFlag = false;
        player.row = row;
        player.col = col;
      }

    }

    player.y = INIT_Y[player.row - 1];
    player.x = INIT_X[player.col];

    checkGetStuff();   // 传送到有物品的地方时，会获得物品
    setTimeout(() => player.transmitting = false, 400);   //结束传送过程
}

function showGetNum(code) {
    switch (code) {
      case 1:
        let i = 0;
        greenGem.forEach((gem) => {
          if (gem.get) {
            i++;
          }
        });
        getGreenGemNum.innerHTML = i;
        break;
      case 2:
        getBlueGemNum.innerHTML = "1";
        break;
      case 3:
        getYellowGemNum.innerHTML = "1";
        break;
      case 4:
        getKeyNum.innerHTML = "1";
        break;
      case 5:
        getTreasureNum.innerHTML = "1";
        break;
    }
}

var Block = function(num_x, num_y) {

    this.col = num_x;
    this.x = INIT_X[num_x];

    this.row = num_y;
    this.y = INIT_Y[num_y - 1];

    this.sprite = "images/Rock.png";
    this.show = true;
};

Block.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/*
  构建物品类，由其派生出游戏中各个道具，主要包含如下属性：
  - 行坐标、y属性；列坐标、x属性
  - png图源
  - 显示属性

  方法：
  - 刷新绘制的方法
  - 检查是否获得物品的方法
*/
class Item {
  constructor(col, row) {
    this.col = col;
    this.x = INIT_X[col];

    this.row = row;
    this.y = INIT_Y[row - 1];

    this.sprite = undefined;

    this.show = true;

    this.get = false;
    this.score = 0;
    this.code = 0;        //用于显示的时候判别物品的依据
  }

  render() {
      ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  };

  isGettingItem() {
      if (player.row === this.row && player.col === this.col) {
        this.show = false;
        this.row = -1;
        this.col = -1;
        this.get = true;
        return true;
      }
      return false;
  };
}


//宝石类
class Gem extends Item {
  constructor(col, row) {
    super(col, row);
  }
}

class GreenGem extends Gem {
  constructor(col, row) {
    super(col, row);

    this.score = 30;
    this.sprite = 'images/Gem Green new.png';
    this.code = 1;
  }
}

class BlueGem extends Gem {
  constructor(col, row) {
    super(col, row);

    this.score = 60;
    this.sprite = 'images/Gem Blue new.png';
    this.code = 2;
  }
}

class YellowGem extends Gem {
  constructor(col, row) {
    super(col, row);

    this.score = 100;
    this.sprite = 'images/Gem Orange new.png';
    this.code = 3;
  }
}

//钥匙类(获得钥匙后，宝藏显示出来)
class Key extends Item {
  constructor(col, row) {
    super(col, row);

    this.sprite = "images/Key.png";
    this.score = 50;
    this.code = 4;
  }
}

//宝藏类
class Treasure extends Item {
  constructor(col, row) {
    super(col, row);

    this.show = false;
    this.sprite = "images/Star.png";
    this.score = 50;
    this.code = 5;
  }
  isGettingItem() {
      if (player.row === this.row && player.col === this.col && this.show) {
        this.show = false;
        this.row = -1;
        this.col = -1;
        this.get = true;
        return true;
      }
      return false;
  };
}

//传送门类(重写了isGettingItem()以适应游戏)
class Portal extends Item {
  constructor(col, row) {
    super(col, row);

    this.show = true;
    this.sprite = "images/Selector new.png";
  }

  isGettingItem() {
      if (player.row === this.row && player.col === this.col) {
        this.get = true;
      }
  };
}

//血量类
class Heart extends Item {
  constructor(col, row) {
    super(col, row);

    this.show = true;
    this.sprite = "images/Heart.png";
  }
}
