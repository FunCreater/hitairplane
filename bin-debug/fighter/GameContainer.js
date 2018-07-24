var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = this && this.__extends || function __extends(t, e) { 
 function r() { 
 this.constructor = t;
}
for (var i in e) e.hasOwnProperty(i) && (t[i] = e[i]);
r.prototype = e.prototype, t.prototype = new r();
};
var fighter;
(function (fighter) {
    /**
    * 主游戏容器
    */
    var GameContainer = (function (_super) {
        __extends(GameContainer, _super);
        function GameContainer() {
            var _this = _super.call(this) || this;
            /**我的子弹*/
            _this.myBullets = [];
            /**敌人的飞机*/
            _this.enemyTexts = [];
            /**触发创建敌机的间隔*/
            _this.enemyTextsTimer = new egret.Timer(1000);
            /**敌人的子弹*/
            _this.enemyBullets = [];
            /**我的成绩*/
            _this.myScore = 0;
            /**响应Touch*/
            // private touchHandler(evt:egret.TouchEvent):void{
            //     if(evt.type==egret.TouchEvent.TOUCH_MOVE)
            //     {
            //         var tx:number = evt.localX;
            //         // tx = Math.max(0,tx);
            //         // tx = Math.min(this.stageW-this.myFighter.width,tx);
            //         this.myFighter.x = tx;
            //         this.myFighter.y = evt.localY;
            //     }
            // }
            _this._touchStatus = false; //当前触摸状态，按下时，值为true
            _this._distance = new egret.Point(); //鼠标点击时，鼠标全局坐标与_bird的位置差
            _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this.onAddToStage, _this);
            return _this;
        }
        /**初始化*/
        GameContainer.prototype.onAddToStage = function (event) {
            this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
            this.createGameScene();
        };
        /**创建游戏场景*/
        GameContainer.prototype.createGameScene = function () {
            this.backg = new egret.Shape();
            this.backg.graphics.beginFill(0x23201b);
            this.backg.graphics.drawRect(0, 0, this.stage.stageWidth, this.stage.stageHeight);
            this.backg.graphics.endFill();
            this.addChild(this.backg);
            this.stageW = this.stage.stageWidth;
            this.stageH = this.stage.stageHeight;
            // //创建可滚动的背景
            // this.bg = new fighter.BgMap();
            // this.addChild(this.bg);
            //开始按钮
            this.btnStart = fighter.createBitmapByName("bullet_png"); //开始按钮
            this.btnStart.x = (this.stageW - this.btnStart.width) / 2; //居中定位
            this.btnStart.y = (this.stageH - this.btnStart.height) / 2; //居中定位
            this.btnStart.touchEnabled = true; //开启触碰
            //点击按钮开始游戏.下面再添加 gameStart 方法，记得要把这一行的注释取消掉哦。
            this.btnStart.addEventListener(egret.TouchEvent.TOUCH_TAP, this.gameStart, this);
            this.addChild(this.btnStart);
            //我的飞机
            this.myFighter = new fighter.Airplane(RES.getRes("plane2_png"), 300, "plane2_png");
            this.myFighter.x = this.stageW / 2;
            this.myFighter.y = this.stageH - this.myFighter.height;
            this.myFighter.addEventListener("createBullet", this.createBulletHandler, this);
            this.myFighter.anchorOffsetX = this.myFighter.width / 2;
            this.myFighter.anchorOffsetY = this.myFighter.height / 2;
            var bound = this.myFighter.getBounds();
            this.addChild(this.myFighter);
            var testBound = new egret.Shape();
            testBound.graphics.beginFill(0xffffff);
            testBound.graphics.drawRect(this.myFighter.x, this.myFighter.y, this.myFighter.width, this.myFighter.height);
            testBound.graphics.endFill();
            this.addChild(testBound);
            this.scorePanel = new fighter.ScorePanel();
        };
        /**游戏开始*/
        GameContainer.prototype.gameStart = function () {
            this.removeChild(this.btnStart);
            // this.bg.start();
            this.myFighter.fire(); //我的飞机开火
            this.enemyTextsTimer.addEventListener(egret.TimerEvent.TIMER, this.createEnemyFighter, this);
            this.enemyTextsTimer.start();
            this.addEventListener(egret.Event.ENTER_FRAME, this.gameViewUpdate, this);
            this.myFighter.touchEnabled = true;
            // this.addEventListener(egret.TouchEvent.TOUCH_MOVE,this.touchHandler,this);
            this.myFighter.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.mouseDown, this);
            this.myFighter.addEventListener(egret.TouchEvent.TOUCH_END, this.mouseUp, this);
        };
        /**创建敌机*/
        GameContainer.prototype.createEnemyFighter = function (evt) {
            var enemyFighter = fighter.EnemyText.produce("test", 1000);
            enemyFighter.x = Math.random() * (this.stageW - enemyFighter.width); //随机坐标
            enemyFighter.y = -enemyFighter.height - Math.random() * 300; //随机坐标
            enemyFighter.addEventListener("createBullet", this.createBulletHandler, this);
            enemyFighter.fire();
            this.addChildAt(enemyFighter, this.numChildren - 1);
            this.enemyTexts.push(enemyFighter);
        };
        /**创建子弹(包括我的子弹和敌机的子弹)*/
        GameContainer.prototype.createBulletHandler = function (evt) {
            var bullet;
            if (evt.target == this.myFighter) {
                for (var i = 0; i < 2; i++) {
                    bullet = fighter.Bullet.produce("bullet3_png");
                    bullet.x = i == 0 ? (this.myFighter.x + 10) : (this.myFighter.x + this.myFighter.width - 22);
                    bullet.x -= this.myFighter.width / 2;
                    bullet.y = this.myFighter.y - this.myFighter.height / 2 + 30;
                    this.addChildAt(bullet, this.numChildren - 1 - this.enemyTexts.length);
                    this.myBullets.push(bullet);
                }
            }
            else {
                var theFighter = evt.target;
                bullet = fighter.Bullet.produce("bullet2_png");
                bullet.x = theFighter.x + 28;
                bullet.y = theFighter.y + 10;
                this.addChildAt(bullet, this.numChildren - 1 - this.enemyTexts.length);
                this.enemyBullets.push(bullet);
            }
        };
        /**游戏画面更新*/
        GameContainer.prototype.gameViewUpdate = function (evt) {
            //为了防止FPS下降造成回收慢，生成快，进而导致DRAW数量失控，需要计算一个系数，当FPS下降的时候，让运动速度加快
            var nowTime = egret.getTimer();
            var fps = 1000 / (nowTime - this._lastTime);
            this._lastTime = nowTime;
            var speedOffset = 60 / fps;
            //我的子弹运动
            var i = 0;
            var bullet;
            var myBulletsCount = this.myBullets.length;
            for (; i < myBulletsCount; i++) {
                bullet = this.myBullets[i];
                if (bullet.y < -bullet.height) {
                    this.removeChild(bullet);
                    fighter.Bullet.reclaim(bullet);
                    this.myBullets.splice(i, 1);
                    i--;
                    myBulletsCount--;
                }
                bullet.y -= 12 * speedOffset;
            }
            //敌人飞机运动
            var theFighter;
            var enemyFighterCount = this.enemyTexts.length;
            for (i = 0; i < enemyFighterCount; i++) {
                theFighter = this.enemyTexts[i];
                if (theFighter.y > this.stage.stageHeight) {
                    this.removeChild(theFighter);
                    fighter.EnemyText.reclaim(theFighter);
                    theFighter.removeEventListener("createBullet", this.createBulletHandler, this);
                    theFighter.stopFire();
                    this.enemyTexts.splice(i, 1);
                    i--;
                    enemyFighterCount--;
                }
                theFighter.y += 4 * speedOffset;
            }
            //敌人子弹运动
            var enemyBulletsCount = this.enemyBullets.length;
            for (i = 0; i < enemyBulletsCount; i++) {
                bullet = this.enemyBullets[i];
                if (bullet.y > this.stage.stageHeight) {
                    this.removeChild(bullet);
                    fighter.Bullet.reclaim(bullet);
                    this.enemyBullets.splice(i, 1);
                    i--;
                    enemyBulletsCount--; //数组长度已经改变
                }
                bullet.y += 8 * speedOffset;
            }
            this.gameHitTest();
        };
        GameContainer.prototype.mouseDown = function (evt) {
            this._touchStatus = true;
            this._distance.x = evt.stageX - this.myFighter.x;
            this._distance.y = evt.stageY - this.myFighter.y;
            this.myFighter.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.mouseMove, this);
        };
        GameContainer.prototype.mouseMove = function (evt) {
            if (this._touchStatus) {
                this.myFighter.x = evt.stageX - this._distance.x;
                this.myFighter.y = evt.stageY - this._distance.y;
            }
        };
        GameContainer.prototype.mouseUp = function (evt) {
            this._touchStatus = false;
            this.myFighter.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.mouseMove, this);
        };
        /**游戏碰撞检测*/
        GameContainer.prototype.gameHitTest = function () {
            var i, j;
            var bullet;
            var theFighter;
            var myBulletsCount = this.myBullets.length;
            var enemyFighterCount = this.enemyTexts.length;
            var enemyBulletsCount = this.enemyBullets.length;
            //将需消失的子弹和飞机记录
            var delBullets = [];
            var delFighters = [];
            //我的子弹可以消灭敌机
            for (i = 0; i < myBulletsCount; ++i) {
                bullet = this.myBullets[i];
                for (j = 0; j < enemyFighterCount; ++j) {
                    theFighter = this.enemyTexts[j];
                    if (fighter.GameUtil.hitTest(theFighter, bullet)) {
                        theFighter.blood -= 2;
                        if (-1 == delBullets.indexOf(bullet))
                            delBullets.push(bullet);
                        if (theFighter.blood <= 0 && -1 == delFighters.indexOf(theFighter))
                            delFighters.push(theFighter);
                    }
                }
            }
            //敌人的子弹可以减我血
            for (i = 0; i < enemyBulletsCount; ++i) {
                bullet = this.enemyBullets[i];
                if (fighter.GameUtil.hitTest(this.myFighter, bullet)) {
                    this.myFighter.blood -= 1;
                    if (-1 == delBullets.indexOf(bullet))
                        delBullets.push(bullet);
                }
            }
            //敌机的撞击可以消灭我
            for (i = 0; i < enemyFighterCount; ++i) {
                theFighter = this.enemyTexts[i];
                if (fighter.GameUtil.hitTest(this.myFighter, theFighter)) {
                    this.myFighter.blood -= 10;
                }
            }
            if (this.myFighter.blood <= 0) {
                this.gameStop();
            }
            else {
                while (delBullets.length > 0) {
                    bullet = delBullets.pop();
                    this.removeChild(bullet);
                    if ("bullet3_png" == bullet.textureName)
                        this.myBullets.splice(this.myBullets.indexOf(bullet), 1);
                    else
                        this.enemyBullets.splice(this.enemyBullets.indexOf(bullet), 1);
                    fighter.Bullet.reclaim(bullet);
                }
                this.myScore += delFighters.length;
                while (delFighters.length > 0) {
                    theFighter = delFighters.pop();
                    theFighter.stopFire();
                    theFighter.removeEventListener("createBullet", this.createBulletHandler, this);
                    this.removeChild(theFighter);
                    this.enemyTexts.splice(this.enemyTexts.indexOf(theFighter), 1);
                    fighter.EnemyText.reclaim(theFighter);
                }
            }
        };
        GameContainer.prototype.gameStop = function () {
            this.addChild(this.btnStart);
            // this.bg.pause();
            this.removeEventListener(egret.Event.ENTER_FRAME, this.gameViewUpdate, this);
            // this.removeEventListener(egret.TouchEvent.TOUCH_MOVE,this.touchHandler,this);
            this.myFighter.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.mouseDown, this);
            this.myFighter.removeEventListener(egret.TouchEvent.TOUCH_END, this.mouseUp, this);
            this.myFighter.stopFire();
            this.myFighter.removeEventListener("createBullet", this.createBulletHandler, this);
            this.enemyTextsTimer.removeEventListener(egret.TimerEvent.TIMER, this.createEnemyFighter, this);
            this.enemyTextsTimer.stop();
            //清理子弹
            var i = 0;
            var bullet;
            while (this.myBullets.length > 0) {
                bullet = this.myBullets.pop();
                this.removeChild(bullet);
                fighter.Bullet.reclaim(bullet);
            }
            while (this.enemyBullets.length > 0) {
                bullet = this.enemyBullets.pop();
                this.removeChild(bullet);
                fighter.Bullet.reclaim(bullet);
            }
            //清理飞机
            var theFigher;
            while (this.enemyTexts.length > 0) {
                theFigher = this.enemyTexts.pop();
                theFigher.stopFire();
                theFigher.removeEventListener("createBullet", this.createBulletHandler, this);
                this.removeChild(theFigher);
                fighter.EnemyText.reclaim(theFigher);
            }
            //显示成绩
            this.scorePanel.showScore(this.myScore);
            this.scorePanel.x = (this.stageW - this.scorePanel.width) / 2;
            this.scorePanel.y = 100;
            this.addChild(this.scorePanel);
        };
        return GameContainer;
    }(egret.DisplayObjectContainer));
    fighter.GameContainer = GameContainer;
    __reflect(GameContainer.prototype, "fighter.GameContainer");
})(fighter || (fighter = {}));
//# sourceMappingURL=GameContainer.js.map