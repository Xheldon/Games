/**
 * Created by xheldon on 16/2/24.
 */
$(function(){
    var $cube = $('#container');
    var $win_w = $(window).width();
    var $win_h = $(window).height();
    var vx= 2;
    var vy = 2;
    var move = function(){
        $cube.css('left','+='+vx);
        $cube.css('top','+='+vy);
        if($cube.offset().left>=$win_w-30){
            vx *= -1;
        }
        if($cube.offset().left<=0){
            vx *= -1;
        }
        if($cube.offset().top>=$win_h-30){
            vy *= -1;
        }
        if($cube.offset().top<=0){
            vy *= -1;
        }
        requestAnimationFrame(move);
    };
    move();
});