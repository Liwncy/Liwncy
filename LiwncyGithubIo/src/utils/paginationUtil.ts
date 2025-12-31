/**
 * 分页工具类
 */


/**
 * 对数据进行分页
 * @param data - 原始数据数组
 * @param pageIndex - 页码（从1开始）
 * @param pageSize - 每页大小
 * @returns 分页后的数据和分页信息
 */
export function getPaginationData(data: any[], pageIndex: number, pageSize: number) {
    // 1. 参数合法性校验与默认值处理（避免异常参数导致报错）
    const validList = Array.isArray(data) ? data : [];
    const validCurrentPage = Math.max(1, parseInt(String(pageIndex), 10) || 1); // 确保当前页最小为1
    const validPageSize = Math.max(1, parseInt(String(pageSize), 10) || 10); // 确保分页大小最小为1

    // 2. 核心计算：总条数、总页数
    const total = validList.length; // 数据总条数
    const totalPages = Math.ceil(total / validPageSize); // 总页数（向上取整，避免有剩余数据无法显示）

    // 3. 边界处理：当前页不超过总页数（若当前页大于总页数，自动修正为最后一页）
    const finalCurrentPage = Math.min(validCurrentPage, totalPages);

    // 4. 核心逻辑：计算数据截取的起始索引和结束索引
    const startIndex = (finalCurrentPage - 1) * validPageSize; // 起始索引（数组下标从0开始）
    const endIndex = startIndex + validPageSize; // 结束索引（slice方法左闭右开，无需减1）

    // 5. 截取当前页数据
    const currentPageList = validList.slice(startIndex, endIndex);

    // 6. 返回规范的分页结构
    return {
        currentPage: finalCurrentPage, // 最终修正后的当前页
        pageSize: validPageSize, // 实际使用的分页大小
        total: total, // 数据总条数
        totalPages: totalPages, // 总页数
        currentPageList: currentPageList, // 当前页显示的数据列表
        hasPrevPage: finalCurrentPage > 1, // 是否有上一页
        hasNextPage: finalCurrentPage < totalPages // 是否有下一页
    };

}