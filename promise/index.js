const Promise = require('./promise');
new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(888)
    }, 1000)

});
