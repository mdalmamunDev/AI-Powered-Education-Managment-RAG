<template>
  <div class="h-full w-full relative">
    <!-- Chat Messages Container -->
    <pagination-custom-comp :custom-url="`message/${urlSuffix}`" :res-data="resData" @set-data="data => resData = data"
      class="w-full h-full max-h-[800px] overflow-y-auto flex flex-col-reverse p-4 space-y-reverse space-y-1 pb-[95px]">
      <template v-for="(msg, index) in resData?.data" :key="msg.id || index">
        <div class="flex gap-2" :class="msg.senderId !== auth?._id ? 'justify-start' : 'justify-end'">
          <!-- Avatar (only show for first message in group from others) -->
          <div v-if="msg.senderId !== auth?._id" class="flex-shrink-0 w-8 h-8">
            <img v-if="shouldShowAvatar(index) && msg.sender?.profileImage" :src="showImg(msg.sender.profileImage)"
              :alt="msg.sender.name" class="w-8 h-8 rounded-full object-cover">
            <div v-else class="w-8"></div>
          </div>

          <!-- Message Bubble -->
          <div class="flex flex-col max-w-[70%]">
            <!-- Sender name (only for first message in group) -->
            <span v-if="msg.senderId !== auth?._id && shouldShowAvatar(index)"
              class="text-xs text-gray-200 font-medium mb-1 ml-3">
              {{ msg.sender?.name }}
            </span>

            <div :class="[
              'rounded-2xl shadow-sm',
              msg.senderId !== auth?._id
                ? 'bg-gray-100 text-gray-900'
                : 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
            ]">
              <!-- Multiple Attachments -->
              <div v-if="msg.attachments?.length" class="p-1.5">
                <div class="grid gap-1.5" :class="msg.attachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'">
                  <div v-for="(attachment, idx) in msg.attachments" :key="idx">
                    <button class="relative" @click="openAttachment(attachment)">
                      <img class="w-full max-w-56 h-auto rounded-xl cursor-pointer hover:opacity-95 transition"
                        :src="showImg(attachment.replace('master.m3u8', 'thumbnail.png'))"
                        :alt="`Attachment ${idx + 1}`" @error="onImageError">

                      <!-- Video Icon Overlay -->
                      <div v-if="attachment.endsWith('.m3u8')"
                        class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-xl">
                        <i v-if="uploadingVideos.includes(attachment)"
                          class="fas fa-spinner text-white text-4xl animate-spin"></i>
                        <i v-else class="fas fa-play-circle text-white text-4xl"></i>
                      </div>
                    </button>
                  </div>
                </div>

                <!-- Message Text (if exists with attachments) -->
                <p v-if="msg.content" class="text-sm break-words mt-2 px-2">
                  {{ msg.content }}
                </p>
              </div>

              <!-- Text-only Message -->
              <div v-else class="px-4 py-2.5">
                <p class="text-sm break-words leading-relaxed">{{ msg.content }}</p>
              </div>
            </div>

            <!-- Timestamp and Read status (only show for last message in group) -->
            <div v-if="isLastInGroup(index)" class="flex items-center gap-1 mt-1"
              :class="msg.senderId !== auth?._id ? 'ml-3' : 'justify-end mr-2'">
              <span class="text-xs text-gray-300">
                {{ formatTime(msg.createdAt) }}
              </span>

              <!-- Read/Delivered indicators for sent messages -->
              <div v-if="msg.senderId === auth?._id" class="flex items-center">
                <!-- Read by users -->
                <svg v-if="msg.readBy?.length > 0" class="w-3.5 h-3.5 text-blue-500" fill="currentColor"
                  viewBox="0 0 20 20">
                  <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                </svg>
                <!-- Delivered but not read -->
                <svg v-else-if="msg.receivedBy?.length > 0" class="w-3.5 h-3.5 text-gray-400" fill="currentColor"
                  viewBox="0 0 20 20">
                  <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                </svg>
                <!-- Sent -->
                <svg v-else class="w-3.5 h-3.5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </template>
    </pagination-custom-comp>

    <!-- Input Area -->
    <div class="absolute bottom-0 right-0 w-full p-4 border-t border-gray-200 bg-glass rounded-lg shadow-lg">

      <!-- Image Preview -->
      <div v-if="attachments?.length" class="mb-3 flex gap-2">
        <div v-for="(att, idx) in attachments" :key="idx" class="relative inline-block">
          <img :src="showImg(att)" alt="Preview" class="w-24 h-24 object-cover rounded-lg shadow-md"
            @error="onImageError" />
          <!-- Remove button -->
          <button @click="attachments.splice(idx, 1)"
            class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full hover:bg-red-600 transition flex items-center justify-center text-xs">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Input Row -->
      <div class="flex items-center space-x-3">
        <!-- Text Input -->
        <div class="flex-1 relative">
          <input v-model="newMessage" type="text" :placeholder="`Chat in league`"
            class="w-full px-4 py-3 bg-gray-50 rounded-full text-sm text-gray-600 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
            @keydown.enter="sendMessage" />
          <!-- Video Icon -->
          <file-uploader url-suffix="video"
            @uploaded="(file) => { attachments.push(file.video); uploadingVideos.push(file.video) }" accept="video/*"
            class="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <i class="fa-regular fa-file-video text-lg"></i>
          </file-uploader>
          <!-- Attachment Icon -->
          <file-uploader @uploaded="file => attachments.push(file.path)" accept="image/*,application/pdf"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <i class="fas fa-paperclip text-lg"></i>
          </file-uploader>
        </div>

        <!-- Send Button -->
        <button @click="sendMessage" class="btn-g w-12 h-12 flex items-center justify-center shadow-lg">
          <i class="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import FileUploader from './FileUploader.vue';
