<script setup>
import {ref, onMounted, computed} from "vue";
import {Search, Money, SwitchButton, Service} from "@element-plus/icons-vue";
import {useWebSocketStore} from "@/stores/websocket.js";
import {showMessage} from "@/utils/message.js";
import {get_setting} from "@/apis/settings.js";
import {useSettingStore} from "@/stores/settings.js";
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const searchText = ref('')
const tableHeight = computed(() => {
  return window.innerHeight - 80;
})

const store = useWebSocketStore();
const settingStore = useSettingStore();

const searchedData = computed(()=> {
  if (searchText.value === "") {
    return store.data;
  }
  return store.data.filter((item) => {
    item.sno.toLowerCase().includes(searchText.value.toLowerCase())
  })
})


onMounted(() => {
  get_setting().then(res => {
    settingStore.setItem(res.data);
  }).catch(err => {
    showMessage('error', 'get settings failed:' + err)
  })
})

const url = "ws://127.0.0.1:8000/ws";

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
  }, 2000)
}

const handleClose = () => {
  store.disconnect()
}

</script>


<template>
  <div class="container">
    <div class="header">
      <div class="header-left">
        <h3 style="font-family: 幼圆,serif">{{$t('message.name')}}</h3>
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
                <el-tag>{{store.count}}</el-tag>
<!--            <el-tag type="success" round v-if="store.data.length < 50">{{store.data.length}}</el-tag>-->
<!--            <el-tag type="warning" round v-else>{{store.data.length}}</el-tag>-->
<!--            <el-divider direction="vertical"></el-divider>-->
<!--            <el-tag type="success" round>60</el-tag>-->
          </div>
          <div style="flex:1;display: flex;align-items: center;justify-content: flex-end;">
            <el-tag round type="primary" style="margin-right: 15px;">{{ store.status }}</el-tag>
            <el-button :icon="Service" round type="primary" @click="handleConnect" :disabled="store.socket !== null">
              {{$t('message.start')}}
            </el-button>
            <el-button :icon="SwitchButton" round type="danger" @click="handleClose" :disabled="store.socket === null">
              {{$t('message.stop')}}
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="content">
      <el-table :data="searchedData" :height="tableHeight" border style="width: 100%;font-size: 18px;">
        <el-table-column prop="create_at" :label="$t('message.datetime')" width="300" fixed="left" align="center"/>
        <el-table-column prop="money_flag" :label="$t('message.bizhong')" width="120" fixed="left" align="center"/>
        <el-table-column prop="valuta" :label="$t('message.bizhi')" width="120" fixed="left" align="center"/>
        <el-table-column prop="ver" :label="$t('message.version')" width="120" fixed="left" align="center"/>
        <el-table-column prop="tf_flag" :label="$t('message.code')" width="120" fixed="left" align="center"/>
        <el-table-column prop="machine_number" :label="$t('message.machine_num')" align="center"/>
        <el-table-column prop="sno" :label="$t('message.mno')" width="180" align="center"/>
        <el-table-column fixed="right" prop="image_data" :label="$t('message.mnoImg')" width="300" align="center">
          <template #default="scope">
            <img :src="'data:image/bmp;base64,' + scope.row.image_data" alt="冠字号码图像" style="height: 40px;">
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
  width: 180px;
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