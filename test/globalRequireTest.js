/**
 * @file globalRequireTest.js
 * @author dengxiaohong01
 */

define('globalRequireTest/mod1', [], function () {
    return {
        name: 'mod1'
    };
});

define('globalRequireTest/mod2', [], function () {
    return {
        name: 'mod2'
    };
});

function globalRequireTest(li) {
    require(['globalRequireTest/mod1'], function (m1) {
        li.className = m1.name === 'mod1'
            ? 'pass'
            : 'fail';
    });

    var m1 = require('globalRequireTest/mod1');
    li.className = m1.name === 'mod1'
        ? 'pass'
        : 'fail';

    require(
        [
            'globalRequireTest/mod1',
            'globalRequireTest/mod2'
        ],
        function (m1, m2) {
            if (m1.name === 'mod1' && m2.name === 'mod2') {
                li.className = 'pass';
            }
            else {
                li.className = 'fail';
            }
        }
    );
}
