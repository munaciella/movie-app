import { View, Text, Image, FlatList, ActivityIndicator } from 'react-native'
import { images } from '@/constants/images'
import MovieCard from '@/components/MovieCard'
import useFetch from '@/services/useFetch'
import { fetchMovies } from '@/services/api'
import { icons } from '@/constants/icons'
import SearchBar from '@/components/SearchBar'
import { useEffect, useState } from 'react'

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: movies,
    loading: movieLoading,
    error: moviesError,
    refetch: loadMovies,
    reset,
  } = useFetch(() =>
    fetchMovies({
      query: searchQuery,
    }), false
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  useEffect(() => {
    const func = async () => {
    if (searchQuery.trim()) {
      await loadMovies();
    } else {
      reset();
    }
    }
    
    func();
  }, [searchQuery]);

  return (
    <View className="flex-1 bg-primary">
      <Image 
      source={images.bg}
      className="absolute flex-1 w-full z-0"
      resizeMode="cover"
      />
      <FlatList 
      data={movies} 
      renderItem={({ item }) => <MovieCard {...item} />}
      keyExtractor={(item) => item.id.toString()}
      className='px-5'
      numColumns={3}
      columnWrapperStyle={{ justifyContent: 'center', gap: 20, marginVertical: 6 }}
      contentContainerStyle= {{ paddingBottom: 100 }}
      ListHeaderComponent={
        <>
        <View className="w-full flex-row justify-center mt-20 items-center">
          <Image 
          source={icons.logo}
          className="w-12 h-10"
          />
        </View>
        <View className="my-6">
          <SearchBar 
          placeHolder='Search for a movie...'
          value={searchQuery}
          onChangeText={handleSearch}
          />
        </View>
        {movieLoading && (
          <ActivityIndicator size="large" color="#0000ff" className='my-3'/>
        )}
        {moviesError && (
          <Text className="text-red-500 px-5 my-3">
            Error: {moviesError?.message}
          </Text>
        )}
        {!movieLoading && !moviesError && searchQuery.trim() && movies?.length! > 0 && (
          <Text className="text-xl text-white font-bold mb-2">
            Search Results for {' '}
            <Text className='text-accent'>
              {searchQuery}
            </Text>
          </Text>
        )}
        </>
      }
      />
    </View>
  )
}

export default Search