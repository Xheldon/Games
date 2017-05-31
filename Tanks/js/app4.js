/**
 * Created by Xheldon 16/3/9.
 */
/**
 * *****************************
 * 一些全局变量
 * *****************************
 * */
var bullet_direction,
    bullet_position = {},
    speed = {
        tank: 2,
        bullet: 3
    },
    BULLET_SIZE = 5,//子弹尺寸
    TANK_SIZE = 50,//坦克尺寸
    currentBulletNum = 0,//当前地图子弹数量
    maxBulletNum = 4,//最大子弹数量
    shooting = false,//发射状态
    $map_width,//地图宽度
    $map_height,//地图高度
    $number_width,//数字高度
    $number_height,//地图高度
    timeInterval = [],//存放子弹发射时间的数组
    minInterval = 500,//最小子弹发射间隔
    flag = 0,//标记已经存在的子弹的发射时间,用来分开子弹发射间隔
    showBricksNum = 404;
/**
 * *****************************
 * 构造子弹
 * *****************************
 * */
function Bullets(className,direction){
    this.className = className;
    this.element = $(className);
    this.direction = direction;
    this.color = 'red';
    this.size = BULLET_SIZE;
}
Bullets.prototype.addBullet = function(){
    $('<div class="'+ this.className +'" data-direction="'+ this.direction +'"></div>').appendTo('#map').css({
        backgroundColor: this.color,
        width: this.size + 'px',
        height: this.size + 'px',
        top: (tank.top + (tank.width/2)) + 'px',
        left: (tank.left + + (tank.height/2)) + 'px',
        position: 'absolute'
    });
};
/**
 * *****************************
 * 构造坦克
 * *****************************
 * */
function Tank(idName){
    this.element = $(idName);
    this.top = 0;
    this.left = 0;
    this.width = TANK_SIZE;
    this.height = TANK_SIZE;
    this.element.css({
        width: this.width + 'px',
        height: this.height + 'px',
        left: '50%',
        top: '100%',
        marginTop: (-1*this.height) + 'px',
        marginLeft: (-1*this.width/2) + 'px'
    });
    this.element.css('width',this.width + 'px');
    this.element.css('height',this.height + 'px');
    this.speed = speed.tank;
    this.direction = null;
}
Tank.prototype.fire = function(){
    var bullet = new Bullets('bullets',bullet_direction);
    bullet.addBullet();
};
Tank.prototype.move = function(){
    switch(this.direction){
        case 'up':
            this.element.css('top','+=' + (-1*this.speed) + 'px');
            break;
        case 'down':
            this.element.css('top','+=' + (this.speed) + 'px');
            break;
        case 'left':
            this.element.css('left','+=' + (-1*this.speed) + 'px');
            break;
        case 'right':
            this.element.css('left','+=' + (this.speed) + 'px');
            break;
    }
};
/**
 * *****************************
 * 构造砖块
 * *****************************
 * */
function Bricks(){

}
Bricks.prototype.disappear = function(bid){

};
function makeBricks(num){

}


/**
 * *****************************
 * 实例化一个坦克用来操作
 * *****************************
 * */
var tank = new Tank('#tank');
/**
 * *****************************
 * 一些工具函数
 * *****************************
 * */
