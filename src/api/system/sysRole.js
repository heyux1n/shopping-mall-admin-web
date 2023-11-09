import request from '@/utils/request'

const api_prefix = '/admin/system/sysRole'

//获取角色列表
export const GetSysRoleListByPage = (pageNum, pageSize, queryDto) => {
  return request({
    url: `${api_prefix}/findByPage/${pageNum}/${pageSize}`,
    method: 'get',
    params: queryDto,
  })
}

// 添加角色请求方法
export const SaveSysRole = data => {
  return request({
    url: `${api_prefix}/saveSysRole`,
    method: 'post',
    data,
  })
}

// 保存修改
export const UpdateSysRole = data => {
  return request({
    url: `${api_prefix}/updateSysRole`,
    method: 'put',
    data,
  })
}

// 删除角色
export const DeleteSysRoleById = roleId => {
  return request({
    url: `${api_prefix}/deleteById/${roleId}`,
    method: 'delete',
  })
}

// 查询所有的角色数据
export const GetAllRoleList = userId => {
  return request({
    url: `${api_prefix}/findAllRoles/${userId}`,
    method: 'get',
  })
}
