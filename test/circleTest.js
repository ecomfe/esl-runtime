/**
 * @file circleTest.js
 * @author dengxiaohong01
 */

define('circleTest/index', ['require'], function (r) {
    var a = r('./a');
    return {
        name: 'index',
        check: function () {
            return a.name === 'a' && a.check();
        }
    };
});

define('circleTest/a', ['require'], function (r) {
    var b = r('./b');
    return {
        name: 'a',
        check: function () {
            return b.name === 'b' && b.check();
        }
    };
});

define('circleTest/b', ['require'], function (r) {
    return {
        name: 'b',
        check: function () {
            return r('./index').name === 'index';
        }
    };
});

function circleTest(li) {
    require(
        ['circleTest/index'],
        function (index) {
            if (index.name === 'index' && index.check()) {
                li.className = 'pass';
            }
            else {
                li.className = 'fail';
            }
        }
    );
}
