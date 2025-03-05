import axios from '@/utils/request.js'

export function get_money_pages(skip, limit) {
    return axios(
        {
            method: 'get',
            url: `/money/pages?skip=${skip}&limit=${limit}`
        }
    )
}