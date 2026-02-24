import React, { useState, useEffect } from 'react';
import { Printer, PlusCircle, List, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';

// 中文大寫金額轉換函數
const convertNumberToChinese = (num) => {
  if (!num || isNaN(num)) return "零元整";
  num = Number(num);
  if (num === 0) return "零元整";

  const chineseChars = ["零", "壹", "貳", "參", "肆", "伍", "陸", "柒", "捌", "玖"];
  const units = ["", "拾", "佰", "仟"];
  const bigUnits = ["", "萬", "億", "兆"];

  let result = "";
  const isNegative = num < 0;
  let tempNum = Math.abs(num);
  let sectionCounter = 0;

  const convertSection = (section) => {
    let res = "";
    let prevIsZero = true;
    for (let i = 0; i < 4; i++) {
      const digit = section % 10;
      if (digit === 0) {
        if (!prevIsZero && i !== 0) {
          res = chineseChars[digit] + res;
        }
        prevIsZero = true;
      } else {
        res = chineseChars[digit] + units[i] + res;
        prevIsZero = false;
      }
      section = Math.floor(section / 10);
    }
    return res;
  };

  while (tempNum > 0) {
    const section = tempNum % 10000;
    const sectionStr = convertSection(section);

    if (section !== 0) {
      result = sectionStr + bigUnits[sectionCounter] + result;
    } else if (sectionCounter > 0 && result !== "" && !result.startsWith("零")) {
      result = "零" + result;
    }

    tempNum = Math.floor(tempNum / 10000);
    sectionCounter++;
  }

  result = result
    .replace(/零+/g, "零")
    .replace(/零[萬億兆]/g, (match) => match[1])
    .replace(/億萬/g, "億")
    .replace(/^零+/, "")
    .replace(/零+$/, "");

  return (isNegative ? "負" : "") + result + "元整";
};

const formatCurrency = (num) => {
  if (!num || isNaN(num)) return "0";
  return Number(num).toLocaleString('zh-TW');
};

export default function App() {
  const [view, setView] = useState('form'); 
  const [records, setRecords] = useState([]);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🔥 填寫你的新版 GAS 部署網址
  const GAS_API_URL = "https://script.google.com/macros/s/AKfycbyZU_a2ohISgH1wXMpYS3zqj8Jo269Qfnuw295BmFe0A5KaPegoTfBKv8N69FGx2vCJ/exec"; 

  // 精準對應「表單回應」工作表的欄位
  const [formData, setFormData] = useState({
    email: '',
    applicantName: '',
    payer: '',
    incomeSubject: '學校自收款',
    subjectCode: '',
    amount: '',
    reason: '',
    documentNumber: '無'
  });

  // 元件載入時，嘗試從 localStorage 讀取上次存的信箱
  useEffect(() => {
    const savedEmail = localStorage.getItem('receiptSystemUserEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!GAS_API_URL) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(GAS_API_URL);
        const result = await response.json();
        if (result.status === 'success') {
          setRecords(result.data);
        }
      } catch (error) {
        console.error("讀取歷史紀錄失敗:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [GAS_API_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.applicantName || !formData.payer || !formData.amount || !formData.email) {
      alert("請填寫必要資訊！");
      return;
    }

    setIsLoading(true);

    // 儲存使用者的信箱，供下次自動帶入
    localStorage.setItem('receiptSystemUserEmail', formData.email);

    if (!GAS_API_URL) {
      const today = new Date();
      const seq = String(records.length + 1).padStart(3, '0');
      
      // 處理時間格式，將 AM/PM 轉為中文 上午/下午
      let timeString = today.toLocaleString('zh-TW', { hour12: true });
      timeString = timeString.replace('AM', '上午').replace('PM', '下午');

      const newRecord = {
        ...formData,
        id: `DEMO-${seq}`,
        timestamp: timeString
      };
      setRecords([newRecord, ...records]);
      setCurrentRecord(newRecord);
      setView('receipt');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'addRecord',
          data: formData
        })
      });

      const result = await response.json();

      if (result.status === 'success') {
        // 如果後端傳來的時間有 AM/PM，也可以在這裡替換
        let responseTime = result.timestamp;
        if(responseTime) {
            responseTime = responseTime.replace('AM', '上午').replace('PM', '下午');
        }

        const newRecord = {
          ...formData,
          id: result.orderNumber,
          timestamp: responseTime,
          link: result.link
        };
        
        setRecords([newRecord, ...records]);
        setCurrentRecord(newRecord);
        setView('receipt');
        
        // 成功後清空部分表單，保留常用資訊
        setFormData(prev => ({
          ...prev,
          payer: '',
          amount: '',
          reason: '',
          documentNumber: '無'
        }));
      } else {
        alert("提交失敗：" + result.message);
      }
    } catch (error) {
      console.error("提交發生錯誤:", error);
      alert("連線至試算表失敗。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <nav className="bg-blue-800 text-white shadow-md print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-2">
              <FileText className="w-6 h-6" />
              <span className="font-bold text-lg tracking-wider">新北市土城國民小學 收款收據系統</span>
            </div>
            <div className="flex space-x-2 items-center">
              <button onClick={() => setView('form')} className={`px-3 py-2 rounded-md text-sm font-medium ${view === 'form' ? 'bg-blue-900' : 'hover:bg-blue-700'}`}>新增收據</button>
              <button onClick={() => setView('history')} className={`px-3 py-2 rounded-md text-sm font-medium ${view === 'history' ? 'bg-blue-900' : 'hover:bg-blue-700'}`}>歷史紀錄</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 print:p-0">
        
        {view === 'form' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                <PlusCircle className="w-5 h-5 mr-2 text-blue-600" />
                建立「收款收據登錄」請領單
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">電子郵件地址 *</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="example@mail.ttcps.ntpc.edu.tw" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">請領人(填表人)姓名 *</label>
                  <input type="text" name="applicantName" required value={formData.applicantName} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">繳款人或機關名稱 *</label>
                  <input type="text" name="payer" required value={formData.payer} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">金額 (新臺幣) *</label>
                  <input type="number" name="amount" required min="0" value={formData.amount} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  {formData.amount && <p className="mt-1 text-sm text-blue-600">大寫：{convertNumberToChinese(formData.amount)}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">收入科目</label>
                  <input type="text" name="incomeSubject" value={formData.incomeSubject} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="例如：學校自收款、市政府補助款" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">科目代號</label>
                  <input type="text" name="subjectCode" value={formData.subjectCode} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="例如：L24007" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">事由 *</label>
                  <input type="text" name="reason" required value={formData.reason} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">公文字號</label>
                  <input type="text" name="documentNumber" value={formData.documentNumber} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="pt-4 border-t flex justify-end">
                <button type="submit" disabled={isLoading} className={`px-6 py-2 rounded-lg font-medium text-white flex items-center ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {isLoading ? '處理中...' : '生成收據並預覽'}
                </button>
              </div>
            </form>
          </div>
        )}

        {view === 'receipt' && currentRecord && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm print:hidden border border-gray-200">
              <button onClick={() => setView('form')} className="text-gray-600 hover:text-gray-900 flex items-center"><ArrowLeft className="w-4 h-4 mr-1" /> 返回</button>
              <div className="flex space-x-3">
                <button onClick={() => window.print()} className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  <Printer className="w-4 h-4 mr-2" /> 列印收據
                </button>
              </div>
            </div>

            {/* 實際列印版面 (精準還原「單據範本」格式) */}
            <div className="bg-white p-10 max-w-4xl mx-auto border print:border-none print:shadow-none relative">
              
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-widest text-black mb-1">新北市土城國民小學</h1>
                <h2 className="text-2xl font-bold tracking-widest text-black">「收款收據登錄」請領單</h2>
              </div>

              <div className="space-y-2 mb-6 text-[15px] font-medium text-black">
                <div className="flex items-center">
                  <div className="w-32">請領人</div>
                  <div className="flex-1 px-4">{currentRecord.applicantName} <span className="text-gray-600 font-normal">({currentRecord.email})</span></div>
                </div>
                <div className="flex items-center">
                  <div className="w-32">登錄時間</div>
                  <div className="flex-1 px-4">{currentRecord.timestamp}</div>
                </div>
                <div className="flex items-center">
                  <div className="w-32">收款收據編號</div>
                  <div className="flex-1 px-4">{currentRecord.id}</div>
                </div>
                <div className="flex items-center">
                  <div className="w-32">科目代號</div>
                  <div className="flex-1 px-4">{currentRecord.subjectCode}</div>
                </div>
              </div>

              <table className="w-full border-collapse border border-black text-[15px]">
                <tbody>
                  <tr>
                    <td className="border border-black p-3 font-semibold w-36 text-center whitespace-pre-line">
                      {"繳款人或\n機關名稱"}
                    </td>
                    <td className="border border-black p-3">{currentRecord.payer}</td>
                    <td className="border border-black p-3 font-semibold w-36 text-center whitespace-pre-line">
                      {"收入科目\n及代號"}
                    </td>
                    <td className="border border-black p-3">
                      {currentRecord.incomeSubject} {currentRecord.subjectCode ? `(${currentRecord.subjectCode})` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-3 font-semibold text-center whitespace-pre-line">
                      {"金額\n(新臺幣大寫)"}
                    </td>
                    <td className="border border-black p-3">{convertNumberToChinese(currentRecord.amount)}</td>
                    <td className="border border-black p-3 font-semibold text-center">金額</td>
                    <td className="border border-black p-3">
                      {formatCurrency(currentRecord.amount)} 元
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-3 font-semibold text-center">事由</td>
                    <td className="border border-black p-3">{currentRecord.reason}</td>
                    <td className="border border-black p-3 font-semibold text-center whitespace-pre-line">
                      {"公文\n字號"}
                    </td>
                    <td className="border border-black p-3">{currentRecord.documentNumber}</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-16 grid grid-cols-2 text-[15px] font-semibold pl-4">
                <div>領據人簽名：</div>
                <div>領取日期：</div>
              </div>

            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                <List className="w-5 h-5 mr-2 text-blue-600" /> 歷史紀錄清單
              </h2>
              <span className="text-sm bg-blue-100 text-blue-800 py-1 px-3 rounded-full font-medium">
                共 {records.length} 筆
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 border-b">
                    <th className="px-4 py-3 whitespace-nowrap">收據編號 / 登錄時間</th>
                    <th className="px-4 py-3 whitespace-nowrap">請領人</th>
                    <th className="px-4 py-3 whitespace-nowrap">繳款人 / 機關名稱</th>
                    <th className="px-4 py-3 min-w-[200px]">事由明細</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">金額</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {records.map((r, i) => (
                    <tr key={i} className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{r.id || '-'}</div>
                        <div className="text-xs text-gray-500">{r.timestamp ? r.timestamp.replace('AM', '上午').replace('PM', '下午') : '-'}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-800">{r.applicantName || '-'}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{r.payer || '-'}</td>
                      <td className="px-4 py-3">
                         <div className="text-gray-800 font-medium mb-1">{r.reason || '-'}</div>
                         <div className="text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                            {r.documentNumber && r.documentNumber !== '無' && <span>📝 {r.documentNumber}</span>}
                            {(r.incomeSubject || r.subjectCode) && <span>📂 {r.incomeSubject} {r.subjectCode ? `(${r.subjectCode})` : ''}</span>}
                         </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">${formatCurrency(r.amount)}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => { setCurrentRecord(r); setView('receipt'); }} className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded whitespace-nowrap font-medium">
                          查看
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {records.length === 0 && !isLoading && (
                <div className="p-8 text-center text-gray-500">
                  目前沒有任何歷史紀錄，或是尚未連線成功。
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
