const decoder = require('lame').Decoder;
const { google } = require('googleapis');
const keys = require('../keys.json');
const { printError } = require('./utils');
const Speaker = require('speaker');
const youtubeStream = require('youtube-audio-stream');
const { YoutubeVideo } = require('./database');

const youtube = google.youtube({
  version: 'v3',
  auth: keys.youtube
});

module.exports = { getInfo, stream, download };

async function getInfo(url) {
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

  video.sourceId = videoId;
  return video;
}

function stream(video) {
  const url = `http://youtube.com/watch?v=${video.sourceId}`;
  console.log(url);
  youtubeStream(url).pipe(decoder()).pipe(new Speaker());
}

function download() {

}
