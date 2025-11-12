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
    const els = postElement.querySelectorAll("video, audio");
    els.forEach(this.bindMediaEvents.bind(this));
  }

  bindMediaEvents(mediaElement) {
    TRACKED_EVENTS.forEach((eventType) => {
      mediaElement.addEventListener(eventType, (event) => {
        this._updateLastTime(event.target, mediaElement.currentTime);
        this._triggerAppEvent(event, event.target);
      });
    });

    if (this._timeupdateFrequency > 0) {
      mediaElement.addEventListener("timeupdate", (event) =>
        this._handleTimeUpdateEvent(
          event,
          event.target,
          mediaElement.currentTime
        )
      );
    }
  }

  bindVideojsEvents(video) {
    const videoTag = video.el().querySelector("video");

    TRACKED_EVENTS.forEach((eventType) => {
      video.on(eventType, (event) => {
        this._updateLastTime(videoTag, video.currentTime());
        this._triggerAppEvent(event, video, true);
      });
    });

    if (this._timeupdateFrequency > 0) {
      video.on("timeupdate", (event) =>
        this._handleTimeUpdateEventVideojs(event, video, videoTag)
      );
    }
  }

  _triggerAppEvent(event, target, videojs = false) {
    const eventType = event.type.toLowerCase();
    const tagName = videojs ? "video" : target.tagName.toLowerCase();
    const data = videojs
      ? this._extractEventDataVideojs(target)
      : this._extractEventData(target);

    if (eventType === "pause" && (videojs ? target.ended() : target.ended)) {
      return;
    }

    this._appEvents.trigger(`discourse-media:${tagName}:${eventType}`, data);
  }

  _extractEventData(mediaElement) {
    const src = mediaElement.currentSrc;
    const filename = src.substring(src.lastIndexOf("/") + 1);
    const currentTime = mediaElement.currentTime;
    const postElement = mediaElement.closest("article");
    const topicElement = mediaElement.closest("section");

    let postId = Number(postElement?.dataset?.postId || 0);
    let topicId = Number(topicElement?.dataset?.topicId || 0);

    return { filename, src, currentTime, postId, topicId };
  }

  _extractEventDataVideojs(video) {
    const src = video.currentSrc();
    const filename = src.substring(src.lastIndexOf("/") + 1);
    const currentTime = video.currentTime();
    const postElement = video.el().closest("article");
    const topicElement = document.getElementById("topic");

    let postId = Number(postElement?.dataset?.postId || 0);
    let topicId = Number(topicElement?.dataset?.topicId || 0);

    return { filename, src, currentTime, postId, topicId };
  }

  _handleTimeUpdateEvent(event, target, currentTime) {
    const lastTime = Number(target.dataset.lastTime) || 0;

    if (Math.abs(currentTime - lastTime) >= this._timeupdateFrequency) {
      this._updateLastTime(target, currentTime);
      this._triggerAppEvent(event, target);
    }
  }

  _handleTimeUpdateEventVideojs(event, video, target) {
    const lastTime = Number(target.dataset.lastTime) || 0;
    const currentTime = video.currentTime();

    if (Math.abs(currentTime - lastTime) >= this._timeupdateFrequency) {
      this._updateLastTime(target, currentTime);
      this._triggerAppEvent(event, video, true);
    }
  }

  _updateLastTime(mediaElement, currentTime) {
    mediaElement.dataset.lastTime = currentTime;
  }
}
