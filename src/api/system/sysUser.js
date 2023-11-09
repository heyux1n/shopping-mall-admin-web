import request from '@/utils/request'

const api_prefix = '/admin/system/sysUser'

//获取用户列表
export const GetSysUserListByPage = (pageNum, pageSize, queryDto) => {
  return request({
    url: `${api_prefix}/findByPage/${pageNum}/${pageSize}`,
    method: 'get',
    params: queryDto,
  })
}

// 添加用户请求方法
export const SaveSysUser = data => {
  return request({
    url: `${api_prefix}/saveSysUser`,
    method: 'post',
    data,
  })
}

// 保存用户修改
export const UpdateSysUser = data => {
  return request({
    url: `${api_prefix}/updateSysUser`,
    method: 'put',
    data,
  })
}

// 删除用户
export const DeleteSysUserById = roleId => {
  return request({
    url: `${api_prefix}/deleteById/${roleId}`,
    method: 'delete',
  })
}

// 给用户分配角色请求
export const DoAssignRoleToUser = assginRoleVo => {
  return request({
    url: `${api_prefix}/doAssign`,
    method: 'post',
    data: assginRoleVo,
  })
}
