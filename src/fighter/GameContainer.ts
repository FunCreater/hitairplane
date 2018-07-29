module fighter
{
    
     /**
     * 主游戏容器
     */
    export class GameContainer extends egret.DisplayObjectContainer
    {
        /**@private*/
        private stageW:number;
        /**@private*/
        private stageH:number;
        /**开始按钮*/
        private btnStart:egret.Bitmap;

        /**重试按钮 */
        private btnReStart:egret.Bitmap;

        /**可滚动背景*/
        private bg:fighter.BgMap;
        /**我的飞机*/
        private myFighter:fighter.Airplane;
        /**我的子弹*/
        private myBullets:fighter.Bullet[] = [];
        /**敌人的飞机*/
        private enemyTexts:fighter.EnemyText[] = [];
        /**触发创建敌机的间隔*/
        private enemyTextsTimer:egret.Timer = new egret.Timer(1000);
        /**敌人的子弹*/
        private enemyBullets:fighter.Bullet[] = [];
        /**成绩显示*/
        private scorePanel:fighter.ScorePanel;
        /**我的成绩*/
        private myScore:number = 0;
        /**@private*/
        private _lastTime:number;
        public constructor() {
            super();
            this.addEventListener(egret.Event.ADDED_TO_STAGE,this.onAddToStage,this);
        }
        /**初始化*/
        private onAddToStage(event:egret.Event){
            this.removeEventListener(egret.Event.ADDED_TO_STAGE,this.onAddToStage,this);
            this.createGameScene();
        }

        private backg:egret.Shape;

        /**创建游戏场景*/
        private createGameScene():void{
            this.backg = new egret.Shape();
            this.backg.graphics.beginFill(0x23201b);
            this. backg.graphics.drawRect(0,0,this.stage.stageWidth,this.stage.stageHeight);
            this.backg.graphics.endFill();
            this.addChild(this.backg);       


            this.stageW = this.stage.stageWidth;
            this.stageH = this.stage.stageHeight;
            // //创建可滚动的背景
            // this.bg = new fighter.BgMap();
            // this.addChild(this.bg);
            //开始按钮
            this.btnStart = fighter.createBitmapByName("bullet_png");//开始按钮
            this.btnStart.x = (this.stageW-this.btnStart.width)/2;//居中定位
            this.btnStart.y = (this.stageH-this.btnStart.height)/2;//居中定位
            this.btnStart.touchEnabled = true;//开启触碰
            this.btnStart.addEventListener(egret.TouchEvent.TOUCH_TAP,this.gameStart,this);
            this.addChild(this.btnStart);

            this.btnReStart = fighter.createBitmapByName("bullet_png");
            this.btnReStart.x = this.stageW/2;//居中定位
            this.btnReStart.y = this.stageH-this.btnReStart.height/2;//居中定位
            this.btnReStart.touchEnabled = true;//开启触碰
            this.btnReStart.addEventListener(egret.TouchEvent.TOUCH_TAP,this.gameReStart,this);
           
        
            //我的飞机
            this.myFighter = new fighter.Airplane(RES.getRes("plane2_png"),300,"plane2_png");
            this.myFighter.x = (this.stageW - this.myFighter.width)  / 2;
            this.myFighter.y = this.stageH - this.myFighter.height;
            this.myFighter.addEventListener("createBullet",this.createBulletHandler,this);
            this.addChild(this.myFighter);

            this.scorePanel = new fighter.ScorePanel();

               
        }

        /**游戏开始*/
        private gameStart():void{
            this.removeChild(this.btnStart);
            // this.bg.start();
            
            this.myFighter.touchEnabled=true;
            this.myFighter.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.mouseDown, this);
            this.myFighter.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.mouseMove, this);
            this.myFighter.addEventListener(egret.TouchEvent.TOUCH_END, this.mouseUp, this);

            this.myFighter.fire();//我的飞机开火
            this.enemyTextsTimer.addEventListener(egret.TimerEvent.TIMER,this.createEnemyFighter,this);
            this.enemyTextsTimer.start();

            this.addEventListener(egret.Event.ENTER_FRAME,this.gameViewUpdate,this);

         
        }

        /**创建敌机*/
        private createEnemyFighter(evt:egret.TimerEvent):void{
            var enemyFighter:fighter.EnemyText = fighter.EnemyText.produce("test",1000);
            enemyFighter.x = Math.random()*(this.stageW-enemyFighter.width);//随机坐标
            enemyFighter.y = -enemyFighter.height-Math.random()*300;//随机坐标
            enemyFighter.addEventListener("createBullet",this.createBulletHandler,this);
            enemyFighter.fire();
            this.addChildAt(enemyFighter,this.numChildren-1);
            this.enemyTexts.push(enemyFighter);

        }

        /**创建子弹(包括我的子弹和敌机的子弹)*/
        private createBulletHandler(evt:egret.Event):void{
            var bullet:fighter.Bullet;
            var pos:number  = this.myFighter.x + this.myFighter.width / 2;
            if(evt.target==this.myFighter) {
                for(var i:number=0;i<2;i++) {
                    bullet = fighter.Bullet.produce("bullet3_png");
                    bullet.x = i==0?(pos-40):(pos+40);
                    bullet.y = this.myFighter.y;
                    this.addChildAt(bullet,this.numChildren-1-this.enemyTexts.length);
                    this.myBullets.push(bullet);
                }
            } else {
                var theFighter:fighter.Airplane = evt.target;
                bullet = fighter.Bullet.produce("bullet2_png");
                bullet.x = theFighter.x;
                bullet.y = theFighter.y+10;
                this.addChildAt(bullet,this.numChildren-1-this.enemyTexts.length);
                this.enemyBullets.push(bullet);
            }
        }

        /**游戏画面更新*/
        private gameViewUpdate(evt:egret.Event):void{
            //为了防止FPS下降造成回收慢，生成快，进而导致DRAW数量失控，需要计算一个系数，当FPS下降的时候，让运动速度加快
            var nowTime:number = egret.getTimer();
            var fps:number = 1000/(nowTime-this._lastTime);
            this._lastTime = nowTime;
            var speedOffset:number = 60/fps;
            //我的子弹运动
            var i:number = 0;
            var bullet:fighter.Bullet;
            var myBulletsCount:number = this.myBullets.length;
            for(;i < myBulletsCount;i++){
                bullet = this.myBullets[i];
                if(bullet.y < -bullet.height){
                    this.removeChild(bullet);
                    Bullet.reclaim(bullet);
                    this.myBullets.splice(i,1);
                    i--;
                    myBulletsCount--;
                }
                bullet.y -= 12 * speedOffset;

            }
            //敌人飞机运动
            var theFighter:fighter.EnemyText;
            var enemyFighterCount:number = this.enemyTexts.length;
            for(i = 0;i < enemyFighterCount;i++){
                theFighter = this.enemyTexts[i];
                if(theFighter.y>this.stage.stageHeight){
                    this.removeChild(theFighter);
                    EnemyText.reclaim(theFighter);
                    theFighter.removeEventListener("createBullet",this.createBulletHandler,this);
                    theFighter.stopFire();
                    this.enemyTexts.splice(i,1);
                    i--;
                    enemyFighterCount--;
                }
                theFighter.y += 4 * speedOffset;

            }
            //敌人子弹运动
            var enemyBulletsCount:number = this.enemyBullets.length;
            for(i = 0;i < enemyBulletsCount;i++){
                bullet = this.enemyBullets[i];
                if(bullet.y>this.stage.stageHeight){
                    this.removeChild(bullet);
                    Bullet.reclaim(bullet);
                    this.enemyBullets.splice(i,1);
                    i--;
                    enemyBulletsCount--;//数组长度已经改变
                }
                bullet.y += 8 * speedOffset;
            }
            this.gameHitTest();
        }

     

        private _touchStatus:boolean = false;              //当前触摸状态，按下时，值为true
        private _distance:egret.Point = new egret.Point(); //鼠标点击时，鼠标全局坐标与_bird的位置差

        private mouseDown(evt:egret.TouchEvent){
            this._touchStatus = true;
            this._distance.x = evt.stageX - this.myFighter.x;
            this._distance.y = evt.stageY - this.myFighter.y;
            // this.myFighter.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.mouseMove, this);
        }

        private mouseMove(evt:egret.TouchEvent){
            if( this._touchStatus )
            {
                this.myFighter.x = evt.stageX - this._distance.x;
                this.myFighter.y = evt.stageY - this._distance.y;
            }
        }

        private mouseUp(evt:egret.TouchEvent){
            this._touchStatus = false;
            // this.myFighter.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.mouseMove, this);
        }



        /**游戏碰撞检测*/
        private gameHitTest(){
            var i:number,j:number;
            var bullet:fighter.Bullet;
            var theFighter:fighter.EnemyText;
            var myBulletsCount:number = this.myBullets.length;
            var enemyFighterCount:number = this.enemyTexts.length;
            var enemyBulletsCount:number = this.enemyBullets.length;
            //将需消失的子弹和飞机记录
            var delBullets:fighter.Bullet[] = [];
            var delFighters:fighter.EnemyText[] = [];
            //我的子弹可以消灭敌机
            for(i=0; i<myBulletsCount; ++i){
                bullet = this.myBullets[i];
                for(j=0; j<enemyFighterCount; ++j){
                    theFighter = this.enemyTexts[j];
                    if(fighter.GameUtil.hitTest(theFighter,bullet)){
                        theFighter.blood -=2;
                        if(-1 == delBullets.indexOf(bullet))
                            delBullets.push(bullet);
                        if(theFighter.blood <= 0 && -1 == delFighters.indexOf(theFighter))
                            delFighters.push(theFighter);
                    }
                }
            }
            //敌人的子弹可以减我血
            for(i=0; i<enemyBulletsCount; ++i){
                bullet = this.enemyBullets[i];
                if(fighter.GameUtil.hitTest(this.myFighter,bullet)){
                    this.myFighter.blood -= 1;
                    if(-1 == delBullets.indexOf(bullet))
                        delBullets.push(bullet);
                }
            }
            //敌机的撞击可以消灭我
            for(i = 0;i<enemyFighterCount; ++i){
                theFighter = this.enemyTexts[i];
                if(fighter.GameUtil.hitTest(this.myFighter,theFighter)){
                    this.myFighter.blood -= 10;
                }
            }
            if(this.myFighter.blood <= 0){
                this.gameStop();
            }else{
                while(delBullets.length > 0){
                    bullet = delBullets.pop();
                    this.removeChild(bullet);
                    if("bullet3_png" == bullet.textureName)
                        this.myBullets.splice(this.myBullets.indexOf(bullet),1);
                    else
                        this.enemyBullets.splice(this.enemyBullets.indexOf(bullet),1);
                    fighter.Bullet.reclaim(bullet);
                }
                this.myScore += delFighters.length;
                while(delFighters.length > 0){
                    theFighter = delFighters.pop();
                    theFighter.stopFire();
                    theFighter.removeEventListener("createBullet",this.createBulletHandler,this);
                    this.removeChild(theFighter);
                    this.enemyTexts.splice(this.enemyTexts.indexOf(theFighter),1);
                    fighter.EnemyText.reclaim(theFighter);
                }
            }
        }

        private gameReStart(){
            location.reload();
        }
        

        /**游戏结束 */
        private gameStop(){
            this.addChild(this.btnReStart);
            // this.bg.pause();
            this.removeEventListener(egret.Event.ENTER_FRAME,this.gameViewUpdate,this);
            
            this.myFighter.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.mouseDown, this);
            this.myFighter.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.mouseMove, this);
            this.myFighter.removeEventListener(egret.TouchEvent.TOUCH_END, this.mouseUp, this);
            
            this.myFighter.stopFire();
            this.myFighter.removeEventListener("createBullet",this.createBulletHandler,this);
            this.enemyTextsTimer.removeEventListener(egret.TimerEvent.TIMER,this.createEnemyFighter,this);
            this.enemyTextsTimer.stop();
            //清理子弹
            var i:number = 0;
            var bullet:fighter.Bullet;
            while(this.myBullets.length > 0){
                bullet = this.myBullets.pop();
                this.removeChild(bullet);
                fighter.Bullet.reclaim(bullet);
            }
            while(this.enemyBullets.length > 0){
                bullet = this.enemyBullets.pop();
                this.removeChild(bullet);
                fighter.Bullet.reclaim(bullet);
            }
            
            //清理飞机
            var theFigher:fighter.EnemyText;
            while(this.enemyTexts.length > 0){
                theFigher = this.enemyTexts.pop();
                theFigher.stopFire();
                theFigher.removeEventListener("createBullet",this.createBulletHandler,this);
                this.removeChild(theFigher);
                fighter.EnemyText.reclaim(theFigher);
            }

            //显示成绩
            this.scorePanel.showScore(this.myScore);
            this.scorePanel.x = (this.stageW-this.scorePanel.width)/2;
            this.scorePanel.y = 100;
            this.addChild(this.scorePanel);
        }
    }
}