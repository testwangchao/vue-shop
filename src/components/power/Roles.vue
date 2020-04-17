<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!--添加角色按钮-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>

      <!--角色列表区域-->
      <el-table :data="roleList" border stripe>
        <!--展开列-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom', index1===0? 'bdtop' :'','vcenter']"
                    v-for="(item1, index1) in scope.row.children"
                    :key="item1.id">
              <!--渲染一级权限-->
              <el-col :span="5">
                <el-tag closable @close="remRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--渲染二级和三级权限-->
              <el-col :span="20">
                <el-row :class="[index2===0?'':'bdtop','bdtop','vcenter']" v-for="(item2, index2) in item1.children"
                        :key="item2.id" closable @close="remRightById(scope.row, item2.id)">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="remRightById(scope.row, item2.id)">{{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3, index3) in item2.children" :key="item3.id" closable
                            @close="remRightById(scope.row, item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>

        <el-table-column type="index" align="center"></el-table-column>
        <el-table-column label="角色名称" prop="roleName" align="center"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" circle size="mini" @click="showEditRoleDialog"></el-button>
            <el-button type="danger" icon="el-icon-delete" circle size="mini"></el-button>
            <el-button type="warning" icon="el-icon-setting" circle size="mini" @click="showSetRightDialog(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--添加角色dialog-->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="resetForm('roleFormRef')" :center="true">
      <el-form ref="roleFormRef" :model="roleForm" label-width="100px" :rules="rules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="roleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!--编辑角色-->
    <el-dialog
      title="编辑角色"
      :visible.sync="editRoleDialogVisible"
      width="50%"
      @close="resetForm('editFormRef')" :center="true">
      <div>
        <el-form ref="editFormRef" :model="roleForm" label-width="100px">
          <el-form-item label="角色名称">
            <el-input v-model="roleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="roleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
  </span>
    </el-dialog>
    <!--分配权限-->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="30%" @close="setRightDialogClosed">
      <!--树形控件-->
      <el-tree :data="rightsList" :props="treeProps" node-key="id" show-checkbox default-expand-all
      :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Roles",
    data() {
      let checkRoleName = (rule, value, callback) => {
        if (!value) {
          return callback(new Error("角色名称不能为空"))
        } else {
          return callback()
        }
      };
      return {
        // 角色列表数据
        roleList: [],
        // 权限列表数据
        rightsList: [],
        addRoleDialogVisible: false,
        editRoleDialogVisible: false,
        setRightDialogVisible: false,
        // 默认选中的节点的id
        defKeys:[],
        // 当前即将分配权限的ID
        roleId:'',
        roleForm: {
          roleName: '',
          roleDesc: ''
        },
        rules: {
          roleName: [
            {required: true, message: '请输入角色名称', trigger: 'blur'},
            {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'},
            {validator: checkRoleName, trigger: 'blur'}
          ],
          roleDesc: [
            {required: true, message: '请输入角色描述', trigger: 'blur'},
            {min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur'}
          ]
        },
        treeProps:{
          label: 'authName',
          children: 'children'
        }
      }
    },
    created() {
      this.getRoleList()
    },
    methods: {
      // 获取所有角色列表
      async getRoleList() {
        this.$http.get('roles').then(
          ({data: res}) => {
            if (res.meta.status == 200) {
              this.roleList = res.data;
              return console.log(res)
            }
            this.$message.error("获取角色列表数据失败")
          }
        )
      },
      addRole() {
        this.$refs.roleFormRef.validate(
          (valid) => {
            if (valid) {
              alert('submit!');
            }
            return false;
          }
        );
        // this.addRoleDialogVisible = false
      },
      resetForm(formRef) {
        this.$refs[formRef].resetFields()
      },
      showEditRoleDialog() {
        this.editRoleDialogVisible = true
      },
      // 根据ID删除对应的权限
      remRightById(role, rightId) {
        // 弹框提示用户是否删除
        this.$confirm(
          '此操作将永久删除该权限, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: "warning"
          }
        ).then(
          async () => {
            await this.$http.delete(`roles/${role.id}/rights/${rightId}`).then(
              ({data: res}) => {
                if (res.meta.status !== 200) {
                  return this.$message.error("删除失败")
                }
                this.$message.success("删除成功");
                // this.getRoleList()
                // 删除接口会直接返回最新权限，直接赋值
                role.children = res.data
              }
            );
          }).catch(() => {
          this.$message.info("已取消删除")
        })
      },
      async showSetRightDialog(role) {
        this.roleId = role.id;
        // 获取所有权限列表
        await this.$http.get('rights/tree').then(
          ({data: res}) => {
            if (res.meta.status !== 200) {
              return this.$message.error("获取所有权限列表数据失败")
            }
            this.rightsList = res.data;
            // 递归获取三级节点的ID
            this.getLeafKeys(role, this.defKeys)
          }
        );
        this.setRightDialogVisible = !this.setRightDialogVisible
      },
      //递归获取角色下所有三级权限的ID
      getLeafKeys(node, arr){
        // 如果当前节点不包含children属性，则是三级节点
        if (!node.children){
          return arr.push(node.id)
        }
        node.children.forEach(item=>this.getLeafKeys(item, arr))
      },
      // 监听分配权限对话框的对话事件
      setRightDialogClosed(){
        this.defKeys = []
      },
      // 点击确定按分配权限
      async allotRights(){
        console.log(this.$refs);
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ];
        const idStr = keys.join(',');
        await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr}).then(
          ({data:res})=>{
            if (res.meta.status!==200){
              return this.$message.error('分配权限失败')
            }
            this.$message.success('分配权限成功');
            this.getRoleList();
            this.setRightDialogVisible = false
          }
        )
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }

  .bdtop {
    border-top: 1px solid #eee;
  }

  .bdbottom {
    border-bottom: 1px solid #eee;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
