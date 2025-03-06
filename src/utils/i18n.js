import {createI18n} from 'vue-i18n';

const messages = {
    en: () => import('@/locales/en.json'),
    zh: () => import('@/locales/zh.json'),
    zh_td: () => import('@/locales/zh_td.json')
}

const i18n = createI18n({
    messages:{},
    locale: 'en',
    fallbackLocale: 'en',
})

export async function loadLanguageAsync(language) {
    const loadedMessages = await messages[language]();
    i18n.global.setLocaleMessage(language, loadedMessages.default || loadedMessages);
    return language
}

// 设置默认语言
loadLanguageAsync('en').then(() => {
    i18n.global.locale = 'en';
})


export default i18n;
