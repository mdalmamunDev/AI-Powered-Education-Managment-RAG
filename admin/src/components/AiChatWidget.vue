<template>
  <div class="ai-chat-widget" :class="{ 'is-open': open }">
    <!-- Floating launcher -->
    <button type="button" class="ai-launcher" :class="{ 'is-open': open }" @click="toggleOpen"
      :title="open ? 'Close AI assistant' : 'Chat with AI assistant'"
      :aria-label="open ? 'Close AI assistant' : 'Chat with AI assistant'">
      <span class="ai-launcher-ring ai-launcher-ring--1"></span>
      <span class="ai-launcher-ring ai-launcher-ring--2"></span>
      <span class="ai-launcher-core">
        <i :class="open ? 'fa-solid fa-xmark' : 'fa-solid fa-robot'"></i>
      </span>
      <span v-if="!open && hasUnread" class="ai-launcher-dot"></span>
    </button>

    <!-- Chat panel -->
    <transition name="ai-panel-dock">
      <div v-if="open" class="ai-panel">
        <!-- Header -->
        <div class="ai-header" @mousemove="onGlow">
          <span class="ai-header-glow"></span>
          <div class="flex items-center justify-between gap-2 px-4 py-3 relative">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="ai-bot-avatar">
                <i class="fa-solid fa-robot"></i>
                <span class="ai-bot-pulse"></span>
              </div>
              <div class="min-w-0 text-start">
                <div class="text-white font-semibold leading-tight truncate">EduTech AI </div>
                <div class="ai-status-line text-xs opacity-90 leading-tight truncate">
                  <span class="ai-status-dot"></span> Online · Ask about your institution
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" class="ai-header-btn ai-glow" @mousemove.stop="onGlow"
                @click="clearMessages" title="Clear chat" aria-label="Clear chat">
                <i class="fa-solid fa-rotate-left"></i>
              </button>
              <button type="button" class="ai-header-btn ai-glow" @mousemove.stop="onGlow"
                @click="open = false" title="Close chat" aria-label="Close chat">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Messages -->
        <div ref="messages" class="ai-messages overflow-y-auto">
          <transition-group name="ai-msg" tag="div" class="flex flex-col gap-2">
            <div v-for="(msg, index) in visibleMessages" :key="index"
              class="flex gap-2" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
              <div v-if="msg.role !== 'user'" class="ai-avatar flex-shrink-0 w-8 h-8">
                <i class="fa-solid fa-robot text-lg"></i>
              </div>

              <div class="flex flex-col max-w-[85%]" :class="msg.role !== 'user' ? 'flex-1 items-start' : ''">
                <div :class="[
                  'ai-bubble rounded-2xl px-4 py-2.5 text-sm break-words leading-relaxed whitespace-pre-wrap',
                  msg.role === 'user' ? 'ai-bubble--user self-end' : 'ai-bubble--bot'
                ]">
                  {{ msg.content }}<span v-if="msg.streaming" class="ai-stream-cursor"></span>
                </div>

                <button v-if="msg.role !== 'user' && msg.sources?.length" type="button"
                  class="ai-sources-toggle" @click="msg.showSources = !msg.showSources"
                  :aria-expanded="!!msg.showSources">
                  Based on {{ msg.sources.length }} {{ msg.sources.length === 1 ? 'source' : 'sources' }}
                  <i :class="msg.showSources ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
                </button>

                <div v-if="msg.role !== 'user' && msg.sources?.length && msg.showSources"
                  class="ai-sources-list">
                  <div v-for="(src, sIndex) in msg.sources" :key="sIndex" class="ai-source-item">
                    <div class="ai-source-meta">
                      <span v-if="src.sourceType" class="ai-source-chip" :class="'ai-source-chip--' + src.sourceType">
                        {{ src.sourceType }}
                      </span>
                      <button v-if="src.source && sourceRouteFor(src.source)" type="button"
                        class="ai-source-name ai-source-name--link" @click="openSource(src)"
                        :title="'Open ' + src.source">
                        {{ src.source }} <i class="fa-solid fa-arrow-up-right-from-square"></i>
                      </button>
                      <span v-else-if="src.source" class="ai-source-name">{{ src.source }}</span>
                    </div>
                    <div v-if="src.content" class="ai-source-content">{{ src.content }}</div>
                    <div v-if="src.query" class="ai-source-query">{{ JSON.stringify(src.query) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </transition-group>

          <!-- Typing / stage indicator -->
          <transition name="ai-msg">
            <div v-if="isChatLoading && !writing" class="flex justify-start gap-2 items-center mt-2">
              <div class="ai-avatar flex-shrink-0 w-8 h-8 ai-avatar--thinking">
                <i class="fa-solid fa-robot text-lg"></i>
              </div>
              <div class="ai-typing rounded-2xl px-4 py-2.5 flex items-center gap-2">
                <span class="ai-typing-dot"></span>
                <span class="ai-typing-dot"></span>
                <span class="ai-typing-dot"></span>
                <span class="text-xs text-sub whitespace-nowrap">{{ stageText || 'Thinking…' }}</span>
              </div>
            </div>
          </transition>
        </div>

        <!-- Quick suggestions -->
        <div v-if="suggestions.length" class="ai-suggestions overflow-x-auto">
          <button v-for="(suggestion, index) in suggestions" :key="index" type="button"
            class="ai-suggestion ai-glow" @mousemove="onGlow" :disabled="isChatLoading"
            @click="sendMessage(suggestion)">
            {{ suggestion }}
          </button>
        </div>

        <!-- Input -->
        <div class="ai-inputbar flex items-end gap-2 p-2.5">
          <textarea v-model="message" rows="1" class="ai-input" placeholder="Ask anything..."
            @keydown.enter.exact.prevent="onEnter" @keydown.shift.enter.exact="onShiftEnter"
            :disabled="isChatLoading"></textarea>
          <button type="button" class="ai-send ai-glow" @mousemove="onGlow"
            :class="{ 'is-active': message.trim() && !isChatLoading }"
            :disabled="isChatLoading || !message.trim()" @click="sendMessage()"
            title="Send message" aria-label="Send message">
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { getSocket } from '@/plugins/socket';


export default {
  name: "AiChatWidget",
  data() {
    return {
      open: false,
      hasUnread: true,
      message: "",
      isChatLoading: false,
      streaming: false, // answer tokens are currently streaming in
      writing: false, // becomes true once tokens start flowing -> hide the thinking bubble
      stageText: "", // human-readable stage shown to the user
      queuePosition: 0,
      requestId: null, // matches socket events back to this request
      pendingUserContent: "",
      socket: null,
      messages: [
        {
          role: "assistant",
          content:
            "Hi! I'm the EduTech AI assistant. I can help you with questions about your students, teachers, courses, attendance, grades, and more. How can I help?",
          sources: [],
        },
      ],
      history: [], // prior turns sent to the backend so follow-ups keep context
      suggestions: [
        "How many students are there in total?",
        "List all courses with more than 3 credit hours",
        "How many students are enrolled in each course?",
        "What is the average grade score per course?",
        "What is the total payment amount by payment method?",
      ],
    };
  },
  methods: {
    connectSocket() {
      if (this.socket) return;
      this.socket = getSocket();
      this.socket.on("chat:progress", this.onChatProgress);
      this.socket.on("chat:token", this.onChatToken);
      this.socket.on("chat:done", this.onChatDone);
      this.socket.on("chat:error", this.onChatError);
    },
    disconnectSocket() {
      if (this.socket) {
        this.socket.off("chat:progress", this.onChatProgress);
        this.socket.off("chat:token", this.onChatToken);
        this.socket.off("chat:done", this.onChatDone);
        this.socket.off("chat:error", this.onChatError);
        this.socket.disconnect();
        this.socket = null;
      }
    },
    // Ignore socket events belonging to an older request.
    isMine(payload = {}) {
      return !this.requestId || !payload.requestId || payload.requestId === this.requestId;
    },
    onGlow(e) {
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    },
    toggleOpen() {
      this.open = !this.open;
      if (this.open) {
        this.hasUnread = false;
        this.scrollToBottom();
      }
    },
    clearMessages() {
      this.messages = [
        { role: "assistant", content: "Chat cleared. How can I help you?", sources: [] },
      ];
      this.history = [];
      this.message = "";
      this.isChatLoading = false;
      this.streaming = false;
      this.writing = false;
      this.stageText = "";
      this.scrollToBottom();
    },
    onEnter() {
      if (this.isChatLoading) return;
      this.sendMessage();
    },
    onShiftEnter(event) {
      const start = event.target.selectionStart;
      const end = event.target.selectionEnd;
      this.message = this.message.slice(0, start) + "\n" + this.message.slice(end);
      this.$nextTick(() => (event.target.selectionStart = event.target.selectionEnd = start + 1));
    },
    sendMessage(quickText = false) {
      const content = (quickText || this.message || "").trim();
      if (!content || this.isChatLoading) return;

      this.messages.push({ role: "user", content, sources: [] });
      this.message = "";
      this.isChatLoading = true;
      this.streaming = true;
      this.writing = false;
      this.stageText = "Queuing your question…";
      this.queuePosition = 0;
      this.pendingUserContent = content;
      this.requestId = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      // Placeholder assistant bubble that fills with the streamed answer.
      this.messages.push({ role: "assistant", content: "", sources: [], streaming: true });

      this.connectSocket();
      this.scrollToBottom();

      this.httpReq({
        customUrl: "assistant/ask",
        method: "post",
        data: { question: content, history: this.history, requestId: this.requestId },
        callback: (data) => {
          if (!data) return;
          if (data.position) this.queuePosition = data.position;
          if (data.requestId) this.requestId = data.requestId;
          this.stageText = this.stageLabel("queued");
        },
        errorCallback: (errData) => {
          const msg =
            errData?.message ||
            "I'm having trouble reaching the assistant right now. Please try again.";
          this.failChat(msg);
        },
      });
    },
    stageLabel(stage) {
      const labels = {
        queued: this.queuePosition
          ? `Waiting in queue (position ${this.queuePosition})…`
          : "Waiting in queue…",
        rewriting: "Rewriting your question…",
        understanding: "Understanding your question…",
        querying: "Querying the database…",
        searching: "Searching the knowledge base…",
        generating: "Generating answer…",
        done: "",
      };
      return labels[stage] || "Processing…";
    },
    onChatProgress(payload = {}) {
      console.log("onChatProgress:",payload);
      if (!this.isChatLoading || !this.isMine(payload)) return;
      if (typeof payload.position === "number") this.queuePosition = payload.position;
      this.stageText = this.stageLabel(payload.stage);
      // The moment it starts generating, switch from the thinking bubble to
      // the writing bubble (the streamed answer).
      if (payload.stage === "generating") this.writing = true;
    },
    onChatToken(payload = {}) {
      console.log("onChatToken:",payload);
      if (!this.streaming || !this.isMine(payload)) return;
      this.writing = true; // writing has begun -> hide the thinking bubble
      const last = this.messages[this.messages.length - 1];
      if (last && last.role === "assistant" && last.streaming) {
        last.content += payload.token || "";
        this.scrollToBottom();
      }
    },
    onChatDone(payload = {}) {
      console.log("onChatDone:",payload);
      if (!this.streaming || !this.isMine(payload)) return;
      const answer = payload.answer || "Sorry, I couldn't find an answer.";
      this.finalizeAssistant(answer, payload.sources || []);
      // Keep prior turns in sync so follow-up questions carry context.
      this.history.push({ role: "user", content: this.pendingUserContent });
      this.history.push({ role: "assistant", content: answer });
      this.history = this.history.slice(-16); // last 8 exchanges (16 turns)
      this.streaming = false;
      this.writing = false;
      this.isChatLoading = false;
      this.stageText = "";
      this.scrollToBottom();
    },
    onChatError(payload = {}) {
      console.log("onChatError:",payload);
      if (!this.streaming || !this.isMine(payload)) return;
      this.failChat(payload.message || "Sorry, something went wrong. Please try again.");
    },
    failChat(message) {
      // Track the user's attempt so a retry still has the context.
      this.history.push({ role: "user", content: this.pendingUserContent });
      this.history = this.history.slice(-16);
      this.finalizeAssistant(message, []);
      this.streaming = false;
      this.writing = false;
      this.isChatLoading = false;
      this.stageText = "";
      this.scrollToBottom();
    },
    finalizeAssistant(content, sources) {
      const last = this.messages[this.messages.length - 1];
      if (last && last.role === "assistant" && last.streaming) {
        last.content = content;
        last.sources = sources || [];
        last.streaming = false;
      } else {
        this.messages.push({
          role: "assistant",
          content,
          sources: sources || [],
          streaming: false,
        });
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const area = this.$refs.messages;
        if (area) area.scrollTop = area.scrollHeight;
      });
    },
    // Map a backend model/source key (e.g. "course", "libraryBook",
    // "parentGuardian", "officeHours") to the admin list page, so clicking
    // the source name opens the matching module. Returns "" when there is no
    // matching route (then the name renders as plain text).
    sourceRouteFor(source) {
      if (!source) return "";
      const routes = {
        department: "/departments",
        semester: "/semesters",
        teacher: "/teachers",
        student: "/students",
        parentGuardian: "/guardians",
        course: "/courses",
        enrollment: "/enrollments",
        attendance: "/attendances",
        grade: "/grades",
        assignment: "/assignments",
        submission: "/submissions",
        exam: "/exams",
        classroom: "/classrooms",
        schedule: "/schedules",
        payment: "/payments",
        officeHours: "/office-hours",
        advisement: "/advisements",
        libraryBook: "/library-books",
        bookLoan: "/book-loans",
      };
      return routes[source] || routes[String(source).toLowerCase()] || "";
    },
    openSource(src = {}) {
      const path = this.sourceRouteFor(src.source);
      if (!path) return;
      // The docked widget sits inside AppLayout next to <router-view>, so
      // navigate in place; the chat keeps its state while the module page
      // opens beside it.
      this.$router.push(path).catch(() => {});
    },
  },
  computed: {
    // The empty streaming placeholder bubble stays hidden while the AI is
    // still thinking; it only appears once writing (tokens) has started.
    visibleMessages() {
      return this.messages.filter((m) => !m.streaming || this.writing);
    },
  },
  beforeUnmount() {
    this.disconnectSocket();
  },
};
</script>

<style scoped>
.ai-chat-widget {
  position: relative;
  flex: 0 0 auto;
  width: 0;
  overflow: hidden;
  transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.ai-chat-widget.is-open {
  width: 24rem;
}

/* ---------- Launcher ---------- */
.ai-launcher {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  z-index: 50;
  width: 3.75rem;
  height: 3.75rem;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
/* While the panel is docked open, the launcher steps aside (it would overlap
   the panel's input bar); the header close button takes over. */
.ai-launcher.is-open {
  opacity: 0;
  transform: scale(0.5) translateY(8px);
  pointer-events: none;
}

.ai-launcher-core {
  position: relative;
  width: 3.75rem;
  height: 3.75rem;
  border-radius: 9999px;
  background: linear-gradient(180deg, var(--accent), var(--accent-2));
  color: #fff;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18), 0 0 0 0 var(--accent);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s ease;
  animation: ai-core-breathe 3.2s ease-in-out infinite;
}

.ai-launcher:hover .ai-launcher-core {
  filter: brightness(1.1);
  transform: scale(1.08) rotate(-4deg);
}

.ai-launcher.is-open .ai-launcher-core {
  animation: none;
  transform: rotate(90deg);
}

.ai-launcher-ring {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  border: 2px solid var(--accent);
  opacity: 0;
  animation: ai-ring-pulse 2.6s ease-out infinite;
  pointer-events: none;
}
.ai-launcher-ring--2 {
  animation-delay: 1.3s;
}
.ai-launcher.is-open .ai-launcher-ring {
  display: none;
}

.ai-launcher-dot {
  position: absolute;
  top: 0.2rem;
  right: 0.2rem;
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 9999px;
  background: #ff5c5c;
  box-shadow: 0 0 0 2px var(--bg-surface);
  animation: ai-dot-blink 1.6s ease-in-out infinite;
}

@keyframes ai-core-breathe {
  0%, 100% { box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18), 0 0 0 0 rgba(0,0,0,0); }
  50% { box-shadow: 0 10px 34px rgba(0, 0, 0, 0.22), 0 0 18px 4px color-mix(in srgb, var(--accent) 45%, transparent); }
}
@keyframes ai-ring-pulse {
  0% { transform: scale(0.9); opacity: 0.55; }
  100% { transform: scale(1.9); opacity: 0; }
}
@keyframes ai-dot-blink {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

/* ---------- Panel (docked to the right edge, pushes content left) ---------- */
.ai-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 24rem; /* fixed inner width so content never squishes while the rail animates */
  height: 100%;
  box-sizing: border-box;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform-origin: right center;
}

.ai-panel-dock-enter-active {
  transition: opacity 0.3s ease, transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}
.ai-panel-dock-leave-active {
  transition: opacity 0.2s ease, transform 0.24s ease;
}
.ai-panel-dock-enter-from {
  opacity: 0;
  transform: translateX(36px);
}
.ai-panel-dock-leave-to {
  opacity: 0;
  transform: translateX(16px);
}

/* ---------- Small screens: overlay instead of squeezing the layout ---------- */
@media (max-width: 1023.98px) {
  .ai-chat-widget,
  .ai-chat-widget.is-open {
    width: 0;
  }
  .ai-panel {
    position: fixed;
    top: 1rem;
    right: 1rem;
    bottom: 1rem;
    height: auto;
    border-radius: 1rem;
    width: min(23.75rem, calc(100vw - 2rem));
    z-index: 50;
    box-shadow: 0 16px 44px rgba(0, 0, 0, 0.22);
  }
}

/* ---------- Header (cursor-tracked spotlight) ---------- */
.ai-header {
  position: relative;
  flex-shrink: 0;
  background: linear-gradient(120deg, var(--accent), var(--accent-2), var(--accent));
  background-size: 200% 200%;
  animation: ai-header-shift 6s ease infinite;
  overflow: hidden;
}

.ai-header-glow {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: radial-gradient(220px circle at var(--mx, 50%) var(--my, 0%),
    rgba(255, 255, 255, 0.35), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
.ai-header:hover .ai-header-glow {
  opacity: 1;
}

@keyframes ai-header-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.ai-bot-avatar {
  position: relative;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
}

.ai-bot-pulse {
  position: absolute;
  inset: -3px;
  border-radius: 9999px;
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  animation: ai-ring-pulse 2.2s ease-out infinite;
}

.ai-status-line {
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.ai-status-dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 9999px;
  background: #4ade80;
  box-shadow: 0 0 6px #4ade80;
  flex-shrink: 0;
  animation: ai-dot-blink 1.8s ease-in-out infinite;
}

.ai-header-btn {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  border: none;
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, transform 0.15s ease;
}
.ai-header-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.08);
}

/* ---------- Cursor-follow glow (generic, buttons/chips) ---------- */
.ai-glow {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}
.ai-glow::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  background: radial-gradient(90px circle at var(--mx, 50%) var(--my, 50%),
    rgba(255, 255, 255, 0.35), transparent 70%);
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}
.ai-glow:hover::before {
  opacity: 1;
}
.ai-glow > * {
  position: relative;
  z-index: 1;
}
.ai-suggestion.ai-glow::before,
.ai-send.ai-glow::before {
  background: radial-gradient(140px circle at var(--mx, 50%) var(--my, 50%),
    color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%);
}

/* ---------- Messages ---------- */
.ai-messages {
  flex: 1 1 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  scroll-behavior: smooth;
}

.ai-msg-enter-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.ai-msg-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.97);
}

