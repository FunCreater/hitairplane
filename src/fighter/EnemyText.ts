module fighter
{

    export class EnemyText extends egret.DisplayObjectContainer
    {
        /**敌人text */
        private txt:egret.TextField;
        /**创建子弹的时间间隔*/
        private fireDelay:number;
        /**定时射*/
        private fireTimer:egret.Timer;
        /**飞机生命值*/
        public blood:number = 10;
        //可视为飞机类型名
        public textureName:string;
        public constructor(text:string,fireDelay:number) {
            super();
            this.fireDelay = fireDelay;
            this.txt = new egret.TextField();
            this.txt.textAlign = "center";
            this.txt.textColor = 0xFFFFFF;
            this.txt.size = 12;
            this.txt.text = "测试";
            // this.txt.y = 60;

            this.addChild(this.txt);
            this.fireTimer = new egret.Timer(fireDelay);
            this.fireTimer.addEventListener(egret.TimerEvent.TIMER,this.createBullet,this);
        }
        /**开火*/
        public fire():void {
            this.fireTimer.start();
        }
        /**停火*/
        public stopFire():void {
            this.fireTimer.stop();
        }
        /**创建子弹*/
        private createBullet(evt:egret.TimerEvent):void {
            this.dispatchEventWith("createBullet");
        }


        private static cacheDict:Object = {};
        /**
        /**生产*/
        public static produce(text:string,fireDelay:number):fighter.EnemyText
        {    
            // if(fighter.EnemyText.cacheDict[textureName]==null)
            //     fighter.EnemyText.cacheDict[textureName] = [];
            // var dict:fighter.EnemyText[] = fighter.EnemyText.cacheDict[textureName];
            var theFighter:fighter.EnemyText;
            // if(dict.length>0) {
            //     theFighter = dict.pop();
            // } else {
                theFighter = new fighter.EnemyText(text,fireDelay);
            // }
            theFighter.blood = 10;
            return theFighter;
        }
        /**回收*/
        public static reclaim(theFighter:fighter.EnemyText):void
        {
            // var textureName: string = theFighter.textureName;
            // if(fighter.EnemyText.cacheDict[textureName]==null)
            //     fighter.EnemyText.cacheDict[textureName] = [];
            // var dict:fighter.EnemyText[] = fighter.EnemyText.cacheDict[textureName];
            // if(dict.indexOf(theFighter)==-1)
            //     dict.push(theFighter);
        }
    }
}