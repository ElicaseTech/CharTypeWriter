import { ref } from "vue";
import { useHistory } from "./useHistory";

export function useDialogue(maxLines = 5, idleSeconds = 5, typingSpeed = 100) {
  const name = ref("");
  const lines = ref<string[]>([]);
  const buffer = ref("");
  const sentHistory = new Set<string>();
  const { addHistoryItem } = useHistory();

  // 打字机队列
  const queue = ref<string[]>([]);
  let typingTimer: NodeJS.Timeout | null = null;
  let idleTimer: NodeJS.Timeout | null = null;
  let thirdPartyWs: WebSocket | null = null;

  function connectThirdParty(url: string) {
    thirdPartyWs = new WebSocket(url);
    thirdPartyWs.onopen = () => console.log("第三方 WS 已连接");
  }

  function sendToThirdParty(content: string) {
    if (
      thirdPartyWs?.readyState === WebSocket.OPEN &&
      !sentHistory.has(content)
    ) {
      thirdPartyWs.send(content);
      sentHistory.add(content);
    }
  }

  function resetIdle() {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (lines.value.join("").trim()) {
        sendToThirdParty(lines.value.join("\n"));
        // 将要消失的内容添加到历史记录
        addHistoryItem(name.value, lines.value.join("\n"));
      }
      lines.value = [];
      buffer.value = "";
    }, idleSeconds * 1000);
  }

  function startTyping() {
    if (typingTimer) return;
    typingTimer = setInterval(() => {
      if (queue.value.length === 0) {
        clearInterval(typingTimer!);
        typingTimer = null;
        return;
      }
      const char = queue.value.shift()!;

      if (lines.value.length === 0) {
        lines.value = [""];
      }

      // 写入当前行
      const lastLine = lines.value[lines.value.length - 1] + char;
      lines.value = [...lines.value.slice(0, -1), lastLine];

      // 如果是句号 → 另起一行（保留句号）
      if (char === "\n") {
        lines.value = [...lines.value, ""];
        if (lines.value.length > maxLines) {
          // 保存被移除的行到历史记录
          const removedLine = lines.value[0];
          if (removedLine && removedLine.trim()) {
            addHistoryItem(name.value, removedLine);
          }
          lines.value = lines.value.slice(lines.value.length - maxLines);
        }
        // sendToThirdParty(lines.value.join('\n'))
      }
    }, typingSpeed);
  }

  function addMessage(username: string, words: string) {
    name.value = username;
    console.log(`[${Date.now().toLocaleString()}] ${username}: ${words}`);
    if (words === "/delete") {
      // 清空所有内容
      lines.value = [];
      buffer.value = "";
      queue.value = [];
      console.log("🧹 清屏完成");
      return;
    }
    if (words === "/enter") {
      queue.value.push("\n");
    } else if (words === "/space") {
      queue.value.push(" ");
    } else if (words === "/backspace") {
      // 如果正在打字，删除 queue 中的最后一个字
      if (queue.value.length > 0) {
        queue.value.pop();
      } else if (lines.value.length > 0) {
        // 删除当前最后一行最后一个字符
        const lastLine = lines.value[lines.value.length - 1];
        if (lastLine!.length > 0) {
          lines.value[lines.value.length - 1] = lastLine!.slice(0, -1);
        } else {
          // 当前行为空则删除整行
          lines.value.pop();
        }
      }
    } else {
      queue.value.push(...words.split(""));
    }
    startTyping();
    resetIdle();
  }

  return { name, lines, connectThirdParty, addMessage };
}
