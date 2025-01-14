// we shouzld extend...
//https://www.utf8-chartable.de/

// KEEP IN SYNC WITH FRONTEND -> search for SEARCHSTRING_CLEANUP

export const SEARCHSTRING_CLEANUP = /\s|[^0-9a-zA-Z\u0080-\uFFFF-]|„|“|”|‚|’|‘|«|»|‹/gi;
