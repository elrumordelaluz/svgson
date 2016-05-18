BIN = `npm bin`
TESTS = ./test
REPORTER = spec

# Task: test
# Run mocha tests for components.
test:
	@NODE_ENV=test $(BIN)/mocha \
	  --reporter $(REPORTER) \
		--recursive \
		--timeout 5000 \
		$(TESTS)

.PHONY: test
