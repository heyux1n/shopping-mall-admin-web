<template>
  <div class="tools-div">
    <el-button type="success" size="small" @click="dialogVisible = true">
      添 加
    </el-button>
  </div>

  <el-table :data="list" style="width: 100%">
    <el-table-column prop="name" label="品牌名称" />
    <el-table-column prop="logo" label="品牌图标" #default="scope">
      <img :src="scope.row.logo" width="50" />
    </el-table-column>
    <el-table-column prop="createTime" label="创建时间" />
    <el-table-column label="操作" width="200" #default="scope">
      <el-button type="primary" size="small" @click="updateShow(scope.row)">
        修改
      </el-button>
      <el-button type="danger" size="small" @click="deleteData(scope.row.id)">
        删除
      </el-button>
    </el-table-column>
  </el-table>

  <el-pagination
    :page-sizes="[10, 20, 50, 100]"
    :total="total"
    layout="total, sizes, prev, pager, next"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />

  <el-dialog
    v-if="dialogVisible"
    v-model="dialogVisible"
    title="添加或修改"
    width="30%"
  >
    <el-form label-width="120px">
      <el-form-item label="品牌名称">
        <el-input v-model="brand.name" />
      </el-form-item>
      <el-form-item label="品牌图标">
        <el-upload
          action="/api/admin/system/fileUpload"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :headers="headers"
        >
          <img v-if="brand.logo" :src="brand.logo" width="100" />
          <el-icon v-else class="-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveOrUpdate">提交</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  GetBrandPageList,
  SaveBrand,
  UpdateBrandById,
  DeleteBrandById,
} from '@/api/product/brand.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBearerToken } from '@/utils/request'

const headers = {
  //从pinia中获取token，在进行文件上传的时候将token设置到请求头中
  Authorization: getBearerToken(),
}

//定义表格数据模型
const list = ref([])

//定义提交表单数据模型
const brand = ref({
  id: '',
  name: '',
  logo: '',
})
const dialogVisible = ref(false)

//分页条数据模型
const total = ref(0)

const pageParams = ref({
  //页码
  page: 1,
  //每页记录数
  limit: 10,
})

// 钩子函数
onMounted(() => {
  fetchData()
})

const fetchData = async () => {
  let { data } = await GetBrandPageList(
    pageParams.value.page,
    pageParams.value.limit
  )
  list.value = data.list
  total.value = data.total
}

//页面变化
const handleSizeChange = size => {
  pageParams.value.limit = size
  fetchData()
}
const handleCurrentChange = number => {
  pageParams.value.page = number
  fetchData()
}

const updateShow = row => {
  brand.value = row
  dialogVisible.value = true
}

//上传
const handleAvatarSuccess = response => {
  brand.value.logo = response.data
}

// 保存数据
const saveOrUpdate = () => {
  if (!brand.value.id) {
    saveData()
  } else {
    updaData()
  }
}

// 新增
const saveData = async () => {
  await SaveBrand(brand.value)
  dialogVisible.value = false
  ElMessage.success('操作成功')
  fetchData()
}

const updaData = async () => {
  await UpdateBrandById(brand.value)
  dialogVisible.value = false
  ElMessage.success('操作成功')
  fetchData()
}

const deleteData = id => {
  ElMessageBox.confirm('此操作将永久删除该记录, 是否继续?', 'Warning', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    let { data } = await DeleteBrandById(id)
    if (data) {
      ElMessage.success('操作成功')
      dialogVisible.value = false
      fetchData()
    }
  })
}
</script>

<style scoped>
.tools-div {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 3px;
  background-color: #fff;
}
</style>
