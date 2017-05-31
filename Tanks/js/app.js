/**
 * Created by Xheldon 16/3/7.
 */
$(function(){
    //一些全局变量
    var $container = $('#map'),
        container_w = $container.width(),
        container_h = $container.height(),
        $tank,
        $bullet,
        tank_size = 35,
        bullets = [],
        bullets_size = 5,
        bullets_v = 5,
        tank_v = 2,
        direction = {
            tank_d : {
                up: false,
                left: false,
                down: false,
                right: false
            },
            bullet_d: {}
        },
        $document = $(document);
    //构造tank
    var Tanks = function(){
        this.width = tank_size;
        this.height = tank_size;
        this.name = 'tank';
    };
    //将tank添加到页面
    Tanks.prototype.draw = function(){
        var that = this;
        $tank = $('<div id="' + that.name + '"></div>');
        $tank.css({
            position: 'absolute',
            width: that.width + 'px',
            height: that.height + 'px',
            left: (container_w - that.width)/2 + 'px',
            top: container_h - that.height + 'px',
            border: '5px solid skyblue'
        });
        $tank.appendTo($container);
    };
    //构造砖块
    //num为生成的砖块形状
    var Bricks = function(num){

    };
    //构造子弹
    var Bullets = function(){
        this.size = bullets_size;
    };
    Bullets.prototype.draw = function(position,show){
        var that = this,
            setPosition = function(){
                switch(position){
                    case 'up':
                        return {
                            top: 0 + '',
                            left: (tank_size - bullets_size) / 2 + 'px'
                        };
                    case 'left':
                        return {
                            top: (tank_size - bullets_size) / 2 + 'px',
                            left: 0 + ''
                        };
                    case 'down':
                        return {
                            top: tank_size -bullets_size + 'px',
                            left: (tank_size - bullets_size) / 2 + 'px'
                        };
                    case 'right':
                        return {
                            top: (tank_size - bullets_size) / 2 + 'px',
                            left: tank_size -bullets_size + 'px'
                        }
                }
            };
        $bullet = $('<div class="bullet"></div>');
        $bullet.css({
            width: this.size + 'px',
            height: this.size + 'px',
            borderRadius: '50%',
            backgroundColor: 'red',
            position: 'absolute',
            top: '+=' + setPosition().top,
            left: '+=' + setPosition().left,
            display: show == true ? 'block' : 'none'
        });
        $bullet.appendTo($tank);
    };
    Util = {
        init: function(){
            var tank = new Tanks();
            tank.draw();
            this.setBullets('up');
            this.setBullets('left');
            this.setBullets('down');
            this.setBullets('right');
        },
        setBullets: function(direction){
            for(var i=0;i<4;i++){
                var bullet = new Bullets();
                bullet.draw(direction,true);
                bullets.push([direction,bullet]);
            }
        },
        fire: function(position){

        },
        control: function(){
            $document.keydown(function(e){
                switch(e.keyCode){
                    case 87:
                        direction.tank_d.up = true;
                        direction.bullet_d.up = true;
;                       break;
                    case 65:
                        direction.tank_d.left = true;
                        direction.bullet_d.left = true;
                        break;
                    case 83:
                        direction.tank_d.down = true;
                        direction.bullet_d.down = true;
                        break;
                    case 68:
                        direction.tank_d.right = true;
                        direction.bullet_d.right = true;
                        break;
                    case 32:
                        direction.bullet_d.fire = true;
                }
            });
            $document.keyup(function(e){
                switch(e.keyCode){
                    case 87:
                        direction.tank_d.up = false;
                        break;
                    case 65:
                        direction.tank_d.left = false;
                        break;
                    case 83:
                        direction.tank_d.down = false;
                        break;
                    case 68:
                        direction.tank_d.right = false;
                        break;
                }
            });
            return direction;
        }
    };
    //初始化
    Util.init();
    var GOGOGO = function(){
        //console.log(Util.control());
        if(Util.control().tank_d.up){
            $tank.css('top','+=' + (-1*tank_v) );
        }
        if(Util.control().tank_d.left){
            $tank.css('left','+=' + (-1*tank_v));
        }
        if(Util.control().tank_d.down){
            $tank.css('top','+=' + (tank_v));
        }
        if(Util.control().tank_d.right){
            $tank.css('left','+=' + (tank_v));
        }
        if(Util.control().bullet_d.fire){
            Util.fire('up');
            if(Util.control().bullet_d.up){
                console.log(Util.control().bullet_d.up);
                Util.fire('up');
                $bullet.css('top','+=' + (-1*bullets_v) );
            }
            if(Util.control().bullet_d.left){
                console.log(Util.control().bullet_d.left);
                Util.fire('left');
                $bullet.css('left','+=' + (-1*bullets_v) );
            }
            if(Util.control().bullet_d.down){
                Util.fire('down');
                $bullet.css('top','+=' + (bullets_v) );
            }
            if(Util.control().bullet_d.right){
                Util.fire('right');
                $bullet.css('left','+=' + (bullets_v) );
            }
        }
        requestAnimationFrame(GOGOGO);
    };
    GOGOGO();
});