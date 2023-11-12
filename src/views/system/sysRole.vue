<template>
  <div class="search-div">
    <!-- 搜索表单 -->
    <el-form label-width="70px" size="small">
      <el-form-item label="角色名称">
        <el-input
          v-model="queryDto.roleName"
          style="width: 100%"
          placeholder="角色名称"
        ></el-input>
      </el-form-item>
      <el-row style="display:flex">
        <el-button type="primary" size="small" @click="fetchData">
          搜索
        </el-button>
        <el-button size="small" @click="resetQuery">重置</el-button>
      </el-row>
    </el-form>

    <!-- 添加按钮 -->
    <div class="tools-div">
      <el-button type="success" size="small" @click="showAdd">
        添 加
      </el-button>
    </div>

    <!--- 角色表格数据 -->
    <el-table :data="list" style="width: 100%">
      <el-table-column prop="roleName" label="角色名称" width="180" />
      <el-table-column prop="roleCode" label="角色code" width="180" />
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column label="操作" width="280" #default="scope">
        <el-button
          type="warning"
          size="small"
          @click="showAssignMenu(scope.row.id)"
        >
          分配菜单
        </el-button>
        <el-button type="primary" size="small" @click="showUpdate(scope.row)">
          修改
        </el-button>
        <el-button type="danger" size="small" @click="delteRole(scope.row.id)">
          删除
        </el-button>
      </el-table-column>
    </el-table>

    <!--分页条-->
    <el-pagination
      v-model:current-page="pageParams.page"
      v-model:page-size="pageParams.limit"
      :page-sizes="[10, 20, 50, 100]"
      @size-change="fetchData"
      @current-change="fetchData"
      layout="total, sizes, prev, pager, next"
      :total="total"
    />
  </div>

  <!-- 添加角色表单对话框 -->
  <el-dialog v-model="dialogVisible" title="添加或修改角色" width="30%">
    <el-form label-width="120px">
      <el-form-item label="角色名称">
        <el-input v-model="roleForm.roleCode" />
      </el-form-item>
      <el-form-item label="角色Code">
        <el-input v-model="roleForm.roleName" />
      </el-form-item>
      <el-form-item label="角色描述">
        <el-input v-model="roleForm.description" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="formSubmit">提交</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

  <!-- 分配菜单的对话框 
// tree组件添加ref属性，后期方便进行tree组件对象的获取
-->
  <el-dialog v-model="dialogMenuVisible" title="分配菜单" width="40%">
    <el-form label-width="80px">
      <el-tree
        v-if="dialogMenuVisible"
        :data="sysMenuTreeList"
        ref="menuTree"
        show-checkbox
        node-key="id"
        :default-expanded-keys="checkedSysMenuIdList"
        :default-checked-keys="checkedSysMenuIdList"
        :check-on-click-node="true"
        :props="defaultProps"
      />
      <el-form-item>
        <el-button type="primary" @click="doAssign">提交</el-button>
        <el-button @click="dialogMenuVisible = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  GetSysRoleListByPage,
  SaveSysRole,
  UpdateSysRole,
  DeleteSysRoleById,
  GetSysRoleMenuIds,
  DoAssignMenuIdToSysRole,
} from '@/api/system/sysRole'

// 分页条总记录数
let total = ref(0)

// 定义表格数据模型
let list = ref([])

//分页数据
const pageParamsForm = {
  page: 1, // 页码
  limit: 10, // 每页记录数
}

// 将pageParamsForm包装成支持响应式的对象
const pageParams = ref(pageParamsForm)
// 搜索表单数据
const queryDto = ref({ roleName: '' })

// 控制对话是否展示的变量
const dialogVisible = ref(false)

// 控制设置菜单权限弹窗
const dialogMenuVisible = ref(false)

//菜单列表
const defaultProps = {
  children: 'children',
  label: 'title',
}
const sysMenuTreeList = ref([])
const checkedSysMenuIdList = ref([])

const roleForm = ref({
  id: undefined,
  roleName: '',
  roleCode: '',
  description: '',
})

const menuTree = ref()

onMounted(() => {
  fetchData()
})

const resetQuery = () => {
  queryDto.value.roleName = ''
  fetchData()
}

const fetchData = async () => {
  let { data } = await GetSysRoleListByPage(
    pageParams.value.page,
    pageParams.value.limit,
    queryDto.value
  )
  list.value = data.list
  total.value = data.total
}

const formSubmit = async () => {
  if (roleForm.value.id) {
    updateRole()
  } else {
    addRole()
  }
}

const showAdd = () => {
  roleForm.value = {}
  dialogVisible.value = true
}

const showAssignMenu = async roleId => {
  roleForm.value.id = roleId
  let { data } = await GetSysRoleMenuIds(roleId)
  sysMenuTreeList.value = data.allList
  checkedSysMenuIdList.value = data.checkIdList
  dialogMenuVisible.value = true
}

const doAssign = async () => {
  let checkedNodes = menuTree.value.getCheckedNodes(true)
  let menuIdList = checkedNodes.map(node => node.id)
  let { data } = await DoAssignMenuIdToSysRole({
    roleId: roleForm.value.id,
    menuIdList,
  })
  if (data) {
    ElMessage.success('操作成功')
    dialogMenuVisible.value = false
  }
}

const showUpdate = row => {
  roleForm.value = row
  dialogVisible.value = true
}

//添加
const addRole = async () => {
  let { data } = await SaveSysRole(roleForm.value)
  if (data) {
    ElMessage.success('操作成功')
    dialogVisible.value = false
    fetchData()
  }
}

//添加
const updateRole = async () => {
  let { data } = await UpdateSysRole(roleForm.value)
  if (data) {
    ElMessage.success('操作成功')
    dialogVisible.value = false
    fetchData()
  }
}

//删除
const delteRole = async roleId => {
  ElMessageBox.confirm('此操作将永久删除该记录, 是否继续?', 'Warning', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    let { data } = await DeleteSysRoleById(roleId)
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
</style>
