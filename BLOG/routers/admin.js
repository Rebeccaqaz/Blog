/**
 *处理后台发送的请求
 * 后台的服务端程序
 */

var express = require('express');
var mongodb=require('mongodb');
var MongoClient=mongodb.MongoClient;
var router = express.Router();
var url='mongodb://localhost:27017';
var responseData;
var objectId=mongodb.ObjectId;
router.use(function(req,resp,next){
    responseData={
        code:0,
        message:''
    };
    next();
});
//所有都有admin显示 userInfo(通过保存在cooies)里的都要通过绚染render传递

//访问后台首页的路由，将一个地址和回调函数绑在一起，这个叫路由
router.get('/',function(req,resp){
    //渲染views/admin/index.html
    resp.render('admin/index',{
        userInfo:req.userInfo
    });
});

//用户管理
router.get('/user/userInfo',function(req,resp){
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) {
            console.log(err);
            return;
        }
        var dbase=db.db('blog');
        dbase.collection('blog_users')
            .find().sort({'_id':-1}).toArray(function(err,results){
                if (err) {
                    console.log(err);
                    return;
                }
                //获取当前查询页数默认第一条
                var page=req.query.page||1;
                //每页显示三条数据
                var limit=3;
                //计算总页数
                var totalPage=Math.ceil(results.length/limit);
                //如果当前页小于等于第一页那么查询第一页内容
                if(page<=1){page=1;}
                //如果当前页大于等于最后一页那么查询最后一页内容
                if(page>=totalPage){page=totalPage;}
                //计算出从哪个下标开始查起
                var startIndex=(page-1)*limit;
                var users=results.slice(startIndex,startIndex+limit);
                resp.render('admin/user_info',{
                    userInfo:req.userInfo,
                    users:users,
                    count:results.length,
                    page:page,
                    limit:limit,
                    totalPage:totalPage
                });
            });
    });

});

//分类添加先用渲染跳到category_add页面
router.get('/category/add',function(req,resp){
    resp.render('admin/category_add',{
        userInfo:req.userInfo
    });
});
//分类添加
router.post('/category/add', function (req,resp) {
    var categoryname=req.body.categoryname||'';
    if(categoryname==''){

        resp.render('admin/error',{
            userInfo:req.userInfo,
            message:'分类名不能为空',
            url:'/admin/category/add'
        });
        return;
    }
    MongoClient.connect(url,{ useNewUrlParser: true,useUnifiedTopology:true },
        function(err,db){

        if(err){
            console.log(err);
            return;
        }

        //判断添加的分类名是否已经在数据库中存在
        //获取操作的数据库

        var dbase = db.db('blog');

        var whereStr={'categoryname':categoryname};

        dbase.collection('blog_categorys')
            .find(whereStr).toArray(function(err,results){
            if(err){
                console.log(err);
                return;
            }
            if(results.length>0){

                resp.render('admin/error',{
                    userInfo:req.userInfo,
                    message:'分类名已经被添加了',
                    url:'/admin/category/add'
                });
            }
            else{

                //定义一个插入分类的json对象
                var category = {
                    'categoryname':categoryname
                };


                dbase.collection('blog_categorys').insertOne(category,function(err,res){

                    if(err){
                        console.log(err);
                        return;
                    }
                    resp.render('admin/success',{
                        userInfo:req.userInfo,
                        message:'添加分类成功',
                        url:'/admin/category/Info'
                    });

                });
            }
        });

    });

});

//分类修改
router.get('/category/edit',function(req,resp){
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var id = req.query.id||'';
        var dbase=db.db('blog');
        var whereStr={'_id':objectId(id)};
        dbase.collection('blog_categorys').find(whereStr).toArray(function(err,results){
            if(err){
                console.log(err);
                return;
            }
            if(results.length==0) {
                resp.render('admin/error', {
                    userInfo: req.userInfo,
                    message: '分类信息不存在',
                    url: '/admin/category/Info'
                });
            }

            resp.render('admin/category_edit',{
                    userInfo:req.userInfo,
                    categoryname:results[0].categoryname
                })
        })
    });

})
//分类删除
router.get('/category/delete',function(req,res){

    var id =req.query.id||'';
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbase=db.db('blog');
        //给定删除条件
        var whereStr={'_id':objectId(id)};
        dbase.collection('blog_categorys').deleteOne(whereStr,function(err,results){
            if(err){
                console.log(err);
                return;
            }
            res.render('admin/success',{
                userInfo:req.userInfo,
                message:'删除成功',
                url:'/admin/category/Info'
            })
        });
    });

})
//分类展示.
router.get('/category/Info',function(req,resp){
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) {
            console.log(err);
            return;
        }
        var dbase=db.db('blog');
        dbase.collection('blog_categorys')
            .find().sort({'_id':-1}).toArray(function(err,results){
                if (err) {
                    console.log(err);
                    return;
                }
                //获取当前查询页数默认第一条
                var page=req.query.page||1;
                //每页显示三条数据
                var limit=3;
                //计算总页数
                var totalPage=Math.ceil(results.length/limit);
                //如果当前页小于等于第一页那么查询第一页内容
                if(page<=1){page=1;}
                //如果当前页大于等于最后一页那么查询最后一页内容
                if(page>=totalPage){page=totalPage;}
                //计算出从哪个下标开始查起
                var startIndex=(page-1)*limit;
                var categorys=results.slice(startIndex,startIndex+limit);
                resp.render('admin/category_info',{
                    userInfo:req.userInfo,
                    categorys:categorys,
                    count:results.length,
                    page:page,
                    limit:limit,
                    totalPage:totalPage
                });
            });
    });

});

