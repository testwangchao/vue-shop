<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
      <el-row class="add-cate-button">
        <el-col>
          <el-button type="primary" @click="showAddCateDiglog">添加分类</el-button>
        </el-col>
      </el-row>
      <!--表格占位-->
      <tree-table :data="cateList" :columns="columns" :selection-type="false" :expand-type="false"
                  :show-index="true" index-text="#" border stripe class="cate-table">
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color: lightgreen"></i>
          <i class="el-icon-success" v-else style="color: red"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <!--排序-->
          <el-tag v-if="scope.row.cat_level===0">标签一</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level===1">标签二</el-tag>
          <el-tag type="info" v-else>标签三</el-tag>
        </template>
        <!--操作-->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" size="mini" @click="editCate(scope.row.cat_id)">编辑</el-button>
          <el-button type="primary" size="mini">删除</el-button>
        </template>

      </tree-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :page-sizes="[5, 10, 20, 40]"
        :page-size="queryInfo.pagesize"
        :current-page="queryInfo.pageNum"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!--添加分类-->
    <el-dialog
      title="添加分类"
      :visible.sync="setCatedialogVisible"
      width="50%"
      :center="true"
    @close="resetForm('addCateFormRef')">
      <el-form ref="addCateFormRef" :model="addCateForm" label-width="80px" :rules="cateFormRules">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="value"
            :options="parentCateList"
            :props="{value: 'cat_id', label: 'cat_name', children: 'children'}"
            ref="catRef"
            expandTrigger="hover"
            :filterable="true"
            clearable
          @change="getCate(value)"></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setCatedialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
    </el-dialog>
    <!--编辑分类-->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCatedialogVisible"
      width="30%"
      :center="true"
    @close="resetForm('editCateFormRef')">
      <el-form ref="editCateFormRef" :model="editCateForm" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editCatedialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="confirmEditCate">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Cate",
    data() {
      return {
        // 商品分类的数据列表，默认为空
        cateList: [],
        total: 0,
        setCatedialogVisible: false,
        editCatedialogVisible: false,
        // 查询条件
        queryInfo: {
          type: 3,
          pageNum: 1,
          pageSize: 5
        },
        // 添加商品分类表单
        addCateForm: {
          cat_name: '',
          cat: ''
        },
        // 添加商品分类表单校验
        cateFormRules: {
          cat_name: [
            {required: true, message: '请输入商品分类名称', trigger: 'blur'},
            {min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur'}
          ],
          cat: [
            {required: true, message: '请选择父级分类', trigger: 'blur'},
              {min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur'}
          ]
        },
        // 获取商品分类的数据
        editCateForm: {
          cat_name: ''
        },
        //父级分类的数据
        parentCateList: [],
        value: [],
        columns: [
          {
            label: '分类名称',
            prop: 'cat_name',
            align: 'center'
          },
          {
            label: '是否有效',
            prop: 'cat_deleted',
            type: 'template',
            template: 'isok',
            align: 'center'
          },
          {
            label: '排序',
            prop: 'cat_level',
            // align: 'center',
            type: 'template',
            template: 'order'
          },
          {
            label: '操作',
            type: 'template',
            template: 'opt'
          }
        ]
      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      async getCateList() {
        const {data: res} = await this.$http.get('categories', {params: this.queryInfo});
        if (res.meta.status !== 200) {
          return this.$message.error("获取商品分类数据失败")
        }
        // console.log(res)
        this.cateList = res.data;
        this.total = res.data.length
      },
      // 显示添加商品分类对话框
      showAddCateDiglog() {
        this.getParentCateList();
        this.setCatedialogVisible = true

      },
      //  确定添加商品分类
      addCate() {
        this.$refs.addCateFormRef.validate((valid) => {
          if (valid) {
            this.$message.success("添加商品分类成功");
            this.setCatedialogVisible = false
          } else {
            return new Error("请填写正确的信息")
          }

        });
      },
      // 编辑商品分类
      editCate(cateId) {
        for (let cate of this.cateList) {
          if (cate.cat_id == cateId) {
            this.editCateForm.cat_id = cateId;
            this.editCateForm.cat_name = cate.cat_name;
          }
          this.editCatedialogVisible = true
        }

      },
      //确定编辑商品分类
      confirmEditCate() {
        this.editCatedialogVisible = false;
        this.$message.success("编辑成功")
      },
      // 监听pagesize改变的事件
      handleSizeChange(newSize) {
        // console.log(newSize);
        this.queryInfo.pageSize = newSize;
        this.getCateList()
      },
      // 监听页码值改变的事件
      handleCurrentChange(newNum) {
        this.queryInfo.pageNum = newNum;
        this.getCateList()
      },
      getCate(v){
        console.log(this.$refs.catRef.getCheckedNodes())
      },
      // 关闭或取消时，重置表单
      resetForm(formName){
        this.$refs[formName].resetFields();
        // 清空分类
        this.value=[]
      },
      // 获取父级分类的数据列表
      async getParentCateList(){
        const {data: res} = await this.$http.get('categories', {params:{type: 2}});
        if (res.meta.status!==200){
          return this.$message.error("获取父级分类数据失败")
        }
        // console.log(res.data)
        this.parentCateList = res.data
      }
    }
  }
</script>

<style lang="less" scoped>
  .add-cate-button {
    margin-bottom: 20px;
  }

  .zk-table__cell-inner {
    text-align: center;
  }
  .el-cascader{
    width: 100%;
  }
</style>
