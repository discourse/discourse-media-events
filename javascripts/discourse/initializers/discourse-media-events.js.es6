import { withPluginApi } from "discourse/lib/plugin-api";
import MediaEventTracker from "discourse-media-events/lib/track-cooked-media-events";

export default {
  name: "discourse-media-events",

  initialize(container) {
    const appEvents = container.lookup("service:app-events");

    withPluginApi("0.8.31", (api) => {
      const tracker = new MediaEventTracker(appEvents, settings);

      api.decorateCookedElement(
        ($elem, helper) => {
          tracker.startTrackingForPost($elem);
        },
        {
          onlyStream: true,
          id: "discourse-media-events",
        }
      );
    });
  },
};