.ai-avatar {
  border-radius: 9999px;
  background: var(--accent-soft);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ai-avatar--thinking {
  animation: ai-core-breathe 1.4s ease-in-out infinite;
}

.ai-bubble--bot {
  background: var(--bg-surface-2);
  color: var(--text-1);
}
.ai-bubble--user {
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #fff;
}

/* Typing indicator */
.ai-typing {
  background: var(--bg-surface-2);
}
.ai-typing-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: var(--accent);
  margin-right: 0.25rem;
  animation: ai-bounce 1s ease-in-out infinite;
}
.ai-typing-dot:nth-child(2) { animation-delay: 0.15s; }
.ai-typing-dot:nth-child(3) { animation-delay: 0.3s; }

@keyframes ai-bounce {
  0%, 100% { transform: translateY(0); opacity: 0.5; }
  50% { transform: translateY(-4px); opacity: 1; }
}

/* ---------- Suggestions ---------- */
.ai-suggestions {
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  display: flex;
  gap: 0.5rem;
}
.ai-suggestion {
  flex-shrink: 0;
  border: 1px solid var(--border);
  background: var(--bg-surface-2);
  color: var(--text-1);
  font-size: 0.75rem;
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
}
.ai-suggestion:hover:not(:disabled) {
  background: var(--hover);
  border-color: var(--border-strong);
  transform: translateY(-1px);
}
.ai-suggestion:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* ---------- Input ---------- */
.ai-inputbar {
  flex-shrink: 0;
  border-top: 1px solid var(--border);
}
.ai-input {
  flex: 1 1 auto;
  resize: none;
  overflow-y: auto;
  min-height: 2.25rem;
  max-height: 7.5rem;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  color: var(--text-1);
  border-radius: 0.75rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.ai-input:focus {
  border-color: var(--focus);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
}

.ai-send {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  border: none;
  background: var(--bg-surface-2);
  color: var(--text-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease;
}
.ai-send.is-active {
  background: linear-gradient(180deg, var(--accent), var(--accent-2));
  color: #fff;
}
.ai-send.is-active:hover {
  filter: brightness(1.08);
  transform: scale(1.06) rotate(-8deg);
}
.ai-send:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* ---------- Sources (collapsible, per answer) ---------- */
.ai-sources-toggle {
  margin-top: 0.25rem;
  padding: 0.15rem 0.6rem;
  border: 1px solid var(--border);
  background: var(--bg-surface-2);
  color: var(--text-2);
  font-size: 0.72rem;
  border-radius: 9999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
.ai-sources-toggle:hover {
  background: var(--hover);
  border-color: var(--border-strong);
  color: var(--text-1);
}
.ai-sources-toggle i {
  font-size: 0.6rem;
}

.ai-sources-list {
  margin-top: 0.4rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  max-height: 12rem;
  overflow-y: auto;
}
.ai-source-item {
  border: 1px solid var(--border);
  background: var(--bg-surface-2);
  border-radius: 0.6rem;
  padding: 0.5rem 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.75rem;
  line-height: 1.45;
}
.ai-source-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.ai-source-chip {
  padding: 0.08rem 0.55rem;
  border-radius: 9999px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: var(--accent-soft);
  color: var(--accent);
}
.ai-source-chip--semantic {
  background: color-mix(in srgb, #4ade80 18%, transparent);
  color: #16a34a;
}
.ai-source-name {
  font-weight: 600;
  color: var(--text-1);
}
.ai-source-name--link {
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: inherit;
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.ai-source-name--link:hover {
  filter: brightness(1.1);
}
.ai-source-name--link i {
  font-size: 0.6rem;
}
.ai-source-content {
  color: var(--text-1);
  word-break: break-word;
}
.ai-source-query {
  color: var(--text-2);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.68rem;
  word-break: break-all;
  white-space: pre-wrap;
}

/* Blinking cursor shown while the answer is streaming in */
.ai-stream-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  margin-left: 2px;
  vertical-align: -0.15em;
  background: var(--accent);
  animation: ai-cursor-blink 1s steps(2, start) infinite;
}
@keyframes ai-cursor-blink {
  to { visibility: hidden; }
}
</style>