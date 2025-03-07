<script setup>
import {ref, onMounted, computed, nextTick} from "vue";
import {Search} from "@element-plus/icons-vue";
import {get_money_pages, search_money} from "@/apis/money.js";
import {showMessage} from "@/utils/message.js";

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const searchText = ref('')
const start = ref('')
const end = ref('')
const currentPage = ref(1);
const limit = ref(20);
const count = ref(0);
const currentPageData = ref([])
const searchTotal = ref(0)

const searchDialog = ref(false)
const searchResult = ref([])
const isSearching = ref(false)
const searchCurrentPage = ref(1)
const searchPageSize = ref(20)
const pdfTable = ref(null);
const excel_exporting = ref(false);
const pdf_exporting = ref(false);

onMounted(() => {
  get_money_pages(0, limit.value).then(res => {
    currentPageData.value = res.data.data;
    count.value = res.data.total;
  }).catch(err => {
    showMessage('error', '获取列表失败:' + err)
  })
})

const searchPageItems = computed(() => {
  const start = (searchCurrentPage.value - 1) * searchPageSize.value;
  return searchResult.value.slice(start, start + searchPageSize.value);
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
    showMessage('error', '获取列表失败:' + err)
  })
};

const handlePageChange = (page) => {
  currentPage.value = page;
  fetchItems(page);
};

const handleSearchPageChange = (page) => {
  searchCurrentPage.value = page;
};

const handleSearch = () => {
  let range = []
  if (start.value !== '' && end.value !== '') {
    range = [start.value, end.value]
  }

  if (searchText.value.trim().length === 0) {
    showMessage('warning', 'Please enter some words');
  } else {
    searchDialog.value = true;
    isSearching.value = true;

    let data = {
      q: searchText.value.trim(),
      date_range: range
    }

    search_money(data).then(res => {
      searchResult.value = res.data.data;
      searchTotal.value = res.data.total;
      isSearching.value = false;
    }).catch(err => {
      isSearching.value = false;
      showMessage('error', 'Searching failed:' + err)
    })
  }
}

const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(searchResult.value);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  // 导出 Excel 文件
  const excel_name = searchText.value.trim() + '.xlsx'
  XLSX.writeFile(workbook, excel_name);
}

// 导出 PDF 方法
const handleExportPDF = async () => {
  try {
    // 1. 确保 DOM 更新完成
    await nextTick();
    // 2. 强制渲染表格内容
    pdfTable.value.doLayout();
    await new Promise(resolve => setTimeout(resolve, 300));

    // 3. 获取实际内容容器
    const tableBody = pdfTable.value.$el.querySelector('.el-table__body');
    if (!tableBody?.isConnected) {
      throw new Error('表格内容未正确渲染');
    }

    // 4. 生成 Canvas
    const canvas = await html2canvas(tableBody, {
      scale: 2,
      useCORS: true,
      ignoreElements: (element) => {
        // 过滤 Element Plus 的 loading 动画
        return element.classList?.contains('el-table__empty-block');
      },
    });

    // 5. 生成 PDF
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save('users.pdf');
  } catch (error) {
    console.error('导出 PDF 失败:', error);
    alert('导出失败，请确保表格已完全加载');
  }
};

</script>


<template>
  <div class="container">
    <div class="header">
      <div class="header-left">
        <h3>历史记录</h3>
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
                  v-model="start"
                  type="date"
                  size="small"
                  placeholder="Start"
                  style="width: 110px;margin:0;"
              />
              <el-date-picker
                  v-model="end"
                  type="date"
                  size="small"
                  placeholder="End"
                  style="width: 110px;margin-left:8px;"
              />
            </template>
            <template #append>
              <el-button :icon="Search" @click="handleSearch"/>
            </template>
          </el-input>
        </div>
        <div class="function-area">
          <div>
            <el-text type="primary" truncated :title="count">记录总数: {{ count }}</el-text>
          </div>
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
    <div style="width: 100%">
      <div v-if="!isSearching">
        <div style="margin-bottom: 20px;">
          <el-button type="success" :disabled="excel_exporting" @click="exportToExcel()">Export Excel</el-button>
          <el-button type="primary" :disabled="pdf_exporting" @click="handleExportPDF()">Export PDF</el-button>
          <el-tag type="success" style="margin-left: 10px" size="large">{{ searchTotal }} searched items</el-tag>
        </div>
        <div>
          <el-table :data="searchPageItems" border ref="pdfTable" style="width: 100%" :height="400">
            <el-table-column prop="id" label="ID" width="180" fixed="left" align="center"/>
            <el-table-column prop="calc_time" label="日期时间" width="180" fixed="left" align="center"/>
            <el-table-column prop="tf_flag" label="真伪标志" width="90" fixed="left" align="center"/>
            <el-table-column prop="valuta" label="币值" width="120" fixed="left" align="center"/>
            <el-table-column prop="fsn_count" label="纸币计数" width="90" align="center"/>
            <el-table-column prop="char_num" label="冠字号码字符数" width="130" align="center"/>
            <el-table-column prop="sno" label="冠字号码" align="center"/>
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
        <div style="margin-top: 20px;display: flex; justify-content: center;align-items: center;width: 100%;">
          <el-pagination
              @current-change="handleSearchPageChange"
              :page-size="searchPageSize"
              :total="searchTotal"
              background
              layout="prev, pager, next"
              prev-text="上一页"
              next-text="下一页"
              :current-page="searchCurrentPage"
          />
        </div>
      </div>
      <div v-else style="margin-top: 20px; display: flex; justify-content: center;align-items: center;width: 100%;">
        Searching......
      </div>
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
  justify-content: flex-end;
  width: 100px;
  max-width: 360px;
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