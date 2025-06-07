import axios from '@/utils/request.js'

export function get_money_pages(skip, limit) {
    return axios(
        {
            method: 'get',
            url: `/money/pages?skip=${skip}&limit=${limit}`
        }
    )
}

export function search_money(data) {
    return axios(
        {
            method: 'post',
            url: '/money/search',
            data
        }
    )
}

export function export_money(data) {
    return axios(
        {
            method: 'post',
            url: '/money/export',
            data
        }
    )
}