export interface ItemVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 平台ID
   */
  platformId: string | number;

  /**
   * 产品Id
   */
  prodId: string | number;

  /**
   * SKU编号
   */
  sku: string;

  /**
   * 本地分类id
   */
  categoryId: string | number;

  /**
   * 仓库ID
   */
  wareId: string | number;

  /**
   * 刊登类目
   */
  listingCategory: string;

  /**
   * 标签
   */
  tag: string;

  /**
   * 可售库存
   */
  quantity: number;

  /**
   * 是否库存同步
   */
  isSynInventory: string;

  /**
   * 是否自动补货
   */
  isAutoCargo: string;

  /**
   * 实际库存量
   */
  actualQuantity: number;

  /**
   * 是否组合产品
   */
  isCombination: string;

  /**
   * 是否多属性
   */
  isMultiattribute: string;

  /**
   * 多属性信息
   */
  multiAttrInfo: string;

  /**
   * 状态
   */
  status: string;

  /**
   * 备注
   */
  remark: string;

}

export interface ItemForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 平台ID
   */
  platformId?: string | number;

  /**
   * 产品Id
   */
  prodId?: string | number;

  /**
   * SKU编号
   */
  sku?: string;

  /**
   * 本地分类id
   */
  categoryId?: string | number;

  /**
   * 仓库ID
   */
  wareId?: string | number;

  /**
   * 刊登类目
   */
  listingCategory?: string;

  /**
   * 标签
   */
  tag?: string;

  /**
   * 可售库存
   */
  quantity?: number;

  /**
   * 是否库存同步
   */
  isSynInventory?: string;

  /**
   * 是否自动补货
   */
  isAutoCargo?: string;

  /**
   * 实际库存量
   */
  actualQuantity?: number;

  /**
   * 是否组合产品
   */
  isCombination?: string;

  /**
   * 是否多属性
   */
  isMultiattribute?: string;

  /**
   * 多属性信息
   */
  multiAttrInfo?: string;

  /**
   * 状态
   */
  status?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface ItemQuery extends PageQuery {

  /**
   * 平台ID
   */
  platformId?: string | number;

  /**
   * 产品Id
   */
  prodId?: string | number;

  /**
   * SKU编号
   */
  sku?: string;

  /**
   * 本地分类id
   */
  categoryId?: string | number;

  /**
   * 仓库ID
   */
  wareId?: string | number;

  /**
   * 刊登类目
   */
  listingCategory?: string;

  /**
   * 标签
   */
  tag?: string;

  /**
   * 可售库存
   */
  quantity?: number;

  /**
   * 是否库存同步
   */
  isSynInventory?: string;

  /**
   * 是否自动补货
   */
  isAutoCargo?: string;

  /**
   * 实际库存量
   */
  actualQuantity?: number;

  /**
   * 是否组合产品
   */
  isCombination?: string;

  /**
   * 是否多属性
   */
  isMultiattribute?: string;

  /**
   * 多属性信息
   */
  multiAttrInfo?: string;

  /**
   * 状态
   */
  status?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



