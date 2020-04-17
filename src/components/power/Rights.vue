<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index" align="center"></el-table-column>
        <el-table-column label="权限名称" prop="authName" align="center"></el-table-column>
        <el-table-column label="路径" prop="path" align="center"></el-table-column>
        <el-table-column label="权限等级" prop="level" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-if="scope.row.level === '2'">三级</el-tag>

          </template>
        </el-table-column>

      </el-table>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: "Roles",
    data() {
      return {
        // 权限列表
        rightsList: []
      }
    },
    created() {
      // 获取所有权限
      this.getRightsList()

    },
    methods: {
      // 获取权限列表
      async getRightsList() {
        await this.$http.get('rights/list').then(
          ({data: res}) => {
            if (res.meta.status !== 200) {
              return this.$message.error("获取权限列表失败")
            }
            this.rightsList = res.data;

            // console.log(this.rightsList)
          }
        )
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
