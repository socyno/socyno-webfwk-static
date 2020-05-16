<template>
  <div class="content">
    <div class="con">
      <div class="head">
        <span class="title">简流程系统初始化</span>
      </div>
      <div class="bg">
        <el-form ref="form01" class="form-input-pane" label-position="right" :rules="rules" :model="param" @submit.native.prevent>
          <el-form-item label-width="120px" size="mini" label="超级租戶代码" prop="superTenantCode">
            <el-input v-model="param.superTenantCode" placeholder="超级租戶代码" />
          </el-form-item>
          <el-form-item label-width="120px" size="mini" label="超级租戶名称" prop="superTenantName">
            <el-input v-model="param.superTenantName" placeholder="超级租戶名称" />
          </el-form-item>
          <el-form-item label-width="120px" size="mini" label="超级管理员账户" prop="superAdminUsername">
            <el-input v-model="param.superAdminUsername" placeholder="超级管理员账户" />
          </el-form-item>
          <el-form-item label-width="120px" size="mini" label="超级管理员姓名" prop="superAdminUserDisplay">
            <el-input v-model="param.superAdminUserDisplay" placeholder="超级管理员姓名" />
          </el-form-item>
          <el-form-item label-width="120px" size="mini" label="超级管理员邮箱" prop="superAdminMailAddress">
            <el-input v-model="param.superAdminMailAddress" placeholder="超级管理员邮箱" />
          </el-form-item>
          <el-form-item label-width="120px" size="mini" label="超级管理员密码" prop="superAdminPassword">
            <el-col :span="10">
              <el-input v-model="param.superAdminPassword" type="password" placeholder="超级管理员密码" />
            </el-col>
            <el-col :span="4">
              <span style="float:right;margin-right:10px;">密码确认</span>
            </el-col>
            <el-col :span="10">
              <el-input v-model="param.superAdminConfirmPassword" type="password" placeholder="超级管理员密码确认" />
            </el-col>
          </el-form-item>
          <div class="form-button-pane">
            <el-form-item label>
              <el-button
                class="submit-button"
                native-type="submit"
                type="primary"
                @click="submitForm('form01')"
              >
                保存
              </el-button>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { initialize } from '@/apis/common'
export default {
  data() {
    var checkPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else if (value !== this.param.superAdminConfirmPassword) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      param: {
        superTenantCode: '',
        superTenantName: '',
        superAdminUsername: '',
        superAdminUserDisplay: '',
        superAdminMailAddress: '',
        superAdminPassword: '',
        superAdminConfirmPassword: ''
      },
      rules: {
        superTenantCode: [{ required: true, message: '请务必按要求填写', trigger: 'blur' }],
        superTenantName: [{ required: true, message: '请务必按要求填写', trigger: 'blur' }],
        superAdminUsername: [{ required: true, message: '请务必按要求填写', trigger: 'blur' }],
        superAdminUserDisplay: [{ required: true, message: '请务必按要求填写', trigger: 'blur' }],
        superAdminMailAddress: [{ required: true, message: '请务必按要求填写', trigger: 'blur' }],
        superAdminPassword: [{ required: true, validator: checkPassword, message: '请务必按要求填写, 并确保两次密码的一致性', trigger: 'blur' }]
      }
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (!valid) {
          return false
        }
        initialize(this.param).then(res => {
          this.$router.replace(this.$route.query.redirect || '/dashboard')
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
  overflow: hidden;
  .con {
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -30%);
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
      .form-input-pane {
        width: 600px;
        margin-top: 20px;
        .form-button-pane {
          text-align: center;
          .submit-button {
            width:135px;
            font-weight: normal;
            margin-right: 10px;
          }
        }
      }
    }
  }
}
</style>
