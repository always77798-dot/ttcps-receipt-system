import React from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { convertToChineseNumerals } from "../utils/cnNumber";
import { formatNumber, formatTimestamp } from "../utils/format";

/**
 * 收款收據預覽與列印組件
 * 
 * @param {Object} props
 * @param {Object} props.record 當前選中要預覽/列印的收據資料
 * @param {Function} props.onBack 返回按鈕事件處理器
 */
export const ReceiptPreview = ({ record, onBack }) => {
  if (!record) return null;

  return (
    <div className="space-y-6">
      {/* 頂部操作列 (列印時會隱藏) */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 print:hidden">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 flex items-center font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          返回列表
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
        >
          <Printer className="w-4 h-4 mr-2" />
          列印收據
        </button>
      </div>

      {/* 收據實體 (列印時的主要區域) */}
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
              {record.applicantName} <span className="text-gray-500 font-normal">({record.email})</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-32 text-gray-700 font-semibold">登錄時間：</div>
            <div className="flex-1 px-2 text-black">{formatTimestamp(record.timestamp)}</div>
          </div>
          <div className="flex items-center">
            <div className="w-32 text-gray-700 font-semibold">收款收據編號：</div>
            <div className="flex-1 px-2 text-black font-mono font-bold text-blue-900 print:text-black">
              {record.id || "-"}
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-32 text-gray-700 font-semibold">科目代號：</div>
            <div className="flex-1 px-2 text-black font-mono">{record.subjectCode}</div>
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
