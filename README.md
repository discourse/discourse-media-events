# discourse-media-events

* This component adds event tracking for posts in a topic containing `<video>` or `<audio>` tags.
* The events tracked are:
  * [play](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play_event)
  * [pause](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/pause_event)
  * [ended](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/ended_event)
* The events are captured and broadcast using `appEvents` and the prefix `discourse-media:` e.g. `discourse-media:video:play` or `discourse-media:audio:pause`.
* The `target` element which fired the event is captured, as well as the post and topic ID, and the list of sources for the media tag.
