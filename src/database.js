const mongoose = require('mongoose');
const { printError } = require('./utils');

mongoose.Promise = Promise;

// Connect
exports.connect = async (address) => {
  try {
    await mongoose.connect(`mongodb://${address}`);
    return true;
  } catch (exception) {
    printError(`Error: ${exception.message}`);
    return false;
  }
};

// Songs in the queue
const queueSongSchema = new mongoose.Schema({
  added: Date,
  addedBy: String,

  removed: Date,
  removedBy: String,

  finished: Date,

  likes: [String],
  dislikes: [String],

  source: String,
  sourceId: String,
  title: String,
  thumbnail: String,
  duration: Date
});
queueSongSchema.index({ isRemoved: -1, isFinished: 1, added: 1 });

exports.QueueSong = mongoose.model('queueSong', queueSongSchema);

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
