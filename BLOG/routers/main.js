
/**
 * 处理前台首页发送的请求
 * 前台首页的服务端程序
 */

var express = require('express');

var router = express.Router();

var mongodb=require('mongodb');
var MongoClient=mongodb.MongoClient;
var url='mongodb://localhost:27017';
var objectId=mongodb.ObjectId;

//访问前台首页的路由，将一个地址和回调函数绑在一起，这个叫路由
router.get('/',function(req,resp){

        MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
            if (err) {
                console.log(err);
                return;
            }
            var dbase=db.db('blog');
            //读取内容 最新的展示在最前面
            dbase.collection('blog_categorys')
                .find().sort({addTime:-1}).toArray(function(err,categories) {
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
                        {$sort:{'_id':-1}}
                    ]).toArray(function(err,res){
                        console.log(categories);
                        //获取当前查询页数默认第一条
                        var page=req.query.page||1;
                        //每页显示三条数据
                        var limit=3;
                        //计算总页数
                        var totalPage=Math.ceil(res.length/limit);
                        //如果当前页小于等于第一页那么查询第一页内容
                        if(page<=1){page=1;}
                        //如果当前页大于等于最后一页那么查询最后一页内容
                        if(page>=totalPage){page=totalPage;}
                        //计算出从哪个下标开始查起
                        var startIndex=(page-1)*limit;
                        var contents=res.slice(startIndex,startIndex+limit);
                        resp.render('main/index', {
                            userInfo: req.userInfo,
                            categories: categories,
                            contents: contents,
                            page:page,
                            limit:limit,
                            totalPage:totalPage
                        })
                    })
                })
        })
});
module.exports = router;