//内容添加先进行渲染跳转到add页面
router.get('/content/add',function(req,resp){

    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) {
            console.log(err);
            return;
        }
        var dbase=db.db('blog');
        dbase.collection('blog_categorys')
            .find().sort({'_id':-1}).toArray(function(err,results){
                if (err) {
                    console.log(err);
                    return;
                }
                var categories=results;
                resp.render('admin/content_add',{
                    userInfo:req.userInfo,
                    categories:categories
                });
            });
    });
});
//不知道怎么弄这种分类查询也没有什么思路呢添加不需要关联查
//内容保存 处理通过action 传来的post请求 a标签默认为get请求 不可改变
router.post('/content/add',function(req,resp){
    if(req.body.title==''){
        resp.render('admin/error',{
            userInfo:req.userInfo,
            message:'标题不能为空'
        })
        return;
    }
    if(req.body.content==''){
        resp.render('admin/error',{
            userInfo:req.userInfo,
            message:'内容不能为空'
        })
        return;
    }
    //保存
    MongoClient.connect(url,{ useNewUrlParser: true,useUnifiedTopology:true },
        function(err,db){

            if(err){
                console.log(err);
                return;
            }

            var dbase = db.db('blog');
            var date=new Date();
                        //定义一个插入分类的json对象
                        var content = {
                            cid:objectId(req.body.category),
                            title:req.body.title,
                            disc:req.body.disc,
                            content:req.body.content,
                            uid:objectId(req.userInfo._id),
                            views:10,
                            addTime:date.toLocaleTimeString()
                        };


                        dbase.collection('blog_contents').insertOne(content,function(err,res){

                            if(err){
                                console.log(err);
                                return;
                            }
                            resp.render('admin/success',{
                                userInfo:req.userInfo,
                                message:'添加内容成功',
                                url:'/admin/content/Info'
                            });

                        });

                });



})
//修改内容
router.post('/content/edit',function(req,resp){
    if(req.body.title==''){
        resp.render('admin/error',{
            userInfo:req.userInfo,
            message:'标题不能为空'
        })
        return;
    }
    if(req.body.content==''){
        resp.render('admin/error',{
            userInfo:req.userInfo,
            message:'内容不能为空'
        })
        return;
    }
    //保存
    MongoClient.connect(url,{ useNewUrlParser: true,useUnifiedTopology:true },
        function(err,db){

            if(err){
                console.log(err);
                return;
            }

            var dbase = db.db('blog');
            var date=new Date();
            //定义一个插入分类的json对象
            var content = {
                cid:objectId(req.body.category),
                title:req.body.title,
                disc:req.body.disc,
                content:req.body.content,
                uid:objectId(req.userInfo._id),
                views:10,
                addTime:date.toLocaleTimeString()
            };

            //var updateStr={$set:content};
            //dbase.collection('blog_contents').updateOne(whereStr,updateStr,true,function(err,results){
            //    if(err){
            //        console.log(err);
            //        return;
            //    }
            dbase.collection('blog_contents').insertOne(content,function(err,res){

                if(err){
                    console.log(err);
                    return;
                }
                resp.render('admin/success',{
                    userInfo:req.userInfo,
                    message:'修改内容成功',
                    url:'/admin/content/Info'
                });

            });

        });



})

//内容显示 怎么进行两次聚合查询和怎么设置阅读量？？？
router.get('/content/Info',function(req,resp){
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) {
            console.log(err);
            return;
        }
        var dbase=db.db('blog');
        dbase.collection('blog_contents').aggregate([{
            $lookup:{
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
            {$unwind:'$category'},{$unwind:'$user'},{$sort:{'_id':-1}}]).toArray(function(err,results){
            if(err){
                console.log(err);
                return;
            }
                //获取当前查询页数默认第一条
                var page=req.query.page||1;
                //每页显示三条数据
                var limit=3;
                //计算总页数
                var totalPage=Math.ceil(results.length/limit);
                //如果当前页小于等于第一页那么查询第一页内容
                if(page<=1){page=1;}
                //如果当前页大于等于最后一页那么查询最后一页内容
                if(page>=totalPage){page=totalPage;}
                //计算出从哪个下标开始查起
                var startIndex=(page-1)*limit;
                var contents=results.slice(startIndex,startIndex+limit);
                resp.render('admin/content_info',{
                    userInfo:req.userInfo,
                    contents:contents,
                    count:results.length,
                    page:page,
                    limit:limit,
                    totalPage:totalPage
                });
            });
    });

});
//内容修改

router.get('/content/edit',function(req,resp){
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var id = req.query.id||'';
        var dbase=db.db('blog');
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
                    {$unwind:'$category'},
                    {$sort:{'_id':-1}},
                    {$match:{_id:objectId(id)}}
                ]).toArray(function(err,res){
                    var content=res[0];
                    console.log(categories);
                    resp.render('admin/content_edit', {
                        userInfo: req.userInfo,
                        categories: categories,
                        content: content
                    })
                })
            })
    })
})


//内容删除
router.get('/content/delete',function(req,res){

    var id =req.query.id||'';
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbase=db.db('blog');
        //给定删除条件
        var whereStr={'_id':objectId(id)};
        dbase.collection('blog_contents').deleteOne(whereStr,function(err,results){
            if(err){
                console.log(err);
                return;
            }
            res.render('admin/success',{
                userInfo:req.userInfo,
                message:'删除成功',
                url:'/admin/content/Info'
            })
        });
    });

})

//退出登录
router.get('/logout',function(req,resp){
    resp.render('main/index',{
        userInfo:req.userInfo
    });
});
module.exports = router;