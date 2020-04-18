// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import '../static/css/global.css'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios'
// 导入三方图标
import './assets/icon/iconfont.css'
import TreeTable from 'vue-table-with-tree-grid'
axios.defaults.baseURL = "http://timemeetyou.com:8889/api/private/v1/";

axios.interceptors.request.use(config => {
  // console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token');
  // 必须return config
  return config
});

Vue.prototype.$http = axios;
Vue.config.productionTip = false;
Vue.use(ElementUI);
Vue.prototype.$message = ElementUI.Message;
Vue.component('tree-table', TreeTable);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: {App},
  template: '<App/>'
});
