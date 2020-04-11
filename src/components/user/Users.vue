<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
      <!--搜索与添加区域-->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" :clearable="true" @clear="getUserList()">
            <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!--用户列表区域-->
      <el-table
        :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="手机号"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <!--scope.row拿到当前行的数据-->
            <!--{{scope.row}}-->
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949" @change="userStateChange(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <!--修改-->
            <el-tooltip class="item" effect="dark" content="编辑" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" circle
                         @click="showEditUserDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <!--删除-->
            <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
              <!--              <el-button type="text" @click="open"></el-button>-->
              <el-button type="danger" icon="el-icon-delete" size="mini" circle
                         @click="showDeleteDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <!--分配角色-->
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" circle></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
      <!--添加用户对话框-->
      <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="resetForm('addFormRef')">       <!--关闭对话框后重置表单-->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser('addFormRef')">确 定</el-button>
        </span>
      </el-dialog>
      <!--修改用户的对话框-->
      <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="resetForm('editFormRef')">
        <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUser">确 定</el-button>
        </span>
      </el-dialog>
      <!--删除用户的对话框-->
      <el-dialog
        title="删除用户"
        :visible.sync="deleteDialogVisible"
        width="30%">
        <span>确定要删除用户么？</span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="deleteUser">确 定</el-button>
  </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: "Users",
    data() {
      // 验证邮箱的规则
      let checkEmail = (rule, value, callback) => {
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
        if (regEmail.test(value)) {
          return callback()
        }
        callback(new Error("请输入合法的邮箱"))
      };

      // 验证手机号的规则
      let checkMobile = (rule, value, callback) => {
        const regMobile = /^1[3456789]\d{9}$/;
        if (regMobile.test(value)) {
          return callback()
        }
        callback(new Error("请输入合法的手机号"))
      };

      return {
        // 获取用户列表的参数对象
        queryInfo: {
          query: '',
          // 当前耶页数
          pagenum: 1,
          // 当前每页显示多少条数据
          pagesize: 2
        },
        userList: [],
        total: 0,
        // 控制添加用户对话框的显示与隐藏
        addDialogVisible: false,
        // 控制编辑用户对话框的显示与隐藏
        editDialogVisible: false,
        // 控制删除用户对话框的显示与隐藏
        deleteDialogVisible: false,
        // 添加用户的表单数据
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        // 获取用户的表单数据
        editForm: {}
        ,
        // 添加表单的验证规则对象
        addFormRules: {
          username: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur'}
          ],
          email: [
            {required: true, message: '请输入邮箱', trigger: 'blur'},
            {validator: checkEmail, trigger: 'blur'}
          ],
          mobile:
            [
              {required: true, message: '请输入邮箱', trigger: 'blur'},
              {min: 11, max: 11, message: '手机号为11位F', trigger: 'blur'},

              {validator: checkMobile, trigger: 'blur'}
            ]
        },
        // 编辑用户的表单的验证规则对象
        editFormRules: {
          email: [
            {required: true, message: '请输入邮箱', trigger: 'blur'},
            {validator: checkEmail, trigger: 'blur'}
          ],
          mobile:
            [
              {required: true, message: '请输入邮箱', trigger: 'blur'},
              {min: 11, max: 11, message: '手机号为11位F', trigger: 'blur'},

              {validator: checkMobile, trigger: 'blur'}
            ]
        }
      }
    },
    created() {
      this.getUserList()
    },
    methods: {
      async getUserList() {
        await this.$http.get('users', {params: this.queryInfo}).then(
          (res) => {
            let data = res.data;
            if (data.meta.status !== 200) {
              return this.$message.error("获取用户列表失败")
            }
            this.userList = data.data.users;
            this.total = data.data.total;
          }
        );
      },
      // 监听pagesize改变的事件
      handleSizeChange(newSize) {
        // console.log(newSize);
        this.queryInfo.pagesize = newSize;
        this.getUserList()
      },
      // 监听页码值改变的事件
      handleCurrentChange(newNum) {
        this.queryInfo.pagenum = newNum;
        this.getUserList()
      },
      // 监听switch开关状态
      async userStateChange(userInfo) {
        await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`).then(
          (res) => {
            let data = res.data;
            if (data.meta.status !== 200) {
              userInfo.mg_state = !userInfo.mg_state;
              return this.$message.error("更新用户状态失败")
            }
            return this.$message.success("更新用户状态成功")
          }
        )
      },
      // 重置表单
      resetForm(refName) {
        this.$refs[refName].resetFields();
      },
      //点击按钮，添加用户
      addUser(refName) {
        this.$refs[refName].validate(
          async valid => {
            console.log(valid);
            if (!valid) {
              return new Error("请填写正确的信息")
            }
            const {data: res} = await this.$http.post('users', this.addForm);
            if (res.meta.status !== 200) {
              this.$message.error("添加用户失败")
            }
            this.$message.success("添加用户成功");
            // 隐藏添加用户的对话框
            this.addDialogVisible = false;
            this.getUserList()
          }
        )
      },
      // 展示编辑用户的对话框
      async showEditUserDialog(userId) {

        this.editDialogVisible = true;
        // console.log(userId)
        const {data: res} = await this.$http.get('users/' + userId);
        if (res.meta.status !== 200) {
          return this.$message.error("获取用户数据失败")
        }
        this.editForm = res.data
      },
      // 编辑用户信息并提交
      editUser() {
        this.$refs.editFormRef.validate(
          async valid => {
            if (!valid) {
              return this.$message.error("请填写正确的信息")
            }
            const {data: res} = await this.$http.put('users/' + this.editForm.id, {
              email: this.editForm.email,
              mobile: this.editForm.mobile
            });
            if (res.meta.status !== 200) {
              return this.$message.error("编辑用户失败")
            }
            // 关闭对话框
            this.editDialogVisible = false;
            // 刷新用户列表
            this.getUserList();
            this.$message.success("更新用户成功")
          }
        )
      },
      // 显示删除用户对话框
      showDeleteDialog(userId) {
        // this.deleteDialogVisible = true
        this.$confirm("确认删除用户？", '提示', {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: 'warning'
        }).then(async () => {
            const {data: res} = await this.$http.delete('users/' + userId);
            if (res.meta.status !== 200) {
              return this.$message.error("删除失败")
            }
            this.$message.success("删除成功");
            return this.getUserList()
          }
        )
          .catch(() => {
            this.$message.error("已取消删除")
          })
      },
      // 删除用户信息并提交
      async deleteUser() {
        console.log("删除用户成功");
        this.deleteDialogVisible = false
        // const {data: res} = await this.$http.get()
      }
    }
  }
</script>

<style scoped>

</style>
