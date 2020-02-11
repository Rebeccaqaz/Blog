//不要忘了加载页面！！！
function renderComment(comments){
    var html = '';
    for(var i = 0; i < comments.length; i ++){
        html += '<li style="padding: 10px;border: 1px solid;margin-bottom: 20px;"><div style="font-weight: bold;justify-content: space-between;display: flex;"><p>'+ comments[i].user.username +'</p><p>'+ comments[i].postTime +'</p></div><div>'+ comments[i].comment +'</div></li>'
    }
    $('.megList').html(html);
}
$(function(){
    $('.commentBtn').on('click',function(){
        $.ajax({
            type:'post',
            url:'/api/comment/post',
            data:{
                contentid:$('#contentId').val(),
                content:$('.neirong').val()
            },
            success:function(res){
                console.log(res.data);
                $('.neirong').val('');//清空评论区
                //$(' .tips').html(res.message);
                renderComment(res.data);
            }
        })
    })
})



