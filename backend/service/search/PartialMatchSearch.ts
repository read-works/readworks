export const PartialMatchSearch = () => {
  return {
    /**
     * This method checks whether a search query is partially contained in a text
     * We consider these hits to be relevant no matter the fuzzy matching score
     * @param search
     * @param currentWordWindow
     * @param currentTextWindow
     */
    matchByPartial: (searchQuery: string, currentTextWindow: string) => {
      if (currentTextWindow.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase())) {
        return { match: true, score: 1 };
      } else {
        return { match: false, score: 0 };
      }
    },
  };
};
