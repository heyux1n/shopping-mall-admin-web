import request from '@/utils/request'

//获取用户列表
export const GetSysUserListByPage = (pageNum, pageSize, queryDto) => {
  return request({
    url: `/admin/system/sysUser/findByPage/${pageNum}/${pageSize}`,
    method: 'get',
    params: queryDto,
  })
}

// 添加用户请求方法
export const SaveSysUser = data => {
  return request({
    url: '/admin/system/sysUser/saveSysUser',
    method: 'post',
    data,
  })
}

// 保存用户修改
export const UpdateSysUser = data => {
  return request({
    url: '/admin/system/sysUser/updateSysUser',
    method: 'put',
    data,
  })
}

// 删除用户
export const DeleteSysUserById = roleId => {
  return request({
    url: `/admin/system/sysUser/deleteById/${roleId}`,
    method: 'delete',
  })
}

// 给用户分配角色请求
export const DoAssignRoleToUser = assginRoleVo => {
  return request({
    url: '/admin/system/sysUser/doAssign',
    method: 'post',
    data: assginRoleVo,
  })
}