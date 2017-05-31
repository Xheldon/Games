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


    var constant = {
        $bg: $('#content'),//画布
        winWidth: $(window).innerWidth(),
        winHeight: $(window).innerHeight(),
        rprObj: {length: 0}//存放红包实例的对象
    };


    var option_default = {
        amount: 8,//同时出现在页面中红包的最大数量
        get width(){
          return constant.winWidth/(this.amount*1.2);//红包的宽度，为防止makeNoOverlap循环调用，最好是将其设置为屏幕宽度的 红包数量2倍的数值
        },
        get height(){
            return constant.winHeight/(this.amount*1.5);//红包的高度
        },
        speedRange: [150, 300],//红包的速度范围 像素/秒
        get topRange(){
            return [0, this.height*5];
        } ,//红包生成时候的随机范围,单位
        delayRange: [0, 300],//延迟下落时间，形成错落下落效果,单位毫秒
        allowedOverlap: 0.3// 允许重叠的百分比，1为不允许重叠，0为允许完全重叠
    };

    var util = {
        isOutOfWin: function($ele){
            var isOutOfInLeft = $ele.offset().left + $ele.innerWidth() <= 0,//超过左边的边界
                isOutOfInRight = $ele.offset().left >= constant.winWidth,//超过屏幕右边的边界
                isOutOfInBottom = $ele.offset().top >= constant.winHeight;//超过屏幕下面的边界
            return (isOutOfInLeft || isOutOfInRight || isOutOfInBottom);
        },
        getRandomRange: function(range){
            return Math.ceil(Math.random() * (range[1] - range[0]) + range[0]);
        },
        makeNoOverlap: function(rprObj, compareRpr, cb){
            var left = Math.ceil(Math.random()*(constant.winWidth - option_default.width));//生成元素时元素左边不会超过屏幕左边，元素右边不会超过屏幕右边;
            var top = Math.ceil(-1 * option_default.height - util.getRandomRange(option_default.topRange));
            var rprArr = Object.keys(rprObj);
            if(rprArr.length){
                var ifReload = rprArr.some(function(rpr){
                    if(rpr !== 'length'){
                        var rprOld = rprObj[rpr];
                        var leftOld = rprOld.left;
                        var topOld = rprOld.top;
                        //如果新建元素是左右或者上下重复是左右重复的
                        return ((leftOld - left >= 0 && leftOld - left <= compareRpr.width*(option_default.allowedOverlap)) || (left - leftOld >= 0 && left - leftOld <= option_default.width*(option_default.allowedOverlap)));
                    }
                });
                if(ifReload){
                    arguments.callee(rprObj, compareRpr, cb);
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
        },
        countDown: function(time, cb){
            setTimeout(function(){
                cb();
            }, time);
        }
    };

    $('html').css('fontSize', '10px');

    // 构造红包雨RedPackageRain = RPR
    function RPR(){
        var that = this;
        that.id = 'r-' + new Date().getTime();
        that.$this = $('<div id="' + that.id + '">值<div class="J_add_one add-one">+1</div>');
        that.width = option_default.width;
        that.height = option_default.height;
        that.speed = util.getRandomRange(option_default.speedRange);
        that.delay = util.getRandomRange(option_default.delayRange);// 开始时候形成错落下落效果
        util.makeNoOverlap(constant.rprObj, that, function(leftAndTop){
            that.left = leftAndTop.left;
            that.top = leftAndTop.top;
        });
    }
    RPR.prototype.create = function(){
        var that = this;
        that.$this.css({
            transform: "translate3d("+ that.left +"px,"+ that.top + "px, 0px)",
            width: that.width,
            height: that.height,
            transitionProperty: 'transform',
            // '-webkit-transitionProperty': 'top, left',
            transitionDuration: (constant.winHeight/that.speed) + 's',
            // '-webkit-transitionDuration': (constant.winHeight/that.speed) + 's',
            transitionTimingFunction: 'ease-in',
            // '-webkit-transitionTimingFunction': 'ease-in',
            transitionDelay: that.delay + 'ms'
            // '-webkit-transitionDelay': that.delay + 's'
        }).on('touchstart', function(){
            var $this = $(this);
            $this.find('.J_add_one').fadeIn(function(){
                $this.fadeOut(500);
            });
        });
        constant.$bg.append(that.$this);
        return that;
    };
    RPR.prototype.destroy = function(rprObj, rpr){
        var that = this;
        var $this = $('#' + rpr.id);
        $this.off('click').remove();
        rprObj.length -= 1;
        delete rprObj[rpr.id];
    };
    RPR.prototype.run = function(){
        var that = this;
        $('#' + that.id).css({
            transform: "translate3d("+ that.left +"px,"+ constant.winHeight + "px, 0px)"
        });
    };
    window.init = function(){
        requestAnimationFrame(arguments.callee);
        if(constant.rprObj.length < option_default.amount){
            constant.rprObj.length += 1;
            var rprTemp = new RPR();
            constant.rprObj[rprTemp.id] = rprTemp.create();
        }else{
            for(var id in constant.rprObj){
                if(constant.rprObj.hasOwnProperty(id) && id !== 'length'){
                    var rpr = constant.rprObj[id];
                    var $this = $('#' + rpr.id);
                    rpr.run();
                    if(util.isOutOfWin($this) || $this.css('display') === 'none'){
                        rpr.destroy(constant.rprObj, constant.rprObj[id]);
                    }
                }
            }
        }
    };
    init();
    (function(){
        // $(document).on('touchmove touchstart', function (event) {
        //     event.preventDefault();
        // });
        // $(document).on('touchstart', 'div[id^=r-]', function(){
        //
        // });
        // $(document).on('touchstart', 'div#start', function(){
        //     var $count = function(){
        //             return $('#J_countdown');
        //         },
        //     countDown = function(){
        //         return $count().html();
        //     };
        //     util.countDown(1000, function(){
        //        if(parseInt(countDown()) === 0){
        //            init();
        //        }else{
        //            $count().html(parseInt(countDown()) - 1);
        //            util.countDown(1000, arguments.callee);
        //        }
        //     });
        // });
    })();
});