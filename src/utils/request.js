import axios from "axios";

const service = axios.create({
    baseURL:"http://192.168.3.25:8000",
    timeout: 30000
})

export default service;
