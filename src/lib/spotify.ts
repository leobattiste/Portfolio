/*
 * Spotify's embed, kept out of sight, driven by the turntable.
 * Nothing loads until someone presses play.
 * https://developer.spotify.com/documentation/embeds/references/iframe-api
 */

type Update = { isPaused: boolean; isBuffering: boolean; position: number; duration: number };
type Controller = {
  loadUri: (uri: string) => void;
  play: () => void;
  pause: () => void;
  resume: () => void;
  addListener: (event: string, fn: (e: { data: Update }) => void) => void;
};
type Api = {
  createController: (
    el: HTMLElement,
    options: { uri: string; width?: number | string; height?: number | string },
    ready: (c: Controller) => void,
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: Api) => void;
  }
}

let api: Promise<Api> | null = null;
function loadApi() {
  api ??= new Promise<Api>((resolve, reject) => {
    window.onSpotifyIframeApiReady = resolve;
    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    script.onerror = () => {
      api = null;
      reject(new Error("Spotify did not load"));
    };
    document.body.appendChild(script);
  });
  return api;
}

export type Player = {
  play: (uri: string) => Promise<void>;
  pause: () => void;
  warm: () => void;
  loaded: () => boolean;
};

/* One hidden player for the page. `host` is where the iframe lives. */
export function createPlayer(host: () => HTMLElement | null, onUpdate: (u: Update) => void): Player {
  let controller: Controller | null = null;
  let current = "";
  let pending = false;
  let last: Update | null = null;

  return {
    loaded: () => controller !== null,
    warm() {
      loadApi().catch(() => {});
    },
    async play(uri) {
      const IFrameAPI = await loadApi();
      if (!controller) {
        const el = host();
        if (!el) return;
        const mount = document.createElement("div");
        el.replaceChildren(mount);
        current = uri;
        pending = true;
        await new Promise<void>((done) =>
          IFrameAPI.createController(mount, { uri, width: "100%", height: 80 }, (c) => {
            controller = c;
            c.addListener("ready", () => {
              if (pending) {
                pending = false;
                c.play();
              }
            });
            c.addListener("playback_update", (e) => {
              last = e.data;
              onUpdate(e.data);
            });
            done();
          }),
        );
        return;
      }
      if (uri !== current) {
        current = uri;
        pending = true;
        controller.loadUri(uri);
        /* "ready" normally follows loadUri; this covers the times it doesn't */
        setTimeout(() => {
          if (pending && controller) {
            pending = false;
            controller.play();
          }
        }, 1500);
      } else if (last && last.duration && last.position >= last.duration - 1000) {
        controller.play();
      } else {
        controller.resume();
      }
    },
    pause() {
      pending = false;
      controller?.pause();
    },
  };
}
