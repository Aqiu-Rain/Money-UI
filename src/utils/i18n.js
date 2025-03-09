import {createI18n} from 'vue-i18n'

// 准备语言翻译信息
const messages = {
    en: {
        message: {
            home: 'Home',
            history: 'Record History',
            setting: 'Serial Settings',
            name: 'GRACETEK_PC SW',
            datetime: 'Date&Time',
            bizhong: 'Currency',
            bizhi: 'Denom.',
            code: 'Code',
            machine_num: 'Machine No.',
            mno: 'S.N.',
            mnoImg: 'S.N. Image',
            search: 'Search',
            start: 'Start',
            stop: 'Stop',
            w_connect: 'Waiting Connect',
            connect: 'Connected',
            record_count: 'Record Count',
            version: 'Version',
            limit: 'The page has reached the 500-entry setting limit. Previous data has been cleared, but you can view it in the history.',
            language: 'Please Select Language',
            port: 'Port',
            btl: 'Baud Rate',
            sjw: 'Data Bits',
            jyw: 'Parity Bit',
            tzw: 'Stop Bits',
            csz: 'Timeout',
            save_setting: 'Save Setting',
        }
    },
    zh: {
        message: {
            home: '主页',
            history: '历史记录',
            setting: '串口设置',
            name: '点钞机记录系统',
            datetime: '日期时间',
            bizhong: '币种',
            bizhi: '币值',
            code: '真伪标志',
            machine_num: '机具编号',
            mno: '冠字号码',
            mnoImg: ' 冠字号图像',
            search: '搜索',
            start: '开始',
            stop: '结束',
            w_connect: '等待连接',
            connect: '连接成功',
            record_count: '记录总数',
            version: '版本',
            limit: '页面已达500条设置上限，清空之前数据，但是您可以在历史数据中查看之前的数据',
            language: '请选择语言',
            port: '端口号',
            btl: '波特率',
            sjw: '数据位',
            jyw: '校验位',
            tzw: '停止位',
            csz: '超时值',
            save_setting: '保存设置',
        }
    },
    zh_TW: {
        message: {
            home: '主頁',
            history: '歷史記錄',
            setting: '串口設置',
            name: '點鈔機記錄系統',
            datetime: '日期時間',
            bizhong: '幣種',
            bizhi: '幣值',
            code: '真偽標誌',
            machine_num: '機具編號',
            mno: '冠字號碼',
            mnoImg: '冠字號圖像',
            search: '搜尋',
            start: '開始',
            stop: '結束',
            w_connect: '等待連接',
            connect: '連接成功',
            record_count: '記錄總數',
            version: '版本',
            limit: '頁面已達500條設定上限，已清空舊數據，可於歷史數據中查看',
            language: '請選擇語言',
            port: '端口號',
            btl: '波特率',
            sjw: '數據位',
            jyw: '校驗位',
            tzw: '停止位',
            csz: '超時值',
            save_setting: '儲存設定',
        }
    }
}

const i18n = createI18n({
    legacy: false, // 使用 Composition API 模式
    locale: 'en', // 默认语言
    fallbackLocale: 'en', // 备用语言
    messages
})

export default i18n