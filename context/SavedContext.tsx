// context/SavedContext.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  getSavedMovies,
  saveMovie,
  removeSavedMovie,
} from "@/services/appwrite";

interface SavedContextValue {
  savedIds: Set<number>;
  addSaved: (movie: Movie) => Promise<void>;
  removeSaved: (movieId: number, docId: string) => Promise<void>;
  refreshSaved: () => Promise<void>;
}

const SavedContext = createContext<SavedContextValue | null>(null);

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) {
    throw new Error("useSaved must be used within a SavedProvider");
  }
  return ctx;
}

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  // Fetch all saved movies once on mount, store just the movie_id in a Set.
  const refreshSaved = async () => {
    try {
      const list = await getSavedMovies(); // returns SavedMovie[] | undefined
      if (Array.isArray(list)) {
        const idSet = new Set<number>(list.map((doc) => doc.movie_id));
        setSavedIds(idSet);
      } else {
        setSavedIds(new Set());
      }
    } catch (err) {
      console.error("Failed to load saved IDs:", err);
      setSavedIds(new Set());
    }
  };

  // Call refreshSaved() when provider first mounts
  useEffect(() => {
    refreshSaved();
  }, []);

  // addSaved: call Appwrite’s saveMovie and update the Set
  const addSaved = async (movie: Movie) => {
    try {
      const created = await saveMovie(movie); // returns SavedMovie
      // created.movie_id === movie.id
      setSavedIds((prev) => {
        const copy = new Set(prev);
        copy.add(movie.id);
        return copy;
      });
    } catch (err) {
      console.error("Error in addSaved:", err);
      throw err;
    }
  };

  // removeSaved: call Appwrite’s removeSavedMovie(docId) and update Set
  const removeSaved = async (movieId: number, docId: string) => {
    try {
      await removeSavedMovie(docId);
      setSavedIds((prev) => {
        const copy = new Set(prev);
        copy.delete(movieId);
        return copy;
      });
    } catch (err) {
      console.error("Error in removeSaved:", err);
      throw err;
    }
  };

  return (
    <SavedContext.Provider value={{ savedIds, addSaved, removeSaved, refreshSaved }}>
      {children}
    </SavedContext.Provider>
  );
}
