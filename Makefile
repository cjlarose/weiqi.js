SOURCEDIR := src
DISTDIR := dist
SOURCES := $(shell find $(SOURCEDIR) -name '*.js')
TRANSPILED := $(patsubst $(SOURCEDIR)/%, $(DISTDIR)/%, $(SOURCES))

$(TRANSPILED): $(SOURCES)
	./node_modules/.bin/babel $(SOURCEDIR) --out-dir $(DISTDIR)

test: $(TRANSPILED)
	./node_modules/.bin/mocha --reporter spec
