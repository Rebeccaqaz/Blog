$(function(){
    // 先给 马上注册 超链接添加点击事件
    $('#registera').click(function(){
        // 隐藏登录的DIV
        $('#loginBox').hide();
        // 显示注册的DIV
        $('#registerBox').show();
    });
    // 给 马上登录 超链接添加点击事件
    $('#logina').click(function(){
        // 隐藏注册的DIV
        $('#registerBox').hide();
        // 显示登录的DIV
        $('#loginBox').show();
    });

    // 注册
    $('#registerForm  .loginbtn').click(function(){
        $.ajax({
            url: '/api/user/register',
            type: 'post',
            data: $('#registerForm').serialize(),
            dataType: 'json',
            success: function(res){
                console.log(res);
                $('#registerBox .tips').html(res.message);
            }
        });
    });

    // 登录
    $('#loginForm .loginbtn').click(function(){
        $.ajax({
            url: '/api/user/login',
            type: 'post',
            data: $('#loginForm').serialize(),
            dataType: 'json',
            success: function(res){
                console.log(res);
                $('#loginBox .tips').html(res.message);
                // 登录成功
                if (res.code == 0) {
                    setTimeout(function(){
                        window.location.reload();
                    },1000);
                }
            }
        });
    });

    // 退出
    $('#logout').click(function(){
        $.ajax({
            url: '/api/user/logout',
            dataType: 'json',
            success: function(res){
                // 退出成功，刷新页面
                if (res.code == 0) {
                    window.location.reload();
                }
            }
        });
    });
});
