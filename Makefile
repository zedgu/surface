
SRC = index.js

include node_modules/make-lint/index.mk

TESTS = test/*

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--harmony-generators \
		$(TESTS) \
		--bail

test-cov:
	@NODE_ENV=test node --harmony-generators \
		./node_modules/.bin/_mocha \
		-- -u exports \
		$(TESTS) \
		--bail

test-travis:
	@NODE_ENV=test node --harmony-generators \
		./node_modules/.bin/_mocha \
		--report lcovonly \
		-- -u exports \
		$(TESTS) \
		--bail

bench:
	@$(MAKE) -C benchmarks

.PHONY: test bench