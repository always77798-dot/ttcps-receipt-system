import React from "react";
import { FileText, Mail, User, Users, DollarSign, BookOpen, Hash, AlignLeft, FileEdit, HelpCircle } from "lucide-react";
import { convertToChineseNumerals } from "../utils/cnNumber";

/**
 * 建立收款收據登錄請領表單組件
 * 
 * @param {Object} props
 * @param {Object} props.formData 表單填寫資料
 * @param {boolean} props.loading 提交/讀取中狀態
 * @param {Function} props.onChange 欄位異動處理器
 * @param {Function} props.onSubmit 表單提交處理器
 */
export const ReceiptForm = ({ formData, loading, onChange, onSubmit }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 表頭標題 */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-700">建立「收款收據登錄」請領單</h2>
      </div>

      {/* 表單內容 */}
      <form onSubmit={onSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 電子郵件 */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Mail className="w-4 h-4 mr-1 text-gray-400" />
              電子郵件地址
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="example@mail.ttcps.ntpc.edu.tw"
            />
          </div>

          {/* 請領人姓名 */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <User className="w-4 h-4 mr-1 text-gray-400" />
              請領人(填表人)姓名 <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              name="applicantName"
              required
              value={formData.applicantName}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="請輸入姓名"
              autoComplete="name"
            />
          </div>

          {/* 繳款人名稱 */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Users className="w-4 h-4 mr-1 text-gray-400" />
              繳款人或機關名稱 <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              name="payer"
              required
              value={formData.payer}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="請輸入個人姓名或繳款單位"
              autoComplete="organization"
            />
          </div>

          {/* 金額 */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
              金額 (新臺幣，請填入阿拉伯數字) <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="number"
              name="amount"
              required
              min="0"
              value={formData.amount}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="例如：5000"
            />
            {formData.amount && (
              <p className="mt-1.5 text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-md inline-block">
                大寫：{convertToChineseNumerals(formData.amount)}
              </p>
            )}
          </div>

          {/* 收入科目 */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <BookOpen className="w-4 h-4 mr-1 text-gray-400" />
              收入科目 <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              name="incomeSubject"
              required
              value={formData.incomeSubject}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="例如：學校自收款、市政府補助款"
            />
          </div>

          {/* 科目代號 */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Hash className="w-4 h-4 mr-1 text-gray-400" />
              科目代號 <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              name="subjectCode"
              required
              value={formData.subjectCode}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="例如：L20022"
            />
          </div>

          {/* 事由 */}
          <div className="md:col-span-2 space-y-1">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <AlignLeft className="w-4 h-4 mr-1 text-gray-400" />
              事由 <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              name="reason"
              required
              value={formData.reason}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="請輸入繳款事由說明"
            />
          </div>

          {/* 公文字號 */}
          <div className="md:col-span-2 space-y-1">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <FileEdit className="w-4 h-4 mr-1 text-gray-400" />
              公文字號 <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              name="documentNumber"
              required
              value={formData.documentNumber}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="例如：新北土小字第XXXXXXXXXX號，若無請填「無」"
            />
          </div>
        </div>

        {/* 提交按鈕 */}
        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2.5 rounded-lg font-medium text-white shadow-sm flex items-center transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow active:scale-95"
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                登錄處理中...
              </>
            ) : (
              "生成收據並預覽"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
