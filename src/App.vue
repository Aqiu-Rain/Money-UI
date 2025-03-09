<script setup>
import { ref, watch } from 'vue'
import { useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import Logo from "@/assets/image/logo.png"
import { Setting, Sunny, Money, Location } from "@element-plus/icons-vue"

const languages = [
  { 'key': 'English', 'value': 'en' },
  { 'key': '中文[简]', 'value': 'zh' },
  { 'key': '中文[繁]', 'value': 'zh_TW' }
]

const router = useRouter()
const { locale } = useI18n()
const selectedLocale = ref(locale.value)

// 新增监听器
watch(selectedLocale, (newVal) => {
  locale.value = newVal // 关键：同步到 i18n
  // 可选：存储到 localStorage 实现持久化
  localStorage.setItem('locale', newVal)
})

const goTo = (path) => {
  router.push(path)
}
</script>

<template>
  <div class="main">
    <div class="aside">
      <div class="logo">
        <el-image :src="Logo" style="width: 50px;height: 50px;border-radius: 10px;"></el-image>
      </div>
      <div class="menu">
        <div class="menu-items">
          <div class="menu-item active" @click="goTo('/')" v-if="router.currentRoute.value.path === '/'">
            <el-icon :size="30">
              <Sunny/>
            </el-icon>
          </div>
          <div class="menu-item" @click="goTo('/')" v-else>
            <el-icon :size="30">
              <Sunny/>
            </el-icon>
          </div>
          <div class="menu-item active" @click="goTo('/money')" v-if="router.currentRoute.value.path === '/money'">
            <el-icon :size="30">
              <Money/>
            </el-icon>
          </div>
          <div class="menu-item" @click="goTo('/money')" v-else>
            <el-icon :size="30">
              <Money/>
            </el-icon>
          </div>
        </div>
        <div>
          <div class="language-container">
            <el-popover
                placement="right"
                :title="$t('message.language')"
                :width="330"
                trigger="click"
            >
              <template #reference>
                <el-icon :size="30">
                  <Location/>
                </el-icon>
              </template>
              <template #default>
                <el-select
                    v-model="selectedLocale"
                    placeholder="Select Language"
                    size="large"
                    style="width: 300px"
                >
                  <el-option
                      v-for="item in languages"
                      :key="item.value"
                      :label="item.key"
                      :value="item.value"
                  />
                </el-select>
              </template>
            </el-popover>

          </div>
          <div class="setting-container active" @click="goTo('/setting')" v-if="router.currentRoute.value.path === '/setting'">
            <el-icon :size="30">
              <Setting/>
            </el-icon>
          </div>
          <div class="setting-container" @click="goTo('/setting')" v-else>
            <el-icon :size="30">
              <Setting/>
            </el-icon>
          </div>
        </div>
      </div>
    </div>
    <div class="body">
      <router-view/>
    </div>
  </div>
</template>

<style scoped>
.main {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  height: 100vh;
  width: 100vw;
  display: flex;
}

.aside {
  width: 66px;
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #E9E9EAFF;
}

.logo {
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  box-sizing: border-box;
  margin-top: 40px;
  margin-bottom: 40px;
}

.menu {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 66px;
  box-sizing: border-box;
  align-items: center;
  justify-content: space-between;
}

.body {
  width: 100%;
  padding: 0 10px;
  box-sizing: border-box;
  height: 100%;
}

.menu-item,
.setting-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  background-color: rgba(204, 255, 221, 0.27);
  margin: 20px 0;
  border-radius: 10px;
}

.language-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  margin: 20px 0;
  border-radius: 10px;
}

.active {
  background-color: #f66703;
}


</style>
