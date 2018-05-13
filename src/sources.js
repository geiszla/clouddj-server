const { google } = require('googleapis');
const keys = require('../keys.json');
const { printError } = require('./utils');
const { URL } = require('url');
const { YoutubeVideo } = require('./database');

const sourceFunctions = {
  youtube: getFromYoutube
};
const hostnameFragments = {
  youtube: ['youtube', 'youtu.be']
};

exports.getSong = async (urlString) => {
  const url = new URL(urlString);
  const { hostname } = url;

  const source = Object.keys(hostnameFragments).filter(key =>
    hostnameFragments[key].some(fragment => hostname.includes(fragment)))[0];

  if (!source) {
    printError(`The source is not supported: ${hostname}`);
    return null;
  }

  const song = await sourceFunctions[source](url);
  return song;
};

// YouTube
const youtube = google.youtube({
  version: 'v3',
  auth: keys.youtube
});

async function getFromYoutube(url) {
  const { pathname } = url;
  const videoId = pathname.substring(1, pathname.length);

  let video = await YoutubeVideo.findOne({ videoId });
  if (!video) {
    // Get video info from YouTube
    let videoInfo;
    try {
      [videoInfo] = (await youtube.videos.list({
        id: videoId,
        part: 'snippet,contentDetails'
      })).data.items;
    } catch (exception) {
      printError(`Couldn't get info from YouTube: ${exception.message}`);
      return null;
    }

    // Parse info
    const { title, thumbnails } = videoInfo.snippet;
    const thumbnail = thumbnails.high.url;
    const durationString = videoInfo.contentDetails.duration;

    const durationRegex = new RegExp('T(?:(\\d+)H)?(?:(\\d{1,2})M)?(?:(\\d{1,2})S)?');
    const durationMatch = durationString.match(durationRegex);

    const hours = durationMatch[1] === undefined ? 0 : durationMatch[1];
    const minutes = durationMatch[2] === undefined ? 0 : durationMatch[2];
    const seconds = durationMatch[3] === undefined ? 0 : durationMatch[3];
    const duration = new Date(0, 0, 0, hours, minutes, seconds);

    // Save to database
    video = new YoutubeVideo({
      url, videoId, title, thumbnail, duration
    }).save();
  }

  return video;
}

// Spotify
// async function getFromSpotify(trackId) {
// }
