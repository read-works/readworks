import { jaroWinkler } from '@skyra/jaro-winkler';

const SEARCH_SENSITIVITY = 0.9;

export const FuzzySearch = () => {
  return {
    /**
     * Perfoms a search using the Jaro Winkler Distance between a search query and a given string.
     * @param search
     * @param currentWordWindow
     * @param currentTextWindow
     */
    matchByJaroWinklerDistance: (searchQuery: string, currentTextWindow: string) => {
      const score = jaroWinkler(searchQuery.toLowerCase(), currentTextWindow.toLowerCase());
      if (score > SEARCH_SENSITIVITY) {
        return { match: true, score: score };
      } else {
        return { match: false, score: score };
      }
    },
  };
};
