<template>
  <div class="content">
    <canvas id="cas" />
    <div class="con">
      <div class="head">
        <span class="title">{{ $jian.tool.title('系统登录') }}</span>
      </div>
      <div class="bg">
        <el-form ref="form01" class="formInp" label-position="right" :rules="rules" :model="param" @submit.native.prevent>
          <div class="account">
            <el-form-item label class="inpName" prop="account">
              <el-input v-model="param.account" placeholder="登录账号" />
            </el-form-item>
          </div>
          <el-form-item label prop="pwd">
            <el-input v-model="param.pwd" class="pwd" type="password" placeholder="登录密码" />
          </el-form-item>
          <div class="pwddiv">
            <el-form-item label>
              <el-button class="inp loginBtn" native-type="submit" type="primary" @click="submitForm('form01')">
                登 录
              </el-button>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { login } from '@/apis/common'
import { Message } from 'element-ui'
export default {
  data() {
    return {
      param: {
        account: '',
        pwd: ''
      },
      rules: {
        account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        pwd: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  created() {
    // 解决iframe内置登陆问题
    if (top.location !== self.location) { top.location = self.location }
  },
  mounted() {
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (!valid) {
          return false
        }
        login(this.param.account, this.param.pwd).then(res => {
          if (res.status === 0) {
            this.$store.dispatch('user/setUserByToken', res.data.tokenContent)
            this.$store.dispatch('user/setTokenHeader', res.data.tokenHeader)
            this.$router.replace(this.$route.query.redirect || '/dashboard')
          } else {
            Message.error('账户或密码错误')
          }
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.content {
  width: 100%;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  // background: $navcolor;
  overflow: hidden;
  .con {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -80%);
    .head {
      font-size: 28px;
      font-weight: bold;
      color: #fff;
      text-align: center;
      color: $maintext;
      margin-bottom: 30px;
        .subtitle {
          color: $greytext;
          font-size: 14px;
          font-weight: normal;
        }
    }
    .bg {
      background: #fff;
      padding: 15px 25px;
      margin-top: 10px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      .formInp {
        width: 320px;
        margin-top: 20px;
        .account {
          overflow: hidden;
          .inpName {
            margin-bottom: 18px !important;
          }
        }
        .pwddiv {
          text-align: center;
          .loginBtn {
            width:135px;
            // color: #fff;
            font-weight: normal;
            margin-right: 10px;
            // background: $navcolor;
          }
        }
      }
    }
    .oldlogin {
    font-size: 12px;
    color: #fff;
    cursor: pointer;
    }
  }
}
</style>
