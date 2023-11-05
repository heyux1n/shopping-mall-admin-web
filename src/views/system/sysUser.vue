<template>
  <!---搜索表单-->
  <div class="search-div">
    <el-form label-width="70px" size="small">
      <el-row>
        <el-col :span="12">
          <el-form-item label="关键字">
            <el-input
              v-model="queryForm.keyword"
              placeholder="用户名"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="queryForm.createTimes"
              type="daterange"
              range-separator="To"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row style="display:flex">
        <el-button type="primary" size="small" @click="fetchData">
          搜索
        </el-button>
        <el-button size="small" @click="resetQuery">重置</el-button>
      </el-row>
    </el-form>
  </div>

  <!--添加按钮-->
  <div class="tools-div">
    <el-button type="success" size="small" @click="showAdd">添 加</el-button>
  </div>

  <!---数据表格-->
  <el-table :data="list" style="width: 100%">
    <el-table-column prop="userName" label="用户名" />
    <el-table-column prop="name" label="姓名" />
    <el-table-column prop="phone" label="手机" />
    <el-table-column prop="avatar" label="头像" #default="scope">
      <img :src="scope.row.avatar" width="50" />
    </el-table-column>
    <el-table-column prop="description" label="描述" />
    <el-table-column prop="status" label="状态" #default="scope">
      {{ scope.row.status == 1 ? '正常' : '停用' }}
    </el-table-column>
    <el-table-column prop="createTime" label="创建时间" />
    <el-table-column label="操作" width="280" #default="scope">
      <el-button type="primary" size="small" @click="showUpdate(scope.row)">
        修改
      </el-button>
      <el-button type="danger" size="small" @click="deleteUser(scope.row.id)">
        删除
      </el-button>
      <el-button
        type="warning"
        size="small"
        @click="showAssignRole(scope.row.id)"
      >
        分配角色
      </el-button>
    </el-table-column>
  </el-table>

  <!--分页条-->
  <el-pagination
    v-model:current-page="pageParams.page"
    v-model:page-size="pageParams.limit"
    layout="total, sizes, prev, pager, next"
    :page-sizes="[10, 20, 50, 100]"
    :total="total"
    @size-change="fetchData"
    @current-change="fetchData"
  />

  <!-- 添加修改表单对话框 -->
  <el-dialog v-model="dialogVisible" title="添加或修改" width="40%">
    <el-form label-width="120px">
      <el-form-item label="用户名">
        <el-input v-model="userInfo.userName" />
      </el-form-item>
      <el-form-item v-if="userInfo.id == null" label="密码">
        <el-input type="password" show-password v-model="userInfo.password" />
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="userInfo.name" />
      </el-form-item>
      <el-form-item label="手机">
        <el-input v-model="userInfo.phone" />
      </el-form-item>
      <el-form-item label="头像">
        <el-upload
          class="avatar-uploader"
          action="/api/admin/system/fileUpload"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :headers="headers"
        >
          <img v-if="userInfo.avatar" :src="userInfo.avatar" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="userInfo.description" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitUserForm">
          提交
        </el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

  <!-- 设置角色弹框 -->
  <el-dialog v-model="dialogRoleVisible" title="分配角色" width="40%">
    <el-form label-width="80px">
      <el-form-item label="用户名">
        <el-input disabled :value="sysUser.userName"></el-input>
      </el-form-item>

      <el-form-item label="角色列表">
        <el-checkbox-group v-model="userRoleIds">
          <el-checkbox v-for="role in allRoles" :key="role.id" :label="role.id">
            {{ role.roleName }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="assiginUserRole">提交</el-button>
        <el-button @click="dialogRoleVisible = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getBearerToken } from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  GetSysUserListByPage,
  SaveSysUser,
  UpdateSysUser,
  DeleteSysUserById,
  DoAssignRoleToUser,
} from '@/api/system/sysUser'

import { GetAllRoleList } from '@/api/system/sysRole'
const headers = {
  //从pinia中获取token，在进行文件上传的时候将token设置到请求头中
  Authorization: getBearerToken(),
}

// 角色列表
const userRoleIds = ref([])
const allRoles = ref([])

// 表格数据模型
const list = ref([])

//分页数据
const pageParamsForm = {
  page: 1, // 页码
  limit: 10, // 每页记录数
}
const pageParams = ref(pageParamsForm)
// 分页条数据模型
const total = ref(0)

// 控制对话是否展示的变量
const dialogVisible = ref(false)

// 控制对话是否展示的变量
const dialogRoleVisible = ref(false)

//查询dto
const queryForm = ref({
  keyword: '',
  createTimes: [],
})

//新增表单
const userInfo = ref({
  id: '',
  username: '',
  password: '',
  name: '',
  phone: '',
  avatar: '',
  description: '',
})

onMounted(() => {
  fetchData()
})

// 图像上传成功以后的事件处理函数
const handleAvatarSuccess = response => {
  userInfo.value.avatar = response.data
}

const fetchData = async () => {
  let { data } = await GetSysUserListByPage(
    pageParams.value.page,
    pageParams.value.limit,
    {
      keyword: queryForm.value.keyword,
      createTimeBegin: queryForm.value.createTimes[0],
      createTimeEnd: queryForm.value.createTimes[1],
    }
  )
  list.value = data.list
  total.value = data.total
}

const resetQuery = () => {
  queryForm.value.keyword = ''
  queryForm.value.createTimes = ''
  fetchData()
}

const showAdd = () => {
  userInfo.value = {}
  dialogVisible.value = true
}

const showUpdate = row => {
  userInfo.value = row
  dialogVisible.value = true
}

const showAssignRole = async id => {
  userInfo.value.id = id
  let { data } = await GetAllRoleList(id)
  allRoles.value = data.allList
  userRoleIds.value = data.checkIdList
  dialogRoleVisible.value = true
}

const assiginUserRole = async userId => {
  let { data } = await DoAssignRoleToUser({
    userId: userInfo.value.id,
    roleIdList: userRoleIds.value,
  })
  if (data) {
    ElMessage.success('操作成功')
    dialogRoleVisible.value = false
  }
}

const addUser = async () => {
  let { data } = await SaveSysUser(userInfo.value)
  if (data) {
    ElMessage.success('操作成功')
    dialogVisible.value = false
    fetchData()
  }
}

const updateUser = async () => {
  let { data } = await UpdateSysUser(userInfo.value)
  if (data) {
    ElMessage.success('操作成功')
    dialogVisible.value = false
    fetchData()
  }
}

const submitUserForm = () => {
  if (userInfo.value.id) {
    //修改
    updateUser()
  } else {
    addUser()
  }
}

//删除
const deleteUser = async id => {
  ElMessageBox.confirm('此操作将永久删除该记录, 是否继续?', 'Warning', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    let { data } = await DeleteSysUserById(id)
    if (data) {
      ElMessage.success('操作成功')
      dialogVisible.value = false
      fetchData()
    }
  })
}
</script>

<style scoped>
.search-div {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 3px;
  background-color: #fff;
}
.tools-div {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 3px;
  background-color: #fff;
}
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}
.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}
.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
