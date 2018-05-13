const mongoose = require('mongoose');
const { printError } = require('./utils');

mongoose.Promise = Promise;

// Connect
exports.connect = (address) => {
  const mongooseOptions = { keepAlive: 300000, connectTimeoutMS: 30000 };

  try {
    mongoose.connect(`mongodb://${address}`, mongooseOptions);
    return true;
  } catch (exception) {
    printError(`Error: ${exception.message}`);
    return false;
  }
};

// Songs in the playlist
const playlistSongSchema = new mongoose.Schema({
  added: Date,
  addedBy: String,

  removed: Date,
  removedBy: String,

  finished: Date,

  likes: [String],
  dislikes: [String],

  url: String,
  title: String,
  thumbnail: String,
  duration: Date
});
playlistSongSchema.index({ isRemoved: -1, isFinished: 1, added: 1 });

exports.PlaylistSong = mongoose.model('PlaylistSong', playlistSongSchema);

// YouTube
const youtubeVideoSchema = new mongoose.Schema({
  url: String,
  videoId: String,
  title: String,
  thumbnail: String,
  duration: Date
});
youtubeVideoSchema.index({ videoId: 1 });

exports.YoutubeVideo = mongoose.model('YoutubeVideo', youtubeVideoSchema);

// Spotify
const spotifyTrackSchema = new mongoose.Schema({
  trackId: String,
  title: String,
  thumbnail: String,
  duration: Date
});
spotifyTrackSchema.index({ trackId: 1 });

exports.SpotifyTrack = mongoose.model('SpotifyTrack', youtubeVideoSchema);
