import { defineWebSocketHandler } from "h3";

// 存储用户UUID和WebSocket的对应关系
// key: peer.id（wsuuid），value: { userUUID, peer }
const userMap = new Map<
  string,
  object
>();

type APIFrom = {
  name: string;
  uuid: string;
  type: string;
  timestamp: number;
};

type APIParam = {
  action: string;
  from: APIFrom;
  data: any;
};

export default defineWebSocketHandler({
  // 客户端连接
  open(peer) {
    console.log(`[${Date.now().toLocaleString()}] 新客户端连接传入: ${peer.request.url}, ${peer.id}`);

    // 临时保存（等收到 join_member 才补充 userUUID）
    userMap.set(peer.id, { userUUID: "", peer });
  },

  // 客户端消息
  async message(peer, message) {
    try {
      const { action, from, data } = JSON.parse(message.text()) as APIParam;
      console.log("收到消息:", message.text(), "from:", from);

      const user = userMap.get(peer.id);
      if (!user) {
        peer.send(JSON.stringify({ type: "error", msg: "未注册用户" }));
        return;
      }
      peer.send(message.text());
      broadcast(peer.id,message.text());
    } catch (err) {
      console.error("解析消息出错:", err);
      peer.send(JSON.stringify({ type: "error", msg: "无效的消息格式" }));
    }
  },

  // 客户端断开
  close(peer) {
    console.log("客户端已断开:", peer.id);
    cleanupPeer(peer.id);
  },
});

// 房间内广播
function broadcast(excludePeerId: string, msg: any) {
  for (const pid of userMap.keys()) {
    if (pid === excludePeerId) continue;
    const u = userMap.get(pid);
    if (u) {
      (u as any).peer.send(JSON.stringify(msg));
    }
  }
}

// 清理 peer
function cleanupPeer(peerId: string) {
  const user = userMap.get(peerId);
  if (!user) return;

  console.log(
    `用户断开连接: wsUUID=${peerId}`
  );

  // 删除 userMap
  userMap.delete(peerId);
}
