import {defineStore} from "pinia";
import {showMessage, showNotification} from "@/utils/message.js";

export const useWebSocketStore = defineStore('websocketStore', {
    state() {
        return {
            data: [],
            status: '等待链接',
            message: '',
            socket: null,
        }
    },
    actions: {
        setData(data) {
            if(this.data.length >= 500) {
                this.data = []
                showMessage('warning', '页面已达500条设置上限，清空之前数据，但是您可以在历史数据中查看之前的数据')
            }
            this.data.push(data)
        },
        connect(url) {
            this.socket = new WebSocket(url);
            this.socket.onopen = () => {
                if (this.socket.readyState === WebSocket.OPEN) {
                    this.status = '已经连接'
                }
            };
            this.socket.onclose = () => {
                if (this.socket.readyState === WebSocket.OPEN) {
                    this.status = '等待链接'
                    this.socket.close()
                }
            };
            this.socket.onerror = (e) => {
                showNotification(
                    'error',
                    e,
                    5000,
                    'top-right',
                )
                try {
                    this.socket.close();
                    this.status = '等待链接'
                    this.message = e
                    this.socket = null
                } catch (e) {
                    this.status = '等待链接'
                    this.message = e
                    this.socket = null
                } finally {
                    this.status = '等待链接'
                    this.socket = null
                }
            };
            this.socket.onmessage = (e) => {
                const parsedData = JSON.parse(e.data);
                if(parsedData.type === "serial_data") {
                    this.setData(parsedData.data)
                } else if (parsedData.type === "notification") {
                    showNotification(
                        'error',
                        parsedData.data,
                        5000,
                        'top-right',
                    )
                }else if(parsedData.type === "error") {
                    showNotification(
                        'error',
                        parsedData.data,
                        5000,
                        'top-right',
                    )
                    try {
                        this.socket.close()
                        this.socket = null
                        this.status = '等待链接'
                    } catch(e) {
                        this.socket = null
                        this.status = '等待链接'
                    } finally {
                        this.socket = null
                        this.status = '等待链接'
                    }
                }
            }
        },
        disconnect() {
            try {
                this.socket.close()
                this.status = '等待链接'
                this.socket = null
            } catch(e) {
                showNotification(
                    'error',
                    'Disconnect error:' + e,
                    5000,
                    'top-right',
                )
                this.status = '等待链接'
                this.socket = null
            } finally {
                this.socket = null
                this.status = '等待链接'
            }
        },
        sendData(data) {
            this.socket.send(JSON.stringify(data))
        }
    }
})
