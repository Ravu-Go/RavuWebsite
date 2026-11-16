import axios from 'axios';
import { installCloudflareSpaInterceptor } from './cloudflare-spa-adapter';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

installCloudflareSpaInterceptor();
