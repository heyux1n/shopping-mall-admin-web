<template>
  <div class="search-div">
    <el-form label-width="70px" size="small">
      <el-row>
        <el-col :span="12">
          <el-form-item label="品牌">
            <el-select
              class="m-2"
              v-model="queryDto.brandId"
              placeholder="选择品牌"
              size="small"
              style="width: 100%"
            >
              <el-option
                v-for="item in brandList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分类">
            <el-cascader
              v-model="searchCategoryIdList"
              :props="categoryList"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row style="display:flex">
        <el-button type="primary" size="small" @click="fetchData">
          搜索
        </el-button>
        <el-button size="small" @click="resetData">重置</el-button>
      </el-row>
    </el-form>
  </div>

  <div class="tools-div">
    <el-button type="success" size="small" @click="addShow">
      添 加
    </el-button>
  </div>

  <el-table :data="list" style="width: 100%">
    <el-table-column prop="categoryName" label="分类" />
    <el-table-column prop="brandName" label="品牌" />
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
    layout="total, sizes, prev, pager, next"
    :total="total"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />

  <el-dialog v-model="dialogVisible" title="添加或修改" width="30%">
    <el-form label-width="120px">
      <el-form-item label="品牌">
        <el-select
          class="m-2"
          placeholder="选择品牌"
          size="small"
          v-model="categoryBrand.brandId"
        >
          <el-option
            v-for="item in brandList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="分类">
        <el-cascader :props="categoryList" v-model="categoryBrand.categoryId" />
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
import { FindAllBrand } from '@/api/product/brand.js'
import {
  FindCategoryByParentId,
  GetCategoryPath,
} from '@/api/product/category.js'
import {
  GetCategoryBrandPageList,
  SaveCategoryBrand,
  UpdateCategoryBrandById,
  DeleteCategoryBrandById,
} from '@/api/product/categoryBrand.js'
import { ElMessage, ElMessageBox } from 'element-plus'

// ================数据模型定义  start ===============================================
// 定义搜索表单数据模型
const brandList = ref([])

const categoryProps = {
  lazy: true,
  value: 'id',
  label: 'name',
  leaf: 'leaf',
  async lazyLoad(node, resolve) {
    let { data } = await FindCategoryByParentId(node?.data?.id || 0)
    data.forEach(item => {
      //hasChildren判断是否有子节点
      item.leaf = !item.hasChildren
    })
    resolve(data) // 返回数据
  },
}
const categoryList = ref(categoryProps)

// 定义表格数据模型
const list = ref([])

// 分页条数据模型
const total = ref(0)

const categoryBrand = ref({
  //页面表单数据
  id: '',
  brandId: '',
  categoryId: '',
})

const dialogVisible = ref(false)

const pageParams = ref({
  //页码
  page: 1,
  //每页记录数
  limit: 10,
})

// 搜索表单数据模型
const queryDto = ref({ brandId: '', categoryId: '' })
const searchCategoryIdList = ref([])

// 钩子函数
onMounted(() => {
  fetchData()
  initBrandData()
})

const initBrandData = async () => {
  let { data } = await FindAllBrand()
  brandList.value = data
}

//重置
const resetData = () => {
  queryDto.value = { brandId: '', categoryId: '' }
  searchCategoryIdList.value = []
  fetchData()
}

const fetchData = async () => {
  console.log(searchCategoryIdList.value)
  if (searchCategoryIdList.value.length == 3) {
    queryDto.value.categoryId = searchCategoryIdList.value[2]
  }
  const { data } = await GetCategoryBrandPageList(
    pageParams.value.page,
    pageParams.value.limit,
    queryDto.value
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

const addShow = () => {
  categoryBrand.value = {
    brandId: '',
    categoryId: '',
  }
  dialogVisible.value = true
}
const updateShow = async row => {
  categoryBrand.value = { ...row }
  let { data } = await GetCategoryPath(row.categoryId)
  categoryBrand.value.categoryId = data.reverse()
  dialogVisible.value = true
}

//提交保存与修改
const saveOrUpdate = () => {
  if (categoryBrand.value.brandId == '') {
    ElMessage.info('品牌信息必须选择')
    return
  }
  //categoryId为数组：[1,2,3]
  if (categoryBrand.value.categoryId.length != 3) {
    ElMessage.info('分类信息必须选择')
    return
  }
  //系统只需要三级分类id
  categoryBrand.value.categoryId = categoryBrand.value.categoryId[2]
  if (!categoryBrand.value.id) {
    saveData()
  } else {
    updateData()
  }
}

// 新增
const saveData = async () => {
  await SaveCategoryBrand(categoryBrand.value)
  dialogVisible.value = false
  ElMessage.success('操作成功')
  fetchData()
}

const updateData = async () => {
  await UpdateCategoryBrandById(categoryBrand.value)
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
    let { data } = await DeleteCategoryBrandById(id)
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
