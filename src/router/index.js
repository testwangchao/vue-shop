import Vue from 'vue'
import Router from 'vue-router'
import Login from "../components/Login";
import Dashboard from "../components/Dashboard";
import Home from "../components/Home";
import Welcome from "../components/Welcome";
import Users from "../components/user/Users";

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      name: 'Login',
      path: '/login',
      component: Login
    },
    {
      name: "DashBoard",
      path: '/home',
      component: Dashboard,
      redirect: '/welcome',
      children: [
        {
          name: "Welcome",
          path: '/welcome',
          component: Welcome
        }, {
          name: "Users",
          path: '/users',
          component: Users
        }, {
          name: "Rights",
          path: '/rights',
          component: () => import('../components/power/Rights')
        }, {
          name: "Roles",
          path: '/roles',
          component: () => import('../components/power/Roles')
        },
        {
          name: 'Categories',
          path: '/categories',
          component: () => import('../components/goods/Cate')
        },
        {
          name: 'Params',
          path: '/params',
          component: ()=>import('../components/goods/Params')
        }

      ]
    },
    {
      name: "Home",
      path: '/index',
      component: Home,
    }
  ]
})
