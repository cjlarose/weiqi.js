SOURCEDIR := src
BUILDDIR := build
DISTDIR := dist
SOURCES := $(shell find $(SOURCEDIR) -name '*.js')
TRANSPILED := $(patsubst $(SOURCEDIR)/%, $(BUILDDIR)/%, $(SOURCES))

$(TRANSPILED): $(SOURCES)
	./node_modules/.bin/babel $(SOURCEDIR) --out-dir $(BUILDDIR)

test: $(TRANSPILED)
	./node_modules/.bin/mocha --reporter spec

.PHONY: clean
clean:
	rm -f $(TRANSPILED)
