<script setup>
import {ref, onMounted, computed, nextTick} from "vue";
import {Search} from "@element-plus/icons-vue";
import {get_money_pages, search_money} from "@/apis/money.js";
import {showMessage} from "@/utils/message.js";

import { useI18n } from 'vue-i18n'

const { t } = useI18n()

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const searchText = ref('')
const start = ref('')
const end = ref('')
const currentPage = ref(1);
const limit = ref(100);
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
    showMessage('error', 'get data failed:' + err)
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
    showMessage('error', 'get data failed:' + err)
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
  const excel_name = searchText.value.trim() + '.xlsx'
  XLSX.writeFile(workbook, excel_name);
}

// 导出 PDF 方法
const handleExportPDF = async () => {
  try {
    await nextTick();
    pdfTable.value.doLayout();
    await new Promise(resolve => setTimeout(resolve, 300));
    const tableBody = pdfTable.value.$el.querySelector('.el-table__body');
    if (!tableBody?.isConnected) {
      throw new Error('table content not rendered');
    }

    const canvas = await html2canvas(tableBody, {
      scale: 2,
      useCORS: true,
      ignoreElements: (element) => {
        return element.classList?.contains('el-table__empty-block');
      },
    });

    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save('export.pdf');
  } catch (error) {
    showMessage('error', 'export PDF failed:' + error.message);
  }
};

</script>


<template>
  <div class="container">
    <div class="header">
      <div class="header-left">
        <h3>{{$t('message.history')}}</h3>
      </div>
      <div class="header-right">
        <div class="search-container">
          <el-input
              v-model="searchText"
              :placeholder="$t('message.search')"
              class="input-with-select"
              size="large"

          >
            <template #prepend>
              <el-date-picker
                  v-model="start"
                  type="datetime"
                  size="small"
                  :placeholder="$t('message.start')"
                  style="width: 180px;margin:0;"
                  value-format="YYYY-MM-DD HH:mm:ss"
              />
              <el-date-picker
                  v-model="end"
                  type="datetime"
                  size="small"
                  :placeholder="$t('message.stop')"
                  style="width: 180px;margin-left:8px;"
                  value-format="YYYY-MM-DD HH:mm:ss"
              />
            </template>
            <template #append>
              <el-button :icon="Search" @click="handleSearch"/>
            </template>
          </el-input>
        </div>
        <div class="function-area">
          <div>
            <el-text type="primary" truncated :title="count">{{$t('message.record_count')}}: {{ count }}</el-text>
          </div>
        </div>
      </div>
    </div>
    <div class="content">
      <el-table :data="currentPageData" border style="width: 100%;font-size:18px;" :height="tableHeight">
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
    <div style="margin-top: 20px; display: flex; justify-content: center;align-items: center;width: 100%;">
      <el-pagination
          background
          layout="prev, pager, next"
          :total="count"
          prev-text="<<"
          next-text=">>"
          :current-page="currentPage"
          :page-size="limit"
          @current-change="handlePageChange"
      />
    </div>
  </div>

  <el-dialog v-model="searchDialog" title="" width="90%">
    <div style="width: 100%">
      <div v-if="!isSearching">
        <div style="margin-bottom: 20px;">
          <el-button type="success" :disabled="excel_exporting" @click="exportToExcel()">Export Excel</el-button>
          <el-button type="primary" :disabled="pdf_exporting" @click="handleExportPDF()">Export PDF</el-button>
          <el-tag type="success" style="margin-left: 10px" size="large">{{ searchTotal }} searched items</el-tag>
        </div>
        <div>
          <el-table :data="searchPageItems" border ref="pdfTable" style="width: 100%" :height="400">
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
        <div style="margin-top: 20px;display: flex; justify-content: center;align-items: center;width: 100%;">
          <el-pagination
              @current-change="handleSearchPageChange"
              :page-size="searchPageSize"
              :total="searchTotal"
              background
              layout="prev, pager, next"
              prev-text="<<"
              next-text=">>"
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
  width: 200px;
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