import { module, test } from "qunit";
import MediaEventTracker from "../../../../discourse-media-events/lib/track-cooked-media-events";

module("discourse-media-events | Unit | Lib | MediaEventTracker", function () {
  module("_extractEventData", function () {
    test("extracts filename, src, currentTime, postId, and topicId from media element", function (assert) {
      const tracker = new MediaEventTracker({});

      const topicElement = document.createElement("section");
      topicElement.dataset.topicId = "123";

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
    });
  });

  module("_extractEventDataVideojs", function () {
    test("extracts filename, src, currentTime, postId, and topicId from Video.js player", function (assert) {
      const tracker = new MediaEventTracker({});

      const topicElement = document.createElement("section");
      topicElement.dataset.topicId = "789";

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
    });
  });
});
