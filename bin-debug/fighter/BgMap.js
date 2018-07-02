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
     * 可滚动的底图
     */
    var BgMap = (function (_super) {
        __extends(BgMap, _super);
        function BgMap() {
            var _this = _super.call(this) || this;
            /**控制滚动速度*/
            _this.speed = 2;
            _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this.onAddToStage, _this);
            return _this;
        }
        /**初始化*/
        BgMap.prototype.onAddToStage = function (event) {
            this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
            this.stageW = this.stage.stageWidth;
            this.stageH = this.stage.stageHeight;
            var texture = RES.getRes("nier_jpg");
            this.textureHeight = texture.textureHeight; //保留原始纹理的高度，用于后续的计算
            this.rowCount = Math.ceil(this.stageH / this.textureHeight) + 1; //计算在当前屏幕中，需要的图片数量
            this.bmpArr = [];
            //创建这些图片，并设置y坐标，让它们连接起来
            for (var i = 0; i < this.rowCount; i++) {
                var bgBmp = fighter.createBitmapByName("bg_jpg");
                bgBmp.y = this.textureHeight * i - (this.textureHeight * this.rowCount - this.stageH);
                this.bmpArr.push(bgBmp);
                this.addChild(bgBmp);
            }
        };
        /**开始滚动*/
        BgMap.prototype.start = function () {
            this.removeEventListener(egret.Event.ENTER_FRAME, this.enterFrameHandler, this);
            this.addEventListener(egret.Event.ENTER_FRAME, this.enterFrameHandler, this);
        };
        /**逐帧运动*/
        BgMap.prototype.enterFrameHandler = function (event) {
            for (var i = 0; i < this.rowCount; i++) {
                var bgBmp = this.bmpArr[i];
                bgBmp.y += this.speed;
                //判断超出屏幕后，回到队首，这样来实现循环反复
                if (bgBmp.y > this.stageH) {
                    bgBmp.y = this.bmpArr[0].y - this.textureHeight;
                    this.bmpArr.pop();
                    this.bmpArr.unshift(bgBmp);
                }
            }
        };
        /**暂停滚动*/
        BgMap.prototype.pause = function () {
            this.removeEventListener(egret.Event.ENTER_FRAME, this.enterFrameHandler, this);
        };
        return BgMap;
    }(egret.DisplayObjectContainer));
    fighter.BgMap = BgMap;
    __reflect(BgMap.prototype, "fighter.BgMap");
})(fighter || (fighter = {}));
//# sourceMappingURL=BgMap.js.map