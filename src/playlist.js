const { print, printError } = require('./utils');

const { getSong } = require('./sources');
const { PlaylistSong } = require('./database');

exports.get = async () => {
  const playlist = await (PlaylistSong.find({ isRemoved: false })
    .sort({ isFinished: 1, date: 1 }));

  return playlist;
};

exports.addSong = async (url) => {
  // Get song from source
  const song = await getSong(url);
  if (!song) {
    printError("Couldn't get song.");
    return false;
  }

  // Add song to the playlist
  let playlistSong;
  try {
    playlistSong = await (new PlaylistSong({
      added: new Date(),
      url: song.url,
      title: song.title,
      thumbnail: song.thumbnail,
      duration: song.duration
    }).save());
  } catch (exception) {
    printError(`Couldn't add song to playlist: ${exception.message}`);
    return false;
  }

  print(`Video was added to the playlist: ${playlistSong.title}`);
  return true;
};

exports.removeSong = async (playlistSongId) => {
  const playlistSong = await PlaylistSong.findOne({ _id: playlistSongId });

  try {
    playlistSong.set({ removed: new Date() });
    await playlistSong.save();
  } catch (exception) {
    printError(`Couldn't remove song from playlist: ${exception.message}`);
    return false;
  }

  print(`Video was removed from the playlist: ${playlistSong.title}`);
  return true;
};
