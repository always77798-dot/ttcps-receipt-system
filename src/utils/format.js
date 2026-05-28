/**
 * 將數字格式化為符合臺灣習慣的千分位字串 (例如：1000 -> "1,000")
 * 
 * @param {number|string} num 要格式化的數字
 * @returns {string} 格式化後的千分位字串
 */
export const formatNumber = (num) => {
  if (!num || isNaN(num)) return "0";
  return Number(num).toLocaleString("zh-TW");
};

/**
 * 解析並將 Google Apps Script 的時間戳記格式化為易讀的上午/下午中文格式
 * 
 * @param {string} timestamp GAS 時間戳記 (例如: "2026-05-29 06:40:00 AM")
 * @returns {string} 格式化後的日期時間字串
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return "-";
  return timestamp.replace("AM", "上午").replace("PM", "下午");
};

/**
 * 將時間戳記拆分為日期與時間兩個部分，便於在表格中換行美化顯示
 * 
 * @param {string} timestamp GAS 時間戳記
 * @returns {{date: string, time: string}} 拆分後的日期與時間物件
 */
export const splitTimestamp = (timestamp) => {
  const formatted = formatTimestamp(timestamp);
  const spaceIndex = formatted.indexOf(" ");
  if (spaceIndex !== -1) {
    return {
      date: formatted.substring(0, spaceIndex),
      time: formatted.substring(spaceIndex + 1),
    };
  }
  return { date: formatted, time: "" };
};
