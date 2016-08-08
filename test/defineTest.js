/**
 * @file defineTest.js
 * @author dengxiaohong01
 */

define('defineTest/mod1', [], function () {
    return {
        name: 'mod1'
    };
});

define('defineTest/mod2', [], {
    name: 'mod2'
});

function defineTest(li) {
    require(
        [
            'defineTest/mod1',
            'defineTest/mod2'
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
