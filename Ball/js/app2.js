/**
 * Created by xheldon on 16/2/14.
 */
//var status = {
//    w : false,//87
//    a : false,//65
//    s : false,//83
//    d : false//68
//};

$(function(){
    var $ball = $('#ball'),
        $winWidth = $(window).width(),
        $winHeight = $(window).height(),
        $maxWidth = $(window).width()-$ball.width(),
        $maxHeight = $(window).height()-$ball.height(),
        Ball = {
            //判断是否越界
            judge : function(){
                var $ballLeft = $ball.offset().left,
                    $ballTop = $ball.offset().top;
                if($ballLeft>=$maxWidth){
                    this.status.d = false;
                }
                if($ballTop>=$maxHeight){
                    this.status.s = false;
                }
                if($ballLeft<=0){
                    this.status.a = false;
                }
                if($ballTop<=0){
                    this.status.w = false;
                }
            },
            //初始化状态
            status : {
                w : false,
                a : false,
                s : false,
                d : false
            },
            //控制状态
            control : function(){
                $(document).keydown(function(e){
                    switch(e.keyCode){
                        case 87:
                            Ball.status.w = true;
                            break;
                        case 65:
                            Ball.status.a = true;
                            break;
                        case 83:
                            Ball.status.s = true;
                            break;
                        case 68:
                            Ball.status.d = true;
                            break;
                    }
                });
                $(document).keyup(function(e){
                    switch(e.keyCode){
                        case 87:
                            Ball.status.w = false;
                            break;
                        case 65:
                            Ball.status.a = false;
                            break;
                        case 83:
                            Ball.status.s = false;
                            break;
                        case 68:
                            Ball.status.d = false;
                            break;
                    }
                });
                Ball.judge();
                if(Ball.status.w){
                    $ball.css('top','-=5');
                }
                if(Ball.status.a){
                    $ball.css('left','-=5');
                }
                if(Ball.status.s){
                    $ball.css('top','+=5');
                }
                if(Ball.status.d){
                    $ball.css('left','+=5');
                }
            }
        },
        Bricks = {
            show : true,
            numOfEveryRow : 5,
            numOfCol : 5,
            width : function(){
                return $winWidth/this.numOfEveryRow;
            },
            height : function(){
                return $winHeight/this.numOfCol;
            },
            init : function(){
                for(var i= 0;i<this.numOfEveryRow;i++){
                    $('<div class="brick"></div>').css({
                        width : Bricks.width() + 'px',
                        height : Bricks.height() + 'px',
                        border : '1px solid white',
                        backgroundColor : 'skyblue',
                        boxSizing:'border-box',
                        display:'inline-block'
                    }).appendTo('#container');
                }
            }
        };
        Bricks.init();
    var time = setInterval(Ball.control,80);
});