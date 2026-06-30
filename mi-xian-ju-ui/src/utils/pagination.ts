export function getPaginationData<T>(data: T[], pageIndex: number, pageSize: number) {
  const validList = Array.isArray(data) ? data : []
  const validCurrentPage = Math.max(1, parseInt(String(pageIndex), 10) || 1)
  const validPageSize = Math.max(1, parseInt(String(pageSize), 10) || 10)
  const total = validList.length
  const totalPages = Math.ceil(total / validPageSize)
  const finalCurrentPage = Math.min(validCurrentPage, totalPages)
  const startIndex = (finalCurrentPage - 1) * validPageSize
  const endIndex = startIndex + validPageSize

  return {
    currentPage: finalCurrentPage,
    pageSize: validPageSize,
    total,
    totalPages,
    currentPageList: validList.slice(startIndex, endIndex),
    hasPrevPage: finalCurrentPage > 1,
    hasNextPage: finalCurrentPage < totalPages,
  }
}
