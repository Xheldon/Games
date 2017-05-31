/**
 * Created by Xheldon 16/3/9.
 */
var direction = {},
    speed = {
        tank: 2,
        bullet: 3
    },
    bulletId = 0,
    currentBulletNum = 0,
    maxBullentNum = 4,
    $tank = $('#tank'),
    tank_top,
    tank_left,
    shotting = 0,
    $map_width = $('#map').width(),
    $map_height = $('#map').height(),
    timeInterval = [],
    minInterval = 500,
    s = 0;
timeInterval[0] = 0;
var Util = {
    setCss: function(ele,dir,speed){
        var $ele = $(ele);
        switch(dir){
            case 'up':
                $ele.css('top','+=' + (-1*speed) + 'px');
                break;
            case 'down':
                $ele.css('top','+=' + (speed) + 'px');
                break;
            case 'left':
                $ele.css('left','+=' + (-1*speed) + 'px');
                break;
            case 'right':
                $ele.css('left','+=' + (speed) + 'px');
                break;
        }
    }
};
$(document).keydown(function(e){
    switch(e.keyCode){
        case 87:
            direction = {
                tank: 'up',
                bullet: 'up'
            };
            break;
        case 83:
            direction = {
                tank: 'down',
                bullet: 'down'
            };
            break;
        case 65:
            direction = {
                tank: 'left',
                bullet: 'left'
            };
            break;
        case 68:
            direction = {
                tank: 'right',
                bullet: 'right'
            };
            break;
        case 32:
            console.log('1:',currentBulletNum);
            s++;
            timeInterval[s] = (new Date()).getTime();
            if(timeInterval[s] - timeInterval[s-1] < minInterval){
                if(currentBulletNum < maxBullentNum){
                    shotting = true;
                    break;
                }else{
                    shotting = false;
                }
            }else{
                shotting = true;
            }
            break;
    }
}).keyup(function(){
    direction.tank = null;
});


function fire() {
    $('<div id="bullet-' + (bulletId+1) + '" data-direction="'+ direction.bullet +'"></div>').appendTo('#map').css({
        backgroundColor: 'red',
        width: '5px',
        height: '5px',
        top: (tank_top + 17) + 'px',
        left: (tank_left + 17) + 'px',
        position: 'absolute'
    });
    bulletId++;
}


(function controlTank(){
    requestAnimationFrame(controlTank);
    Util.setCss('#tank',direction.tank,speed.tank);
    var $b = $('[id^="bullet-"]');
    currentBulletNum = $b.length;
    tank_top = $tank.position().top;
    tank_left = $tank.position().left;
    //console.log('1:',bulletId);
    //console.log('2',timeInterval[bulletId]);
    //console.log('3',timeInterval[bulletId-1]);
    if(shotting == true) {
        fire();
        shotting = false;
    }
    $.each($b,function(index,value){
        var $value = $(value);
        if($value.data('direction') == 'up'){
            if(parseInt($value.css('top')) >= 0){
                $value.css('top','+=' + (-1*speed.bullet) + 'px');
            }else{
                $value.css('top','+=' + 0 + 'px');
                $value.remove();
            }
        }else if($value.data('direction') == 'down'){
            if(parseInt($value.css('top')) <= $map_height){
                $value.css('top','+=' + speed.bullet + 'px');
            }else{
                $value.css('top','+=' + 0 + 'px');
                $value.remove();
            }
        }else if($value.data('direction') == 'left'){
            if(parseInt($value.css('left')) >= 0){
                $value.css('left','+=' + (-1*speed.bullet) + 'px');
            }else{
                $value.css('left','+=' + 0 + 'px');
                $value.remove();
            }
        }else if($value.data('direction') == 'right'){
            if(parseInt($value.css('left')) <= $map_width){
                $value.css('left','+=' + speed.bullet + 'px');
            }else{
                $value.css('left','+=' + 0 + 'px');
                $value.remove();
            }
        }
    });

}());