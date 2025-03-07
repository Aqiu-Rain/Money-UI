<script setup>
import {ref, onMounted, computed} from "vue";
import {Search, Money, SwitchButton, Service} from "@element-plus/icons-vue";
import {useWebSocketStore} from "@/stores/websocket.js";
import {showMessage} from "@/utils/message.js";
import {get_setting} from "@/apis/settings.js";
import {useSettingStore} from "@/stores/settings.js";

const searchText = ref('')
const tableHeight = computed(() => {
  return window.innerHeight - 80;
})

const store = useWebSocketStore();
const settingStore = useSettingStore();

onMounted(() => {
  get_setting().then(res => {
    settingStore.setItem(res.data);
  }).catch(err => {
    showMessage('error', '获取设置失败:' + err)
  })
})

const url = "ws://192.168.3.25:8000/ws";

const handleConnect = () => {
  store.connect(url)

  setTimeout(() => {
    if (store.socket.readyState === WebSocket.OPEN) {
      let data = {
        cmd: 'start',
        param: settingStore.setting
      }
      store.sendData(data)
    }
  }, 1000)
}

const handleClose = () => {
  store.disconnect()
}
</script>


<template>
  <div class="container">
    <div class="header">
      <div class="header-left">
        <h3 style="font-family: 幼圆,serif">点钞记录系统</h3>
      </div>
      <div class="header-right">
        <div class="search-container">
          <el-input
              v-model="searchText"
              size="large"
              :prefix-icon="Money"
              :suffix-icon="Search"/>
        </div>
        <div class="function-area">
          <div style="width: 120px;">
            <el-tag type="success">{{store.data.length}}</el-tag>
            <el-divider direction="vertical"></el-divider>
            <el-tag type="success">500</el-tag>
          </div>
          <div style="flex:1;display: flex;align-items: center;justify-content: flex-end;">
            <el-tag round type="primary" style="margin-right: 15px;">{{ store.status }}</el-tag>
            <el-button :icon="Service" round type="primary" @click="handleConnect" :disabled="store.socket !== null">Start</el-button>
            <el-button :icon="SwitchButton" round type="danger" @click="handleClose" :disabled="store.socket === null">Stop</el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="content">
      <el-table :data="store.data" :height="tableHeight" border style="width: 100%">
        <el-table-column prop="date" label="日期" width="150" fixed="left" align="center"/>
        <el-table-column prop="time" label="时间" width="120" fixed="left" align="center"/>
        <el-table-column prop="tf_flag" label="真伪标志" width="120" fixed="left" align="center"/>
        <el-table-column prop="valuta" label="币值" width="120" align="center"/>
        <el-table-column prop="fsn_count" label="纸币计数" width="100" align="center"/>
        <el-table-column prop="char_num" label="冠字号码字符数" width="130" align="center"/>
        <el-table-column prop="sno" label="冠字号码" width="140" align="center"/>
        <el-table-column prop="machine_sno" label="机具编号" width="120" align="center"/>
        <el-table-column prop="reserve1" label="保留字" align="center"/>
        <el-table-column fixed="right" prop="image_data" label="冠字号码图像" align="center">
          <template #default="scope">
            <img :src="'data:image/bmp;base64,' + scope.row.image_data" alt="冠字号码图像">
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.container {
  height: 100%;
  width: 100%;
}

.header {
  height: 50px;
  border: 1px solid lightgray;
  margin-bottom: 10px;
  margin-top: 10px;
  display: flex;
  padding: 0 10px;
  align-items: center;
  border-radius: 10px;
}

.header-left {
  height: 100%;
  width: 140px;
  display: flex;
  align-items: center;
}

.header-right {
  height: 100%;
  flex: 1;
  display: flex;
  align-items: center;
}

.search-container {
  display: flex;
  align-items: center;
  height: 100%;
  flex: 1;
  padding: 0 15px;
}

.function-area {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 400px;
  height: 100%;
}

.content {
  display: flex;
  width: calc(100vw - 86px);
  align-items: flex-start;
  justify-content: center;
  border-radius: 10px;
  box-sizing: border-box;
  height: calc(100% - 80px);
}


</style>