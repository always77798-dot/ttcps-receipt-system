/**
 * 將阿拉伯數字金額轉換為中文繁體財務大寫（例如：10005 -> 壹萬零伍元整）
 * 適用於學校收款收據等財務憑證。
 * 
 * @param {number|string} amount 阿拉伯數字金額
 * @returns {string} 中文大寫財務金額
 */
export const convertToChineseNumerals = (amount) => {
  if (!amount || isNaN(amount)) return "零元整";
  
  const num = Number(amount);
  if (num === 0) return "零元整";

  const digits = ["零", "壹", "貳", "參", "肆", "伍", "陸", "柒", "捌", "玖"];
  const units = ["", "拾", "佰", "仟"];
  const bigUnits = ["", "萬", "億", "兆"];
  
  let result = "";
  const isNegative = num < 0;
  let absVal = Math.abs(num);
  let bigUnitIdx = 0;

  // 處理 4 位數區段的轉換函數
  const processFourDigits = (section) => {
    let sectionResult = "";
    let isZero = true;
    
    for (let i = 0; i < 4; i++) {
      const digit = section % 10;
      if (digit === 0) {
        if (!isZero && i !== 0) {
          sectionResult = digits[digit] + sectionResult;
        }
        isZero = true;
      } else {
        sectionResult = digits[digit] + units[i] + sectionResult;
        isZero = false;
      }
      section = Math.floor(section / 10);
    }
    return sectionResult;
  };

  while (absVal > 0) {
    const section = absVal % 10000;
    const sectionStr = processFourDigits(section);
    
    if (section !== 0) {
      result = sectionStr + bigUnits[bigUnitIdx] + result;
    } else if (bigUnitIdx > 0 && result !== "" && !result.startsWith("零")) {
      result = "零" + result;
    }
    
    absVal = Math.floor(absVal / 10000);
    bigUnitIdx++;
  }

  // 清理轉換後的字串格式
  result = result
    .replace(/零+/g, "零")
    .replace(/零[萬億兆]/g, (match) => match[1])
    .replace(/億萬/g, "億")
    .replace(/^零+/, "")
    .replace(/零+$/, "");

  return (isNegative ? "負" : "") + result + "元整";
};
