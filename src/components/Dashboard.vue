<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <span>测试平台</span>
      </div>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse?'64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse()">{{change}}</div>
        <!-- 侧边栏菜单区-->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#ffd04b"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath">
          <!--一级菜单-->
          <el-submenu :index="item.id +''" v-for="item in menuList" :key="item.id">
            <!--一级菜单的模板区域-->
            <template slot="title">
              <!--图标-->
              <i class="el-icon-s-grid"></i>
              <!--文本-->
              <span>{{item.authName}}</span>
            </template>
            <!--二级菜单-->
            <el-menu-item :index="'/'+sub_item.path" v-for="sub_item in item.children" :key="sub_item.id" @click="saveNavState('/'+sub_item.path)">
              <template slot="title">
                {{sub_item.authName}}
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--右侧内容区域-->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    name: "Dashboard",
    created() {
      this.getMenuList();
      this.activePath = window.sessionStorage.getItem('activePath');
    },
    data() {
      return {
        menuList: [],
        isCollapse: false,
        activePath: ''
      }
    },
    computed: {
      change() {
        if (this.isCollapse) {
          return '>>>'
        }
        return '<<<'
      }
    },
    methods: {
      async getMenuList() {
        await this.$http.get('menus').then(datas => {
          if (datas.data.meta.status == 200) {
            const res = datas.data.data;
            this.menuList = res;
          } else {
            return this.$message.error(datas.data.meta.msg)
          }
        });
      },
      // 点击按钮切换菜单的折叠和展开
      toggleCollapse() {
        this.isCollapse = !this.isCollapse
      },
      // 点击高亮
      saveNavState(activePath){
        window.sessionStorage.setItem('activePath', activePath);
        this.activePath = activePath;
      }
    }

  }
</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;
  }

  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: white;
    font-size: 20px;

    div {
      display: flex;
      align-items: center;

      span {
        padding-left: 60px;
      }
    }
  }

  .el-aside {
    background-color: #333744;

    .el-menu {
      border-right: none;
    }
  }

  .el-main {
    background-color: #eaedf1;
  }

  .toggle-button {
    background-color: #4A5064;
    font-size: 10px;
    line-height: 24px;
    color: white;
    text-align: center;
    letter-spacing: 0.2em;

  }
</style>