import socket from '@/plugins/socket';
import PaginationCustomComp from './PaginationCustomComp.vue';

export default {
  name: "MessagesCom",
  components: { FileUploader, PaginationCustomComp },
  data() {
    return {
      newMessage: '',
      attachments: [],
      threadId: null,
      resData: {},
      uploadingVideos: [],
    };
  },
  props: {
    urlSuffix: String,
  },
  mounted() {
    this.fetchData({
      customUrl: `message/${this.urlSuffix}`,
      callback: (data, response) => {
        this.threadId = response.data?.extra?.threadId;
        this.resData = response.data;
      }
    });

    // Listen for messages from server
    socket.on("message-receive", (msg) => {
      this.resData?.data?.unshift(msg);
    });


    socket.on("video-uploaded", ({ masterPlaylist }) => {
      this.uploadingVideos.pop(masterPlaylist);
    });
  },
  methods: {
    sendMessage() {
      let authUser = this.$store.getters.auth;
      if (!authUser || !this.threadId) {
        this.showToast('Something went wrong', 'error');
        return;
      }
      if (!this.newMessage?.trim() && !this.attachments?.length) return;

      const msg = {
        senderId: authUser._id,
        threadId: this.threadId,
        content: this.newMessage,
      };
      if (this.attachments?.length) msg.attachments = this.attachments;

      socket.emit("message-send", msg);
      this.newMessage = '';
      this.attachments = [];
    },

    // Check if we should show avatar (only first message in group)
    shouldShowAvatar(index) {
      const messages = this.resData?.data || [];
      const currentMsg = messages[index];
      const topMsg = messages[index + 1];

      // if (index === 0) {
      //   console.log("currentMsg", currentMsg);
      //   console.log("prevMsg", prevMsg);
      // }


      if (!topMsg || (topMsg.senderId !== currentMsg.senderId)) return true;

      const timeDiff = new Date(currentMsg.createdAt) - new Date(topMsg.createdAt);
      if (timeDiff > 120000) return true; // 2 minutes

      return false;
    },

    // Check if this is the last message in a group
    isLastInGroup(index) {
      const messages = this.resData?.data || [];
      const currentMsg = messages[index];
      const nextMsg = messages[index + 1];

      if (index === messages.length - 1) return true;
      if (!nextMsg || nextMsg.senderId !== currentMsg.senderId) return true;

      const timeDiff = new Date(nextMsg.createdAt) - new Date(currentMsg.createdAt);
      if (timeDiff > 120000) return true;

      return false;
    },

    formatTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;

      if (diff < 60000) return 'Just now';

      if (diff < 3600000) {
        const mins = Math.floor(diff / 60000);
        return `${mins}m`;
      }

      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }

      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      }

      if (diff < 604800000) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    },

    openAttachment(attachment) {
      if (this.uploadingVideos.includes(attachment)) {
        this.showToast('Video is still processing. Please wait a moment and try again.', 'info');
        return;
      }
      window.open(this.showImg(attachment, true), '_blank');
    }
  },
};
</script>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f9fafb;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>