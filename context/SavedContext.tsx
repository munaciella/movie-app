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

  const refreshSaved = async () => {
    try {
      const list = await getSavedMovies();
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

  useEffect(() => {
    refreshSaved();
  }, []);

  const addSaved = async (movie: Movie) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const created = await saveMovie(movie);
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
    <SavedContext.Provider
      value={{ savedIds, addSaved, removeSaved, refreshSaved }}
    >
      {children}
    </SavedContext.Provider>
  );
}
