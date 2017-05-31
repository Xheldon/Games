$(function(){
    // 传说中优化requestAnimationFrame动画的
    (function() {
        var lastTime = 0;
        var vendors = ['webkit', 'moz'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame =
                window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());



    var option_default = {
        amount: 8,//同时出现在页面中红包的最大数量
        get width(){
            return this.winWidth/(this.amount*1.2);//红包的宽度，为防止makeNoOverlap循环调用，最好是将其设置为屏幕宽度的 红包数量2倍的数值
        },
        get height(){
            return this.winHeight/(this.amount*1.5);//红包的高度
        },
        speedRange: [150, 300],//红包的速度范围 像素/秒
        get topRange(){
            return [0, this.height*5];
        },//红包生成时候的随机范围,单位
        delayRange: [0, 300],//延迟下落时间，形成错落下落效果,单位毫秒
        allowedOverlap: 0.3,// 允许重叠的百分比，1为不允许重叠，0为允许完全重叠
        gapHorizontalRange: [5, 10],//红包生成的左右间隔
        gapVerticalRange: [5, 10],//红包生成的上下间隔（仅针对生成红包的位置，下落过程可能出现红包速度不同而重叠的情况）
        $bg: $('#content'),//画布
        rprObj: {length: 0},//存放红包实例的对象
        winWidth: $(window).innerWidth(),
        winHeight: $(window).innerHeight()
    };

    var util = {
        isOutOfWin: function($ele){
            var isOutOfInLeft = $ele.offset().left + $ele.innerWidth() <= 0,//超过左边的边界
                isOutOfInRight = $ele.offset().left >= option_default.winWidth,//超过屏幕右边的边界
                isOutOfInBottom = $ele.offset().top >= option_default.winHeight;//超过屏幕下面的边界
            return (isOutOfInLeft || isOutOfInRight || isOutOfInBottom);
        },
        getRandomRange: function(range){
            return Math.ceil(Math.random() * (range[1] - range[0]) + range[0]);
        },
        makeNoOverlap: function(compareRpr, cb){
            var left = Math.ceil(Math.random()*(option_default.winWidth - option_default.width));//生成元素时元素左边不会超过屏幕左边，元素右边不会超过屏幕右边;
            var top = Math.ceil(-1 * option_default.height - util.getRandomRange(option_default.topRange));
            var $rprArr = $('div[id^="r-"]');
            var arr = Array.prototype.slice.call($rprArr);
            if(arr.length){
                var ifReload = arr.some(function(rpr){
                    var $this = $(rpr);
                    var leftOld = $this.offset().left;
                    //如果新建元素是左右或者上下重复是左右重复的
                    return ((leftOld - left > 0 && leftOld - left < compareRpr.width) || (left - leftOld > 0 && left - leftOld < option_default.width))
                });
                if(ifReload){
                    arguments.callee(compareRpr, cb);
                }else{
                    // 直接return存在执行过快导致的未返回情况，因此将写到回调中
                    cb({
                        'left': left,
                        'top': top
                    });
                }
            }else{
                cb({
                    'left': left,
                    'top': top
                });
            }

        }
    };

    $('html').css('fontSize', '10px');

    // 构造红包雨RedPackageRain = RPR
    function RPR(){
        var that = this;
        that.id = 'r-' + new Date().getTime();
        that.$this = $('<div id="' + that.id + '">值</div>');
        that.width = option_default.width;
        that.height = option_default.height;
        that.speed = util.getRandomRange(option_default.speedRange);
        that.delay = util.getRandomRange(option_default.delayRange);// 开始时候形成错落下落效果
        util.makeNoOverlap(that, function(leftAndTop){
            that.left = leftAndTop.left;
            that.top = leftAndTop.top;
        });
    }
    RPR.prototype.create = function(cb){
        var that = this;
        that.$this.css({
            left: that.left,
            top: that.top,
            width: that.width,
            height: that.height,
            transitionProperty: 'top',
            transitionDuration: (option_default.winHeight/that.speed) + 's',
            transitionTimingFunction: 'ease-in',
            transitionDelay: that.delay + 'ms'
        }).on('click', function(){
            var $this = $(this);
            $this.find('.J_add_one').fadeIn(function(){
                $this.css('pointer-event', 'none').fadeOut(500);
            });
        }).appendTo(option_default.$bg);
        cb(that);
    };
    RPR.prototype.destroy = function($rpr, animationId){
        cancelAnimationFrame(animationId);
        $rpr.off('click').remove();
    };
    RPR.prototype.run = function(){
        var that = this;
        var $this = $('#' + that.id);
        var animationId = requestAnimationFrame(that.run.bind(that));
        $this.css({
            left: that.left,//垂直下落
            top: option_default.winHeight
        });
        if(util.isOutOfWin($this) || $this.css('display') === 'none'){
            that.destroy($this, animationId);
            (new RPR()).create(function(rpr){
                setTimeout(function(){
                    rpr.run();
                }, 0);//将动画队列挪到执行线程最后
            });
        }
    };
    for(var i=0;i<option_default.amount;i++){
        (new RPR()).create(function(rpr){
            rpr.run();
        });
    }
});