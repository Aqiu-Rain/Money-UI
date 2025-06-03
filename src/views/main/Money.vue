<script setup>
import {ref, onMounted, computed, nextTick} from "vue";
import {Search} from "@element-plus/icons-vue";
import {get_money_pages, search_money} from "@/apis/money.js";
import {showMessage} from "@/utils/message.js";
import {formatDate} from "@/utils/time.js";

import { useI18n } from 'vue-i18n'

const { t } = useI18n()

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import excel_icon from '@/assets/image/excel.jpg'
import pdf_icon from '@/assets/image/pdf.png'

const searchText = ref('')
const start = ref('')
const end = ref('')
const code = ref('all')
const currentPage = ref(1);
const limit = ref(100);
const count = ref(0);
const currentPageData = ref([])
const searchTotal = ref(0)

const searchDialog = ref(false)
const searchResult = ref([])
const isSearching = ref(false)
const searchCurrentPage = ref(1)
const searchPageSize = ref(28)
const pdfTable = ref(null);
const excel_exporting = ref(false);
const pdf_exporting = ref(false);

const excel_text = ref('Export Excel');
const pdf_text = ref('Export PDF');
const excel_data = ref([]);


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

  searchDialog.value = true;
  isSearching.value = true;

  let data = {
    q: searchText.value.trim(),
    code: code.value,
    date_range: range
  }

  search_money(data).then(res => {
    excel_data.value = res.data.excel_data;
    searchResult.value = res.data.data;
    searchTotal.value = res.data.total;
    isSearching.value = false;
  }).catch(err => {
    isSearching.value = false;
    showMessage('error', 'Searching failed:' + err)
  })
}

const exportToExcel = () => {
  try {
    excel_exporting.value = true;
    excel_text.value = 'Exporting...';
    const worksheet = XLSX.utils.json_to_sheet(excel_data.value);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const excel_name = searchText.value.trim() + '.xlsx'
    XLSX.writeFile(workbook, excel_name);
    excel_exporting.value = false;
    excel_text.value = 'Export Excel';
  } catch (error) {
    showMessage('error', 'export excel failed:' + error.message);
    excel_exporting.value = false;
    excel_text.value = 'Export Excel';
  }
}

async function mergeSelectorsToPDF(selectors, pdfName = 'output.pdf') {
  await nextTick();
  pdfTable.value.doLayout();
  await new Promise(resolve => setTimeout(resolve, 300));

  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // 特殊处理表头和表体，确保它们正确组合
  if (selectors.includes('.el-table__header') && selectors.includes('.el-table__body')) {
    // 获取表头元素
    const headerElement = pdfTable.value.$el.querySelector('.el-table__header');
    // 获取表体元素
    const bodyElement = pdfTable.value.$el.querySelector('.el-table__body');
    
    if (headerElement && bodyElement) {
      // 先处理表头
      const headerCanvas = await html2canvas(headerElement, { scale: 1 });
      const headerImgData = headerCanvas.toDataURL('image/png');
      
      // 计算表头在PDF中的尺寸
      const headerImgWidth = pageWidth;
      const headerImgHeight = (headerCanvas.height * pageWidth) / headerCanvas.width;
      
      // 处理表体
      const bodyCanvas = await html2canvas(bodyElement, { scale: 1 });
      const bodyImgData = bodyCanvas.toDataURL('image/png');
      
      // 计算表体在PDF中的尺寸
      const bodyImgWidth = pageWidth;
      const bodyImgHeight = (bodyCanvas.height * pageWidth) / bodyCanvas.width;
      
      // 先添加表头
      pdf.addImage(headerImgData, 'PNG', 0, 0, headerImgWidth, headerImgHeight);
      
      // 在表头下方添加表体
      pdf.addImage(bodyImgData, 'PNG', 0, headerImgHeight, bodyImgWidth, bodyImgHeight);
      
      // 如果内容超出页面，自动添加新页
      if (headerImgHeight + bodyImgHeight > pageHeight) {
        // 内容已经添加，但需要调整页面布局
        console.log('内容超出页面高度，可能需要调整缩放比例');
      }
    } else {
      console.warn('表头或表体元素未找到');
    }
  } else {
    // 原有的处理逻辑，处理其他选择器
    for (const selector of selectors) {
      const element = pdfTable.value.$el.querySelector(selector);
      if (!element) {
        console.warn(`Selector "${selector}" not found.`);
        continue;
      }

      // 使用 html2canvas 将元素转换为 canvas
      const canvas = await html2canvas(element, { scale: 1 });
      const imgData = canvas.toDataURL('image/png');

      // 计算元素在 PDF 中的尺寸
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      // 如果当前页剩余空间不足以容纳该元素，则添加新页
      const currentY = pdf.internal.getCurrentPageInfo().pageContext.y || 0;
      if (currentY + imgHeight > pageHeight) {
        pdf.addPage();
      }

      // 将图像添加到 PDF
      const yPosition = pdf.internal.getCurrentPageInfo().pageContext.y || 0;
      pdf.addImage(imgData, 'PNG', 0, yPosition, imgWidth, imgHeight);
      
      // 更新Y坐标位置
      pdf.internal.getCurrentPageInfo().pageContext.y += imgHeight;
    }
  }

  // 保存 PDF 文件
  pdf.save(pdfName);
}

