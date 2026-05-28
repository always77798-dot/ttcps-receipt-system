import { convertToChineseNumerals } from "./src/utils/cnNumber.js";
import { formatNumber, formatTimestamp, splitTimestamp } from "./src/utils/format.js";

console.log("=== TTCPS 收據系統工具函數測試 ===");

const numberTests = [
  { input: 0, expected: "零元整" },
  { input: 10, expected: "壹拾元整" },
  { input: 25, expected: "貳拾伍元整" },
  { input: 105, expected: "壹佰零伍元整" },
  { input: 1000, expected: "壹仟元整" },
  { input: 10005, expected: "壹萬零伍元整" },
  { input: 100000, expected: "壹拾萬元整" },
  { input: 1234567, expected: "壹佰貳拾參萬肆仟伍佰陸拾柒元整" },
];

console.log("\n1. 測試金額轉中文大寫 (cnNumber.js):");
let allNumberTestsPassed = true;
for (const test of numberTests) {
  const result = convertToChineseNumerals(test.input);
  const status = result === test.expected ? "✅ 通過" : `❌ 失敗 (得到: ${result}, 預期: ${test.expected})`;
  console.log(`輸入: ${test.input} -> ${result} [${status}]`);
  if (result !== test.expected) allNumberTestsPassed = false;
}

const formatTests = [
  { input: 1000, expected: "1,000" },
  { input: 1234567, expected: "1,234,567" },
  { input: 0, expected: "0" },
];

console.log("\n2. 測試千分位格式化 (format.js):");
let allFormatTestsPassed = true;
for (const test of formatTests) {
  const result = formatNumber(test.input);
  const status = result === test.expected ? "✅ 通過" : `❌ 失敗 (得到: ${result}, 預期: ${test.expected})`;
  console.log(`輸入: ${test.input} -> ${result} [${status}]`);
  if (result !== test.expected) allFormatTestsPassed = false;
}

const timeTests = [
  { input: "2026-05-29 06:40:00 AM", expectedDate: "2026-05-29", expectedTime: "06:40:00 上午" },
  { input: "2026-05-29 06:40:00 PM", expectedDate: "2026-05-29", expectedTime: "06:40:00 下午" },
];


console.log("\n3. 測試時間戳記拆分與轉換 (format.js):");
let allTimeTestsPassed = true;
for (const test of timeTests) {
  const { date, time } = splitTimestamp(test.input);
  const status = (date === test.expectedDate && time === test.expectedTime) ? "✅ 通過" : `❌ 失敗 (得到: ${date} ${time})`;
  console.log(`輸入: "${test.input}" -> 日期: "${date}", 時間: "${time}" [${status}]`);
  if (date !== test.expectedDate || time !== test.expectedTime) allTimeTestsPassed = false;
}

console.log("\n=== 測試結論 ===");
if (allNumberTestsPassed && allFormatTestsPassed && allTimeTestsPassed) {
  console.log("🎉 所有工具函數單元測試皆完全通過！");
} else {
  console.log("⚠️ 部分測試失敗，請檢查代碼。");
}
