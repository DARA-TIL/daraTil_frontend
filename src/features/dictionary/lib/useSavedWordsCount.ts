import { useEffect, useMemo } from "react";
import { useDictionaryStore } from "../store/useDictionaryStore";

/**
 * Number of dictionary words the user has saved (favorited).
 *
 * This is the meaningful "words learned" metric for the profile and dashboard:
 * it reflects the words the user actually collected in the dictionary, rather
 * than the backend profile counter (which does not track saved words).
 */
export function useSavedWordsCount(): number {
  const favoriteIds = useDictionaryStore((state) => state.favoriteIds);
  const refreshFavorites = useDictionaryStore((state) => state.refreshFavorites);

  useEffect(() => {
    void refreshFavorites();
  }, [refreshFavorites]);

  return useMemo(
    () => Object.values(favoriteIds).filter(Boolean).length,
    [favoriteIds],
  );
}
