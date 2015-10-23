/**
 * @file pluginTest.js
 * @author dengxiaohong01
 */

define('pluginTest/plugin', ['require', 'exports', 'module'], function (require, exports, module) {
    return {
        normalize: function (name, normalize) {
            var parts = name.split('/');
            return normalize(parts[parts.length-1]);
        },

        load: function (name, require, load, config) {
            require([name], function (value) {
                load(value);
            });
        }
    };
});

define('final', [], function () {
    return {
        name: 'final',
        getName: function () {
            return this.name;
        }
    };
});

define('pluginTest/css', [], function () {
    return {
        load: function (resourceId, req, load) {
            var link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('type', 'text/css');
            link.setAttribute('href', resourceId);

            var parent = document.getElementsByTagName('head')[0]
                || document.body;
            parent.appendChild(link);

            parent = null;
            link = null;

            load(true);
        }
    };
});


function pluginTest(li) {
    require(
        [
            'pluginTest/plugin!a/b/c/final',
            'pluginTest/css!a.css'
        ],
        function (p1, p2) {
            if (p1.getName() === 'final'
                && p2) {
                li.className = 'pass';
            }
            else {
                li.className = 'fail';
            }
        }
    );
}
