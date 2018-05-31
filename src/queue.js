const { getSong, playSong } = require('./sources');
const { print, printError } = require('./utils');

const { QueueSong } = require('./database');

exports.getQueue = async () => {
  const queue = await (QueueSong.find({ removed: { $exists: false } })
    .sort({ isFinished: 1, date: 1 }));

  return queue;
};

exports.addSong = async (url) => {
  // Get song from source
  const song = await getSong(url);
  if (!song) {
    printError("Couldn't get song.");
    return false;
  }

  // Add song to the queue
  let queueSong;
  try {
    queueSong = await createQueueSong(song).save();
  } catch (exception) {
    printError(`Couldn't add song to queue: ${exception.message}`);
    return false;
  }

  print(`Video was added to the queue: ${queueSong.title}`);
  return true;
};

exports.addFromHistory = async (queueSongId) => {
  let queueSong = await queueSong.findOne({ _id: queueSongId });

  if (!queueSong) {
    const errorString = `Song with id "${queueSongId}" was not found.`;
    printError(`Couldn't add song from history to queue. ${errorString}`);
    return false;
  }

  try {
    queueSong = await createQueueSong(queueSong).save();
  } catch (exception) {
    printError(`Couldn't add song from history to queue: ${exception.message}`);
    return false;
  }

  print(`Video from history was added to the queue: ${queueSong.title}`);
  return true;
};

exports.removeSong = async (queueSongId) => {
  const queueSong = await QueueSong.findOne({ _id: queueSongId });

  if (!queueSong) {
    const errorString = `Song with id "${queueSongId}" was not found.`;
    printError(`Couldn't remove song from queue. ${errorString}`);
    return false;
  }

  try {
    queueSong.set({ removed: new Date() });
    await queueSong.save();
  } catch (exception) {
    printError(`Couldn't remove song from queue: ${exception.message}`);
    return false;
  }

  print(`Video was removed from the queue: ${queueSong.title}`);
  return true;
};

exports.playNext = async () => {
  const nextSong = await QueueSong.findOne().sort({ added: 1 });
  playSong(nextSong);
};

function createQueueSong(song) {
  return new QueueSong({
    added: new Date(),
    source: song.source,
    sourceId: song.sourceId,
    title: song.title,
    thumbnail: song.thumbnail,
    duration: song.duration
  });
}
