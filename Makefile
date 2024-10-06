install: deps-install
	npx simple-git-hooks

run:
	bin/nodejs-package.js 10

deps-install:
	npm ci --legacy-peer-deps

deps-update:
	npx ncu -u

test:
	npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8

lint:
	npx eslint .

publish:
	npm publish

.PHONY: test

tests:
	npm run test
make publish:
	npm publish --dry-run
make debug-test:
	DEBUG=page-loader* make test
make debug-nock:
	DEBUG=nock.* make test
