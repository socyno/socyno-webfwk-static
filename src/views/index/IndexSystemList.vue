<template>
  <div>
    <div class="subsystem-list">
      <el-form
        size="small"
        :inline="true"
        :model="form"
        style="    float: right; padding: 20px 20px;"
      >
        <el-form-item>
          <el-input v-model="form.namelike" placeholder="关键字" class="input-with-select" />
        </el-form-item>

        <el-form-item>
          <el-select
            v-model="form.subsystemId"
            filterable
            remote
            reserve-keyword
            placeholder="选择子系统"
            clearable
            :remote-method="remoteMethod"
            :loading="loading"
          >
            <el-option
              v-for="item in subsystems"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-select
            v-model="form.applicationId"
            filterable
            remote
            clearable
            reserve-keyword
            placeholder="选择应用"
            :remote-method="remoteMethodAppSearch"
            :loading="loading"
          >
            <el-option
              v-for="item in applist"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-select
            v-model="form.ownerId"
            filterable
            remote
            clearable
            reserve-keyword
            placeholder="选择负责人"
            :remote-method="remoteMethodUsers"
            :loading="loading"
          >
            <el-option
              v-for="item in users"
              :key="item.id"
              :label="item.display"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button icon="el-icon-search" type="primary" @click="loadData()" />
          <el-button type="text" size="mini" @click="handleExpandAll">
            展开表格
          </el-button>
        </el-form-item>
      </el-form>

      <el-table
        ref="sys-table"
        :data="productline"
        style="width: 100%;margin-bottom: 20px;"
        row-key="id"
        border
        :tree-props="{children: 'subsystems'}"
      >
        <el-table-column
          prop="code"
          label="代码"
          sortable
          width="280"
        >
          <template slot-scope="scope">
            <a
              v-if="scope.row.productlines"
              class="table_link"
              size="mini"
              @click="handDetail(scope.$index, scope.row)"
            >
              {{ scope.row.code }}
            </a>
            <span v-else>{{ scope.row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="名称"
          sortable
          width="280"
        >
          <template slot-scope="scope">
            <a
              v-if="scope.row.productlines"
              class="table_link"
              size="mini"
              @click="handDetail(scope.$index, scope.row)"
            >
              {{ scope.row.name }}
            </a>
            <span v-else>{{ scope.row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="owner.optionDisplay"
          :formatter="fmtOwners"
          label="负责人"
        />
      </el-table>
    </div>

    <BasePagination
      v-model="page"
      :options="page"
      :total="total"
      class="pagination"
      @change="loadData"
    />
  </div>
</template>
<script>
import BasePagination from '@/components/BasePagination'
import { getProductlineOptions, getSubsystemOptions, getAppOptions, getUserOptions } from '@/apis/application/index'
export default {
  components: {
    BasePagination
  },
  data() {
    return {
      page: {
        limit: 10,
        page: 1
      },
      form: {},
      loading: false,
      total: 0,
      productline: [],
      subsystems: [],
      applist: [],
      users: [],
      expandAll: false
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    handleExpandAll() {
      for (const key in this.productline) {
        this.$refs['sys-table'].toggleRowExpansion(this.productline[key])
      }
    },
    loadData() {
      var params = this.page
      Object.assign(params, this.form)
      getProductlineOptions(this.page).then(res => {
        this.productline = res.data.list
        this.total = res.data.total
      })
    },
    fmtOwners(row, column, cellValue, index) {
      if (row.owner) {
        return row.owner.display
      } else {
        if (row.owners) {
          return row.owners.map(r => r.display).join(' | ')
        } else {
          return ''
        }
      }
    },
    remoteMethod(query) {
      if (query !== '') {
        this.loading = true
        getSubsystemOptions(query).then(res => {
          this.loading = false
          this.subsystems = res.data
        })
      } else {
        this.subsystems = []
      }
    },
    remoteMethodAppSearch(query) {
      if (query !== '') {
        this.loading = true
        getAppOptions(query).then(res => {
          this.loading = false
          this.applist = res.data
        })
      } else {
        this.applist = []
      }
    },
    remoteMethodUsers(query) {
      if (query !== '') {
        this.loading = true
        getUserOptions(query).then(res => {
          this.loading = false
          this.users = res.data
        })
      } else {
        this.users = []
      }
    },
    handDetail(idx, row) {
      this.$router.push({ path: 'subsystem/' + row.id })
    }
  }
}
</script>
<style lang="scss">
 .el-table th, .el-table tr {
   background: #ffffff !important;
 }

 .subsystem-list .el-table__row--level-1 .el-icon-arrow-right {
    display: none;
}

.subsystem-list {
  .el-table .cell {
    text-align: left;
    padding-left: 50px !important;
}

.table_link {
cursor: pointer;
}
.table_link:hover {
  text-decoration: underline;
}
}

</style>
