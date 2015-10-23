/**
 * @file mapTest.js
 * @author dengxiaohong01
 */

define('mapTest/mod1', ['require'], function (require) {
    return {
        name: 'mod1',
        getTeName: function () {
            return require('te').name; // 等价于 require('mapstar');
        }
    };
});


define('mapTest/mod2', ['require'], function (require) {
    return {
        name: 'mod2',
        getTeName: function () {
            return require('te').name; // 等价于 require('moremap');
        }
    };
});

define('mapTest/mod3', ['require'], function (require) {
    return {
        name: 'mod3',
        getTeName: function () {
            return require('te').name; // 等价于 require('map');
        }
    };
});
define('mapTest/mod3/a', ['require'], function (require) {
    return {
        name: 'mod3',
        getTeName: function () {
            return require('te').name; // 等价于 require('map');
        }
    };
});

define('mapTest/map', [], function () {
    return {
        name: 'map'
    };
});

define('mapTest/mapstar', [], function () {
    return {
        name: 'mapstar'
    };
});

define('mapTest/moremap', [], function () {
    return {
        name: 'moremap'
    };
});

function mapTest(li) {
    require(
        [
            'mapTest/mod1',
            'mapTest/mod2',
            'mapTest/mod3',
            'mapTest/mod3/a'
        ],
        function (m1, m2, m3, m4) {
            if (m1.getTeName() === 'mapstar'
                && m2.getTeName() === 'moremap'
                && m3.getTeName() === 'map'
                && m4.getTeName() === 'map') {
                    li.className = 'pass';
            }
            else {
                li.className = 'fail';
            }
        }
    );
}