var Util = {
    bulletMove: function(){//使发射出来的子弹动起来
        var $bullets = $('.bullets'),
            that = this;
        currentBulletNum = $bullets.length;
        tank.top = tank.element.position().top + parseInt(tank.element.css('marginTop'));
        tank.left = tank.element.position().left + parseInt(tank.element.css('marginLeft'));
        if(shooting == true) {
            tank.fire();
            flag++;
            shooting = false;
        }
        $.each($bullets,function(index,value){
            var $value = $(value);
            if($value.data('direction') == 'up'){
                if(parseInt($value.css('top')) >= 0){
                    $value.css('top','+=' + (-1*speed.bullet) + 'px');
                    that.gotTheBulletPositon($value);
                }else{
                    $value.css('top','+=' + 0 + 'px');
                    $value.remove();
                }
            }else if($value.data('direction') == 'down'){
                if(parseInt($value.css('top')) <= $map_height){
                    $value.css('top','+=' + speed.bullet + 'px');
                    that.gotTheBulletPositon($value);
                }else{
                    $value.css('top','+=' + 0 + 'px');
                    $value.remove();
                }
            }else if($value.data('direction') == 'left'){
                if(parseInt($value.css('left')) >= 0){
                    $value.css('left','+=' + (-1*speed.bullet) + 'px');
                    that.gotTheBulletPositon($value);
                }else{
                    $value.css('left','+=' + 0 + 'px');
                    $value.remove();
                }
            }else if($value.data('direction') == 'right'){
                if(parseInt($value.css('left')) <= $map_width){
                    $value.css('left','+=' + speed.bullet + 'px');
                    that.gotTheBulletPositon($value);
                }else{
                    $value.css('left','+=' + 0 + 'px');
                    $value.remove();
                }
            }
        });
    },
    gotTheBulletPositon: function(value){
        bullet_position.left = value.offset().left;
        bullet_position.top = value.offset().top;
    },
    eventBind: function(){
        $(document).keydown(function(e){
            switch(e.keyCode){
                case 87:
                    tank.direction = 'up';
                    bullet_direction = 'up';
                    break;
                case 83:
                    tank.direction = 'down';
                    bullet_direction = 'down';
                    break;
                case 65:
                    tank.direction = 'left';
                    bullet_direction = 'left';
                    break;
                case 68:
                    tank.direction = 'right';
                    bullet_direction = 'right';
                    break;
                case 32:
                    timeInterval[flag+1] = (new Date()).getTime();
                    if(timeInterval[flag+1] - timeInterval[flag] < minInterval){
                        shooting =false;
                    }else if(timeInterval[flag+1] - timeInterval[flag] > minInterval && currentBulletNum < maxBulletNum){
                        shooting = true;
                    }
                    break;
            }
        }).keyup(function(){
            tank.direction = null;
        });
    },
    makeTheNum: function(num){
        switch(num){
            case '0':
                return [1,2,3,4,5,9,10,13,14,15,17,19,20,21,24,25,29,30,31,32,33,34];
            case '1':
                return [2,6,7,10,12,17,22,27,30,31,32,33,34];
            case '2':
                return [1,2,3,4,5,9,14,18,22,26,30,31,32,33,34];
            case '3':
                return [1,2,3,4,5,9,14,17,18,19,24,25,29,31,32,33,34];
            case '4':
                return [3,7,8,11,13,15,18,20,21,22,23,24,28,33];
            case '5':
                return [0,1,2,3,4,5,10,11,12,13,19,24,29,25,31,32,33];
            case '6':
                return [1,2,3,5,9,10,15,16,17,18,20,24,25,29,31,32,33];
            case '7':
                return [0,1,2,3,4,9,13,17,22,27,32];
            case '8':
                return [1,2,3,5,9,10,14,16,17,18,20,24,25,29,31,32,33];
            case '9':
                return [1,2,3,5,9,10,14,16,17,18,19,24,25,29,31,32,33];
        }
    },
    setBricks: function(num){
        var that = this,
            num = num + '',
            numArr = num.split('');
        for(var i=0;i<3;i++){
            $.each(that.makeTheNum(numArr[i]),function(index,value){
                var brick = $('#brickgroup-' + i).find('#brick-' + value),
                    brick_width = brick.width(),
                    brick_height = brick.height(),
                    brick_top = brick.offset().top,
                    brick_left = brick.offset().left;
                //console.log('brick_top:',brick_top);
                //console.log('brick_left:',brick_left);
                if(bullet_position.left <= brick_left + brick_width && bullet_position.left >= brick_left && bullet_position.top >= brick_top && bullet_position.top <= brick_top + brick_height){
                    $('#brickgroup-' + i).find('#brick-' + value).css({
                        backgroundColor: 'red'
                    });
                    return false;
                }
                $('#brickgroup-' + i).find('#brick-' + value).css({
                    backgroundColor: 'orange'
                })
            })
        }
    },
    ifCrash: function(){
        var that = this,
            num = showBricksNum + '',
            numArr = num.split('');
        for(var i=0;i<3;i++){
            $.each(that.makeTheNum(numArr[i]),function(index,value){
                var brick = $('#brickgroup-' + i).find('#brick-' + value),
                    brick_width = brick.width(),
                    brick_height = brick.height(),
                    brick_top = brick.offset().top,
                    brick_left = brick.offset().left;
                if(bullet_position.left <= brick_left + brick_width && bullet_position.left >= brick_left && bullet_position.top >= brick_top && bullet_position.top <= brick_top + brick_height){
                    $('#brickgroup-' + i).find('#brick-' + value).css({
                        backgroundColor: 'red'
                    });
                }
            })
        }
    },
    init: function(){//初始化
        var $map = $('#map'),
            $number = $('#number');
        $map_width = $map.width();
        $map_height = $map.height();
        $number_width = $map.width()*(0.93);
        $number_height = $number.height();
        timeInterval[0] = 0;//时间间隔数组,第一个应该是0
        bullet_direction = 'up';//子弹默认向上发射
        //生成钻块
        for(var i=0;i<3;i++){//有三个数字
            $('<div id="brickgroup-' + i + '">').css({
                width: $number_width/3 + 'px',
                height: $number_height + 'px',
                float: 'left',
                position: 'absolute',
                left: ($map_width/3)*(i) + (i)*(10) + 'px'
            }).appendTo('#number');
            for(var j=0;j<35;j++){//每个数字由5x7个块组成
                $('<div id="brick-' + j + '">').css({
                    width: $number_width/15 + 'px',
                    height: $number_height/10 + 'px',
                    //border: '1px solid green',
                    boxSizing: 'border-box',
                    float: 'left',
                }).appendTo('#brickgroup-' + i);
            }
        };
        this.setBricks(showBricksNum);
    }
};
/**
 * *****************************
 * 开始调用函数
 * *****************************
 * */
Util.eventBind();
Util.init();
(function GOGOGO(){
    tank.move();
    Util.bulletMove();
    Util.ifCrash();
    //console.log('b_left:',bullet_position.left);
    //console.log('b_top:',bullet_position.top);
    requestAnimationFrame(GOGOGO);
}());