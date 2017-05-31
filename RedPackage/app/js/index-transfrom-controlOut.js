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
        getElePosition: function($ele){
            var _transformOriginArr = $ele[0].style.transform.split('');
            var _transformValueArrWithPX = _transformOriginArr.slice(_transformOriginArr.indexOf('(') + 1, _transformOriginArr.indexOf(')'));
            var _transformValueArrWithoutPX = _transformValueArrWithPX.filter(function(value, key){
                return !(value === 'p' || value === 'x')
            }).join('').split(',');
            return {
                x: parseFloat(_transformValueArrWithoutPX[0]),
                y: parseFloat(_transformValueArrWithoutPX[1])
            }
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
    RPR.prototype.create = function(){
        var that = this;
        var $this = $('<div id="' + that.id + '">值</div>');
        $this.css({
            // left: that.left,
            // top: that.top,
            transform: 'translate3d(' + that.left + 'px,' + that.top + 'px,0px)',
            width: that.width,
            height: that.height
            // transition: 'all ' + (constant.winHeight/that.speed) + 's linear'
            // lineHeight: that.height
        }).on('click', function(){
            console.log('shit');
        });

        option_default.$bg.append($this);
        return this;//方便放入数组
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
        var $this = $('#' + that.id);
        var vertical = Math.ceil(util.getElePosition($this).y + (that.speed * Math.cos(option_default.angle*Math.PI/180).toFixed(9)));
        var horizontal = Math.ceil(util.getElePosition($this).x + (that.speed * Math.sin(option_default.angle*Math.PI/180).toFixed(9)));
        // var left = util.getElePosition($this).x + v.speed;
        $this.css({
            //速度先写死
            // left: (option_default === 'left' ? '-' : '+') + '=' + + v.speed,
            // top: '+=' + v.speed
            // '-webkit-transform': 'translate3d(2px, 2px, 0px)'
            'transform': 'translate3d(' + horizontal +'px, ' + vertical + 'px, 0px)'
        })
    };




    (function init(){
        requestAnimationFrame(init, $('div[id^="r-"]'));
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
    })();
    (function(){
        $(document).on('touchmove touchstart', function (event) {
            event.preventDefault();
        });
        $(document).on('touchstart', 'div[id^=r-]', function(){
            var $this = $(this);
            $this.find('.J_add_one').fadeIn(function(){
                $this.fadeOut(500);
            });
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