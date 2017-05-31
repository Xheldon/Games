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
        get width(){
            return constant.winWidth/(this.amount*1.2);//红包的宽度，为防止makeNoOverlap循环调用，最好是将其设置为屏幕宽度的 红包数量2倍的数值
        },
        get height(){
            return constant.winHeight/(this.amount*1.5);//红包的高度
        },
        speedRange: [100, 250],//红包的速度范围 像素/秒
        get topRange(){
            return [0, this.height*5];
        },//红包生成时候的随机范围,单位
        $bg: $('#content'),
        winWidth: $(window).innerWidth(),
        winHeight: $(window).innerHeight(),
        allowedOverlap: 0.3// 允许重叠的百分比，1为不允许重叠，0为允许完全重叠
    };

    var constant = {
        rprObj: {length: 0},
        winWidth: $(window).innerWidth(),
        winHeight: $(window).innerHeight(),
        $rprTpl: $('#J_rpr_tpl')
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
                    return ((leftOld - left >= 0 && leftOld - left <= compareRpr.width*(option_default.allowedOverlap)) || (left - leftOld >= 0 && left - leftOld <= option_default.width*(option_default.allowedOverlap)))
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

        },
        countDown: function(time, cb){
            setTimeout(function(){
                cb();
            }, time);
        }
    };
    $('html').css('fontSize', '10px');

    // 构造红包雨RedPackageRain
    function RPR(){
        var that = this;
        that.id = 'r-' + new Date().getTime();
        that.width = option_default.width;
        that.height = option_default.height;
        that.speed = Math.random() * 10 + 2;
        that.delay = Math.random() * 800;// 开始时候形成错落下落效果
        util.makeNoOverlap(that, function(leftAndTop){
            that.left = leftAndTop.left;
            that.top = leftAndTop.top;
        });
    }
    RPR.prototype.create = function(cb){
        var that = this;
        constant.$rprTpl.clone().attr('id', that.id).css({
            transform: 'translate3d(' + that.left + 'px,' + that.top + 'px,0px)',
            width: that.width,
            height: that.height
        }).on('touchstart', function(){
            var $this = $(this);
            $this.find('.J_add_one').fadeIn(function(){
                $this.css('pointer-event', 'none').fadeOut(500);
            });
        }).appendTo(option_default.$bg);
        cb(that);
    };
    RPR.prototype.destroy = function($rpr, animationId){
        cancelAnimationFrame(animationId);
        $rpr.off('touchstart').remove();
    };
    RPR.prototype.over = function($rpr, animationId){
        $rpr.off('touchstart');
        cancelAnimationFrame(animationId);
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
                that.destroy($this, animationId);
                (new RPR()).create(function(rpr){
                    setTimeout(function(){
                        rpr.run();
                    }, 0);
                });
            }
            if(parseInt($('#J_countdown_game').html()) === 0){
                that.over($this, animationId);
            }
        });
    };

    window.init = function(){
        for(var i=0;i<option_default.amount;i++){
            (new RPR()).create(function(rpr){
                rpr.run();
            });
        }
    };



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
            var $countGame = function(){
                return $('#J_countdown_game');
            },
            countDownGame = function(){
                return $countGame().html();
            };
            util.countDown(1000, function(){
                if(parseInt(countDown()) === 0){
                    init();
                    util.countDown(1000, function(){
                        if(parseInt(countDownGame()) !==0){
                            $countGame().html(parseInt(countDownGame()) - 1);
                            util.countDown(1000, arguments.callee);
                        }else{
                            //游戏结束
                            console.log('游戏结束');
                        }
                    })
                }else{
                    $count().html(parseInt(countDown()) - 1);
                    util.countDown(1000, arguments.callee);
                }
            });
        });
    })();
});