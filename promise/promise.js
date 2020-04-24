const PENDING = 'PENDING';
const RESOLVED = 'RESOLVED';
const REJECTED = 'REJECTED';
const resolvePromise = (promise2, x, resolve, reject) => {
    if (promise2 === x) {
        reject(new TypeError('chucuole'))
    }
    if ((x !== null && typeof x === 'object') || typeof x === 'function') {
        let used;
        try {
            let then = x.then;
            if (typeof then === 'function') {
                then.call(x, (y) => {
                    if (used) {
                        return
                    }
                    used = true;
                    resolvePromise(promise2, y, resolve, reject);
                }, (r) => {
                    if (used) {
                        return
                    }
                    used = true;
                    reject(r);
                })

            } else {
                if (used) {
                    return
                }
                used = true;
                resolve(x);
            }

        } catch (e) {
            if (used) {
                return
            }
            used = true;
            reject(e)
        }
    } else {
        resolve(x)
    }


};

class Promise {
    constructor(executor) {
        // Promise 必须处于以下三个状态之一: pending, fulfilled（resolved） 或者是 rejected
        this.status = PENDING; // 默认的状态是pending
        // value 是promise状态成功时的值，包括 undefined/thenable或者是 promise
        this.value = undefined;
        // reason 是promise状态失败时的值
        this.reason = undefined;
        this.onFulfilledArray = [];
        this.onRejectedArray = [];
        // 成功执行的回调
        const resolve = (value) => {
            if (this.status === PENDING) {
                this.status = RESOLVED;
                this.value = value;
                this.onFulfilledArray.forEach(fn => fn())
            }

        };
        // 失败执行的回调
        const reject = (value) => {
            if (this.status === PENDING) {
                this.status = REJECTED;
                this.reason = value;
                this.onRejectedArray.forEach(fn => fn())
            }

        }
        try {
            executor(resolve, reject)
        } catch (e) {
            reject(e);
        }
    }
    // promise必须提供一个then方法，来访问最终的结果
    // promise的then方法接收两个参数
    // onFulfilled 和 onRejected 都是可选参数
    // 两个可选参数必须是函数类型
    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (value) => value;
        onRejected = typeof onRejected === 'function' ? onRejected : (reason) => { throw reason };
        // then会返回一个新的promise
        let promise2 = new Promise((resolve, reject) => {
            // 同步情况
            if (this.status === RESOLVED) {
                setTimeout(() => {
                    try {
                        // x可能是个普通值，也可能是个promise
                        let x = onFulfilled(this.value);
                        resolvePromise(promise2, x, resolve,reject)
                    } catch (e) {
                        reject(e)
                    }

                });
            }
            if (this.status === REJECTED) {
                setTimeout(() => {
                    try {
                        let x = onRejected(this.reason);
                        resolvePromise(promise2, x, resolve,reject)
                    } catch (e) {
                        reject(e)
                    }
                });
            }
            // 异步情况
            if (this.status === PENDING) {
                this.onRejectedArray.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onRejected(this.reason);
                            resolvePromise(promise2, x, resolve,reject)
                        } catch (e) {
                            reject(e)
                        }
                    });
                });
                this.onFulfilledArray.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onFulfilled(this.value);
                            resolvePromise(promise2, x, resolve,reject)
                        } catch (e) {
                            reject(e)
                        }
                    });
                })

            }
        });
        return promise2
    }

}
Promise.defer = Promise.deferred = function () {
    let dfd = {};
    dfd.promise = new Promise((resolve, reject) => {
        dfd.resolve = resolve;
        dfd.reject = reject;
    });
    return dfd;
}

module.exports = Promise;


