<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <el-form ref="loginFormRef" label-width="0px" class="login_form" :model="loginForm" :rules="loginFormRules">
        <!--用户名-->
        <el-form-item prop="username">
          <el-input prefix-icon="iconfont icon-username" v-model="loginForm.username"></el-input>
        </el-form-item>
        <!--密码-->
        <el-form-item prop="passwd">
          <el-input prefix-icon="iconfont icon-passwd" v-model="loginForm.password" type="password"></el-input>
        </el-form-item>
        <!--按钮区域-->
        <el-form-item class="btns">
          <el-button type="primary" @click="validateForm('loginFormRef')">登录</el-button>
          <el-button type="info" @click="resetForm('loginFormRef')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Login",
    methods: {
      // 重置表单
      resetForm(formName) {
        this.$refs[formName].resetFields()
      },
      // 提交前表单的验证
      validateForm(formName) {
        this.$refs[formName].validate(
          async valid => {
            if (valid) {
              let {data, res} = await this.$http.post('login', this.loginForm);
              if (data.meta.status == 200) {
                // this.loginSuccess();
                window.sessionStorage.setItem("token", data.data.token);
                this.$router.push('/home')
              } else {
                this.loginFail()
              }
            } else {
              console.log("数据异常")
            }
          }
        )
      },
      loginSuccess() {
        this.$message.success("登陆成功")
      },
      loginFail() {
        this.$message.error("登录失败")
      }
    },
    data() {
      return {
        loginForm: {
          username: 'admin',
          password: '123456'
        },
        // 表单验证规则对象
        loginFormRules: {
          // 验证用户名是否合法
          username: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
          ],
          // 验证密码是否合法
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur'}
          ]
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  .login_container {
    background-color: #2b4b6b;
    height: 100%;
  }

  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;

    }
  }

  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }

  .btns {
    display: flex;
    justify-content: center;
  }
</style>
