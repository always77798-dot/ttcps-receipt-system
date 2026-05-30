import React, { useState, useEffect } from "react";
import { School, FilePlus2, History } from "lucide-react";
import { ReceiptForm } from "./components/ReceiptForm";
import { ReceiptPreview } from "./components/ReceiptPreview";
import { ReceiptHistory } from "./components/ReceiptHistory";

// Google Apps Script 試算表後端 Web App 網址
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbyZU_a2ohISgH1wXMpYS3zqj8Jo269Qfnuw295BmFe0A5KaPegoTfBKv8N69FGx2vCJ/exec";

// SessionStorage 快取鍵名
const CACHE_KEY_RECORDS = "ttcps_receipt_records_cache";
const CACHE_KEY_EXPIRE = "ttcps_receipt_records_expire";
const CACHE_DURATION = 5 * 60 * 1000; // 快取有效期限：5 分鐘

function App() {
  // 視圖路由：'form' (填表), 'draft_preview' (草稿預覽), 'receipt' (正式收據), 'history' (歷史紀錄)
  const [view, setView] = useState("form");
  
  // 記住正式收據返回時應該前往的頁面 ('form' 或 'history')
  const [backView, setBackView] = useState("form");
  
  // 資料庫紀錄列表
  const [records, setRecords] = useState([]);
  
  // 當前選取查看的單一收據 (可以是草稿，也可以是正式紀錄)
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // 網路請求狀態
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);

  // 表單資料狀態
  const [formData, setFormData] = useState({
    email: "",
    applicantName: "",
    payer: "",
    incomeSubject: "",
    subjectCode: "",
    amount: "",
    reason: "",
    documentNumber: "",
  });

  // 1. 初始化：從 LocalStorage 載入常用的填表人信箱與姓名
  useEffect(() => {
    const cachedEmail = localStorage.getItem("receiptSystemUserEmail") || "";
    const cachedName = localStorage.getItem("receiptSystemUserName") || "";
    setFormData((prev) => ({
      ...prev,
      email: cachedEmail,
      applicantName: cachedName,
    }));
  }, []);

  // 2. 表單欄位異動處理器
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 3. 讀取歷史收據紀錄 (加入 SessionStorage 效能快取優化)
  const fetchRecordsHistory = async (forceRefresh = false) => {
    // 檢查是否有有效的快取
    if (!forceRefresh) {
      const cachedData = sessionStorage.getItem(CACHE_KEY_RECORDS);
      const expireTime = sessionStorage.getItem(CACHE_KEY_EXPIRE);
      
      if (cachedData && expireTime && Date.now() < Number(expireTime)) {
        setRecords(JSON.parse(cachedData));
        return;
      }
    }

    setFetchingHistory(true);
    try {
      const res = await fetch(GAS_API_URL);
      const result = await res.json();
      
      if (result.status === "success" && Array.isArray(result.data)) {
        const sortedData = result.data; // 預設後端已排好順序或在此處排序
        setRecords(sortedData);
        
        // 寫入快取
        sessionStorage.setItem(CACHE_KEY_RECORDS, JSON.stringify(sortedData));
        sessionStorage.setItem(CACHE_KEY_EXPIRE, (Date.now() + CACHE_DURATION).toString());
      } else {
        console.error("讀取歷史紀錄失敗:", result.message || "未知錯誤");
      }
    } catch (err) {
      console.error("連線至試算表失敗:", err);
    } finally {
      setFetchingHistory(false);
    }
  };

  // 當切換到「歷史紀錄」分頁時才動態拉取資料，提升初始載入速度
  useEffect(() => {
    if (view === "history") {
      fetchRecordsHistory();
    }
  }, [view]);

  // 4. 表單提交：切換至「收據預覽」草稿模式
  const handleFormPreviewSubmit = (e) => {
    e.preventDefault();

    // 基礎防呆驗證
    if (
      !formData.applicantName ||
      !formData.payer ||
      !formData.amount ||
      !formData.incomeSubject ||
      !formData.subjectCode ||
      !formData.reason ||
      !formData.documentNumber
    ) {
      alert("請填寫所有必要欄位資訊！");
      return;
    }

    // 將填表人資訊存入 LocalStorage，方便下次自動預填
    localStorage.setItem("receiptSystemUserEmail", formData.email);
    localStorage.setItem("receiptSystemUserName", formData.applicantName);

    // 建立臨時草稿資料
    const draftRecord = {
      ...formData,
      id: "", // 草稿無編號
      timestamp: "", // 草稿無時間
      link: "",
    };

    setSelectedRecord(draftRecord);
    setBackView("form");
    setView("draft_preview");
  };

  // 5. 確認登錄並寫入 Google Sheets 資料庫
  const handleConfirmRegistration = async (sendEmail) => {
    setLoading(true);

    try {
      // GAS Web App 需要以 text/plain 繞過 CORS preflight options 限制
      const response = await fetch(GAS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          action: "addRecord",
          data: {
            ...formData,
            sendEmail: sendEmail, // 傳遞用戶是否寄送電子郵件
          },
        }),
      });

      const result = await response.json();

      if (result.status === "success") {
        // GAS 回傳時間戳記格式處理
        let formattedTime = result.timestamp || "";
        if (formattedTime) {
          formattedTime = formattedTime.replace("AM", "上午").replace("PM", "下午");
        }

        // 組合新建立的收據資料
        const newRecord = {
          ...formData,
          id: result.orderNumber,
          timestamp: formattedTime,
          link: result.link,
        };

        // 高效能狀態同步：將新收據直接插入本地 records 快取頂端，避免立刻重新發送網絡 Fetch
        const updatedRecords = [newRecord, ...records];
        setRecords(updatedRecords);
        sessionStorage.setItem(CACHE_KEY_RECORDS, JSON.stringify(updatedRecords));

        // 設定並切換至收據正式預覽頁面
        setSelectedRecord(newRecord);
        setBackView("form");
        setView("receipt");

        // 重設部分表單欄位，保留 email 與 applicantName
        setFormData((prev) => ({
          ...prev,
          payer: "",
          amount: "",
          reason: "",
          documentNumber: "無",
        }));

        // 開啟瀏覽器列印視窗
        setTimeout(() => {
          window.print();
        }, 300);
      } else {
        alert("提交失敗：" + (result.message || "伺服器無回應"));
      }
    } catch (err) {
      console.error("提交收據發生錯誤:", err);
      alert("連線至試算表失敗，請檢查網路連線或稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  // 6. 複製收據功能：切換回表單並帶入所選收據內容
  const handleCopyReceipt = (record) => {
    if (!record) return;
    setFormData({
      email: record.email || "",
      applicantName: record.applicantName || "",
      payer: record.payer || "",
      incomeSubject: record.incomeSubject || "",
      subjectCode: record.subjectCode || "",
      amount: record.amount || "",
      reason: record.reason || "",
      documentNumber: record.documentNumber || "",
    });
    setView("form");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* 導覽列 (列印時會自動隱藏) */}
      <nav className="bg-blue-800 text-white shadow-md print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo 與校名 */}
            <div className="flex items-center space-x-2">
              <School className="w-6 h-6" />
              <span className="font-bold text-lg tracking-wider">
                新北市土城國民小學 收款收據系統
              </span>
            </div>

            {/* 功能分頁切換按鈕 */}
            <div className="flex space-x-2 items-center">
              <button
                onClick={() => setView("form")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-all ${
                  view === "form" || view === "draft_preview" || view === "receipt"
                    ? "bg-blue-900 shadow-inner"
                    : "hover:bg-blue-700/60"
                }`}
              >
                <FilePlus2 className="w-4 h-4 mr-1.5" />
                新增收據
              </button>
              <button
                onClick={() => setView("history")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-all ${
                  view === "history"
                    ? "bg-blue-900 shadow-inner"
                    : "hover:bg-blue-700/60"
                }`}
              >
                <History className="w-4 h-4 mr-1.5" />
                歷史紀錄
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主體區塊 */}
      <main className="max-w-5xl mx-auto p-4 sm:p-6 print:p-0">
        {view === "form" && (
          <ReceiptForm
            formData={formData}
            loading={loading}
            onChange={handleInputChange}
            onSubmit={handleFormPreviewSubmit}
          />
        )}

        {view === "draft_preview" && selectedRecord && (
          <ReceiptPreview
            record={selectedRecord}
            isDraft={true}
            loading={loading}
            onBack={() => setView("form")}
            onConfirm={handleConfirmRegistration}
          />
        )}

        {view === "receipt" && selectedRecord && (
          <ReceiptPreview
            record={selectedRecord}
            isDraft={false}
            onBack={() => setView(backView)}
            onBackText={backView === "history" ? "返回歷史紀錄" : "返回新增收據"}
            onCopy={() => handleCopyReceipt(selectedRecord)}
          />
        )}

        {view === "history" && (
          <ReceiptHistory
            records={records}
            loading={fetchingHistory}
            onViewRecord={(rec) => {
              setSelectedRecord(rec);
              setBackView("history");
              setView("receipt");
            }}
            onRefresh={() => fetchRecordsHistory(true)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
