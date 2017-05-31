/**
 * Created by Xheldon 16/3/8.
 */
$(function(){
    //一些全局变量
    var MAP = {
            map: function(){
                return $('#map')
            },
            width: function(){
                return this.map().width();
            },
            height: function(){
                return this.map().height();
            }
        },
        TANK = {
            speed: 5,
            size: 35
        },
        BULLETS = {
            speed: 10,
            size: 5
        },
        BRICKS = {
            size: 10
        },
        tank_direction = null,
        bullet_direction = 'up';
        Util = {
            keyBind: function(){
                $(document).on('keydown',function(e){
                    e.preventDefault();
                    switch(e.keyCode){
                        case 87:
                            tank_direction = 'up';
                            bullet_direction = 'up';
                            break;
                        case 65:
                            tank_direction = 'left';
                            bullet_direction = 'left';
                            break;
                        case 83:
                            tank_direction = 'down';
                            bullet_direction = 'down';
                            break;
                        case 68:
                            tank_direction = 'right';
                            bullet_direction = 'right';
                            break;
                        case 32:
                            tank.firing = true;
                    }
                }).on('keyup',function(e){
                    e.preventDefault();
                    if(e.keyCode == 32){
                        tank.firing = false;
                    }else{
                        tank_direction = null;
                    }
                });
            },
            removeBullets: function(){
                $.each($('[class^="bullets-"]'),function(i,v){
                    if(i>5){
                        v.remove();
                    }
                })
            }
        };
    function  Tank(id){
        this.element = $(id);
        this.element.css({
            width: TANK.size + 'px',
            height: TANK.size + 'px',
            border: '2px solid skyblue',
            position: 'absolute'
        });
        this.speed = TANK.speed;
        this.width = TANK.size;
        this.firing = false;
    }
    Tank.prototype.move = function(direction){
        var that = this;
        switch(direction){
            case 'up':
                if(this.element.position().top >= 0){
                    this.element.css('top','+=' + (-1*this.speed) + 'px');
                }else{
                    this.element.css('top','+=' + 0 + 'px');
                }
                break;
            case 'down':
                if(this.element.position().top <= MAP.height()-this.element.height()){
                    this.element.css('top','+=' + (1*this.speed) + 'px');
                }else{
                    this.element.css('top','+=' + 0 + 'px');
                }
                break;
            case 'left':
                if(this.element.position().left >= 0){
                    this.element.css('left','+=' + (-1*this.speed) + 'px');
                }else{
                    this.element.css('left','+=' + 0 + 'px');
                }
                break;
            case 'right':
                if(this.element.position().left <= MAP.width()-this.element.width()){
                    this.element.css('left','+=' + (1*this.speed) + 'px');
                }else{
                    this.element.css('left','+=' + 0 + 'px');
                }
                break;
        }
    };
    var bullets = {};
    Tank.prototype.fire = function(){
        var direction = bullet_direction,
            timestamp = new Date().getTime() + '';
        bullets[timestamp] = new Bullets(timestamp);
            tank.element.append(bullets[timestamp].element);
        bullets[timestamp].move(direction);
    };
    function Bullets(timestamp){
        this.element = $('<div class="bullets-'+ timestamp +'"></div>');
        this.element.css({
            width: BULLETS.size + 'px',
            height: BULLETS.size + 'px',
            backgroundColor: 'red',
            position: 'absolute'
        });
        this.direction = 'up';
    }
    Bullets.prototype.move = function(direction){
        var that = this.element;
        switch(direction){
            case 'up':
                console.log(direction);
                that.css({
                    top: '+=' + (-1*BULLETS.speed) + 'px',
                    left: (tank.element.width()-that.width())/2 + 'px'
                });
                break;
            case 'down':
                that.css({
                    top: '+=' + (tank.element.height()+BULLETS.speed) + 'px',
                    left: (tank.element.width()-that.width())/2 + 'px'
                });
                break;
            case 'left':
                that.css({
                    top: (tank.element.height()-that.height())/2 + 'px',
                    left: '+=' + (-1*BULLETS.speed) + 'px'
                });
                break;
            case 'right':
                that.css({
                    top: (tank.element.height()-that.height())/2 + 'px',
                    left: '+=' + (tank.element.width()+BULLETS.speed) + 'px'
                });
                break;
        }
    };
    var Bricks = function(){

    };
    //动起来
    var tank = new Tank('#tank');
    Util.keyBind();
    (function TankMove(){
        var that = tank;
        that.move(tank_direction);
        that.direction = tank_direction;
        if(tank.firing){
            tank.fire();
        }
        Util.removeBullets();
        requestAnimationFrame(TankMove);
    }());
});