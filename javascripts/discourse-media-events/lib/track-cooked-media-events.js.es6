const TRACKED_EVENTS = [
  "play",
  "pause",
  "ended",
  "seeked",
  "enterpictureinpicture",
  "leavepictureinpicture",
  "fullscreenchange",
];

export default class MediaEventTracker {
  constructor(appEvents) {
    this._appEvents = appEvents;
    this._timeupdateFrequency = settings.timeupdate_event_frequency;
  }

  startTrackingForPost(postElement) {
    const videoElements = postElement.querySelectorAll("video");
    const audioElements = postElement.querySelectorAll("audio");

    videoElements.forEach(this.bindMediaEvents.bind(this));
    audioElements.forEach(this.bindMediaEvents.bind(this));
  }

  bindMediaEvents(mediaElement) {
    TRACKED_EVENTS.forEach((eventType) => {
      mediaElement.addEventListener(eventType, (event) => {
        this._updateLastTime(event.target);
        this._triggerAppEvent(event, event.target);
      });
    });

    if (this._timeupdateFrequency > 0) {
      mediaElement.addEventListener("timeupdate", (event) =>
        this._handleTimeUpdateEvent(event, event.target)
      );
    }
  }

  bindVideojsEvents(video) {
    const videoTag = video.el().querySelector("video");

    TRACKED_EVENTS.forEach((eventType) => {
      video.on(eventType, (event) => {
        this._updateLastTime(videoTag);
        this._triggerAppEvent(event, videoTag);
      });
    });

    if (this._timeupdateFrequency > 0) {
      video.on("timeupdate", (event) =>
        this._handleTimeUpdateEvent(event, videoTag, video.currentTime())
      );
    }
  }

  _triggerAppEvent(event, target) {
    const tagName = target.tagName.toLowerCase();
    const eventType = event.type.toLowerCase();
    const data = this._extractEventData(target);

    if (eventType === "pause" && target.ended) {
      return;
    }

    this._appEvents.trigger(`discourse-media:${tagName}:${eventType}`, data);
  }

  _extractEventData(mediaElement) {
    const src = mediaElement.currentSrc;
    const filename = src.substring(src.lastIndexOf("/") + 1);
    const currentTime = mediaElement.currentTime;
    const postElement = mediaElement.closest("article");

    let postId = null;
    let topicId = null;

    if (postElement) {
      if (postElement.dataset.postId) {
        postId = Number(postElement.dataset.postId);
      }

      if (postElement.dataset.topicId) {
        topicId = Number(postElement.dataset.topicId);
      }
    }

    return { filename, src, currentTime, postId, topicId };
  }

  _handleTimeUpdateEvent(event, target, currentTime) {
    const lastTime = Number(target.dataset.lastTime) || 0;

    if (Math.abs(currentTime - lastTime) >= this._timeupdateFrequency) {
      this._updateLastTime(target);
      this._triggerAppEvent(event, target);
    }
  }

  _updateLastTime(mediaElement) {
    mediaElement.dataset.lastTime = mediaElement.currentTime;
  }
}
