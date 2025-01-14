GENCCODE_ASSEMBLY_TYPE=-a gcc-darwin
SO=dylib
SOBJ=dylib
A=a
LIBPREFIX=lib
LIB_EXT_ORDER=.73.2.dylib
COMPILE=x86_64-apple-darwin13.4.0-clang -DU_ATTRIBUTE_DEPRECATED= -D_FORTIFY_SOURCE=2 -isystem /Applications/readworks.app/Contents/Resources/poppler/rattler/.prefix/include -mmacosx-version-min=10.9   -DU_HAVE_STRTOD_L=1 -DU_HAVE_XLOCALE_H=1 -DU_HAVE_STRING_VIEW=1  -march=core2 -mtune=haswell -mssse3 -ftree-vectorize -fPIC -fPIE -fstack-protector-strong -O2 -pipe -isystem /Applications/readworks.app/Contents/Resources/poppler/rattler/.prefix/include -fdebug-prefix-map=/Users/runner/miniforge3/conda-bld/icu_1692900505391/work=/usr/local/src/conda/icu-73.2 -fdebug-prefix-map=/Applications/readworks.app/Contents/Resources/poppler/rattler/.prefix=/usr/local/src/conda-prefix -std=c11 -Wall -pedantic -Wshadow -Wpointer-arith -Wmissing-prototypes -Wwrite-strings   -fno-common -c
LIBFLAGS=-I/Applications/readworks.app/Contents/Resources/poppler/rattler/.prefix/include  -dynamic
GENLIB=x86_64-apple-darwin13.4.0-clang -dynamiclib -dynamic -march=core2 -mtune=haswell -mssse3 -ftree-vectorize -fPIC -fPIE -fstack-protector-strong -O2 -pipe -isystem /Applications/readworks.app/Contents/Resources/poppler/rattler/.prefix/include -fdebug-prefix-map=/Users/runner/miniforge3/conda-bld/icu_1692900505391/work=/usr/local/src/conda/icu-73.2 -fdebug-prefix-map=/Applications/readworks.app/Contents/Resources/poppler/rattler/.prefix=/usr/local/src/conda-prefix -std=c11 -Wall -pedantic -Wshadow -Wpointer-arith -Wmissing-prototypes -Wwrite-strings   -Wl,-pie -Wl,-headerpad_max_install_names -Wl,-dead_strip_dylibs -Wl,-rpath,/Applications/readworks.app/Contents/Resources/poppler/rattler/.prefix/lib -L/Applications/readworks.app/Contents/Resources/poppler/rattler/.prefix/lib -Wl,-rpath,/Applications/readworks.app/Contents/Resources/poppler/rattler/.prefix/lib 
LDICUDTFLAGS=
LD_SONAME=-Wl,-compatibility_version -Wl,73 -Wl,-current_version -Wl,73.2 -install_name /Applications/readworks.app/Contents/Resources/poppler/rattler/.prefix/lib/
RPATH_FLAGS=
BIR_LDFLAGS=
AR=x86_64-apple-darwin13.4.0-ar
ARFLAGS=r -c
RANLIB=x86_64-apple-darwin13.4.0-ranlib
INSTALL_CMD=/usr/bin/install -c
