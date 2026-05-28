import React, { useState, useMemo } from "react";
import { History, Search, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileQuestion } from "lucide-react";
import { formatNumber, splitTimestamp } from "../utils/format";

/**
 * 收據歷史紀錄列表組件 (含分頁、搜尋與過濾優化)
 * 
 * @param {Object} props
 * @param {Array} props.records 歷史收據紀錄清單
 * @param {boolean} props.loading 讀取狀態
 * @param {Function} props.onViewRecord 點擊「查看」收據事件處理器
 */
export const ReceiptHistory = ({ records, loading, onViewRecord }) => {
  // 搜尋字串狀態
  const [searchQuery, setSearchQuery] = useState("");
  
  // 分頁狀態
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // 預設每頁顯示 10 筆

  // 1. 搜尋過濾邏輯 (以 useMemo 優化，避免重複計算)
  const filteredRecords = useMemo(() => {
    setCurrentPage(1); // 搜尋時重設回第一頁
    
    if (!searchQuery.trim()) return records;
    
    const query = searchQuery.toLowerCase().trim();
    return records.filter((rec) => {
      return (
        (rec.id && rec.id.toLowerCase().includes(query)) ||
        (rec.applicantName && rec.applicantName.toLowerCase().includes(query)) ||
        (rec.payer && rec.payer.toLowerCase().includes(query)) ||
        (rec.reason && rec.reason.toLowerCase().includes(query)) ||
        (rec.incomeSubject && rec.incomeSubject.toLowerCase().includes(query)) ||
        (rec.subjectCode && rec.subjectCode.toLowerCase().includes(query))
      );
    });
  }, [records, searchQuery]);

  // 2. 分頁計算邏輯
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  
  // 當前頁次邊界調整
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  // 切割出當前頁次需要顯示的資料列
  const paginatedRecords = useMemo(() => {
    const startIdx = (safeCurrentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    return filteredRecords.slice(startIdx, endIdx);
  }, [filteredRecords, safeCurrentPage, pageSize]);

  // 頁次變更處理器
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 表頭與控制列 */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-700">歷史紀錄清單</h2>
          {!loading && (
            <span className="text-xs bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full font-medium">
              共 {filteredRecords.length} 筆
            </span>
          )}
        </div>

        {/* 搜尋欄與分頁大小選單 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* 搜尋輸入框 */}
          <div className="relative flex-1 sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="搜尋編號、姓名、事由..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* 每頁筆數選單 */}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>顯示</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10 筆</option>
              <option value={20}>20 筆</option>
              <option value={50}>50 筆</option>
            </select>
          </div>
        </div>
      </div>

      {/* 歷史清單表格區 */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50/75 text-gray-500 border-b border-gray-200">
              <th className="px-6 py-3 font-semibold whitespace-nowrap">收據編號 / 登錄時間</th>
              <th className="px-6 py-3 font-semibold whitespace-nowrap">請領人</th>
              <th className="px-6 py-3 font-semibold whitespace-nowrap">繳款人 / 機關名稱</th>
              <th className="px-6 py-3 font-semibold min-w-[200px]">事由明細 / 科目</th>
              <th className="px-6 py-3 font-semibold text-right whitespace-nowrap">金額</th>
              <th className="px-6 py-3 font-semibold text-center whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedRecords.length > 0 ? (
              paginatedRecords.map((item, idx) => {
                const { date, time } = splitTimestamp(item.timestamp);
                return (
                  <tr key={item.id || idx} className="hover:bg-blue-50/40 transition-colors">
                    {/* 編號與時間 */}
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-gray-900">{item.id || "-"}</div>
                      <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                        <div>{date}</div>
                        {time && <div className="text-gray-400">{time}</div>}
                      </div>
                    </td>
                    {/* 請領人 */}
                    <td className="px-6 py-4 text-gray-700 font-medium">
                      {item.applicantName || "-"}
                    </td>
                    {/* 繳款人 */}
                    <td className="px-6 py-4 text-gray-700">
                      {item.payer || "-"}
                    </td>
                    {/* 事由與科目 */}
                    <td className="px-6 py-4 text-gray-600">
                      <div className="font-medium text-gray-800 line-clamp-2" title={item.reason}>
                        {item.reason || "-"}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 font-mono">
                        {item.incomeSubject} {item.subjectCode ? `(${item.subjectCode})` : ""}
                      </div>
                    </td>
                    {/* 金額 */}
                    <td className="px-6 py-4 text-right font-bold text-gray-900 text-[15px] font-mono">
                      ${formatNumber(item.amount)}
                    </td>
                    {/* 操作 */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onViewRecord(item)}
                        className="inline-flex items-center text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        查看收據
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              // 無資料狀態
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <FileQuestion className="w-10 h-10 text-gray-300" />
                    <div>
                      {loading
                        ? "正在努力讀取學校歷史紀錄中..."
                        : searchQuery
                        ? "找不到符合搜尋條件的收據紀錄"
                        : "目前沒有任何歷史收據紀錄"}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 底部導覽分頁列 (有資料且頁數大於 1 時顯示) */}
      {!loading && filteredRecords.length > 0 && totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            顯示第 <span className="font-medium text-gray-800">{((safeCurrentPage - 1) * pageSize) + 1}</span> 至{" "}
            <span className="font-medium text-gray-800">
              {Math.min(safeCurrentPage * pageSize, filteredRecords.length)}
            </span>{" "}
            筆，共 <span className="font-medium text-gray-800">{filteredRecords.length}</span> 筆紀錄
          </div>

          <div className="flex items-center space-x-1">
            {/* 第一頁 */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="第一頁"
            >
              <ChevronsLeft className="w-4 h-4 text-gray-600" />
            </button>

            {/* 上一頁 */}
            <button
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="上一頁"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>

            {/* 頁碼按鈕 */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => Math.abs(p - safeCurrentPage) <= 2 || p === 1 || p === totalPages)
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && p - prev > 1;
                
                return (
                  <React.Fragment key={p}>
                    {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                    <button
                      onClick={() => handlePageChange(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        safeCurrentPage === p
                          ? "bg-blue-600 text-white shadow-sm"
                          : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            {/* 下一頁 */}
            <button
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="下一頁"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>

            {/* 最後一頁 */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="最後一頁"
            >
              <ChevronsRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
