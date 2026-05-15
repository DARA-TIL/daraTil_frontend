import {
  buildWebSocketUrl,
  getWsAuthMode,
  hasWsCredentials,
  isWsDisabledByEnv,
} from "@/shared/realtime/wsConfig";
import {
  normalizeAiChatEvent,
} from "../model/normalize";
import type {
  AIChatSocketHandlers,
  AiChatSocketStatus,
  SendAiChatMessageRequest,
} from "../model/types";

const RECONNECT_DELAYS = [1000, 2000, 5000, 10000, 30000] as const;

export class AIChatSocket {
  private ws: WebSocket | null = null;
  private shouldReconnect = false;
  private reconnectTimer: number | null = null;
  private reconnectAttempt = 0;
  private readonly handlers: AIChatSocketHandlers;

  constructor(handlers: AIChatSocketHandlers) {
    this.handlers = handlers;
  }

  connect() {
    if (typeof window === "undefined" || typeof WebSocket === "undefined") return;
    if (isWsDisabledByEnv()) {
      this.emitError("AI chat WebSocket is disabled by environment.");
      this.updateStatus("error");
      return;
    }

    if (getWsAuthMode() === "none") {
      this.emitError("AI chat WebSocket auth mode is not configured.");
      this.updateStatus("error");
      return;
    }
    if (!hasWsCredentials()) {
      this.emitError("AI chat WebSocket query auth requires an access token.");
      this.updateStatus("error");
      return;
    }

    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.shouldReconnect = true;
    this.clearReconnectTimer();
    this.updateStatus(this.reconnectAttempt > 0 ? "reconnecting" : "connecting");

    let socket: WebSocket;
    try {
      socket = new WebSocket(buildWebSocketUrl("/ws/aiChat"));
    } catch {
      this.updateStatus("error");
      this.emitError("Failed to create AI chat connection.");
      this.scheduleReconnect();
      return;
    }

    this.ws = socket;

    socket.onopen = () => {
      this.reconnectAttempt = 0;
      this.updateStatus("connected");
    };

    socket.onmessage = (event) => {
      if (typeof event.data !== "string") return;
      const parsed = safeJsonParse(event.data);
      const nextEvent = normalizeAiChatEvent(parsed);
      if (!nextEvent) {
        this.emitError("Invalid AI chat event received.");
        return;
      }
      this.handlers.onEvent(nextEvent);
    };

    socket.onerror = () => {
      this.updateStatus("error");
      this.emitError("AI chat connection error.");
    };

    socket.onclose = () => {
      this.ws = null;
      if (!this.shouldReconnect) {
        this.updateStatus("idle");
        return;
      }

      this.updateStatus("reconnecting");
      this.scheduleReconnect();
    };
  }

  disconnect() {
    this.shouldReconnect = false;
    this.clearReconnectTimer();

    const socket = this.ws;
    this.ws = null;

    if (
      socket &&
      (socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING)
    ) {
      socket.close(1000, "client disconnect");
    }

    this.updateStatus("idle");
  }

  send(payload: SendAiChatMessageRequest): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.emitError("AI chat is not connected yet.");
      return false;
    }

    this.ws.send(JSON.stringify(payload));
    return true;
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer === null) return;
    window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private scheduleReconnect() {
    if (!this.shouldReconnect) return;
    if (isWsDisabledByEnv()) return;
    if (getWsAuthMode() === "none") return;
    if (!hasWsCredentials()) return;

    const delay =
      RECONNECT_DELAYS[
        Math.min(this.reconnectAttempt, RECONNECT_DELAYS.length - 1)
      ];

    this.reconnectAttempt += 1;
    this.clearReconnectTimer();
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private updateStatus(status: AiChatSocketStatus) {
    this.handlers.onStatusChange?.(status);
  }

  private emitError(message: string) {
    this.handlers.onError?.(message);
  }
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
