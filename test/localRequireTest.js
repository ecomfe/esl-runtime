/**
 * @file localRequireTest.js
 * @author dengxiaohong01
 */

define('localRequireTest1/mod1', [], function () {
    return {
        name: 'mod1'
    };
});

define('localRequireTest1/mod2', [], function () {
    return {
        name: 'mod2'
    };
});

define('localRequireTest1/mod4', ['require', 'localRequireTest1/mod1'], function (require, m1) {
    return {
        name: 'mod4',
        mod1Name: m1.name,
        mod2Name: require('localRequireTest1/mod2').name
    };
});

function localRequireTest1(li) {
    require(['localRequireTest1/mod4'], function (m4) {
        if (m4.name === 'mod4'
            && m4.mod1Name === 'mod1'
            && m4.mod2Name === 'mod2') {

            li.className = 'pass';
        }
        else {
            li.className = 'fail';
        }
    });
}



define('parent/child1', [], function () {
    return {
        name: 'child1'
    };
});
define('parent/child2', [], function () {
    return {
        name: 'child2'
    };
});

define('parent/child4', ['require', './child1'], function (require, ch1) {
    return {
        name: 'child4',
        child1Name: ch1.name,
        child2Name: require('./child2').name
    };
});

function localRequireTest2(li) {
    require(['parent/child4'], function (ch4) {
        if (ch4.name === 'child4'
            && ch4.child1Name === 'child1'
            && ch4.child2Name === 'child2') {

            li.className = 'pass';
        }
        else {
            li.className = 'fail';
        }
    });
}

function localRequireTest(li) {
    localRequireTest1(li);
    localRequireTest2(li);
}
