# discourse-media-events

* This component adds event tracking for `<video>` and `<audio>` tags in posts via `api.decorateCookedElement`.
* The events tracked are:
  * [play](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play_event)
  * [pause](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/pause_event)
  * [ended](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/ended_event)
  * [timeupdate](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/timeupdate_event) (optional, configured via `timeupdate_event_frequency` setting)
* The events are captured and broadcast using `appEvents` and the prefix `discourse-media:` e.g. `discourse-media:video:play` or `discourse-media:audio:pause`.
* The post and topic ID that the media is playing in is captured, as well as the media source, the filename and the current time of the source.

## Handing playback to a host app

An app embedding the site can take playback off the page into its own player
and report the same `discourse-media:` events itself. While it owns playback it
sets `data-native-media-state` on the media element, and this component skips
events from marked elements — including the `pause` it uses to release the page
copy, which is the handoff rather than a viewer action. Tracking resumes when
the attribute is removed.
