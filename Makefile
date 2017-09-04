install:
		npm install
start:
		npm run babel-node -- index.js
publish:
		npm publish
lint:
		npm run eslint -- src
test:
		npm test
start:
		npm run nodemon -- --exec babel-node bin/server
