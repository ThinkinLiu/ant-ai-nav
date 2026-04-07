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

// 企业官网关键词列表
const COMPANY_KEYWORDS = [
  '企业', '公司', '官网', '官方网站', '集团', '有限', '科技', '服务',
  '解决方案', '咨询', '业务', '合作', '关于我们', '联系我们',
  '企业官网', '公司官网', '企业介绍', '公司介绍', '产品中心',
  '新闻中心', '人力资源', '招聘', '投资', '股东', '投资者',
  '品牌', '营销', '广告', '公关', '宣传', '企业文化',
  '企业服务', '商务合作', '商务', '客户服务', '售后服务',
  '企业级', '商用', '商业', 'B2B', '企业版', '企业应用',
  '企业云', '企业解决方案', '企业软件', '企业应用'
];

/**
 * 判断是否为企业官网类型工具
 */
function isCompanyWebsite(tool: any): boolean {
  const { name, description, long_description, website } = tool;

  // 检查名称、描述、网站URL中是否包含企业官网关键词
  const allText = [name, description, long_description, website].join(' ').toLowerCase();

  // 检查关键词匹配
  const keywordMatch = COMPANY_KEYWORDS.some(keyword =>
    allText.includes(keyword.toLowerCase())
  );

  // 检查网站URL模式（如：company.com, corp.com等）
  const companyDomainPatterns = [
    /\.com\/(about|contact|about-us|contact-us|company|corporate|team|careers)/i,
    /\.com\.(cn|net|org)\/(about|contact|about-us|contact-us|company|corporate)/i,
    /about\./i,
    /corporate\./i,
    /company\./i
  ];

  const domainMatch = companyDomainPatterns.some(pattern =>
    pattern.test(website || '')
  );

  // 检查描述是否过于简单或不像AI工具描述
  const simpleDescriptionPatterns = [
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
    /^.*（.*）有限公司$/,
  ];

  const simpleDescriptionMatch = simpleDescriptionPatterns.some(pattern =>
    pattern.test(description || '')
  );

  // 综合判断
  return keywordMatch || domainMatch || simpleDescriptionMatch;
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

    // 输出每个工具的分析结果
    const status = isCompany ? '🏢 企业官网' : '✅ 正常工具';
    console.log(`${index + 1}. ${status} - ${tool.name}`);
    console.log(`   ID: ${tool.id}`);
    console.log(`   描述: ${tool.description || '无'}`);
    console.log(`   网站: ${tool.website || '无'}`);
    console.log(`   状态: ${tool.status || 'unknown'}`);

    if (isCompany) {
      console.log(`   ⚠️  匹配原因:`);

      // 分析匹配原因
      const { name, description, website } = tool;
      const matchedKeywords: string[] = [];

      COMPANY_KEYWORDS.forEach(keyword => {
        if (name?.toLowerCase().includes(keyword.toLowerCase()) ||
            description?.toLowerCase().includes(keyword.toLowerCase())) {
          matchedKeywords.push(keyword);
        }
      });

      if (matchedKeywords.length > 0) {
        console.log(`      - 包含关键词: ${matchedKeywords.join(', ')}`);
      }

      // 检查简单描述模式
      const simpleDescriptionPatterns = [
        /^提供.*服务$/,
        /^专注.*领域$/,
        /^致力于.*$/,
      ];
      if (simpleDescriptionPatterns.some(p => p.test(description || ''))) {
        console.log(`      - 描述过于简单/企业宣传化`);
      }
    }

    console.log();
  });

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
      console.log(`- ID: ${tool.id} | ${tool.name} | ${tool.status}`);
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
