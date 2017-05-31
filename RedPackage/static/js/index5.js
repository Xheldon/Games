(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
        angle: 0,//竖直向下方向逆时针旋转为正方向
        amount: 10,//同时出现在页面中红包的最大数量
        width: 20,//红包的宽度
        height: 20,//红包的高度
        speedRange: [200, 500],//红包的速度范围 像素/秒
        topRange: [0, 500],//红包生成时候的随机范围,单位
        delayRange: [0, 0.5],//延迟下落时间，形成错落下落效果,单位毫秒
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
                    var topOld = $this.offset().top;
                    //如果新建元素是左右或者上下重复是左右重复的
                    return ((leftOld - left > 0 && leftOld - left < compareRpr.width) || (left - leftOld > 0 && left - leftOld < option_default.width)) ||
                        ((topOld - top > 0 && topOld - top < compareRpr.height) || (top - topOld > 0 && top - topOld < option_default.height))
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
    RPR.prototype.create = function(){
        var that = this;
        that.$this.css({
            left: that.left,
            top: that.top,
            width: that.width,
            height: that.height,
            transitionProperty: 'top, left',
            transitionDuration: (option_default.winHeight/that.speed) + 's',
            transitionTimingFunction: 'ease-in',
            transitionDelay: that.delay + 's'
        });
        option_default.$bg.append(that.$this);
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
            left: that.left,//垂直下落
            top: option_default.winHeight
        });
    };

    (function(){
        requestAnimationFrame(arguments.callee);
        if(option_default.rprObj.length < option_default.amount){
            option_default.rprObj.length += 1;
            var rprTemp = new RPR();
            option_default.rprObj[rprTemp.id] = rprTemp.create();
        }else{
            for(var id in option_default.rprObj){
                if(option_default.rprObj.hasOwnProperty(id) && id !== 'length'){
                    var rpr = option_default.rprObj[id];
                    var $this = $('#' + rpr.id);
                    rpr.run();
                    if(util.isOutOfWin($this) || $this.css('display') === 'none'){
                        rpr.destroy(option_default.rprObj, option_default.rprObj[id]);
                    }
                }
            }
        }
    })();
    (function(){
        $(document).on('click', 'div[id^=r-]', function(){
            var $this = $(this);
            $this.fadeOut(500);
        });
    })();
});
},{}]},{},[1])