module.exports = 2 ;
//exports代表了module.exports 不能给exports直接赋值破坏指向导致无法导出，而是需要直接在后面添加属性赋值
//module.exports可以直接赋值值就会被导出 但是exports直接赋值就不能被导出,必须使用exports.XXX才可以