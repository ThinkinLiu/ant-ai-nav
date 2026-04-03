import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载环境变量
dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ 错误: 缺少 Supabase 环境变量");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 传统企业/品牌名单（这些企业的"AI"产品通常是企业宣传，不是真正的AI工具）
const TRADITIONAL_COMPANIES = [
  '长虹', 'chonghong', 'tcl', '创维', 'skyworth', '海信', 'hisense',
  '海尔', 'haier', '美的', 'midea', '格力', 'gree', '康佳', 'konka',
  '小米', 'xiaomi', '华为', 'huawei', 'oppo', 'vivo', '联想', 'lenovo',
  '中兴', 'zte', '金立', 'gionee', '酷派', 'coolpad', '魅族', 'meizu',
  '一加', 'oneplus', '荣耀', 'honor', 'realme', 'iqoo',
  '三星', 'samsung', 'lg', '索尼', 'sony', '松下', 'panasonic', '东芝', 'toshiba',
  '夏普', 'sharp', '飞利浦', 'philips', '宏碁', 'acer', '华硕', 'asus',
  '戴尔', 'dell', '惠普', 'hp', '联想', 'lenovo',
  '汽车', '汽车之家', '比亚迪', 'byd', '长城', 'greatwall', '吉利', 'geely',
  '奇瑞', 'chery', '长安', 'changan', '上汽', '一汽', '东风',
  '房地产', '万科', '恒大', '碧桂园', '保利', '融创', '龙湖',
  '银行', '工商银行', '建设银行', '农业银行', '中国银行', '招商银行',
  '保险', '平安保险', '中国人寿', '太平洋保险',
  '电信', '中国移动', '中国联通', '中国电信',
  '电力', '国家电网', '南方电网',
  '石油', '中石油', '中石化', '中海油',
  '钢铁', '宝钢', '首钢', '武钢',
  '化工', '中化', '万华',
  '建材', '海螺', '中国建材',
  '物流', '顺丰', '圆通', '中通', '申通', '韵达', '京东物流',
  '零售', '沃尔玛', '家乐福', '永辉', '大润发',
  '酒店', '如家', '汉庭', '7天', '锦江',
  '餐饮', '肯德基', '麦当劳', '星巴克', '海底捞',
  '白酒', '茅台', '五粮液', '剑南春', '泸州老窖',
  '啤酒', '青岛啤酒', '雪花', '百威',
  '乳业', '伊利', '蒙牛',
  '家电', '苏泊尔', '九阳', '老板电器', '方太',
  '医药', '云南白药', '同仁堂', '白云山', '复星医药',
  '烟草', '中国烟草',
  '黄金', '山东黄金', '紫金矿业',
  '矿业', '江西铜业', '中国神华',
  '煤炭', '中国神华', '陕西煤业',
];

// 真正的AI产品/公司（这些不应该被删除）
const KNOWN_AI_PRODUCTS = [
  'notion', 'mem', 'coda', 'airtable', 'slack', 'zoom', 'fireflies',
  'magical', 'reclaim', 'motion', 'clockwise', 'taskade',
  'clickup', 'monday', 'asana', 'trello', 'linear',
  'chatgpt', 'claude', 'gemini', 'perplexity', 'jade',
  'kimi', '文心一言', '通义千问', '豆包', 'deepseek',
  'copilot', 'duet ai', 'fireflies.ai', 'tldv.io', 'reclaim.ai',
  '飞书ai', '钉钉ai', 'wps ai', '腾讯文档ai', '石墨文档ai', '语雀ai',
];

// AI功能关键词
const AI_FEATURE_KEYWORDS = [
  '智能写作', '智能摘要', '智能翻译', '智能识别', '智能推荐',
  '自动分类', '自动整理', '自动提取', '自动分析', '自动优化',
  '对话', '聊天', '问答', '助手',
  '生成', '创建', '设计', '编辑', '优化', '改写', '翻译',
  '总结', '摘要', '提炼', '提取', '分析', '搜索',
  '语音', '图像', '视频', '音频', '文档', '笔记', '表格',
  '协作', '管理', '会议', '日程', '任务', '项目'
];

// 企业官网宣传性描述
const CORPORATE_DESCRIPTIONS = [
  /^提供.*服务$/,
  /^专注.*领域$/,
  /^致力于.*$/,
  /^我们的.*$/,
  /^我们提供.*$/,
  /^专业.*$/,
  /^领先.*$/,
  /^全球领先的.*$/,
  /^致力于提供.*$/,
  /^致力于.*行业$/,
  /^助力.*$/,
  /^赋能.*$/,
  /^一站式.*$/,
  /^全方位.*$/,
  /^综合性.*$/,
  /^综合性.*平台$/,
  /^为企业提供.*$/,
  /^为.*提供.*解决方案$/,
];

/**
 * 判断是否是传统企业的产品
 */
function isTraditionalCompanyProduct(tool: any): boolean {
  const { name, description, website } = tool;
  const allText = [name, description, website].join(' ').toLowerCase();

  // 检查是否是传统企业
  return TRADITIONAL_COMPANIES.some(company =>
    allText.includes(company.toLowerCase())
  );
}

/**
 * 判断是否是已知的AI产品
 */
function isKnownAIProduct(tool: any): boolean {
  const { name } = tool;

  // 检查是否是已知的AI产品
  return KNOWN_AI_PRODUCTS.some(product =>
    name.toLowerCase().includes(product.toLowerCase())
  );
}

