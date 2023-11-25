<template>
  <div class="search-div">
    <el-form label-width="70px" size="small">
      <el-row>
        <el-col :span="12">
          <el-form-item label="品牌">
            <el-select
              class="m-2"
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
            <el-cascader :props="categoryProps" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row style="display:flex">
        <el-button type="primary" size="small">
          搜索
        </el-button>
        <el-button size="small">重置</el-button>
      </el-row>
    </el-form>
  </div>

  <div class="tools-div">
    <el-button type="success" size="small">添 加</el-button>
  </div>

  <el-table :data="list" style="width: 100%">
    <el-table-column prop="categoryName" label="分类" />
    <el-table-column prop="brandName" label="品牌" />
    <el-table-column prop="logo" label="品牌图标" #default="scope">
      <img :src="scope.row.logo" width="50" />
    </el-table-column>
    <el-table-column prop="createTime" label="创建时间" />
    <el-table-column label="操作" width="200">
      <el-button type="primary" size="small">
        修改
      </el-button>
      <el-button type="danger" size="small">
        删除
      </el-button>
    </el-table-column>
  </el-table>

  <el-pagination
    :page-sizes="[10, 20, 50, 100]"
    layout="total, sizes, prev, pager, next"
    :total="total"
  />
</template>

<script setup>
import { ref } from 'vue'
// ================数据模型定义  start ===============================================
// 定义搜索表单数据模型
const brandList = ref([
  {
    id: 2,
    createTime: '2023-05-06 09:31:19',
    name: '华为',
    logo: 'http://139.198.127.41:9000/sph/20230506/华为.png',
  },
  {
    id: 1,
    createTime: '2023-05-06 09:30:27',
    name: '小米',
    logo: 'http://139.198.127.41:9000/sph/20230506/小米.png',
  },
])

const props = {
  lazy: true,
  value: 'id',
  label: 'name',
  leaf: 'leaf',
  lazyLoad(node, resolve) {
    // 加载数据的方法
    const data = [
      {
        id: 643,
        createTime: '2023-05-22 15:31:18',
        name: '玩具乐器',
        imageUrl:
          'https://lilishop-oss.oss-cn-beijing.aliyuncs.com/0f423fb60f084b2caade164fae25a9a0.png',
        parentId: 0,
        status: 1,
        orderNum: 10,
        hasChildren: true,
        children: null,
      },
      {
        id: 576,
        createTime: '2023-05-22 15:31:13',
        name: '汽车用品',
        imageUrl:
          'https://lilishop-oss.oss-cn-beijing.aliyuncs.com/665dd952b54e4911b99b5e1eba4b164f.png',
        parentId: 0,
        status: 1,
        orderNum: 10,
        hasChildren: true,
        children: null,
      },
    ]
    resolve(data) // 返回数据
  },
}
const categoryProps = ref(props)

// 定义表格数据模型
const list = ref([
  {
    id: 2,
    createTime: '2023-05-24 15:19:24',
    brandId: 1,
    categoryId: 99,
    categoryName: '定制服务',
    brandName: '小米',
    logo: 'http://139.198.127.41:9000/sph/20230506/小米.png',
  },
  {
    id: 1,
    createTime: '2023-05-06 10:59:08',
    brandId: 2,
    categoryId: 76,
    categoryName: 'UPS电源\t',
    brandName: '华为',
    logo: 'http://139.198.127.41:9000/sph/20230506/华为.png',
  },
])

// 分页条数据模型
const total = ref(0)

//======   数据模型定义end========================================================
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
