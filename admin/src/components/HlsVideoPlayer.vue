<template>
  <div class="video-container">
    <video ref="videoPlayer" class="plyr w-full max-w-3xl rounded"></video>
  </div>
</template>

<script>
import Hls from "hls.js";
import Plyr from "plyr";
import "plyr/dist/plyr.css";

export default {
  name: "HlsPlyrPlayer",
  data() {
    return {
      // src: "https://cp44mjvx-8071.asse.devtunnels.ms/uploads/1dc615d2-b835-46a9-a58e-9f945a5b0768/master.m3u8",
      hls: null,
      player: null,
    };
  },
  props: {
    src: {
      type: String,
      required: true,
    },
  },
  mounted() {
    console.log("HlsPlyrPlayer mounted with src:", this.src);
    const video = this.$refs.videoPlayer;

    if (Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(this.src);
      this.hls.attachMedia(video);

      this.hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const availableQualities = data.levels.map((l) => l.height).sort((a, b) => b - a);

        this.player = new Plyr(video, {
          controls: [
            "play", "progress", "current-time", "mute", "volume",
            "settings", "fullscreen"
          ],
          settings: ["quality"],
          quality: {
            default: availableQualities[0],
            options: availableQualities,
            forced: true,
            onChange: (q) => {
              const levelIndex = data.levels.findIndex((l) => l.height === q);
              this.hls.currentLevel = levelIndex;
            },
          },
        });
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = this.src;
      this.player = new Plyr(video, { controls: ["play", "progress", "settings", "fullscreen"] });
    }
  },
  beforeUnmount() {
    if (this.hls) this.hls.destroy();
    if (this.player) this.player.destroy();
  },
};
</script>

<style scoped>
.video-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
}
:deep(.plyr) {
  --plyr-color-main: #3b82f6; /* Tailwind blue-500 */
  --plyr-menu-background: #1f2937; /* gray-800 */
  --plyr-menu-color: #f9fafb; /* gray-100 */
}
</style>
