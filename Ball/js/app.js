/**
 * Created by xheldon on 16/2/14.
 */
var $ball = $('#ball');
//var status = {
//    w : false,//87
//    a : false,//65
//    s : false,//83
//    d : false//68
//};
var $winWidth = $(window).width()-$ball.width();
var $winHeight = $(window).height()-$ball.height();
var control = function() {
    $(document).keydown( function (e) {
        switch (e.keyCode) {
            case 65://a
                $(document).keydown(function (e){
                    switch(e.keyCode){
                        case 87://w
                            if(parseInt($ball.css('top'))<=0){
                                $ball.css('top','+=0');
                                break;
                            }
                            if(parseInt($ball.css('left'))<=0){
                                $ball.css('left','+=0');
                                break;
                            }
                            $ball.css({
                                top : '-=1',
                                left : '-=1'
                            });
                            break;

                    }
                });
                if(parseInt($ball.css('left'))<=0){
                    $ball.css('left','+=0');
                    break;
                }
                $ball.css('left', '-=1');
                break;
            case 68://d
                $(document).keydown(function (e){
                    switch(e.keyCode){
                        case 83://s
                            if(parseInt($ball.css('top'))>=$winHeight){
                                $ball.css('top','+=0');
                                break;
                            }
                            $ball.css({
                                top : '+=1',
                                left : '+=1'
                            });
                            break;

                    }
                });
                if(parseInt($ball.css('left'))>=$winWidth){
                    $ball.css('left','+=0');
                    break;
                }
                $ball.css('left', '+=1');
                break;
            case 83://s
                $(document).keydown(function (e){
                    switch(e.keyCode){
                        case 68://d
                            if(parseInt($ball.css('left'))>=$winWidth){
                                $ball.css('left','+=0');
                                break;
                            }
                            $ball.css({
                                top : '+=1',
                                left : '+=1'
                            });
                            break;
                        case 65://a
                            if(parseInt($ball.css('left'))<=0){
                                $ball.css('left','+=0');
                                break;
                            }
                            $ball.css({
                                top : '+=1',
                                left : '-=1'
                            });
                            break;

                    }
                });
                if(parseInt($ball.css('top'))>=$winHeight){
                    $ball.css('top','+=0');
                    break;
                }
                $ball.css('top', '+=1');
                break;
            case 87://w
                $(document).keydown(function (e){
                    switch(e.keyCode){
                        case 68://d
                            if(parseInt($ball.css('left'))>=$winWidth){
                                $ball.css('left','+=0');
                                break;
                            }
                            $ball.css({
                                top : '-=1',
                                left : '+=1'
                            });
                            break;
                        case 65://a
                            if(parseInt($ball.css('left'))<=0){
                                $ball.css('left','+=0');
                                break;
                            }
                            $ball.css({
                                top : '-=1',
                                left : '-=1'
                            });
                            break;

                    }
                });
                if(parseInt($ball.css('top'))<=0){
                    $ball.css('top','+=0');
                    break;
                }
                $ball.css('top', '-=1');
                break;
        }
    });
};
setInterval(control,300);