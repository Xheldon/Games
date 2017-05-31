(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
$(function(){
    //传说中优化requestAnimationFrame动画的
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
        amount: 8,//同时出现在页面中红包的最大数量
        width: 80,//红包的宽度
        height: 100,//红包的高度
        $bg: $('#content')
    };

    var constant = {
        rprObj: {length: 0},
        winWidth: $(window).innerWidth(),
        winHeight: $(window).innerHeight()
    };
    var util = {
        isOutOfWin: function($ele){
            var isOutOfInLeft = $ele.offset().left + $ele.innerWidth() <= 0,//超过左边的边界
                isOutOfInRight = $ele.offset().left >= constant.winWidth,//超过屏幕右边的边界
                isOutOfInBottom = $ele.offset().top >= constant.winHeight;//超过屏幕下面的边界
            return (isOutOfInLeft || isOutOfInRight || isOutOfInBottom);
        },
        getElePosition: function($ele, cb){
            var _transformOriginArr = $ele[0].style.transform.split('');
            var _transformValueArrWithPX = _transformOriginArr.slice(_transformOriginArr.indexOf('(') + 1, _transformOriginArr.indexOf(')'));
            var _transformValueArrWithoutPX = _transformValueArrWithPX.filter(function(value, key){
                return !(value === 'p' || value === 'x')
            }).join('').split(',');
            cb({
                x: parseFloat(_transformValueArrWithoutPX[0]),
                y: parseFloat(_transformValueArrWithoutPX[1])
            });
        }
    };
    $('html').css('fontSize', '10px');

    // 构造红包雨RedPackageRain
    function RPR(){
        this.id = 'r-' + new Date().getTime();
        this.width = option_default.width;
        this.height = option_default.height;
        this.left = Math.ceil(Math.random()*(constant.winWidth - option_default.width)) ;
        this.top = Math.ceil(-1 * option_default.height - (Math.random()*20 + 90));
        this.speed = Math.random() * 10 + 2;
        this.delay = Math.random() * 800;// 开始时候形成错落下落效果
    }
    RPR.prototype.create = function(cb, animationId){
        var that = this;
        var $this = $('<div id="' + that.id + '">值</div>');
        $this.css({
            transform: 'translate3d(' + that.left + 'px,' + that.top + 'px,0px)',
            width: that.width,
            height: that.height
        }).on('click', function(){
            var $this = $(this);
            cancelAnimationFrame(animationId);
            $this.find('.J_add_one').fadeIn(function(){
                $this.fadeOut(500);
            });
        }).appendTo(option_default.$bg);
        cb(that);
    };
    RPR.prototype.destroy = function(rpr, animationId){
        var $this = $('#' + rpr.id);
        cancelAnimationFrame(animationId);
        $this.off('click').remove();
    };
    RPR.prototype.run = function(){
        var that = this;
        var $this = $('#' + that.id);
        var animationId = requestAnimationFrame(that.run.bind(that));
        var vertical,horizontal;
        util.getElePosition($this, function(position){
            vertical = Math.ceil(position.y + (that.speed * Math.cos(option_default.angle*Math.PI/180).toFixed(2)));
            horizontal = Math.ceil(position.x + (that.speed * Math.sin(option_default.angle*Math.PI/180).toFixed(2)));
            $this.css({
                'transform': 'translate3d(' + horizontal +'px, ' + vertical + 'px, 0px)'
            });
            if(util.isOutOfWin($this) || $this.css('display') === 'none'){
                that.destroy(that, animationId);
                (new RPR()).create(function(rpr){
                    rpr.run();
                }, animationId);
            }
        });
        console.log($('div[id^="r-"]').length);
        return that;
    };

    for(var i=0;i<option_default.amount;i++){
        (new RPR()).create(function(rpr){
            rpr.run();
        });
    }



    (function(){
        $(document).on('touchmove touchstart', function (event) {
            event.preventDefault();
        });
        $(document).on('touchstart', 'div#start', function(){
            var $count = function(){
                    return $('#J_countdown');
                },
                countDown = function(){
                    return $count().html();
                };
            util.countDown(1000, function(){
                if(parseInt(countDown()) === 0){
                    init();
                }else{
                    $count().html(parseInt(countDown()) - 1);
                    util.countDown(1000, arguments.callee);
                }
            });
        });
    })();
});
},{}]},{},[1])