/**
 * 判断是否包含真正的AI功能描述
 */
function hasRealAIFeatures(tool: any): boolean {
  const { name, description, long_description } = tool;
  const allText = [name, description, long_description].join(' ').toLowerCase();

  // 检查是否包含具体的AI功能关键词
  return AI_FEATURE_KEYWORDS.some(keyword =>
    allText.includes(keyword.toLowerCase())
  );
}

/**
 * 判断是否为企业官网宣传性描述
 */
function isCorporateDescription(tool: any): boolean {
  const { description } = tool;

  if (!description || description.length < 10) {
    return true;
  }

  // 检查是否匹配企业官网宣传模式
  return CORPORATE_DESCRIPTIONS.some(pattern =>
    pattern.test(description)
  );
}

/**
 * 判断是否为企业官网类型工具
 */
function isCompanyWebsite(tool: any): boolean {
  const { name, description } = tool;

  // 如果是已知的AI产品，则不是企业官网
  if (isKnownAIProduct(tool)) {
    return false;
  }

  // 如果是传统企业的产品，且没有具体的AI功能描述，则是企业官网
  if (isTraditionalCompanyProduct(tool)) {
    // 检查是否有真正的AI功能描述
    if (!hasRealAIFeatures(tool)) {
      return true;
    }
  }

  // 如果描述是宣传性的，且名称中只是简单加了"AI"，可能是企业官网
  if (isCorporateDescription(tool)) {
    // 检查名称是否只是简单地加了"AI"
    const nameWithoutAI = name.replace(/AI$/i, '').replace(/AI /i, '');
    if (nameWithoutAI.length > 0 && name.includes('AI')) {
      // 进一步检查是否有具体的AI功能
      if (!hasRealAIFeatures(tool)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 分析AI办公分类下的工具
 */
async function analyzeOfficeTools() {
  console.log("🔍 开始分析AI办公分类（ID: 7）下的工具...\n");

  // 1. 获取该分类下的所有工具
  const { data: tools, error: toolsError } = await supabase
    .from('ai_tools')
    .select('*')
    .eq('category_id', 7)
    .order('id', { ascending: true });

  if (toolsError) {
    console.error("❌ 获取工具失败:", toolsError);
    process.exit(1);
  }

  console.log(`📊 总计找到 ${tools.length} 个工具\n`);

  // 2. 分析每个工具
  const companyTools: any[] = [];
  const normalTools: any[] = [];

  tools.forEach((tool, index) => {
    const isCompany = isCompanyWebsite(tool);
    if (isCompany) {
      companyTools.push(tool);
    } else {
      normalTools.push(tool);
    }

    // 只输出前20个和标记为企业的工具
    if (index < 20 || isCompany) {
      const status = isCompany ? '🏢 企业官网' : '✅ 正常工具';
      console.log(`${index + 1}. ${status} - ${tool.name}`);
      console.log(`   ID: ${tool.id}`);
      console.log(`   描述: ${tool.description || '无'}`);

      if (isCompany) {
        console.log(`   ⚠️  匹配原因:`);
        if (isTraditionalCompanyProduct(tool)) {
          console.log(`      - 传统企业产品`);
        }
        if (isCorporateDescription(tool)) {
          console.log(`      - 描述过于简单/宣传化`);
        }
        if (!hasRealAIFeatures(tool)) {
          console.log(`      - 缺少具体AI功能描述`);
        }
      }

      console.log();
    }
  });

  if (tools.length > 20) {
    console.log(`... (省略 ${tools.length - 20} 个正常工具的详细输出)\n`);
  }

  // 3. 输出统计结果
  console.log("=".repeat(80));
  console.log("📈 分析结果统计:");
  console.log("=".repeat(80));
  console.log(`总工具数: ${tools.length}`);
  console.log(`企业官网类型: ${companyTools.length} (${((companyTools.length / tools.length) * 100).toFixed(2)}%)`);
  console.log(`正常工具: ${normalTools.length} (${((normalTools.length / tools.length) * 100).toFixed(2)}%)`);
  console.log();

  // 4. 输出企业官网类型工具的ID列表
  if (companyTools.length > 0) {
    console.log("=".repeat(80));
    console.log("🏢 建议删除的企业官网类型工具:");
    console.log("=".repeat(80));
    companyTools.forEach(tool => {
      console.log(`- ID: ${tool.id} | ${tool.name} | ${tool.description}`);
    });
    console.log();

    // 输出删除命令
    console.log("=".repeat(80));
    console.log("📝 删除命令（供参考）:");
    console.log("=".repeat(80));
    const toolIds = companyTools.map(t => t.id);
    console.log(`工具ID列表: ${toolIds.join(', ')}`);
    console.log();
    console.log(`SQL删除命令:`);
    console.log(`DELETE FROM ai_tools WHERE id IN (${toolIds.join(', ')});`);
  }

  return {
    totalTools: tools.length,
    companyTools,
    normalTools,
    companyToolIds: companyTools.map(t => t.id),
  };
}

analyzeOfficeTools()
  .then(result => {
    console.log("\n" + "=".repeat(80));
    console.log("✅ 分析完成！");
    console.log("=".repeat(80));
    console.log(`发现 ${result.companyTools.length} 个企业官网类型工具待清理`);
    process.exit(0);
  })
  .catch(error => {
    console.error("❌ 分析失败:", error);
    process.exit(1);
  });
