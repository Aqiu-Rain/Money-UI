import {defineStore} from "pinia";
import {showMessage, showNotification} from "@/utils/message.js";

export const useWebSocketStore = defineStore('websocketStore', {
    state() {
        return {
            data: [],
            status: 'Waiting Connect',
            message: '',
            socket: null,
            heartbeatTimer: null,
            lastUrl: null,
        }
    },
    actions: {
        setData(data) {
            if (this.data.length >= 50) {
                this.data = []
                showMessage('warning', 'The page has reached the 50-entry setting limit. Previous data has been cleared, but you can view it in the history.')
            }
            this.data.unshift(data)
        },
        connect(url) {
            this.lastUrl = url;
            this.socket = new WebSocket(url);
            this.socket.onopen = () => {
                if (this.socket.readyState === WebSocket.OPEN) {
                    this.status = 'Connected'
                    this.startHeartbeat();
                }
            };
            this.socket.onclose = () => {
                if (this.socket.readyState === WebSocket.OPEN) {
                    this.status = 'Waiting Connect'
                    this.socket.close()
                }
            };
            this.socket.onerror = (e) => {
                showNotification(
                    'Error',
                    e,
                    'error',
                    3000,
                    'top-right',
                )
                try {
                    this.socket.close();
                    this.status = 'Waiting Connect'
                    this.message = e
                    this.socket = null
                } catch (e) {
                    this.status = 'Waiting Connect'
                    this.message = e
                    this.socket = null
                } finally {
                    this.status = 'Waiting Connect'
                    this.socket = null
                }
            };
            this.socket.onmessage = (e) => {
                const parsedData = JSON.parse(e.data);
                if (parsedData.type === "serial_data") {
                    this.setData(parsedData.data)
                } else if (parsedData.type === "notification") {
                    showNotification(
                        'Success',
                        parsedData.data,
                        'success',
                        3000,
                        'top-right',
                    )
                } else if (parsedData.type === "error") {
                    showNotification(
                        'Error',
                        parsedData.data,
                        'error',
                        3000,
                        'top-right',
                    )

                    try {
                        this.socket.close()
                        this.socket = null
                        this.status = 'Waiting Connect'
                    } catch (e) {
                        this.socket = null
                        this.status = 'Waiting Connect'
                    } finally {
                        this.socket = null
                        this.status = 'Waiting Connect'
                    }
                }
            }
        },
        disconnect() {
            try {
                this.socket.close()
                this.status = 'Waiting Connect'
                this.socket = null
            } catch (e) {
                showNotification(
                    'Error',
                    'Disconnect error:' + e,
                    'error',
                    3000,
                    'top-right',
                )
                this.status = 'Waiting Connect'
                this.socket = null
            } finally {
                this.socket = null
                this.status = 'Waiting Connect'
            }
        },
        sendData(data) {
            this.socket.send(JSON.stringify(data))
        },
        ping() {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({ type: 'heart', data: "ping" }));
            }
        },
        startHeartbeat() {
            this.heartbeatTimer = setInterval(() => {
                if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                    this.ping();
                } else {
                    this.stopHeartbeat();
                    this.reconnect();
                }
            }, 5000);
        },
        stopHeartbeat() {
            if (this.heartbeatTimer) {
                clearInterval(this.heartbeatTimer);
                this.heartbeatTimer = null;
            }
        },
        reconnect() {
            if (this.socket) {
                this.disconnect();
            }
            this.connect(this.lastUrl);
        }
    }
})