// 导出 PDF 方法
const handleExportPDF = async () => {
  try {
    pdf_text.value = 'Exporting...';
    pdf_exporting.value = true;
    const selectors = [
      '.el-table__header',
      '.el-table__body',
    ];
    mergeSelectorsToPDF(selectors, "export.pdf");
    pdf_exporting.value = false;
    pdf_text.value = 'Export PDF';
  } catch (error) {
    console.error('Error exporting PDF:', error);
    showMessage('error', 'export PDF failed:' + error.message);
    pdf_exporting.value = false;
    pdf_text.value = 'Export PDF';
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
              <el-select style="margin-left: 15px; width: 120px" v-model="code" size="large" placeholder="CodeCode">
                <el-option label="all" value="all"/>
                <el-option label="1" value="1"/>
                <el-option label="0" value="0"/>
              </el-select>
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
        <el-table-column prop="create_at" :label="$t('message.datetime')" width="300" fixed="left" align="center">
          <template #default="scope">
            {{ formatDate(scope.row.create_at) }}
          </template>
        </el-table-column>
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

  <el-dialog v-model="searchDialog" title="" width="80%">
    <div style="width: 100%">
      <div v-if="!isSearching">
        <div style="margin-bottom: 20px;">
          <div style="display: flex; align-items: center;">
            <div style="display: flex; background-color: seagreen; padding: 3px; border-radius: 3px; margin-right: 10px;">
              <el-image :src="excel_icon" style="width: 30px; height: 30px; margin-right: 5px"></el-image>
              <el-button type="success" :disabled="excel_exporting" @click="exportToExcel()">{{excel_text}}</el-button>
            </div>
            <div style="display: flex; background-color: skyblue; padding: 3px; border-radius: 3px; margin-right: 10px;">
              <el-image :src="pdf_icon" style="width: 30px; height: 30px; margin-right: 5px"></el-image>
              <el-button type="primary" :disabled="pdf_exporting" @click="handleExportPDF()">{{pdf_text}}</el-button>
            </div>
            <div style="">
              <el-tag type="success" style="margin-left: 10px" size="large">{{ searchTotal }} searched items</el-tag>
            </div>
          </div>
        </div>
        <div>
          <el-table :data="searchPageItems" border ref="pdfTable" style="width: 100%" :height="400">
            <el-table-column prop="create_at" :label="$t('message.datetime')" width="180" fixed="left" align="center">
              <template #default="scope">
                {{ formatDate(scope.row.create_at) }}
              </template>
            </el-table-column>
            <el-table-column prop="money_flag" :label="$t('message.bizhong')" width="90" fixed="left" align="center"/>
            <el-table-column prop="valuta" :label="$t('message.bizhi')" width="90" fixed="left" align="center"/>
            <el-table-column prop="ver" :label="$t('message.version')" width="80" fixed="left" align="center"/>
            <el-table-column prop="tf_flag" :label="$t('message.code')" width="80" fixed="left" align="center"/>
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