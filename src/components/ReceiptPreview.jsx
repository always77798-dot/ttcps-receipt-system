import React, { useState } from "react";
import { ArrowLeft, Printer, CheckCircle, Mail, AlertCircle, Copy } from "lucide-react";
import { convertToChineseNumerals } from "../utils/cnNumber";
import { formatNumber, formatTimestamp } from "../utils/format";

/**
 * 收款收據預覽與列印組件 (支援草稿預覽模式與正式收據模式)
 * 
 * @param {Object} props
 * @param {Object} props.record 收據資料 (草稿或正式紀錄)
 * @param {boolean} props.isDraft 是否為草稿預覽模式
 * @param {boolean} props.loading 登錄 API 請求載入狀態
 * @param {Function} props.onBack 返回按鈕事件處理器 (返回填表)
 * @param {string} props.onBackText 返回按鈕顯示文字
 * @param {Function} props.onConfirm 確認登錄處理器 (草稿模式下點擊確認登錄時觸發，傳入是否寄信)
 * @param {Function} props.onCopy 複製收據處理器
 */
export const ReceiptPreview = ({ record, isDraft = false, loading = false, onBack, onBackText = "返回新增收據", onConfirm, onCopy }) => {
  if (!record) return null;

  // 用戶是否勾選寄送郵件副本的狀態
  const [sendEmail, setSendEmail] = useState(true);

  return (
    <div className="space-y-6">
      {/* 頂部操作控制列 (列印時會自動隱藏) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200 gap-4 print:hidden">
        {/* 返回按鈕 */}
        <button
          onClick={onBack}
          disabled={loading}
          className="text-gray-600 hover:text-gray-900 flex items-center font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {isDraft ? "返回修改欄位" : onBackText}
        </button>

        {/* 右側操作：草稿模式 vs 正式模式 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {isDraft ? (
            <>
              {/* 寄送郵件副本選項 */}
              {record.email && (
                <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer select-none bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    disabled={loading}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="flex items-center">
                    <Mail className="w-4 h-4 mr-1.5 text-gray-400" />
                    郵件寄送收據副本
                  </span>
                </label>
              )}

              {/* 確認登錄按鈕 */}
              <button
                onClick={() => onConfirm(sendEmail)}
                disabled={loading}
                className={`flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all shadow-sm ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 active:scale-95 hover:shadow"
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    正在登錄資料...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    確認登錄並列印
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* 複製收據功能 (可選且僅在正式查看時顯示) */}
              {onCopy && (
                <button
                  onClick={onCopy}
                  className="flex items-center justify-center px-5 py-2.5 bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-all active:scale-95 shadow-sm"
                >
                  <Copy className="w-4.5 h-4.5 mr-2 text-gray-500" />
                  複製此收據
                </button>
              )}
              {/* 正式收據列印按鈕 */}
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
              >
                <Printer className="w-4 h-4 mr-2" />
                列印收款收據
              </button>
            </>
          )}
        </div>
      </div>

      {/* 草稿模式提示橫幅 (列印時隱藏) */}
      {isDraft && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3.5 rounded-xl flex items-start space-x-2.5 shadow-sm print:hidden">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-[15px]">您目前處於「收據預覽」模式</h4>
            <p className="text-sm text-amber-700/90 mt-1 leading-relaxed">
              請核對下方資料是否正確無誤。確認後，請點擊上方綠色<b>「確認登錄並列印」</b>按鈕。
              系統將會正式登錄資料並開啟列印。
            </p>
          </div>
        </div>
      )}


      {/* 收據實體 (列印與高規格呈現區域) */}
      <div 
        id="print-area" 
        className="bg-white p-10 max-w-4xl mx-auto border border-gray-200 rounded-xl shadow-sm print:border-none print:shadow-none print-force-adjust relative"
      >
        {/* 收據大標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-widest text-black mb-1.5">
            新北市土城國民小學
          </h1>
          <h2 className="text-2.5xl font-bold tracking-widest text-black border-b-2 border-double border-black pb-2 inline-block">
            「收款收據登錄」請領單
          </h2>
        </div>

        {/* 基礎登錄資訊 */}
        <div className="space-y-2.5 mb-6 text-[15px] font-medium text-black">
          <div className="flex items-center">
            <div className="w-32 text-gray-700 font-semibold">請領人：</div>
            <div className="flex-1 px-2 text-black">
              {record.applicantName} <span className="text-gray-500 font-normal">({record.email || "無提供電子郵件"})</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-32 text-gray-700 font-semibold">登錄時間：</div>
            <div className={`flex-1 px-2 ${isDraft ? "text-gray-400 italic font-normal" : "text-black"}`}>
              {isDraft ? "（資料庫登錄時自動生成）" : formatTimestamp(record.timestamp)}
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-32 text-gray-700 font-semibold">收款收據編號：</div>
            <div className={`flex-1 px-2 font-mono font-bold ${isDraft ? "text-gray-400 italic font-normal" : "text-blue-900 print:text-black"}`}>
              {isDraft ? "（資料庫登錄時自動生成）" : (record.id || "-")}
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-32 text-gray-700 font-semibold">科目代號：</div>
            <div className="flex-1 px-2 text-black font-mono">{record.subjectCode || "-"}</div>
          </div>
        </div>

        {/* 財務三欄表格 */}
        <table className="w-full border-collapse border border-black text-[15px]">
          <tbody>
            <tr>
              <td className="border border-black p-3.5 font-semibold w-36 text-center bg-gray-50 print:bg-transparent whitespace-pre-line leading-relaxed">
                繳款人或{"\n"}機關名稱
              </td>
              <td className="border border-black p-3.5 text-black font-medium">
                {record.payer}
              </td>
              <td className="border border-black p-3.5 font-semibold w-36 text-center bg-gray-50 print:bg-transparent whitespace-pre-line leading-relaxed">
                收入科目{"\n"}及代號
              </td>
              <td className="border border-black p-3.5 text-black font-medium">
                {record.incomeSubject} {record.subjectCode ? `(${record.subjectCode})` : ""}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-3.5 font-semibold text-center bg-gray-50 print:bg-transparent whitespace-pre-line leading-relaxed">
                金額{"\n"}(新臺幣大寫)
              </td>
              <td className="border border-black p-3.5 text-black font-bold">
                {convertToChineseNumerals(record.amount)}
              </td>
              <td className="border border-black p-3.5 font-semibold text-center bg-gray-50 print:bg-transparent">
                金額
              </td>
              <td className="border border-black p-3.5 text-black font-bold font-mono">
                {formatNumber(record.amount)} 元
              </td>
            </tr>
            <tr>
              <td className="border border-black p-3.5 font-semibold text-center bg-gray-50 print:bg-transparent">
                事由
              </td>
              <td className="border border-black p-3.5 text-black" colSpan="3">
                {record.reason}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-3.5 font-semibold text-center bg-gray-50 print:bg-transparent whitespace-pre-line leading-relaxed">
                公文{"\n"}字號
              </td>
              <td className="border border-black p-3.5 text-black" colSpan="3">
                {record.documentNumber}
              </td>
            </tr>
          </tbody>
        </table>

        {/* 簽名欄位區塊 */}
        <div className="mt-16 grid grid-cols-2 text-[15px] font-semibold pl-4">
          <div className="space-y-12">
            <div>領據人簽名：</div>
          </div>
          <div className="space-y-12">
            <div>領取日期：</div>
          </div>
        </div>
      </div>
    </div>
  );
};
