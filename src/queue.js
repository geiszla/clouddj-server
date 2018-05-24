const { print, printError } = require('./utils');

const { getSong } = require('./sources');
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
    queueSong = await (new QueueSong({
      added: new Date(),
      url: song.url,
      title: song.title,
      thumbnail: song.thumbnail,
      duration: song.duration
    }).save());
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
    queueSong = await (new QueueSong({
      added: new Date(),
      url: queueSong.url,
      title: queueSong.title,
      thumbnail: queueSong.thumbnail,
      duration: queueSong.duration
    }).save());
  } catch (exception) {
    printError(`Couldn't add song from history to queue: ${exception.message}`);
    return false;
  }

  print(`Video from history was added to the queue: ${queueSong.title}`);
  return true;
};

exports.removeSong = async (queueSongId) => {
  const queueSong = await queueSong.findOne({ _id: queueSongId });

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
