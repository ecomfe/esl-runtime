#! /bin/sh

basedir=$(dirname $0)

cd "$basedir/.."

rm -rf dist
mkdir dist


mkdir dist/src
cp src/miniesl.js dist/src/miniesl.source.js
# node tool/rm-ignore.js -i dist/src/miniesl.source.js -o dist/src/miniesl.source.min.js
uglifyjs dist/src/miniesl.source.js -m -c -o dist/src/miniesl.js
# uglifyjs dist/src/miniesl.source.min.js -m -c -o dist/src/miniesl.min.js
uglifyjs src/js.js -m -c -o dist/src/js.js
uglifyjs src/css.js -m -c -o dist/src/css.js

gzip -kf dist/src/miniesl.js
# gzip -kf dist/src/miniesl.min.js


cp -r test dist/test
# cp -r test dist/test-min

rm dist/test/impl/miniesl/miniesl.js
cp dist/src/miniesl.js dist/test/impl/miniesl/miniesl.js

# rm dist/test-min/impl/miniesl/miniesl.js
# cp dist/src/miniesl.min.js dist/test-min/impl/miniesl/miniesl.js
