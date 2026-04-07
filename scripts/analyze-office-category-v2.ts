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

// AI功能关键词（如果包含这些，说明是真正的AI工具）
const AI_FEATURE_KEYWORDS = [
  'AI', '人工智能', '智能', '机器学习', '深度学习', '自动', '自动生成',
  '智能写作', '智能摘要', '智能翻译', '智能识别', '智能推荐',
  '自动分类', '自动整理', '自动提取', '自动分析', '自动优化',
  '对话', '聊天', '问答', '助手', 'copilot', 'chatgpt', 'gpt',
  '生成', '创建', '设计', '编辑', '优化', '改写', '翻译',
  '总结', '摘要', '提炼', '提取', '分析', '搜索',
  '语音', '图像', '视频', '音频', '文档', '笔记', '表格',
  '协作', '管理', '会议', '日程', '任务', '项目'
];

// 企业官网宣传性描述（过于简单或商业化）
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

// 品牌企业产品（这些虽然是大公司的产品，但确实是AI工具，不应该删除）
const KNOWN_AI_PRODUCTS = [
  'notion', 'mem', 'coda', 'airtable', 'slack', 'zoom', 'fireflies',
  'magical', 'reclaim', 'motion', 'clockwise', 'taskade',
  'microsoft', 'google', 'clickup', 'monday', 'asana', 'trello', 'linear',
  '飞书', '钉钉', 'wps', '腾讯', '石墨', '语雀', 'xmind', '有道', '为知',
  'notion ai', 'coda ai', 'airtable ai', 'slack ai', 'zoom ai',
  'microsoft 365', 'microsoft teams', 'google workspace', 'google duet',
];

/**
 * 判断是否包含AI功能描述
 */
function hasAIFeatures(tool: any): boolean {
  const { name, description, long_description } = tool;
  const allText = [name, description, long_description].join(' ').toLowerCase();

  // 检查是否包含AI功能关键词
  const hasAIKeywords = AI_FEATURE_KEYWORDS.some(keyword =>
    allText.includes(keyword.toLowerCase())
  );

  // 检查是否是已知的AI产品
  const isKnownProduct = KNOWN_AI_PRODUCTS.some(product =>
    name.toLowerCase().includes(product.toLowerCase())
  );

  return hasAIKeywords || isKnownProduct;
}

/**
 * 判断是否为企业官网宣传性描述
 */
function isCorporateDescription(tool: any): boolean {
  const { description } = tool;

  if (!description || description.length < 10) {
    return true; // 描述太短
  }

  // 检查是否匹配企业官网宣传模式
  const matchCorporatePattern = CORPORATE_DESCRIPTIONS.some(pattern =>
    pattern.test(description)
  );

  return matchCorporatePattern;
}

/**
 * 判断是否为企业官网类型工具
 */
function isCompanyWebsite(tool: any): boolean {
  const { name, description, website } = tool;

  // 如果包含AI功能，则不是企业官网
  if (hasAIFeatures(tool)) {
    return false;
  }

  // 如果描述是宣传性的，则可能是企业官网
  if (isCorporateDescription(tool)) {
    return true;
  }

  return false;
}

/**
 * 分析AI办公分类下的工具
 */
async function analyzeOfficeTools() {
  console.log("🔍 开始分析AI办公分类（ID: 7）下的工具...\n");

  // 1. 获取分类信息
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', 7)
    .single();

  if (categoryError) {
    console.error("❌ 获取分类失败:", categoryError);
    process.exit(1);
  }

  console.log(`📂 分类信息:`);
  console.log(`   ID: ${category.id}`);
  console.log(`   名称: ${category.name}`);
  console.log(`   Slug: ${category.slug}`);
  console.log(`   描述: ${category.description || '无'}`);
  console.log();

  // 2. 获取该分类下的所有工具
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

  // 3. 分析每个工具
  const companyTools: any[] = [];
  const normalTools: any[] = [];

  tools.forEach((tool, index) => {
    const isCompany = isCompanyWebsite(tool);
    if (isCompany) {
      companyTools.push(tool);
    } else {
      normalTools.push(tool);
    }

    // 只输出前50个和标记为企业的工具，避免输出过多
    if (index < 50 || isCompany) {
      const status = isCompany ? '🏢 企业官网' : '✅ 正常工具';
      console.log(`${index + 1}. ${status} - ${tool.name}`);
      console.log(`   ID: ${tool.id}`);
      console.log(`   描述: ${tool.description || '无'}`);
      console.log(`   网站: ${tool.website || '无'}`);
      console.log(`   状态: ${tool.status || 'unknown'}`);

      if (isCompany) {
        console.log(`   ⚠️  匹配原因: ${isCorporateDescription(tool) ? '描述过于简单/宣传化' : '其他原因'}`);
      }

      console.log();
    }
  });

  if (tools.length > 50) {
    console.log(`... (省略 ${tools.length - 50} 个正常工具的详细输出)\n`);
  }

  // 4. 输出统计结果
  console.log("=".repeat(80));
  console.log("📈 分析结果统计:");
  console.log("=".repeat(80));
  console.log(`总工具数: ${tools.length}`);
  console.log(`企业官网类型: ${companyTools.length} (${((companyTools.length / tools.length) * 100).toFixed(2)}%)`);
  console.log(`正常工具: ${normalTools.length} (${((normalTools.length / tools.length) * 100).toFixed(2)}%)`);
  console.log();

  // 5. 输出企业官网类型工具的ID列表
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
    category,
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
