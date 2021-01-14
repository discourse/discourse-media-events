const TRACKED_EVENTS = ["play", "pause", "ended"];

export default class MediaEventTracker {
  constructor(appEvents) {
    this._appEvents = appEvents;
    this._timeupdateFrequency = settings.timeupdate_event_frequency;
  }

  startTrackingForPost(postElement) {
    const videoElements = postElement.querySelectorAll("video");
    const audioElements = postElement.querySelectorAll("audio");

    videoElements.forEach(this._bindMediaEvents.bind(this));
    audioElements.forEach(this._bindMediaEvents.bind(this));
  }

  _bindMediaEvents(mediaElement) {
    TRACKED_EVENTS.forEach((eventType) => {
      mediaElement.addEventListener(eventType, (event) => {
        this._updateLastTime(event.target);
        this._triggerAppEvent(event);
      });
    });

    if (this._timeupdateFrequency > 0) {
      mediaElement.addEventListener("timeupdate", (event) =>
        this._handleTimeUpdateEvent(event)
      );
    }
  }

  _triggerAppEvent(event) {
    const tagName = event.target.tagName.toLowerCase();
    const eventType = event.type.toLowerCase();
    const data = this._extractEventData(event.target);

    if (eventType === "pause" && event.target.ended) {
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

  _handleTimeUpdateEvent(event) {
    const mediaElement = event.target;
    const lastTime = Number(mediaElement.dataset.lastTime) || 0;
    const currentTime = mediaElement.currentTime;

    if (Math.abs(currentTime - lastTime) >= this._timeupdateFrequency) {
      this._updateLastTime(mediaElement);
      this._triggerAppEvent(event);
    }
  }

  _updateLastTime(mediaElement) {
    mediaElement.dataset.lastTime = mediaElement.currentTime;
  }
}
