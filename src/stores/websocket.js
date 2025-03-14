import {defineStore} from "pinia";
import {showMessage, showNotification} from "@/utils/message.js";

export const useWebSocketStore = defineStore('websocketStore', {
    state() {
        return {
            data: [],
            status: 'Waiting Connect',
            message: '',
            socket: null,
            interval: null
        }
    },
    actions: {
        setData(data) {
            if (this.data.length >= 50) {
                this.data = []
                // showMessage('warning', 'The page has reached the 50-entry setting limit. Previous data has been cleared, but you can view it in the history.')
            }
            this.data.unshift(data)
        },
        connect(url) {
            this.socket = new WebSocket(url);
            this.socket.onopen = () => {
                if (this.socket.readyState === WebSocket.OPEN) {
                    this.status = 'Connected'
                    console.log('Websocket Connected----------')
                    this.sendHeartbeat()
                    console.log('Websocket Connected---------3333-')
                }
            };
            this.socket.onclose = () => {
                clearInterval(this.interval)
                if (this.socket.readyState === WebSocket.CLOSED) {
                    this.status = 'Waiting Connect'
                    this.socket.close()
                    this.socket = null
                }
            };
            this.socket.onerror = (e) => {
                console.error('WebSocket Error:', e);
                if (this.socket.readyState === WebSocket.CLOSED) {
                    this.socket.close()
                    this.status = 'Waiting Connect'
                    this.socket = null
                    showNotification('Error', 'Websocket connect failed.', 'error', 3000, 'top-right')
                } else {
                    showNotification('Error', e, 'error', 3000, 'top-right')
                }
            };
            this.socket.onmessage = (e) => {
                const parsedData = JSON.parse(e.data);
                console.log('----------receive data----------')
                console.log(parsedData)
                console.log('--------------------')

                if (parsedData.type === "serial_data") {
                    this.setData(parsedData.data)
                } else if (parsedData.type === "notification") {
                    showNotification('Success', parsedData.data, 'success', 3000, 'top-right')
                } else if (parsedData.type === "error") {
                    this.socket.close()
                    this.socket = null
                    showNotification('Error', parsedData.data, 'error', 10000, 'top-right')
                } else if (parsedData.type === "heart") {
                    console.log('Received heart: ' + parsedData.data)
                } else if (parsedData.type === "warning") {
                    showNotification('Warning', parsedData.data, 'warning', 3000, 'top-right')
                }
            }
        },
        disconnect() {
            this.socket.disconnect();
            this.status = 'Waiting Connect'
            this.socket = null
            clearInterval(this.interval)
        },
        sendData(data) {
            console.log('--------sendData:-------')
            console.log(data)
            console.log('---------------')
            this.socket.send(JSON.stringify(data))
        },
        sendHeartbeat() {
            this.interval = setInterval(() => {
                console.log('Send heartbeat')
                this.socket.send(JSON.stringify({cmd:'heart', param:{}}))
            }, 5000)
        }
    }
})
