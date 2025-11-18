import { module, test } from "qunit";
import MediaEventTracker from "../../../../discourse-media-events/lib/track-cooked-media-events";

module("discourse-media-events | Unit | Lib | MediaEventTracker", function () {
  module("_extractEventData", function () {
    test("extracts filename, src, currentTime, postId, and topicId from media element", function (assert) {
      const tracker = new MediaEventTracker({});

      const topicElement = document.createElement("div");
      topicElement.id = "topic";
      topicElement.dataset.topicId = "123";
      document.body.appendChild(topicElement);

      const postElement = document.createElement("article");
      postElement.dataset.postId = "456";

      const mediaElement = document.createElement("video");
      Object.defineProperty(mediaElement, "currentSrc", {
        value: "https://example.com/path/to/video.mp4",
        writable: false,
      });
      Object.defineProperty(mediaElement, "currentTime", {
        value: 42.5,
        writable: false,
      });

      topicElement.appendChild(postElement);
      postElement.appendChild(mediaElement);

      const result = tracker._extractEventData(mediaElement);

      assert.strictEqual(result.filename, "video.mp4");
      assert.strictEqual(result.src, "https://example.com/path/to/video.mp4");
      assert.strictEqual(result.currentTime, 42.5);
      assert.strictEqual(result.postId, 456);
      assert.strictEqual(result.topicId, 123);

      // Cleanup
      document.body.removeChild(topicElement);
    });
  });

  module("_extractEventDataVideojs", function () {
    test("extracts filename, src, currentTime, postId, and topicId from Video.js player", function (assert) {
      const tracker = new MediaEventTracker({});

      const topicElement = document.createElement("div");
      topicElement.id = "topic";
      topicElement.dataset.topicId = "789";
      document.body.appendChild(topicElement);

      const postElement = document.createElement("article");
      postElement.dataset.postId = "101";

      const videoContainer = document.createElement("div");

      topicElement.appendChild(postElement);
      postElement.appendChild(videoContainer);

      const mockVideojsPlayer = {
        currentSrc: () => "https://cdn.example.com/videos/sample.webm",
        currentTime: () => 120.75,
        el: () => videoContainer,
      };

      const result = tracker._extractEventDataVideojs(mockVideojsPlayer);

      assert.strictEqual(result.filename, "sample.webm");
      assert.strictEqual(
        result.src,
        "https://cdn.example.com/videos/sample.webm"
      );
      assert.strictEqual(result.currentTime, 120.75);
      assert.strictEqual(result.postId, 101);
      assert.strictEqual(result.topicId, 789);

      // Cleanup
      document.body.removeChild(topicElement);
    });
  });

  module("bindMediaEvents", function () {
    test("skips videojs-enhanced videos with vjs-tech class", function (assert) {
      const mockAppEvents = { trigger: () => {} };
      const tracker = new MediaEventTracker(mockAppEvents);

      const videoElement = document.createElement("video");
      videoElement.classList.add("vjs-tech");
      Object.defineProperty(videoElement, "currentSrc", {
        value: "https://example.com/video.mp4",
        writable: false,
      });
      Object.defineProperty(videoElement, "currentTime", {
        value: 0,
        writable: false,
      });

      let eventFired = false;
      tracker._triggerAppEvent = () => {
        eventFired = true;
      };

      tracker.bindMediaEvents(videoElement);

      // Simulate a play event
      const playEvent = new Event("play");
      Object.defineProperty(playEvent, "target", {
        value: videoElement,
        writable: false,
      });
      videoElement.dispatchEvent(playEvent);

      assert.false(
        eventFired,
        "should not trigger app event for videojs-enhanced video"
      );
    });

    test("tracks regular videos without vjs-tech class", function (assert) {
      const mockAppEvents = { trigger: () => {} };
      const tracker = new MediaEventTracker(mockAppEvents);

      const videoElement = document.createElement("video");
      Object.defineProperty(videoElement, "currentSrc", {
        value: "https://example.com/video.mp4",
        writable: false,
      });
      Object.defineProperty(videoElement, "currentTime", {
        value: 0,
        writable: false,
      });

      let eventFired = false;
      tracker._triggerAppEvent = () => {
        eventFired = true;
      };

      tracker.bindMediaEvents(videoElement);

      // Simulate a play event
      const playEvent = new Event("play");
      Object.defineProperty(playEvent, "target", {
        value: videoElement,
        writable: false,
      });
      videoElement.dispatchEvent(playEvent);

      assert.true(eventFired, "should trigger app event for regular video");
    });
  });

  module("bindVideojsEvents", function () {
    test("prevents duplicate bindings to the same videojs player", function (assert) {
      const mockAppEvents = { trigger: () => {} };
      const tracker = new MediaEventTracker(mockAppEvents);

      const videoTag = document.createElement("video");
      videoTag.classList.add("vjs-tech");
      videoTag.id = "test-video";

      const videoContainer = document.createElement("div");
      videoContainer.appendChild(videoTag);

      const mockVideojsPlayer = {
        currentSrc: () => "https://example.com/video.mp4",
        currentTime: () => 0,
        el: () => videoContainer,
        on: () => {},
      };

      // First binding
      tracker.bindVideojsEvents(mockVideojsPlayer);
      assert.strictEqual(
        videoTag.dataset.videojsEventsbound,
        "true",
        "should mark video as bound"
      );

      // Attempt second binding
      let bindingAttempted = false;
      mockVideojsPlayer.on = () => {
        bindingAttempted = true;
      };

      tracker.bindVideojsEvents(mockVideojsPlayer);

      assert.false(
        bindingAttempted,
        "should not attempt to bind events a second time"
      );
    });
  });
});
