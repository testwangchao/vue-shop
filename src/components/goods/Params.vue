<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
        title="注意：只允许为第三级分类设置相关参数"
        type="warning" :closable="false" show-icon>
      </el-alert>
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddParaDiglog">添加参数</el-button>
          <!--动态参数表格-->
          <el-table :data="manyTableData" border stripe>
            <!--展开行-->
            <el-table-column type="expand">
              <template slot-scope="props">
                <!--循环渲染tag标签-->
                <el-tag type="success" closable @close="handleClose(index, props.row)" v-for="(tag,index) in props.row.attr_vals" :key="index">{{tag}}</el-tag>
                <!--输入框的文本-->
                <el-input
                  class="input-new-tag"
                  v-if="props.row.inputVisible"
                  v-model="props.row.tagInput"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(props.row)"
                  @blur="handleInputConfirm(props.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(props.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" @click="showEditParaDiglog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" @click="reomoveParas(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-dialog
          :title="'添加' + titleText"
          :visible.sync="addParaDialogVisible"
          width="40%"
        @close="resetForm">
          <el-form ref="addParaFormRef" :model="addParaForm" label-width="100px" :rules="addFormRules">
            <el-form-item :label="titleText" prop="paraName">
              <el-input v-model="addParaForm.attr_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
          <el-button @click="addParaDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams()">确 定</el-button>
          </span>
        </el-dialog>
        <!--修改参数对话框-->
        <el-dialog
          :title="'修改' + titleText"
          :visible.sync="editParaDialogVisible"
          width="40%"
        @close="editDialogClosed">
          <el-form ref="editParaFormRef" :model="editParaForm" label-width="100px" :rules="editFormRules">
            <el-form-item :label="titleText" prop="paraName">
              <el-input v-model="editParaForm.attr_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
          <el-button @click="editParaDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams()">确 定</el-button>
          </span>
        </el-dialog>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddParaDiglog">添加属性</el-button>
          <!--静态属性表格-->
          <el-table :data="onlyTableData" border stripe>
            <!--展开行-->
            <el-table-column type="expand">
              <template slot-scope="props">
                <!--循环渲染tag标签-->
                <el-tag type="success" closable @close="handleClose(index, props.row)" v-for="(tag,index) in props.row.attr_vals" :key="index">{{tag}}</el-tag>
                <!--输入框的文本-->
                <el-input
                  class="input-new-tag"
                  v-if="props.row.inputVisible"
                  v-model="props.row.tagInput"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(props.row)"
                  @blur="handleInputConfirm(props.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(props.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" @click="showEditParaDiglog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" @click="reomoveParas(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: "Params",
    data() {
      return {
        cateList: [],
        activeName: 'many',
        // 动态参数的数据
        manyTableData: [],
        // 添加参数dialog
        addParaDialogVisible: false,
        // 编辑参数dialog
        editParaDialogVisible: false,
        // 添加参数的表单数据对象
        addParaForm: {
            attr_name: ''
        },
        // 添加参数的表单数据对象
        addFormRules: {
          attr_name: [
            { required: true, message: '请输入参数名称', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ]
        },
        // 静态属性的数据
        onlyTableData: [],
        cateProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        selectedCateKeys: [],
        // 编辑参数的表单
        editParaForm: {
          attr_name: ''
        },
        //
        editFormRules: {
          attr_name: [
            { required: true, message: '请输入参数名称', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ]
        },
        dynamicTags: []
      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      async getCateList() {
        const {data: res} = await this.$http.get('categories');
        if (res.meta.status !== 200) {
          return this.$message.error("获取商品分类数据失败！")
        }
        this.cateList = res.data
      },
      async handleChange() {
        this.getParamsData()
      },
      handleTabClick() {
        this.getParamsData()
      },
      async getParamsData() {
        if (this.selectedCateKeys.length !== 3) {
          this.selectedCateKeys = [];
          this.manyTableData = [];
          this.onlyTableData = [];
          return
        }
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: this.activeName}});
        if (res.meta.status !== 200) {
          return this.$message.error("获取参数列表失败")
        }
        // 将字符串列表转为真实数组attr_vals=>["",""]
        res.data.forEach(item => {
          if (item.attr_vals) {
            item.attr_vals = item.attr_vals.split(',')
          } else {
            item.attr_vals = []
          }
          // 控制文本框的显示与隐藏
            item.inputVisible = false;
            // 文本框中输入的值
            item.tagInput=''
        });
        if (this.activeName === "many") {
          this.manyTableData = res.data;
        } else {
          this.onlyTableData = res.data
        }
      },
      // 展示添加动态参数对话框
      showAddParaDiglog(){
        this.addParaDialogVisible=true
      },
      // 展示编辑的对话框
      async showEditParaDiglog(attrId){
        this.editParaDialogVisible=true;
        const {data: res} = await this.$http.get(
          `categories/${this.cateId}/attributes/${attrId}`,
          {params: {attr_sel: this.activeName}}
        );
        if (res.meta.status!==200){
          return this.$message.error("获取参数信息失败！")
        }
        this.editParaForm = res.data
      },
      // 点击确定按钮，完成参数的修改
       editParams(){
        this.$refs.editParaFormRef.validate(
          async valid=>{
            if (!valid){
              return
            }
            const {data: res} = await this.$http.put(
              `categories/${this.cateId}/attributes/${this.editParaForm.attr_id}`,
              {attr_name: this.editParaForm.attr_name, attr_sel: this.activeName}
            );
            if (res.meta.status !== 200){
              return this.$message.error("修改参数失败")
            }
            this.$message.success("修改参数成功");
            this.getParamsData();
            this.editParaDialogVisible = false
          }
        )
      },
      // 重置编辑表单并隐藏对话框
      editDialogClosed(){
        this.editParaDialogVisible=false;
        this.$refs.editParaFormRef.resetFields()
      },
      // 重置表单并隐藏对话框
      resetForm(){
        this.addParaDialogVisible=false;
        this.$refs.addParaFormRef.resetFields()
      },
      // 点击按钮，添加参数
      addParams(){
        this.$refs.addParaFormRef.validate(
          valid=>{
            if (!valid) return;
            this.$http.post(`/categories/${this.cateId}/attributes`, {
              attr_name: this.addParaForm.attr_name,
              attr_sel: this.activeName
            }).then(
              res=>{
                if (res.data.meta.status!==201){
                  return this.$message.error("添加参数失败")
                }
                this.addParaDialogVisible = false;
                this.$message.success("添加参数成功");
                this.getParamsData()
              }
            )
          }
        )
      },
      // 根据ID删除对应的参数
      async reomoveParas(attrId){
        const confirmRes = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err);
        // 用户去掉了删除操作
        if (confirmRes != 'confirm'){
          return this.$message.info("已取消删除")
        }
        // 删除的业务逻辑
        const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
        if (res.meta.status !== 200){
          return this.$message.error("删除参数失败")
        }
        this.$message.success("删除成功");
        this.getParamsData()
      },
      // 点击按钮，展示文本输入框
      showInput(row) {
        row.inputVisible = true;
        // 让文本框自动获得焦点
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      async handleInputConfirm(row) {
        if (row.tagInput.trim().length === 0){
          row.tagInput = '';
          row.inputVisible = false;
          return
        }
        if (row.tagInput) {
          if (row.attr_vals.indexOf(row.tagInput) == '-1'){
            row.attr_vals.push(row.tagInput);
          } else {
            return this.$message.error("参数已存在")
          }
        }
        // 添加tag完成后，隐藏文本输入框
        row.tagInput = '';
        row.inputVisible = false;
        this.saveAttrVals(row);

      },
      // 操作标签
      async saveAttrVals(row){
        const {data: res} = await this.$http.put(
          `/categories/${this.cateId}/attributes/${row.attr_id}`,
          {
            attr_name: row.attr_name,
            attr_sel: row.attr_sel,
            attr_vals: row.attr_vals.join(',')
          });
        if (res.meta.status!==200){
          return this.$message.error("添加失败")
        }
        this.$message.success("添加成功");
      },
      // 删除标签
      handleClose(index, row){
        row.attr_vals.splice(index, 1);
        this.saveAttrVals(row)
      }

    },
    computed: {
      isBtnDisabled() {
        if (this.selectedCateKeys.length !== 3) {
          return true
        }
        return false
      },
      cateId() {
        if (this.selectedCateKeys.length === 3) {
          return parseInt(this.selectedCateKeys[2])
        }
        return null
      },
      // 动态计算标题的文本
      titleText(){
        if (this.activeName == "many"){
          return "动态参数"
        } else {
          return "静态属性"
        }
      }
    }

  }
</script>

<style lang="less" scoped>
  .cat_opt {
    margin: 15px 0;
  }
  .input-new-tag{
    width: 120px;
  }
</style>
