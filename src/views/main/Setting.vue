<script setup>
import {reactive, ref, onMounted} from 'vue'
import {get_setting, update_setting, get_ports} from "@/apis/settings.js";
import {useSettingStore} from "@/stores/settings.js";
import {showMessage} from "@/utils/message.js";

const formRef = ref(null)
const store = useSettingStore();



const Ports = ref(
    [],
)

const ByteSize = ref(
    [5, 6, 7, 8],
)

const Parity = ref(
    ['N', 'E', 'O', 'M', 'S'],
)

const StopBits = ref(
    [1, 1.5, 2],
)

const boteRates = ref(
    [384000],
)


// do not use same name with ref
const form = reactive({
  port: '',
  baudrate: 384000,
  bytesize: 8,
  parity: 'N',
  stopbits: 1,
  timeout: 1.0,
  xonxoff: false,
  rtscts: false,
  dsrdtr: false,
})


const rules = reactive({
  port: [
    {required: true, message: '端口不能为空', trigger: 'blur'}
  ],
})


onMounted(() => {
  get_setting().then((res) => {
    store.setItem(res.data)
    form.port = res.data.port
    form.baudrate = res.data.baudrate
    form.bytesize = res.data.bytesize
    form.parity = res.data.parity
    form.timeout = res.data.timeout
    form.xonxoff = res.data.xonxoff
    form.rtscts = res.data.rtscts
    form.dsrdtr = res.data.dsrdtr
  }).catch((err) => {
    showMessage('error', err)
  })

  get_ports().then((res) => {
    Ports.value = res.data
  }).catch((err) => {
    showMessage('error', err)
  })
})


const updateConfig = (FormEl) => {
  FormEl.validate(valid => {
    if (!valid) {
      return false
    }

    update_setting(form).then((res) => {
      store.setItem(res.data)
      showMessage('success', '设置更新成功')
    }).catch((err) => {
      showMessage('error', '设置更新失败:' + err)
    })
  })

}
</script>

<template>
  <div class="container">
    <div class="setting-box">
      <el-form :model="form" label-width="100" ref="formRef" :rules="rules" style="width: 100%;">
        <el-form-item :label="$t('message.port')" prop="port">
          <el-select v-model="form.port" placeholder="">
            <el-option v-for="item in Ports" :label="item.Desc" :value="item.Port" :key="item.Port"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('message.btl')" prop="baudrate">
          <el-select v-model="form.baudrate" placeholder="">
            <el-option v-for="item in boteRates" :label="item" :value="item" :key="item"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('message.sjw')" prop="bytesize">
          <el-select v-model="form.bytesize" placeholder="">
            <el-option v-for="item in ByteSize" :label="item" :value="item" :key="item"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('message.jyw')" prop="parity">
          <el-select v-model="form.parity" placeholder="">
            <el-option v-for="item in Parity" :label="item" :value="item" :key="item"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('message.tzw')" prop="stopbits">
          <el-select v-model="form.stopbits" placeholder="">
            <el-option v-for="item in StopBits" :label="item" :value="item" :key="item"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('message.csz')" prop="timeout">
          <el-input-number v-model="form.timeout" :precision="2" :step="0.1" :max="10"/>
        </el-form-item>

<!--        <el-form-item label="软流控" prop="xonxoff">-->
<!--          <el-switch v-model="form.xonxoff"/>-->
<!--        </el-form-item>-->

<!--        <el-form-item label="硬RTS" prop="rtscts">-->
<!--          <el-switch v-model="form.rtscts"/>-->
<!--        </el-form-item>-->

<!--        <el-form-item label="硬DTR" prop="dsrdtr">-->
<!--          <el-switch v-model="form.dsrdtr"/>-->
<!--        </el-form-item>-->

        <el-form-item>
          <el-button type="primary" round style="width: 100%" size="large" @click="updateConfig(formRef)">
            {{$t('message.save_setting')}}
          </el-button>
        </el-form-item>


      </el-form>
    </div>
  </div>
</template>

<style scoped>
.container {
  height: 100%;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.setting-box {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid lightgray;
  border-radius: 10px;
  padding: 20px;
}


</style>

