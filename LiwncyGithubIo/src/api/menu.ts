import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { RouteRecordRaw } from 'vue-router';

// 获取路由
export function getRouters(): AxiosPromise<RouteRecordRaw[]> {
  return request.get('/common/menu/getRouters');
}

// 获取权限
export function getPermission(): AxiosPromise<RouteRecordRaw[]> {
  return request.get('/common/role/getPermission1');
}