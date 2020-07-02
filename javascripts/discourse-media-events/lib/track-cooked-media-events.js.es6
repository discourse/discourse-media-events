const TRACKED_EVENTS = ["play", "pause", "ended"];

export default class MediaEventTracker {
  constructor(appEvents) {
    this._appEvents = appEvents;
  }

  startTrackingForPost(postElement) {
    let videoElements = postElement.querySelectorAll("video");
    let audioElements = postElement.querySelectorAll("audio");

    videoElements.forEach(this._bindMediaEvents.bind(this));
    audioElements.forEach(this._bindMediaEvents.bind(this));
  }

  _bindMediaEvents(mediaElement) {
    TRACKED_EVENTS.forEach(MEDIA_EVENT => {
      mediaElement.addEventListener(MEDIA_EVENT, event => {
        const target = event.target;
        const src = target.currentSrc;
        const filename = src.substring(src.lastIndexOf("/") + 1);

        let postElement = target.closest("article");
        let postId = null;
        let topicId = null;
        if (postElement) {
          postId = postElement.dataset.postId;
          topicId = postElement.dataset.topicId;
          if (postId) {
            postId = parseInt(postId, 10);
          }
          if (topicId) {
            topicId = parseInt(topicId, 10);
          }
        }

        this._appEvents.trigger(
          `discourse-media:${target.tagName.toLowerCase()}:${MEDIA_EVENT.toLowerCase()}`,
          {
            filename,
            src,
            postId,
            topicId
          }
        );
      });
    });
  }
}
