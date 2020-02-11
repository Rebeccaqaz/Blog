/**
 * 前台的服务端程序
 */
var express = require('express');
var mongodb=require('mongodb');
var objectId=mongodb.ObjectId;
var MongoClient=mongodb.MongoClient;
var router = express.Router();
var responseData;
var url='mongodb://localhost:27017';
router.use(function(req,resp,next){
    responseData={
        code:0,
        message:''
    };
    next();
});
/**
 * 注册
 * 1. 用户名不能为空
 * 2. 密码不能为空
 * 3. 两次密码要一致
 * 4. 用户名不能已经注册
 */
router.post('/user/register', function (req,resp) {
        //处理AJAXPOST方式发送过来的请求
        var username=req.body.username||'';
        var pwd=req.body.pwd||'';
        var repwd=req.body.repwd||'';
        if(username==''){
            responseData.code=1;
            responseData.message='用户名不能为空';
            resp.json(responseData);
            return;
        }
        if(pwd==''){
            responseData.code=2;
            responseData.message='密码不能为空';
            resp.json(responseData);
            return;
        }
        if(repwd!=pwd){
            responseData.code=3;
            responseData.message='两次密码不一致';
            resp.json(responseData);
            return;
        }
    MongoClient.connect(url,{ useNewUrlParser: true,useUnifiedTopology:true },function(err,db){

        if(err){
            console.log(err);
            //    responseData.message = '连接数据库失败！';
            resp.json(responseData);
            return;
        }

        //判断注册的用户是否已经在数据库中存在
        //获取操作的数据库

        var dbase = db.db('blog');

        var whereStr={'username':username};

        dbase.collection('blog_users').find(whereStr).toArray(function(err,results){
            if(err){
                console.log(err);
                return;
            }
            if(results.length>0){
                responseData.code = 4;
                responseData.message = '用户已经被注册了';
                resp.json(responseData);
            }
            else{

                //定义一个插入用户的json对象
                var user = {
                    'username':username,
                    'pwd':pwd,
                    'isAdmin':false
                };


                dbase.collection('blog_users').insertOne(user,function(err,res){

                    if(err){
                        console.log(err)
                        responseData.code = 5;
                        responseData.message = '数据库内添加用户失败';
                        resp.json(responseData);
                        return;
                    }
                });
                responseData.message='添加成功';
                resp.json(responseData)
            }
        });

    });

});
/**
 * 登陆
 * 1. 用户名不能为空
 * 2. 密码不能为空
 * 3. 用户名和密码要正确
 */
router.post('/user/login',function(req,resp){
    //处理AJAXPOST方式发送过来的请求
    var username=req.body.username||'';
    var pwd=req.body.pwd||'';
    if(username==''){
        responseData.code=1;
        responseData.message='用户名不能为空';
        resp.json(responseData);
        return;
    }
    if(pwd==''){
        responseData.code=2;
        responseData.message='密码不能为空';
        resp.json(responseData);
        return;
    }
    MongoClient.connect(url,{ useNewUrlParser: true,useUnifiedTopology:true },function(err,db){
        if(err){
            console.log(err);
            return;
        }
        //获取需要操作的数据库
        var dbase = db.db('blog');
        //查询条件，用户名和密码
        var whereStr={'username':username,'pwd':pwd};

        //根据用户的用户名和密码查询blog_users里面的数据
        dbase.collection('blog_users').find(whereStr).toArray(function(err,results) {
            if (err) {
                console.log(err);
                return;
            }
            //res.json({data: results});
            if(results.length==0){
                responseData.code = 3;
                responseData.message = '用户名或密码不正确！';
                resp.json(responseData);
            }else{
                responseData.message = '登陆成功！';
                responseData.userInfo = {
                    _id:results[0]._id,
                    username:results[0].username
                }
                //设置cookies
                req.cookies.set('userInfo',JSON.stringify(responseData.userInfo));
                resp.json(responseData);
            }




        });
    });

});
/*
* 退出
* 只需将cookie中的登录用户信息清除即可
* */
router.get('/user/logout',function(req,resp){
    //将cookie中的登录用户信息清除
    req.cookies.set('userInfo',null);
    resp.json(responseData);
});
router.get('/',function(req,resp){
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) {
            console.log(err);
            return;
        }
        var dbase=db.db('blog');
        var id = req.query.contentid||'';
        dbase.collection('blog_categorys')
            .find().sort({'_id':-1}).toArray(function(err,categories) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log(categories);
                dbase.collection('blog_contents').aggregate([
                    {
                        $lookup:
                        {
                            from:'blog_categorys',
                            localField:'cid',//blog_contents表里面的字段
                            foreignField:'_id',//blog_s表里面的主键字段
                            as:'category'//别名
                        }
                    },
                    {
                        $lookup:{
                            from:'blog_users',
                            localField:'uid',
                            foreignField:'_id',
                            as:'user'
                        }

                    },
                    {$unwind:'$category'},
                    {$unwind:'$user'},
                    {$sort:{'_id':-1}},
                    {$match:{_id:objectId(id)}}
                ]).toArray(function(err,res){
                    console.log(categories);
                    var content=res[0];
                    console.log(content);
                    resp.render('main/view', {
                        userInfo: req.userInfo,
                        categories: categories,
                        content: content
                    })
                })
            })
    })
})
//评论提交
router.post('/comment/post',function(req,res){
    //内容的id
    var contentid= req.body.contentid||'';
    console.log(contentid);
    var date=new Date();
    var comment=req.body.content;
    var postDate={
        //传递object类型要相同才能比较
        uid:objectId(req.userInfo._id),
        postTime:date.toLocaleTimeString(),
        cid:objectId(contentid),
        comment:comment
    }
    if(postDate.comment==''){
        responseData.code=1;
        responseData.message='内容不能为空';
        res.json(responseData);
        return;
    }

    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        var dbase=db.db('blog');
        dbase.collection('comments').insertOne(postDate,function(){
            MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                dbase.collection('comments').aggregate([
                    {
                        $lookup:{
                            from:'blog_users',
                            localField:'uid',
                            foreignField:'_id',
                            as:'user'
                        }

                    },
                    {$unwind:'$user'},
                    {$sort:{'_id':-1}},
                    {$match:{'cid':objectId(contentid)}}
                ]).toArray(function(err,result){
                    console.log(result);
                    res.json({data: result});
            })
            })

        });

    })
});
//分类对应不同的显示内容
router.get('/display',function(req,resp){
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        var dbase=db.db('blog');
        var id = req.query.cataid||'';
        dbase.collection('blog_categorys')
            .find().sort({'_id':-1}).toArray(function(err,categories) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log(categories);
                dbase.collection('blog_contents').aggregate([
                    {
                        $lookup:
                        {
                            from:'blog_categorys',
                            localField:'cid',//blog_contents表里面的字段
                            foreignField:'_id',//blog_s表里面的主键字段
                            as:'category'//别名
                        }
                    },
                    {
                        $lookup:{
                            from:'blog_users',
                            localField:'uid',
                            foreignField:'_id',
                            as:'user'
                        }

                    },
                    {$unwind:'$category'},
                    {$unwind:'$user'},
                    {$sort:{'_id':-1}},
                    {$match:{cid:objectId(id)}}
                ]).toArray(function(err,res){
                    var content=res[0];
                    console.log(content);
                    resp.render('main/viewcc', {
                        userInfo: req.userInfo,
                        content: content
                    })
                })
            })
    })

})
module.exports = router;