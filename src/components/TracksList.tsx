import { FlatList, FlatListProps, Text, View, Image } from 'react-native';
import { TrackListItem } from './TrackListItem';
import { utilsStyles } from '@/styles';
import TrackPlayer, { Track } from 'react-native-track-player';
import { unknownTrackImageUri } from '@/constants/images';
import { useQueue } from '@/store/queue';
import { useRef } from 'react';
import { QueueControls } from './QueueControls';

export type TracksListProps = Partial<FlatListProps<Track>> & {
  id: string;
  tracks: Track[];
  hideQueueControls?: boolean;
};

const ItemDivider = () => (
  <View style={{ ...utilsStyles.itemSeparator, marginVertical: 9, marginLeft: 60 }} />
);

export const TracksList = ({
  id,
  tracks,
  hideQueueControls = false,
  ...flatListProps
}: TracksListProps) => {
  const queueOffset = useRef(0);
  const { activeQueueId, setActiveQueueId } = useQueue();

  const handleTrackSelect = async (selectedTrack: Track) => {
    const trackIndex = tracks.findIndex((track) => track.url === selectedTrack.url);

    if (trackIndex === -1) return;

    const isChangingQueue = id !== activeQueueId;

    if (isChangingQueue) {
      const beforeTracks = tracks.slice(0, trackIndex);
      const afterTracks = tracks.slice(trackIndex + 1);

      await TrackPlayer.reset();

      // construction of the new queue
      await TrackPlayer.add(selectedTrack);
      await TrackPlayer.add(afterTracks);
      await TrackPlayer.add(beforeTracks);

      await TrackPlayer.play();

      queueOffset.current = trackIndex;
      setActiveQueueId(id);
    } else {
      const nextTrackIndex =
        trackIndex - queueOffset.current < 0
          ? tracks.length + trackIndex - queueOffset.current
          : trackIndex - queueOffset.current;

      await TrackPlayer.skip(nextTrackIndex);
      TrackPlayer.play();
    }
  };

  return (
    <FlatList
      data={tracks}
      contentContainerStyle={{ paddingTop: 10, paddingBottom: 128 }}
      ListHeaderComponent={
        !hideQueueControls ? (
          <QueueControls tracks={tracks} style={{ paddingBottom: 20 }} />
        ) : undefined
      }
      ListFooterComponent={ItemDivider}
      ItemSeparatorComponent={ItemDivider}
      ListEmptyComponent={
        <View>
          <Text style={utilsStyles.emptyContentText}>No songs found</Text>
          <Image source={{ uri: unknownTrackImageUri }} style={utilsStyles.emptyContentImage} />
        </View>
      }
      renderItem={({ item: track }) => (
        <TrackListItem track={track} onTrackSelect={handleTrackSelect} />
      )}
      {...flatListProps}
    />
  );
};
