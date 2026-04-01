import { createClient } from '@supabase/supabase-js';
import { realAITools, shuffleArray } from './real-ai-tools';

const supabase = createClient(
  process.env.COZE_SUPABASE_URL!,
  process.env.COZE_SUPABASE_ANON_KEY!
);

// 分类映射
const categoryMap: Record<string, number> = {
  'AI写作': 1,
  'AI绘画': 2,
  'AI对话': 3,
  'AI编程': 4,
  'AI音频': 5,
  'AI视频': 6,
  'AI办公': 7,
  'AI学习': 8,
};

async function main() {
  console.log('开始插入真实AI工具...\n');
  
  // 0. 获取一个有效的 publisher_id
  const { data: publisher } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single();
  
  const publisherId = publisher?.id || '5b3927c8-fcfa-4ede-bd8b-9e856e4e1a53';
  console.log(`使用 publisher_id: ${publisherId}\n`);
  
  // 1. 获取已存在的工具（去重）
  const { data: existingTools } = await supabase
    .from('ai_tools')
    .select('name, website')
    .eq('status', 'approved');
  
  const existingNames = new Set(
    existingTools?.map(t => t.name.toLowerCase().trim()) || []
  );
  const existingWebsites = new Set(
    existingTools?.map(t => t.website.toLowerCase().replace(/\/$/, '')) || []
  );
  
  console.log(`数据库已有 ${existingTools?.length || 0} 个工具\n`);
  
  // 2. 过滤重复工具
  const newTools = realAITools.filter(tool => {
    const nameLower = tool.name.toLowerCase().trim();
    const websiteLower = tool.website.toLowerCase().replace(/\/$/, '');
    
    // 检查名称是否已存在
    if (existingNames.has(nameLower)) {
      console.log(`跳过(名称重复): ${tool.name}`);
      return false;
    }
    
    // 检查网站是否已存在
    if (existingWebsites.has(websiteLower)) {
      console.log(`跳过(网站重复): ${tool.name} - ${tool.website}`);
      return false;
    }
    
    return true;
  });
  
  console.log(`\n去重后剩余 ${newTools.length} 个新工具\n`);
  
  // 3. 随机打乱顺序
  const shuffledTools = shuffleArray(newTools);
  
  // 4. 准备插入数据 - 为slug添加时间戳保证唯一
  const timestamp = Date.now();
  const toolsToInsert = shuffledTools.map((tool, index) => {
    const baseSlug = tool.name.toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 40);
    return {
      name: tool.name,
      slug: `${baseSlug}-${timestamp + index}`,
      description: tool.description,
      website: tool.website,
      logo: `https://icons.duckduckgo.com/ip3/${new URL(tool.website).hostname}.ico`,
      category_id: categoryMap[tool.category] || 1,
      publisher_id: publisherId,
      status: 'approved',
      is_featured: false,
      is_free: tool.isFree,
      view_count: Math.floor(Math.random() * 100) + 1,
      favorite_count: Math.floor(Math.random() * 20),
    };
  });
  
  // 5. 分批插入（每批50个）
  const batchSize = 50;
  let inserted = 0;
  let failed = 0;
  
  for (let i = 0; i < toolsToInsert.length; i += batchSize) {
    const batch = toolsToInsert.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('ai_tools')
      .insert(batch)
      .select('name');
    
    if (error) {
      console.error(`批次 ${Math.floor(i / batchSize) + 1} 插入失败:`, error.message);
      failed += batch.length;
    } else {
      inserted += data?.length || 0;
      console.log(`已插入 ${inserted}/${toolsToInsert.length} 个工具`);
      
      // 打印本批次插入的工具
      data?.forEach(t => console.log(`  + ${t.name}`));
    }
    
    // 短暂延迟避免过载
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n=== 插入完成 ===`);
  console.log(`成功: ${inserted} 个`);
  console.log(`失败: ${failed} 个`);
  
  // 6. 统计最终结果
  const { count: finalCount } = await supabase
    .from('ai_tools')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');
  
  console.log(`\n数据库总工具数: ${finalCount}`);
  
  // 按分类统计
  console.log('\n各分类工具数:');
  for (const [cat, id] of Object.entries(categoryMap)) {
    const { count } = await supabase
      .from('ai_tools')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)
      .eq('status', 'approved');
    console.log(`  ${cat}: ${count}个`);
  }
}

main().catch(console.error);
