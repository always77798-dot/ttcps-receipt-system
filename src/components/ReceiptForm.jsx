import React from "react";
import { FileText, Mail, User, Users, DollarSign, BookOpen, Hash, AlignLeft, FileEdit, Eye, Eraser } from "lucide-react";
import { convertToChineseNumerals } from "../utils/cnNumber";

/**
 * 建立收款收據登錄請領表單組件
 * 
 * @param {Object} props
 * @param {Object} props.formData 表單填寫資料
 * @param {boolean} props.loading 提交/讀取中狀態
 * @param {Function} props.onChange 欄位異動處理器
 * @param {Function} props.onSubmit 表單提交處理器 (切換至草稿預覽模式)
 */
export const ReceiptForm = ({ formData, loading, onChange, onSubmit, onClear }) => {
  // 阻止 Enter 鍵自動觸發 submit，但允許 button 等正常觸發
  const handleFormKeyDown = (e) => {
    if (e.key === "Enter" && e.target.tagName !== "BUTTON" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform transition-all duration-300">
      {/* 表頭標題 */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white flex items-center">
        <div className="bg-blue-600 p-2 rounded-xl text-white mr-3 shadow-md shadow-blue-500/20">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">建立「收款收據登錄」請領單</h2>
          <p className="text-xs text-gray-400 mt-0.5">請填寫完整的收費資訊以生成預覽收據草稿</p>
        </div>
      </div>

      {/* 表單內容 */}
      <form onSubmit={onSubmit} onKeyDown={handleFormKeyDown} className="p-6 md:p-8 space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 電子郵件 */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-600 flex items-center tracking-wider uppercase">
              <Mail className="w-4 h-4 mr-1.5 text-gray-400" />
              電子郵件地址
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200 text-[15px]"
              placeholder="example@mail.ttcps.ntpc.edu.tw"
            />
          </div>

          {/* 請領人姓名 */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-600 flex items-center tracking-wider uppercase">
              <User className="w-4 h-4 mr-1.5 text-gray-400" />
              請領人(填表人)姓名 <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              name="applicantName"
              required
              value={formData.applicantName}
              onChange={onChange}
              className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200 text-[15px]"
              placeholder="請輸入請領人姓名"
              autoComplete="name"
            />
          </div>

          {/* 繳款人名稱 */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-600 flex items-center tracking-wider uppercase">
              <Users className="w-4 h-4 mr-1.5 text-gray-400" />
              繳款人或機關名稱 <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              name="payer"
              required
              value={formData.payer}
              onChange={onChange}
              className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200 text-[15px]"
              placeholder="請輸入繳款人或繳款機關全銜"
              autoComplete="organization"
            />
          </div>

          {/* 金額 */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-600 flex items-center tracking-wider uppercase">
              <DollarSign className="w-4 h-4 mr-1.5 text-gray-400" />
              金額 (新臺幣，請填入阿拉伯數字) <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="number"
              name="amount"
              required
              min="0"
              value={formData.amount}
              onChange={onChange}
              className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200 text-[15px] font-mono font-semibold"
              placeholder="例如：5000"
            />
            {formData.amount && (
              <p className="mt-2 text-sm text-blue-600 font-bold bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-xl inline-block transition-all duration-200">
                新臺幣大寫金額：{convertToChineseNumerals(formData.amount)}
              </p>
            )}
          </div>

          {/* 收入科目 */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-600 flex items-center tracking-wider uppercase">
              <BookOpen className="w-4 h-4 mr-1.5 text-gray-400" />
              收入科目 <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              name="incomeSubject"
              required
              value={formData.incomeSubject}
              onChange={onChange}
              className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200 text-[15px]"
              placeholder="例如：學校自收款、市政府補助款"
            />
          </div>

          {/* 科目代號 */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-600 flex items-center tracking-wider uppercase">
              <Hash className="w-4 h-4 mr-1.5 text-gray-400" />
              科目代號 <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              name="subjectCode"
              required
              value={formData.subjectCode}
              onChange={onChange}
              className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200 text-[15px] font-mono"
              placeholder="例如：L20022"
            />
          </div>

          {/* 事由 */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-600 flex items-center tracking-wider uppercase">
              <AlignLeft className="w-4 h-4 mr-1.5 text-gray-400" />
              事由 <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              name="reason"
              required
              value={formData.reason}
              onChange={onChange}
              className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200 text-[15px]"
              placeholder="請輸入具體收費事由與說明"
            />
          </div>

          {/* 公文字號 */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-600 flex items-center tracking-wider uppercase">
              <FileEdit className="w-4 h-4 mr-1.5 text-gray-400" />
              公文字號 <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              name="documentNumber"
              required
              value={formData.documentNumber}
              onChange={onChange}
              className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200 text-[15px]"
              placeholder="例如：新北土小字第XXXXXXXXXX號，若無相關公文請填寫「無」"
            />
          </div>
        </div>

        {/* 提交與清空按鈕 */}
        <div className="pt-6 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4">
          <button
            type="button"
            onClick={onClear}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 transition-all duration-200 flex items-center justify-center active:scale-95 disabled:opacity-50 self-start w-full sm:w-auto"
          >
            <Eraser className="w-4.5 h-4.5 mr-2" />
            清畫面
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-3 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/20 flex items-center justify-center transition-all duration-200 active:scale-95 w-full sm:w-auto ${
              loading
                ? "bg-gray-400 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/20"
            }`}
          >
            <Eye className="w-4.5 h-4.5 mr-2" />
            預覽收據草稿
          </button>
        </div>
      </form>
    </div>
  );
};
