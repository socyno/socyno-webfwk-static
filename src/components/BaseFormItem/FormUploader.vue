<template>
  <div class="form-uploader">
    <el-upload
      drag
      :headers="getUploadHeaders()"
      :action="getUploadUrl(formName)"
      :multiple="item.type === 'array'"
      :limit="item.type === 'array' ? 99 : 1"
      :name="item.key"
      :on-success="onFileUploaded"
      :on-remove="onFileRemoved"
      :file-list="fileList"
      :show-file-list="!hasTable"
    >
      <i class="el-icon-upload" />
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
    </el-upload>
    <UploadDisplay
      v-if="hasTable"
      :form-name="formName"
      :form-id="formId"
      :files="fileList"
      :can-remove-file="item.readonly !== true"
      @delete="onTableRemoved"
    />
  </div>
</template>
<script>
import store from '@/store'
import UploadDisplay from '../UploadControl/display'
export default {
  components: {
    UploadDisplay
  },
  props: {
    hasTable: {
      type: Boolean,
      default: false
    },
    files: {
      type: [Array, String],
      default: null
    },
    formName: {
      type: String,
      default() {
        return this.$route.query.formName || this.$route.params.form_name
      }
    },
    formId: {
      type: String,
      default() {
        return this.$route.query.formId || this.$route.params.form_id
      }
    },
    item: {
      type: Object,
      default: null,
      required: true
    }
  },
  data() {
    return {
      fileList: []
    }
  },
  watch: {
    files: {
      immediate: true,
      handler(newv) {
        if (typeof newv !== 'string') {
          this.fileList = JSON.parse(JSON.stringify(newv))
          this.$emit('input', this.fileList)
        }
      }
    }
  },
  methods: {
    onFileUploaded(response, file, fileList) {
      if (response.data && response.data.length) {
        this.fileList.push(response.data[0])
        this.$emit('input', this.fileList)
      }
    },
    onFileRemoved(file, fileList) {
      this.fileList = fileList
      this.$emit('input', this.fileList)
    },
    onTableRemoved(index) {
      this.fileList.splice(index, 1)
      this.$emit('input', this.fileList)
    },
    getUploadUrl(formName) {
      return store.getters['user/getBaseApiUrl']() + formName
    },
    getUploadHeaders() {
      var tokenContent = store.getters['user/getTokenContent']()
      var tokenHeader = store.getters['user/getTokenHeader']()
      var headers = {}
      headers[tokenHeader] = tokenContent
      return headers
    }
  }
}
</script>
<style lang='scss'>

</style>
