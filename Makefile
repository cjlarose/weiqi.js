SOURCEDIR := src
BROWSERDIR := dist-browser
NODEDIR := dist
SOURCES := $(shell find $(SOURCEDIR) -name '*.js')
TRANSPILED := $(patsubst $(SOURCEDIR)/%, $(NODEDIR)/%, $(SOURCES))

.PHONY: all
all: $(BROWSERDIR)/weiqi.js $(TRANSPILED)

$(BROWSERDIR)/weiqi.js:
	./node_modules/.bin/browserify src/exports.js -t babelify -o $@

$(TRANSPILED): $(SOURCES)
	./node_modules/.bin/babel $(SOURCEDIR) --out-dir $(NODEDIR)

.PHONY: test
test: $(TRANSPILED)
	./node_modules/.bin/mocha --reporter spec

.PHONY: clean
clean:
	rm -f $(TRANSPILED) $(BROWSERDIR)/weiqi.js
