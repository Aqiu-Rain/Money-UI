<script setup>
import {ref, onMounted, computed} from "vue";
import {Search, Money, Delete} from "@element-plus/icons-vue";
import {get_money_pages} from "@/apis/money.js";
import {showMessage} from "@/utils/message.js";

const searchText = ref('')
const daterange = ref('')
const currentPage = ref(1);
const limit = ref(20);
const count = ref(0);
const currentPageData = ref([])
const searchDialog = ref(false)
const searchResult = ref([])

onMounted(() => {
  get_money_pages(0, limit.value).then(res => {
    currentPageData.value = res.data.data;
    count.value = res.data.total;
  }).catch(err => {
    showMessage('error', '获取列表失败:' + err)
  })
})


const tableHeight = computed(() => {
  return window.innerHeight - 110;
})

const fetchItems = (page) => {
  const skip = (page - 1) * limit.value;
  get_money_pages(skip, limit.value).then(res => {
    currentPageData.value = res.data.data;
    count.value = res.data.total;
  }).catch(err => {
    showMessage('error', '获取校友列表失败:' + err)
  })
};

const handlePageChange = (page) => {
  currentPage.value = page;
  fetchItems(page);
};

</script>


<template>
  <div class="container">
    <div class="header">
      <div class="header-left">
        <h3 style="font-family: 幼圆,serif">点钞历史记录</h3>
      </div>
      <div class="header-right">
        <div class="search-container">
          <el-input
              v-model="searchText"
              placeholder="Please Input"
              class="input-with-select"
              size="large"
          >
            <template #prepend>
              <el-date-picker
                  v-model="daterange"
                  type="monthrange"
                  range-separator="To"
                  size="small"
                  start-placeholder="Start"
                  end-placeholder="End"
                  style="width: 140px;margin:0;"
              />
<!--              <el-select v-model="select" placeholder="Select" style="width: 115px" size="large">-->
<!--                <el-option label="Restaurant" value="1" />-->
<!--                <el-option label="Order No." value="2" />-->
<!--                <el-option label="Tel" value="3" />-->
<!--              </el-select>-->
            </template>
            <template #append>
              <el-button :icon="Search" @click="searchDialog = true;" />
            </template>
          </el-input>
        </div>
        <div class="function-area">
          <div>
            <el-text type="primary" truncated :title="count">记录总数: {{count}}</el-text>
          </div>
          <el-button round :icon="Delete" type="danger">删除所有</el-button>
        </div>
      </div>
    </div>
    <div class="content">
      <el-table :data="currentPageData" border style="width: 100%" :height="tableHeight">
        <el-table-column prop="calc_time" label="日期时间" width="180" fixed="left" align="center"/>
        <el-table-column prop="tf_flag" label="真伪标志" width="90" fixed="left" align="center"/>
        <el-table-column prop="valuta" label="币值" width="120" fixed="left" align="center"/>
        <el-table-column prop="fsn_count" label="纸币计数" width="90" align="center"/>
        <el-table-column prop="char_num" label="冠字号码字符数" width="130" align="center"/>
        <el-table-column prop="sno" label="冠字号码" width="120" align="center"/>
        <el-table-column prop="machine_sno" label="机具编号" width="120" align="center"/>
        <el-table-column prop="reserve1" label="保留字" width="70" align="center"/>
        <el-table-column prop="date" label="读取日期" width="120" align="center"/>
        <el-table-column prop="time" label="读取时间" width="100" align="center"/>
        <el-table-column prop="create_at" label="数据入库时间" width="250" align="center"/>
        <el-table-column fixed="right" prop="image_data" label="冠字号码图像" width="160" align="center">
          <template #default="scope">
            <img :src="'data:image/bmp;base64,' + scope.row.image_data" alt="冠字号码图像">
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div style="margin-top: 20px; display: flex; justify-content: center;align-items: center;width: 100%;">
      <el-pagination
          background
          layout="prev, pager, next"
          :total="count"
          prev-text="上一页"
          next-text="下一页"
          :current-page="currentPage"
          :page-size="limit"
          @current-change="handlePageChange"
      />
    </div>
  </div>

  <el-dialog v-model="searchDialog" title="Search Result" width="90%">
    <div>
      <el-table :data="searchResult" border style="width: 100%" :height="500">
        <el-table-column prop="calc_time" label="日期时间" width="180" fixed="left" align="center"/>
        <el-table-column prop="tf_flag" label="真伪标志" width="90" fixed="left" align="center"/>
        <el-table-column prop="valuta" label="币值" width="120" fixed="left" align="center"/>
        <el-table-column prop="fsn_count" label="纸币计数" width="90" align="center"/>
        <el-table-column prop="char_num" label="冠字号码字符数" width="130" align="center"/>
        <el-table-column prop="sno" label="冠字号码" width="120" align="center"/>
        <el-table-column prop="machine_sno" label="机具编号" width="120" align="center"/>
        <el-table-column prop="reserve1" label="保留字" width="70" align="center"/>
        <el-table-column prop="date" label="读取日期" width="120" align="center"/>
        <el-table-column prop="time" label="读取时间" width="100" align="center"/>
        <el-table-column prop="create_at" label="数据入库时间" width="250" align="center"/>
        <el-table-column fixed="right" prop="image_data" label="冠字号码图像" width="160" align="center">
          <template #default="scope">
            <img :src="'data:image/bmp;base64,' + scope.row.image_data" alt="冠字号码图像">
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>

</template>

<style scoped>
.container {
  height: 100%;
  width: 100%;
}

.header {
  height: 50px;
  border: 1px solid #e9e9ea;
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
  justify-content: space-between;
  width: 400px;
  height: 100%;
}

.content {
  width: calc(100vw - 86px);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  border-radius: 10px;
  height: calc(100vh - 140px);
}

.input-with-select .el-input-group__prepend {
  background-color: var(--el-fill-color-blank);
}

</style>