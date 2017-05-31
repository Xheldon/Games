$(function(){
    var question = [];// 从题库中抽选的题目数组
    function init(){
        // 随机从题库中随机抽选十个题目
        if(choice_ask.data.length < choice_ask.choice_items){
            alert('题库数量不足！请减小抽题数量或增加题库数量！');
            return;
        }
        var choice_which = [parseInt(Math.random()*choice_ask.data.length)];
        while(choice_which.length < choice_ask.choice_items){
            var temp = parseInt(Math.random()*choice_ask.data.length);
            var tempArr = [];
            for(var i = 0;i < choice_which.length; i++){
                if(choice_which[i] == temp){
                    tempArr.push(1);
                }
            }
            if(tempArr.length === 0){
                choice_which.push(temp);
            }
        }
        for(var j = 0;j < choice_which.length; j++){
            choice_ask.data[choice_which[j]].show_num = (j+1); //将抽出的题目显示的序列号重新整理
            question.push(choice_ask.data[choice_which[j]]);
        }
        var html = Mustache.render($('#template').html(), {
            data_name: choice_ask.data_name,
            data: question
        });
        $('#choice').html(html);
    }
    function pop(text){
        $('#pop').find('.pop-msg').html(text);
        $('#cover').show();
    }
    init();
    //绑定事件
    // 选中选项的时候将所答案放到隐藏域中
    $(document).on('click', 'input[type="radio"]', function(){
        var $this = $(this);
        $this.parents('.choice-items').find('input[type="hidden"]').val($this.siblings('span').html());
    });
    // 计算得分
    $(document).on('click', '#start', function(){
        var total = 0,
            result = [];
        $.each($('.choice-result'), function(k, v){
            var $this = $(v);
            if($this.val() == '0'){
                result.push($this.siblings('.item-name').html());
            }else{
                if($this.val() === question[(parseInt($this.attr('ques-id')) - 1)]['answer']){
                    $this.parents('.choice-items').find('.item-name').css('color', '#000');
                    total += choice_ask.every_score;
                }else{
                    $this.parents('.choice-items').find('.item-name').css('color',choice_ask.error_color);
                }
            }
        });
        if(result.length){
            alert('警告:「' + result.join('」,「') + '」未完成！');
        }else{
            alert(total + '分！');
        }
    });
    // 重新生成试题
    $(document).on('click', '#restart', function(){
        var tempArr = [];
        $.each($('.choice-result'), function(k, v){
            if($(v).val() != 0){
                if(confirm('当前已经开始答题，是否确定要重新生成题目？\n点击确定重新生成，点击取消继续答题')){
                    question = [];
                    init();
                }
                return false;
            }else{
                tempArr.push(1);
            }
        });
        if(tempArr.length === $('.choice-result').length){
            question = [];
            init();
        }
    });
    // 提问
    $(document).on('click', '#who', function(){
        var who = choice_ask.classmate[parseInt(Math.random() * choice_ask.classmate.length)];
        pop(who);
    });
    // 关闭弹窗
    $('.close, #pop > span').click(function(){
        $('#cover').hide();
    });

    //设置样式
    $('.item-ask').css({
        'fontSize': choice_ask.question_font_size,
        'color': choice_ask.question_font_color

    });
    $('.choice-items > ul > li').css({
        'fontSize': choice_ask.options_font_size,
        'color': choice_ask.options_font_color
    });
    $('title').html(choice_ask.data_name);
});