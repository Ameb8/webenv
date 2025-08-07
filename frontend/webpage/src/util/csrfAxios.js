import axios from 'axios';
import Cookies from 'js-cookie';

const csrfAxios = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true,
});

csrfAxios.interceptors.request.use(config => {
    const token = Cookies.get('csrftoken');
    if (token) {
        config.headers['X-CSRFToken'] = token;
    }
    return config;
});

export default csrfAxios;