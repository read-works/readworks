GENCCODE_ASSEMBLY_TYPE=-a gcc-darwin
SO=dylib
SOBJ=dylib
A=a
LIBPREFIX=lib
LIB_EXT_ORDER=.75.1.dylib
COMPILE=arm64-apple-darwin20.0.0-clang -DU_ALL_IMPLEMENTATION -DU_ATTRIBUTE_DEPRECATED= -D_FORTIFY_SOURCE=2 -isystem /Applications/readworks.app/Contents/Resources/poppler/rattler/.prefix/include -mmacosx-version-min=11.0 -mmacosx-version-min=11.0   -DU_HAVE_STRTOD_L=1 -DU_HAVE_XLOCALE_H=1  -ftree-vectorize -fPIC -fstack-protector-strong -O2 -pipe -isystem /Applications/readworks.app/Contents/Resources/poppler/rattler/.prefix/include -fdebug-prefix-map=/Users/runner/miniforge3/conda-bld/icu_1720853142969/work=/usr/local/src/conda/icu-75.1 -fdebug-prefix-map=/Applications/readworks.app/Contents/Resources/poppler/rattler/.prefix=/usr/local/src/conda-prefix -std=c11 -Wall -pedantic -Wshadow -Wpointer-arith -Wmissing-prototypes -Wwrite-strings   -fno-common -c
LIBFLAGS=-I/Applications/readworks.app/Contents/Resources/poppler/rattler/.prefix/include  -dynamic
GENLIB=arm64-apple-darwin20.0.0-clang -dynamiclib -dynamic -ftree-vectorize -fPIC -fstack-protector-strong -O2 -pipe -isystem /Applications/readworks.app/Contents/Resources/poppler/rattler/.prefix/include -fdebug-prefix-map=/Users/runner/miniforge3/conda-bld/icu_1720853142969/work=/usr/local/src/conda/icu-75.1 -fdebug-prefix-map=/Applications/readworks.app/Contents/Resources/poppler/rattler/.prefix=/usr/local/src/conda-prefix -std=c11 -Wall -pedantic -Wshadow -Wpointer-arith -Wmissing-prototypes -Wwrite-strings   -Wl,-headerpad_max_install_names -Wl,-dead_strip_dylibs -Wl,-rpath,/Applications/readworks.app/Contents/Resources/poppler/rattler/.prefix/lib -L/Applications/readworks.app/Contents/Resources/poppler/rattler/.prefix/lib -Wl,-rpath,/Applications/readworks.app/Contents/Resources/poppler/rattler/.prefix/lib 
LDICUDTFLAGS=
LD_SONAME=-Wl,-compatibility_version -Wl,75 -Wl,-current_version -Wl,75.1 -install_name /Applications/readworks.app/Contents/Resources/poppler/rattler/.prefix/lib/
RPATH_FLAGS=
BIR_LDFLAGS=
AR=arm64-apple-darwin20.0.0-ar
ARFLAGS=r -c
RANLIB=arm64-apple-darwin20.0.0-ranlib
INSTALL_CMD=/usr/bin/install -c
