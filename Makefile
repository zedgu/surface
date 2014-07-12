
SRC = index.js

include node_modules/make-lint/index.mk

TESTS = test/*

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
	  --reporter spec \
		--require should \
		--harmony-generators \
		$(TESTS) \
		--bail

test-cov:
	@NODE_ENV=test node --harmony-generators \
		node_modules/.bin/istanbul cover \
		./node_modules/.bin/_mocha \
		-- -u exports \
		--require should \
		$(TESTS) \
		--bail

test-travis:
	@NODE_ENV=test node --harmony-generators \
		node_modules/.bin/istanbul cover \
		./node_modules/.bin/_mocha \
		--report lcovonly \
		-- -u exports \
		--require should \
		$(TESTS) \
		--bail

.PHONY: all test clean