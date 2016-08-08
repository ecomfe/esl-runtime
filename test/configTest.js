/**
 * @file configTest.js
 * @author dengxiaohong01
 */

define('configTest/mod1', ['module'], function (module) {
    var conf = module.config();

    return {
        getColor: function () {
            return conf.color;
        }
    };
});

define('configTest/mod2', ['module'], function (module) {
    var conf = module.config();

    return {
        getColor: function () {
            return conf.color;
        }
    };
});

function configTest(li) {
    require(
        [
            'configTest/mod1',
            'configTest/mod2'
        ],
        function (mod1, mod2) {
            if (mod1.getColor() === 'red' && mod2.getColor() === 'green') {
                li.className = 'pass';
            }
            else {
                li.className = 'fail';
            }
        }
    );
}
