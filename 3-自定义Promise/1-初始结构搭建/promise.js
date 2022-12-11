//声明构造函数
function Promise(executor) {
    //添加属性
    this.PromiseState = 'pending';
    this.PromiseResult = null;
    //声明属性
    this.callbacks = [];
    //保存实例对象this的值
    const self = this

    //resolve函数
    function resolve(data) {
        //判断
        if (self.PromiseState !== 'pending') return
        //1.修改对象的状态 (promiseState)
        self.PromiseState = 'fulfilled'
        //2.设置对象结果值 (promiseResult)
        self.PromiseResult = data;
        //调用成功的回调函数
        setTimeout(() => {
            self.callbacks.forEach(item => {
                item.onResolved(data)
            })
        })
    }

    //reject函数
    function reject(data) {
        //判断
        if (self.PromiseState !== 'pending') return
        //1.修改对象的状态 (promiseState)
        self.PromiseState = 'rejected'
        //2.设置对象结果值 (promiseResult)
        self.PromiseResult = data;
        //调用失败的回调函数
        setTimeout(() => {
            self.callbacks.forEach(item => {
                item.onRejected(data)
            })
        })
    }

    //抛出异常 用try catch
    try {
        //同步调用【执行器函数】
        executor(resolve, reject);
    } catch (e) {
        //修改promise对象状态
        reject(e);
    }
}

//添加 then 方法
Promise.prototype.then = function (onResolved, onRejected) {
    const self = this;
    //判断回调函数参数
    if (typeof onRejected !== 'function') {
        onRejected = reason => {
            throw reason;
        }
    }
    if (typeof onResolved !== 'function') {
        onResolved = value => value;
    }
    return new Promise((resolve, reject) => {
        //封装函数
        function callback(type) {
            try {
                //获取回调函数的执行结果
                let result = type(self.PromiseResult)
                //判断
                if (result instanceof Promise) {
                    result.then(v => {
                        resolve(v);
                    }, r => {
                        reject(r)
                    })
                } else {
                    //结果的对象状态为成功
                    resolve(result)
                }
            } catch (e) {
                reject(e);
            }
        }
        //调用回调函数
        if (this.PromiseState === 'fulfilled') {
            setTimeout(() => {
                callback(onResolved);
            })
        }
        if (this.PromiseState === 'rejected') {
            setTimeout(() => {
                callback(onRejected);
            })
        }
        //判断 pending状态
        if (this.PromiseState === 'pending') {
            //保存回调函数
            this.callbacks.push({
                onResolved: function () {
                    callback(onResolved);
                },
                onRejected: function () {
                    callback(onRejected);
                }
            })
        }
    })
}

//添加 catch 方法
Promise.prototype.catch = function (onRejected) {
    return this.then(undefined, onRejected);
}

//添加 resolve 方法
Promise.resolve = function (value) {
    return new Promise((resolve, reject) => {
        if (value instanceof Promise) {
            value.then(v => {
                resolve(v);
            }, r => {
                reject(r);
            })
        } else {
            resolve(value);
        }
    })
}

//添加 reject 方法
Promise.reject = function (reason) {
    return new Promise((resolve, reject) => {
        reject(reason)
    })
}

//添加 all 方法
Promise.all = function (promises) {
    //返回结果为Promise对象
    return new Promise((resolve, reject) => {
        //声明变量
        let count = 0;
        let arr = [];
        //遍历
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(v => {
                //得知对象的状态为成功
                //每个promise对象都成功
                count++;
                //将当前peomise对象成功的结果存入数组
                arr[i] = v;
                //判断
                if (count === promises.length) {
                    resolve(arr);
                }
            }, r => {
                reject(r);
            })
        }
    })
}

//添加 race 方法
Promise.race = function (promises) {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(v => {
                resolve(v);
            }, r => {
                reject(r);
            })
        }
    })
}