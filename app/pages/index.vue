<template>
  <div class="w-screen h-screen text-white flex flex-col items-center justify-center">
    <!-- 名字（左上角小区域） -->
    <div class="absolute top-4 left-4 font-bold text-4xl">
      {{ name }}
    </div>

    <!-- 中间大区域：文字输出框 -->
    <div
      class="w-full h-2/3 bg-black/50 rounded-2xl shadow-lg p-4 flex items-start justify-center"
    >
      <div
        class="text-4xl leading-relaxed whitespace-pre-line text-center w-full h-full overflow-hidden font-bold"
      >
        <div v-for="(line, i) in lines" :key="i">{{ line }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDialogue } from '~/composables/useDialogue'

const { name, lines, addMessage } = useDialogue(3,600)

type Message = {
  name: string
  words: string
}

// 本地 WS
const ws = new WebSocket('ws://localhost:3000/api/ws')
ws.onmessage = (e) => {
  try {
    const msg : Message = JSON.parse(JSON.parse(e.data))
    console.log(msg)
    // console.log(msg)
    addMessage(msg.name, msg.words)
  } catch {}
}

// 连接第三方 WS
// connectThirdParty('ws://localhost:3000/api/ws')
</script>
