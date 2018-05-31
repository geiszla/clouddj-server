const youtube = require('./youtube');

const { printError } = require('./utils');
const { URL } = require('url');

const hostnameFragments = {
  youtube: ['youtube', 'youtu.be']
};
const sourceFunctions = { youtube };

exports.getSong = async (urlString) => {
  const url = new URL(urlString);
  const { hostname } = url;

  // Get source name
  const source = Object.keys(hostnameFragments).filter(key =>
    hostnameFragments[key].some(fragment => hostname.includes(fragment)))[0];

  // Check if source is supported
  if (!source) {
    printError(`The source is not supported: ${hostname}`);
    return null;
  }

  const song = await sourceFunctions[source].getInfo(url);
  song.source = source;

  return song;
};

exports.playSong = (queueSong) => {
  sourceFunctions[queueSong.source].stream(queueSong);
};
