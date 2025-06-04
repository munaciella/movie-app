import { Client, Databases, ID, Query } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
const SAVED_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_SAVED_COLLECTION_ID!;
const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;

if (!DATABASE_ID || !COLLECTION_ID || !SAVED_COLLECTION_ID || !PROJECT_ID) {
  throw new Error(
    `Missing Appwrite config. Got: ${JSON.stringify({
      DATABASE_ID,
      COLLECTION_ID,
      SAVED_COLLECTION_ID,
      PROJECT_ID,
    })}`
  );
}

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (query: string, movie: Movie) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", query),
    ]);

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      await database.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        existingMovie.$id,
        {
          count: existingMovie.count + 1,
        }
      );
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm: query,
        movie_id: movie.id,
        title: movie.title,
        count: 1,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });
    }
  } catch (error) {
    console.error("Error updating search count:", error);
    throw error;
  }
};

export const getTrendingMovies = async (): Promise<
  TrendingMovie[] | undefined
> => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc("count"),
    ]);

    return result.documents as unknown as TrendingMovie[];
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export interface SavedMovie {
  $id: string;        // Appwrite’s document ID
  movie_id: number;
  title: string;
  poster_url: string;
  $createdAt: string; // provided by Appwrite automatically
  vote_average: number; // optional, if you want to store more details
  release_date: string; // optional, if you want to store more details
}

/**
 * Save a movie to the “SavedMovies” collection.
 * If movie_id already exists, returns the existing document.
 */
export const saveMovie = async (movie: Movie): Promise<SavedMovie> => {
  try {
    // 1) Check if this movie_id is already saved
    const existing = await database.listDocuments(
      DATABASE_ID,
      SAVED_COLLECTION_ID,
      [
        Query.equal("movie_id", movie.id),
        Query.limit(1),
      ]
    );

    if (existing.documents.length > 0) {
      // Already saved → return it
      return existing.documents[0] as unknown as SavedMovie;
    }

    const integerRating = Math.round(movie.vote_average);

    // 2) Create a new “saved” document
    const created = await database.createDocument(
      DATABASE_ID,
      SAVED_COLLECTION_ID,
      ID.unique(),
      {
        movie_id: movie.id,
        title: movie.title,
        poster_url: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : "",
        vote_average: integerRating,
        release_date: movie.release_date,
      }
    );
    return created as unknown as SavedMovie;
  } catch (err) {
    console.error("Error saving movie:", err);
    throw err;
  }
};

/**
 * Remove a saved movie by its Appwrite document ID.
 */
export const removeSavedMovie = async (docId: string): Promise<void> => {
  try {
    await database.deleteDocument(DATABASE_ID, SAVED_COLLECTION_ID, docId);
  } catch (err) {
    console.error("Error removing saved movie:", err);
    throw err;
  }
};

/**
 * Fetch all saved movies, most‐recent first.
 */
export const getSavedMovies = async (): Promise<SavedMovie[] | undefined> => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      SAVED_COLLECTION_ID,
      [
        Query.orderDesc("$createdAt"),
      ]
    );
    return result.documents as unknown as SavedMovie[];
  } catch (err) {
    console.error("Error fetching saved movies:", err);
    return undefined;
  }
};