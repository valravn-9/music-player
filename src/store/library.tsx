import { Artist, TrackWithPlaylist } from '@/helpers/types';
import { Track } from 'react-native-track-player';
import { create } from 'zustand';
import library from '@/assets/data/library.json';
import { useMemo } from 'react';

interface LibraryState {
  tracks: TrackWithPlaylist[];
  toggleTrackFavorite: (track: Track) => void;
  addToPlaylist: (track: Track, playlistName: string) => void;
}

export const useLibraryStore = create<LibraryState>()(() => ({
  tracks: library,
  toggleTrackFavorite: () => {},
  addToPlaylist: () => {},
}));

export const useTracks = () => useLibraryStore((state) => state.tracks);

export const useFavorites = () => {
  const tracks = useLibraryStore((state) => state.tracks);

  const favorites = useMemo(() => tracks.filter((track) => track.rating === 1), [tracks]);
  const toggleTrackFavorite = useLibraryStore((state) => state.toggleTrackFavorite);

  return {
    favorites,
    toggleTrackFavorite,
  };
};

export const useArtists = () =>
  useLibraryStore((state) => {
    return state.tracks.reduce((acc, track) => {
      const existingArtist = acc.find((artist) => artist.name === track.artist);

      if (existingArtist) {
        existingArtist.tracks.push(track);
      } else {
        acc.push({ name: track.artist ?? 'Unknown', tracks: [track] });
      }

      return acc;
    }, [] as Artist[]);
  });
