(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
$(function(){
    //传说中优化requestAnimationFrame动画的
    // (function() {
    //     var lastTime = 0;
    //     var vendors = ['webkit', 'moz'];
    //     for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    //         window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    //         window.cancelAnimationFrame =
    //             window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    //     }
    //
    //     if (!window.requestAnimationFrame)
    //         window.requestAnimationFrame = function(callback, element) {
    //             var currTime = new Date().getTime();
    //             var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    //             var id = window.setTimeout(function() { callback(currTime + timeToCall); },
    //                 timeToCall);
    //             lastTime = currTime + timeToCall;
    //             return id;
    //         };
    //
    //     if (!window.cancelAnimationFrame)
    //         window.cancelAnimationFrame = function(id) {
    //             clearTimeout(id);
    //         };
    // }());



    var option_default = {
        angle: 0,//竖直向下方向逆时针旋转为正方向
        amount: 5,//同时出现在页面中红包的最大数量
        width: 50,//红包的宽度
        height: 80,//红包的高度
        speedRange: [300, 500],//红包的速度范围 像素/秒
        topRange: [0, 1000],//红包生成时候的随机范围,单位
        delayRange: [0, 0],//延迟下落时间，形成错落下落效果,单位毫秒
        gapHorizontalRange: [5, 10],//红包生成的左右间隔
        gapVerticalRange: [5, 10],//红包生成的上下间隔（仅针对生成红包的位置，下落过程可能出现红包速度不同而重叠的情况）
        $bg: $('#content'),//画布
        rprArr: [],//存放红包实例的数组
        winWidth: $(window).innerWidth(),
        winHeight: $(window).innerHeight() - 50
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
        makeNoOverlap: function(compareRpr){
            var left = Math.ceil(Math.random()*(option_default.winWidth - option_default.width));//生成元素时元素左边不会超过屏幕左边，元素右边不会超过屏幕右边;
            var top = Math.ceil(1 * option_default.height - util.getRandomRange(option_default.topRange));
            var $rprArr = $('div[id^="r-"]');
            var arr = Array.prototype.slice.call($rprArr);
            if(arr.length){
                var ifReload = arr.some(function(rpr){
                    var $this = $(rpr);
                    leftOld = $this.offset().left;
                    topOld = $this.offset().top;
                    //如果有一个是左右重复的
                    return ((leftOld - left > 0 && leftOld - left < compareRpr.width) || (left - leftOld > 0 && left - leftOld < option_default.width)) ||
                        ((topOld - top > 0 && topOld - top < compareRpr.height) || (top - topOld > 0 && top - topOld < option_default.height))
                });
                if(ifReload){
                    console.log('error');
                    util.makeNoOverlap(compareRpr);
                }else{
                    return {
                        'left': left,
                        'top': top
                    };
                }
            }else{
                return {
                    'left': left,
                    'top': top
                }
            }

        }
    };

    $('html').css('fontSize', '10px');

    // 构造红包雨RedPackageRain = RPR
    function RPR(){
        var that = this;
        that.id = 'r-' + new Date().getTime();
        that.$this = $('<div id="' + that.id + '" data-left="' + that.left + '">值</div>');
        that.width = option_default.width;
        that.height = option_default.height;
        that.speed = util.getRandomRange(option_default.speedRange);
        that.delay = util.getRandomRange(option_default.delayRange);// 开始时候形成错落下落效果
        // 保证生成的元素不重叠
        // that.left = Math.ceil(Math.random()*(option_default.winWidth - option_default.width));//生成元素时元素左边不会超过屏幕左边，元素右边不会超过屏幕右边
    }
    RPR.prototype.create = function(){
        var that = this;
        // var $this = $('<div id="' + that.id + '">值</div>');
        var leftAndTop = util.makeNoOverlap(that);
        var left = leftAndTop.left;
        var top = leftAndTop.top;
        that.$this.css({
            left: left,
            top: top,
            width: that.width,
            height: that.height,
            transitionProperty: 'top, left',
            transitionDuration: (option_default.winHeight/that.speed) + 's',
            transitionTimingFunction: 'ease-in'
            // transitionDelay: that.delay + 's'
        }).on('click', function(){
            $this.fadeOut(500);
        });
        option_default.$bg.append(that.$this);
        return that;
    };
    RPR.prototype.destroy = function(rpr){
        $(rpr).off('click').remove();
        // return !currentElementArr.splice(key, 1);//元素数组已经被更改，因此跳出当前循环
    };
    RPR.prototype.run = function(){
        var that = this;
        $('#' + that.id).css({
            left: that.left,//垂直下落
            top: option_default.winHeight
        });
        // return this;
    };

    // (function(){
    // option_default.$bg.append($this);
    //     // requestAnimationFrame(arguments.callee);
    //     if(option_default.rprArr.length < option_default.amount){
    //         option_default.rprArr.push(new RPR().create());
    //     }else{
    //         $.each(option_default.rprArr, function(key, rpr){
    //             var $this = $('#' + rpr.id);
    //             rpr.run();
    //             if(util.isOutOfWin($this) || $this.css('display') === 'none'){//显示超过窗口或淡出则移除
    //                 return rpr.destroy(option_default.rprArr, key);// 返回移除元素的结果，跳出当前循环, 进行下一个requestAnimationFrame循环
    //             }
    //         });
    //     }
    // })();


    (function(){
        requestAnimationFrame(arguments.callee);
        var eleArr = Array.prototype.slice.call($('div[id^="r-"]'));
        if(eleArr.length < option_default.amount){
            var tempRpr = new RPR();
            tempRpr.create();
        }else{
            $.each(eleArr, function(key, rpr){
                $(rpr).css({
                    left: $(rpr).data('left'),//垂直下落
                    top: option_default.winHeight
                });
                if(util.isOutOfWin($(rpr)) || $(rpr).css('display') === 'none'){//显示超过窗口或淡出则移除
                    return !$(rpr).off('click').remove();// 返回移除元素的结果，跳出当前循环, 进行下一个requestAnimationFrame循环
                }
            });
        }
    })();







    // (function(){
    //     if(option_default.rprArr.length < option_default.amount){
    //         option_default.rprArr.push(new RPR().create());
    //         arguments.callee();
    //     }else{
    //         $.each(option_default.rprArr, function(key, rpr){
    //             var $this = $('#' + rpr.id);
    //             rpr.run();
    //             if(util.isOutOfWin($this) || $this.css('display') === 'none'){//显示超过窗口或淡出则移除
    //                 return rpr.destroy(option_default.rprArr, key);// 返回移除元素的结果，跳出当前循环, 进行下一个requestAnimationFrame循环
    //             }
    //         });
    //         if(option_default.rprArr.length < option_default.amount){
    //
    //         }
    //     }
    // })();


});
},{}]},{},[1])