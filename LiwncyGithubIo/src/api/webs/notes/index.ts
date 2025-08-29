import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ItemVO, ItemForm, ItemQuery } from '@/api/webs/notes/types';

/**
 * 查询商品基础列表
 * @param query
 * @returns {*}
 */

export const listItem = (query?: ItemQuery): AxiosPromise<ItemVO[]> => {
  return request({
    url: '/sales/item/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询商品基础详细
 * @param id
 */
export const getItem = (id: string | number): AxiosPromise<ItemVO> => {
  return request({
    url: '/sales/item/' + id,
    method: 'get'
  });
};

/**
 * 新增商品基础
 * @param data
 */
export const addItem = (data: ItemForm) => {
  return request({
    url: '/sales/item',
    method: 'post',
    data: data
  });
};

/**
 * 修改商品基础
 * @param data
 */
export const updateItem = (data: ItemForm) => {
  return request({
    url: '/sales/item',
    method: 'put',
    data: data
  });
};

/** 修改产品库存 */
export const updateItemQuantity = (data: any) => {
  return request({
    url: '/sales/item/updateQuantity',
    method: 'put',
    data: data
  });
};

/**
 * 删除商品基础
 * @param id
 */
export const delItem = (id: string | number | Array<string | number>) => {
  return request({
    url: '/sales/item/' + id,
    method: 'delete'
  });
};

/** 恢复 */
export const restoreItem = (ids: string | number | Array<string | number>) => {
  return request({
    url: '/sales/item/restore/' + ids,
    method: 'get'
  });
};

/** 彻底删除 */
export const completeDelItem = (ids: string | number | Array<string | number>) => {
  return request({
    url: '/sales/item/completeDelete/' + ids,
    method: 'delete'
  });
};

/** 回收站数量 */
export const countItem = () => {
  return request({
    url: '/sales/item/recycleBinCount',
    method: 'get'
  });
};
