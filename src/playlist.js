const { google } = require('googleapis');
const keys = require('../keys.json');
const { print, printError } = require('./utils');
const { URL } = require('url');
const { YoutubeVideo } = require('./database');

const supportedSources = ['youtube', 'youtu.be'];

const youtube = google.youtube({
  version: 'v3',
  auth: keys.youtube
});

exports.addSong = async (urlString) => {
  const url = new URL(urlString);
  const { pathname, hostname } = url;

  if (!supportedSources.some(name => hostname.includes(name))) {
    printError(`The source is not supported: ${hostname}`);
    return false;
  }

  const videoId = pathname.substring(1, pathname.length);

  let videoInfo;
  try {
    [videoInfo] = (await youtube.videos.list({
      id: videoId,
      part: 'snippet,contentDetails'
    })).data.items;
  } catch (exception) {
    printError(`Error fetching video info: ${exception.message}`);
    return false;
  }

  const { title, thumbnails } = videoInfo.snippet;
  const thumbnail = thumbnails.high.url;
  const durationString = videoInfo.contentDetails.duration;

  const durationRegex = new RegExp('T(?:(\\d+)H)?(?:(\\d{1,2})M)?(?:(\\d{1,2})S)?');
  const durationMatch = durationString.match(durationRegex);

  const hours = durationMatch[1] === undefined ? 0 : durationMatch[1];
  const minutes = durationMatch[2] === undefined ? 0 : durationMatch[2];
  const seconds = durationMatch[3] === undefined ? 0 : durationMatch[3];
  const duration = new Date(0, 0, 0, hours, minutes, seconds);

  const video = new YoutubeVideo({
    url, videoId, title, thumbnail, duration
  });
  const savedVideo = await video.save();

  print(`Video added to the playlist: ${savedVideo.title}`);
  return true;
};

exports.removeSong = (link) => {
  console.log(link);
};
