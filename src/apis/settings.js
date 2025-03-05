import axios from '@/utils/request.js'

export function get_setting() {
    return axios(
        {
            method: 'get',
            url: '/config/setting'
        }
    )
}

export function update_setting(data) {
    return axios(
        {
            method: 'put',
            url: '/config/setting',
            data
        }
    )
}

export function get_ports() {
    return axios(
        {
            method: 'get',
            url: '/config/serials'
        }
    )
}

