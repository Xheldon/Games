(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
$(function(){
    // 检测是否是在客户端
    var ua = navigator.userAgent;
    if(/xheldonapp/i.test(ua)){
        alert('是在客户端中');
    }else{
        alert('不是在客户端中');
    }
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
    // 全局使用的变量，使用过程中会变化的dom均使用function返回;被同级键使用的使用get方法定义
    var constant = {
        amount: 8,//同时出现在页面中红包的最大数量
        get width(){
            return Math.ceil(constant.winWidth/(this.amount));//红包的宽度，为防止makeNoOverlap循环调用，最好是将其设置为屏幕宽度的 红包数量2倍的数值
        },
        get height(){
            return Math.ceil(constant.winHeight/(this.amount*1.5));//红包的高度
        },
        // speedRange: [100, 250],//红包的速度范围 像素/秒
        speedRange: [2, 7],//红包的速度范围 像素/秒
        get topRange(){
            return [0, this.height*5];
        },//红包生成时候的随机范围,单位
        $bg: $('#game-content'),//游戏进行的画布
        winWidth: $(window).innerWidth(),//窗口宽度
        winHeight: $(window).innerHeight(),//窗口高度
        allowedOverlap: 0.1,// 允许重叠的百分比，1为不允许重叠，0为允许完全重叠
        $rprTpl: $('.J_rpr_tpl'),// 红包模板
        $countStart: function(){//开始倒计时
            return $('#J_countdown_start');
        },
        countDownToStart: function(){
            return this.$countStart().html();
        },
        $countOver: function(){//结束倒计时
            return $('#J_countdown_over');
        },
        countDownToOver: function(){
            return this.$countOver().html();
        },
        $coverPage: $('#cover'),//遮罩浮层
        $pop: $('#pop-chance'),
        $rank: $('#rank-content'),
        $popRule: $('#pop-rule-content'),
        $scrollEle: $('#rank-content, #pop-rule-content'),
        $playTimes: $('#play-times'),
        $indexPage: $('#index'),
        $gamePage: $('#game'),
        $rankPage: $('#rank'),
        $popPage: $('.pop'),
        remainPlayTimes: 0,
        zhiCount: 0,
        myRank: 0
    };
    var util = {
        /*判断元素是否超过边界*/
        isOutOfWin: function($ele){
            return $ele.offset().top >= constant.winHeight - constant.winWidth*0.3333;//超过屏幕下面的边界

        },
        /*获取元素transform属性的translateY中的数值*/
        getElePosition: function($ele, cb){
            var _transformOriginArr = $ele[0].style.transform.split('');
            var _transformValueArrWithPX = _transformOriginArr.slice(_transformOriginArr.indexOf('(') + 1, _transformOriginArr.indexOf(')'));
            var _transformValueArrWithoutPX = _transformValueArrWithPX.filter(function(value){
                return !(value === 'p' || value === 'x')
            }).join('').split(',');
            cb({
                y: parseInt(_transformValueArrWithoutPX[1])
            });
        },
        /*根据给定数组返回一个该数组范围规定的随机值(数组严格按照左边为较小值，右边为较大值传递)*/
        getRandomRange: function(range){
            return Math.ceil(Math.random() * (range[1] - range[0]) + range[0]);
        },
        /*使新生成的值不再相同地方重新生成，compareRpr为当前生成的红包元素实例*/
        makeNoOverlap: function(compareRpr, cb){
            var left = Math.ceil(Math.random()*(constant.winWidth - constant.width));//生成元素时元素左边不会超过屏幕左边，元素右边不会超过屏幕右边;
            var top = Math.ceil(-1 * constant.height - util.getRandomRange(constant.topRange));
            var $rprArr = $('div[id^="r-"]');
            var arr = Array.prototype.slice.call($rprArr);
            if(arr.length){
                var ifReload = arr.some(function(rpr){
                    var $this = $(rpr);
                    var leftOld = $this.offset().left;
                    return ((leftOld - left >= 0 && leftOld - left <= compareRpr.width*(constant.allowedOverlap)) || (left - leftOld >= 0 && left - leftOld <= constant.width*(constant.allowedOverlap)))
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
        /*倒计时函数*/
        countDown: function(cb){
            setTimeout(function(){
                cb();
            }, 1000);
        },
        /*弹窗函数*/
        pop: function(link, options){
            //样式配置
            $('style').remove();
            $('<style>#pop-chance-divide:before{background-color: '+ options.fgColor +';box-shadow: 0 0 0 5px '+ options.fgColor +';}</style>').appendTo('head');
            constant.$coverPage.show();
            if(options.btn[0]){
                $('#pop-chance-btn').html('<span id="'+ options.btn[2] +'">' + options.btn[1] + '</span>').show();
            }else{
                $('#pop-chance-btn').hide();
            }
            constant.$pop.css({
                backgroundColor: options.fgColor
            }).find('#pop-chance-fg').css({
                borderColor: options.fgBorderColor
            }).find('#pop-chance-msg').html(options.msg).end()
                .find('#pop-chance-recommend').attr('href', link.url).html('<span>' + link.title + '</span>').end().end()
                .find('#pop-chance-options').css({
                backgroundImage: options.bgImg
            }).end().show();
        },
        /*滚动事件，阻止内部元素滚动到底部之后外部元素继续滚动;优化微信内滑动页面则会滚动漏出当前页面由谁提供的『bug』*/
        scrollEvent: function(e){
            e.stopPropagation();
            var moveEndX = e.originalEvent.changedTouches[0].pageX,
                moveEndY = e.originalEvent.changedTouches[0].pageY,
                X = moveEndX - startX,
                Y = moveEndY - startY;
            if(Math.abs(Y) < Math.abs(X)){
                e.preventDefault();
                return false;
            }
            if($(e.target).parents('#rank-content').length){
                if(constant.$rank.scrollTop() + constant.$rank.outerHeight() >= $('#rank-list').outerHeight() + $('#rank-info').outerHeight() + $('#rank-divide').outerHeight(true)){
                    //滑到底部
                    if(Y < 0){
                        e.preventDefault();
                        return false;
                    }
                }
                if(constant.$rank.scrollTop() === 0){
                    if(Y > 0){
                        e.preventDefault();
                        return false;
                    }
                }
            }else if($(e.target).parents('#pop-rule-fg').length){
                if(constant.$popRule.scrollTop() + constant.$popRule.outerHeight(true) >= $('#pop-rule-title').outerHeight(true) + $('#pop-rule-content').outerHeight(true)){
                    //滑到底部
                    if(Y < 0){
                        e.preventDefault();
                        return false;
                    }
                }
                if(constant.$popRule.scrollTop() === 0){
                    if(Y > 0){
                        e.preventDefault();
                        return false;
                    }
                }
            }
        },
        reloadPage: function(isDelay){
            if(isDelay){
                setTimeout(function(){
                    location.reload();
                }, 3000);
            }else{
                location.reload();
            }
        },
        flowControl: function(page){
            switch(page){
                case 'index':
                    constant.$indexPage.fadeIn();
                    constant.$coverPage.fadeOut();
                    constant.$popPage.fadeOut();
                    constant.$gamePage.fadeOut();
                    constant.$rankPage.fadeOut();
                    break;
                case 'game':
                    constant.$gamePage.fadeIn();
                    constant.$coverPage.fadeOut();
                    constant.$popPage.fadeOut();
                    constant.$indexPage.fadeOut();
                    constant.$rankPage.fadeOut();
                    break;
                case 'rank':
                    constant.$rankPage.fadeIn();
                    constant.$coverPage.fadeOut();
                    constant.$popPage.fadeOut();
                    constant.$indexPage.fadeOut();
                    constant.$gamePage.fadeOut();
                    break;
            }
        },
        ajaxRequest:  function(options, cb){
            var options_default = {
                type: 'GET',
                dataType: 'jsonp'
            };
            $.ajax($.extend(options_default, options)).done(cb).fail(function(){
                console.log('请求失败!');
                console.log('参数信息：', arguments);
            })
        },
        init: function(cb){
            //游戏开始界面
            util.flowControl('game');
            $('#clock-big').hide();
            $('div[id^=r-]').remove();
            for(var i=0;i<constant.amount;i++){
                (new RPR()).create(function(rpr){
                    rpr.run();
                });
            }
            //发送游戏开始事件，服务端将在接下来的20-25秒内接受点值点击事件和结束事件
            util.ajaxRequest({
                url: 'http://h5.xheldon.com/chunjiedianzhi/ajax_start_play',
                type: 'POST',
                dataType: 'json'
            }, function(resp){
                if(resp.error_code === 0){
                    if(resp.data == 0){//data可能是数组和数值(文涛文档中写的是数值，实际使用时是空数组，因此模糊判断)
                        cb(resp.data);
                    }else{
                        console.log('data不为数字0，具体信息返回：',resp);
                        alert('请求『开始游戏』接口异常，请刷新重试或联系开发！');
                    }
                }else{
                    console.log('error_code不为0，具体信息返回：',resp);
                    alert('请求『开始游戏』接口异常，请刷新重试或联系开发！');
                }
            });
        },
        //为了复用已经写好的函数
        forReuse: {
            add: function(resp, reuseFunc) {
                for (var i in this) {
                    if (this.hasOwnProperty(i)) {
                        if (reuseFunc.prototype.constructor.name === i) {
                            console.error('重用函数名字已经存在，请修改函数名！');
                            return false;
                        }
                    }
                }
                forReuse[reuseFunc.prototype.constructor.name] = reuseFunc.bind(reuseFunc);
                reuseFunc(resp);
            }
        }
    };


    // 构造红包雨RedPackageRain
    function RPR(){
        var that = this;
        that.id = 'r-' + new Date().getTime();
        that.width = constant.width;
        that.height = constant.height;
        that.speed = util.getRandomRange(constant.speedRange);
        that.delay = Math.ceil(Math.random() * 800);// 开始时候形成错落下落效果
        util.makeNoOverlap(that, function(leftAndTop){
            that.left = leftAndTop.left;
            that.top = leftAndTop.top;
        });
    }
    RPR.prototype.create = function(cb){
        var that = this;
        constant.$rprTpl.clone().attr('id', that.id).css({
            display: 'block',
            transform: 'translate3d(' + that.left + 'px,' + that.top + 'px,0px)',
            width: that.width,
            height: that.height
        }).find('img').attr('src', '/img/game/game-zhi-' + Math.ceil(Math.random() * 5) + '.png').end().on('touchstart', function(){
            var $this = $(this);
            util.ajaxRequest({
                type: 'POST',
                url: 'http://h5.xheldon.com/chunjiedianzhi/ajax_click',
                dataType: 'json',
                data: {
                    click_time: new Date().getTime(),
                    click_index: (constant.zhiCount++)
                }
            }, function(resp){
                if(resp.error_code !== 0){
                    console.log('有一个值点击发送但是没有成功哦~');
                }else{
                    if(resp.data != 0){
                        console.log('有一个值点击发送成功但是没有计数哦~');
                    }
                }
            });

            $this.find('.J_add_one').animate({
                opacity: '1',
                top: '-20px'
            }, function(){
                $(this).fadeOut();
                $this.css('pointer-event', 'none').fadeOut(500);
            });
        }).appendTo(constant.$bg);
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
        var animationId = requestAnimationFrame(this.run.bind(this));
        var that = this;
        var $this = $('#' + that.id);
        var vertical;
        util.getElePosition($this, function(position){
            vertical = Math.ceil(position.y + (that.speed));
            $this.css({
                'transform': 'translate3d(' + that.left +'px, ' + vertical + 'px, 0px)'
            });
        });

        if(util.isOutOfWin($this) || $this.css('display') === 'none'){
            that.destroy($this, animationId);
            (new RPR()).create(function(rpr){
                setTimeout(function(){
                    rpr.run();
                }, 0);
            });
        }
        if(parseInt($('#J_countdown_over').html()) === 0){
            that.over($this, animationId);
        }
    };

    (function(){
        // 设置字体缩放
        $('html').css('fontSize', '8px');
        /*
         * *****************滚动事件*********************
         */
        // 排行榜页面和活动规则页面可滚动，其他页面不可滚动
        $(document).on('touchstart touchmove', function(e){
            if(!($(e.target).parents('#rank-content').length || $(e.target).parents('#pop-rule-fg').length)){
                e.preventDefault();
            }
        });
        // 获取可滚动页面的初始触摸位置
        constant.$scrollEle.on('touchstart', function(e){
            startX = e.originalEvent.changedTouches[0].pageX;
            startY = e.originalEvent.changedTouches[0].pageY;
        });
        // 绑定滚动事件
        constant.$scrollEle.on('touchmove', util.scrollEvent);
        //关闭弹窗事件
        $('.pop-close').on('touchstart', function(){
            constant.$coverPage.hide();
            $('.pop').hide();
            //显示剩下几次机会的弹窗关闭按钮点击的话则刷新页面
            if($(this).parents('#pop-chance').length){
                util.reloadPage();
            }
        });
        // 弹窗点击分享事件
        $(document).on('touchstart', '#pop-chance-share, #J_share, #pop-shareRightNow', function(){
            //这里调用原生的接口，因为无法知晓是否分享成功，因此无论是否成功，constant.$playTimes.val()都加1、
            //在点击此按钮之后的未来某个时机（取决于用户点了分享之后的操作，待定），跳转到首页/或者刷新页面更好
            util.ajaxRequest({
                url: 'http://h5.xheldon.com/chunjiedianzhi/ajax_shared',
                type: 'POST',
                dataType: 'json'
            }, function(resp){
                if(resp.error_code === 0){
                    console.log('分享成功！，准备跳转');
                    util.reloadPage(true);
                }
            });
        });
        // 弹窗点击查看排行榜事件
        $('#pop-chance-rank, #J_rank').on('touchstart', function(){
            // 这里有一个ajax请求来获取用户排行榜数据
            util.ajaxRequest({
                url: 'http://h5.xheldon.com/chunjiedianzhi/ajax_get_rankings',
                dataType: 'json'
            }, function(resp){
                if(resp.error_code === 0){
                    //拼接html插入到页面中
                    var html = '';
                    $.each(resp.data, function(key, value){
                        html += '<li><span class="rank-avatar"><img src="' + value.head +'"/></span><span class="rank-name">'+ value.nickname +'</span><span class="rank-score">'+ value.zhi_count +'</span></li>'
                    });
                    $('#rank-list').html(html);
                }else{
                    console.log('获取点值排行榜的接口异常！相关信息：',resp);
                    alert('获取点值排行榜的接口异常！请联系开发！');
                }
                util.flowControl('rank');
            });
        });

        //点值排行榜点击事件
        //返回主页
        $('#rank-backToIndex').on('touchstart', function(){
            util.reloadPage();
        });
        //查看奖品
        $('#rank-award').on('touchstart', function(){
            $('.pop').hide();
            constant.$coverPage.show();
            $('#pop-award').show();
        });
        $('#index-rule').on('touchstart', function(){
            $('.pop').hide();
            $('#cover').show();
            $('#pop-rule').show();
        });
        $(document).on('touchstart', '#pop-playAgain', function(){
            util.reloadPage();
        });
        $('#pop-chance-recommend').on('touchstart', function(){
            location.href = $(this).attr('href');
        });
        // 刚进入页面时，发送ajax请求，获取游戏剩余次数
        util.ajaxRequest({
            url: 'http://h5.xheldon.com/chunjiedianzhi/ajax_get_stats',
            dataType: 'json'
        }, function(resp){
            if(resp.error_code === 0){
                $(document).on('touchstart', 'div#index-button', function(){
                    // 可以继续玩儿
                    if(resp.data.remain_play_times > 0){
                        util.flowControl('game');
                        $('#cover').fadeIn();
                        $('#clock-big').fadeIn();
                        //我的点值数和排行榜
                        $('#rank-zhi').html(resp.data.zhi_count);
                        $('#rank-ranking').html(resp.data.ranking);
                        // 倒计时
                        util.countDown(function(){
                            if(parseInt(constant.countDownToStart()) === 0){
                                //开始倒计时完毕，初始化游戏
                                util.init(function(){
                                    //结束倒计时
                                    util.countDown(function(){
                                        if(parseInt(constant.countDownToOver()) !== 0){
                                            constant.$countOver().html(parseInt(constant.countDownToOver()) - 1 + 'S');
                                            util.countDown(arguments.callee);
                                        }else{
                                            //游戏结束
                                            console.log('游戏结束');
                                            util.ajaxRequest({
                                                url: 'http://h5.xheldon.com/chunjiedianzhi/ajax_end_play',
                                                type: 'POST',
                                                dataType: 'json',
                                                data: {
                                                    end: '1'
                                                }
                                            }, function(resp){
                                                if(resp.error_code === 0){
                                                    constant.myRank = resp.data.ranking;
                                                    var data = resp.data.stats,
                                                        link = resp.data.share;
                                                    if(data.remain_play_times == 0){
                                                        util.forReuse.add(resp, function isShared(param){
                                                            if(param.data.stats.shared_times < 2){
                                                                util.pop(param.data.share, {
                                                                    fgColor: '#fa2b3e',
                                                                    fgBorderColor: '#ff7e69',
                                                                    msg: '累计收获<span class="pop-text">' + param.data.stats.zhi_count + '</span>个值<br>次数已用完，分享后再玩一次',
                                                                    btn: [true, '马上去', 'pop-shareRightNow'],
                                                                    bgImg: 'url(/img/pop/pop-shareForChance.png)'
                                                                });
                                                            }else{
                                                                util.pop(param.data.share, {
                                                                    fgColor: '#ee3354',
                                                                    fgBorderColor: '#ff8474',
                                                                    msg: '累计收获<span class="pop-text">' + param.data.stats.zhi_count + '</span>个值<br>次数已用完，明天再来吧~',
                                                                    btn: [false],
                                                                    bgImg: 'url(/img/pop/pop-noChance.png)'
                                                                });
                                                            }
                                                        });
                                                    }else{
                                                        util.pop(link, {
                                                            fgColor: '#c9252d',
                                                            fgBorderColor: '#ff7e69',
                                                            msg: '累计收获<span class="pop-text">' + data.zhi_count + '</span>个值<br>剩余游戏次数:<span>' + constant.remainPlayTimes + '</span>',
                                                            btn: [true, '再玩一次','pop-playAgain'],
                                                            bgImg: 'url(/img/pop/pop-again.png)'
                                                        });
                                                    }
                                                }else{
                                                    console.log('游戏结束失败！具体信息：',resp);
                                                    alert('游戏结束失败！');
                                                }
                                            });
                                        }
                                    })
                                });
                            }else{
                                constant.$countStart().html(parseInt(constant.countDownToStart()) - 1 );
                                util.countDown(arguments.callee);
                            }
                        });
                    }else{
                        util.forReuse.isShared(resp);
                    }
                });
            }else{
                console.log('获取游戏剩余次数信息失败！具体信息：',resp);
                alert('获取游戏剩余次数信息时报，请刷新页面或联系开发！');
            }
        });
    })();
});
},{}]},{},[1])