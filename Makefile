install:
		npm install
start:
		sudo service redis_6379 start
		npm run nodemon -- --exec babel-node bin/server
publish:
		npm publish
lint:
		npm run eslint -- src
test:
		npm test
