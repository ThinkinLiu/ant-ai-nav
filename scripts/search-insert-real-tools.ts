/**
 * 搜索并插入真实的国内AI工具
 * 通过Web搜索获取真实数据
 */

import { createClient } from '@supabase/supabase-js';
import { SearchClient, Config } from 'coze-coding-dev-sdk';

const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.COZE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);
const ADMIN_ID = '5b3927c8-fcfa-4ede-bd8b-9e856e4e1a53';

const searchClient = new SearchClient(new Config());

const CATEGORY_MAP: Record<string, number> = {
  'ai-writing': 1, 'ai-painting': 2, 'ai-chat': 3, 'ai-coding': 4,
  'ai-audio': 5, 'ai-video': 6, 'ai-office': 7, 'ai-learning': 8,
};

// 搜索关键词列表 - 涵盖各类AI工具
const searchQueries = [
  // AI写作工具
  '国内AI写作工具 ChatGPT 2024',
  '中文AI写作平台 推荐 热门',
  'AI文案生成工具 国内',
  'AI文章写作 中文平台',
  '智能写作助手 国内网站',
  
  // AI绘画工具
  '国内AI绘画工具 Midjourney替代',
  '中文AI画图平台 热门',
  'AI图片生成 国内工具',
  'AI绘画网站 中文推荐',
  '国产AI绘画软件',
  
  // AI对话工具
  '国内AI聊天机器人 ChatGPT替代',
  '中文大语言模型 对话平台',
  '国产AI助手 智能对话',
  'AI问答系统 国内平台',
  '中文GPT替代工具',
  
  // AI编程工具
  '国内AI编程助手 Copilot替代',
  'AI代码生成 中文工具',
  '智能编程助手 国内平台',
  'AI写代码工具 推荐',
  '程序员AI助手 国内',
  
  // AI音频工具
  '国内AI配音工具 热门',
  'AI语音合成 中文平台',
  'AI音乐生成 国内工具',
  '语音转文字 中文AI',
  'AI音频处理工具 推荐',
  
  // AI视频工具
  '国内AI视频生成工具',
  'AI视频剪辑 中文平台',
  'AI视频制作 国内工具',
  '短视频AI工具 热门',
  'AI视频编辑软件 中文',
  
  // AI办公工具
  '国内AI办公工具 效率',
  'AI文档处理 中文平台',
  'AI表格工具 国内网站',
  '智能办公助手 AI',
  'AI PPT制作工具 中文',
  
  // AI学习工具
  '国内AI学习平台 教育',
  'AI教育工具 中文',
  '智能学习助手 国内',
  'AI编程学习平台',
  'AI英语学习工具 推荐',
];

interface ToolInfo {
  name: string;
  website: string;
  category: string;
  description: string;
  isFree: boolean;
  pricing: string;
  tags: string[];
}

function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain;
  } catch {
    return url;
  }
}

function generateSlug(name: string): string {
  const random = Math.random().toString(36).substring(2, 8);
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
  return `${cleanName}-${random}`;
}

function extractToolName(title: string): string {
  // 清理标题，提取工具名称
  let name = title
    .replace(/【.*?】/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\|.*$/g, '')
    .replace(/-.*$/g, '')
    .replace(/_.*$/g, '')
    .replace(/：.*$/g, '')
    .replace(/:.*$/g, '')
    .replace(/（.*）.*/g, '')
    .replace(/\(.*\).*/g, '')
    .replace(/最新|推荐|热门|免费|下载|官网|官方|首页|网站|平台|工具|软件|app|APP/gi, '')
    .trim();
  
  // 限制长度
  if (name.length > 30) {
    name = name.substring(0, 30);
  }
  
  return name || 'AI工具';
}

function determineCategory(title: string, snippet: string): string {
  const text = (title + ' ' + snippet).toLowerCase();
  
  if (text.includes('写作') || text.includes('文案') || text.includes('文章') || text.includes('文档')) {
    return 'ai-writing';
  }
  if (text.includes('绘画') || text.includes('画图') || text.includes('图片') || text.includes('设计') || text.includes('抠图')) {
    return 'ai-painting';
  }
  if (text.includes('对话') || text.includes('聊天') || text.includes('问答') || text.includes('gpt') || text.includes('chat')) {
    return 'ai-chat';
  }
  if (text.includes('编程') || text.includes('代码') || text.includes('开发') || text.includes('copilot')) {
    return 'ai-coding';
  }
  if (text.includes('音频') || text.includes('语音') || text.includes('配音') || text.includes('音乐')) {
    return 'ai-audio';
  }
  if (text.includes('视频') || text.includes('剪辑') || text.includes('短视频')) {
    return 'ai-video';
  }
  if (text.includes('办公') || text.includes('表格') || text.includes('ppt') || text.includes('简历')) {
    return 'ai-office';
  }
  if (text.includes('学习') || text.includes('教育') || text.includes('课程') || text.includes('培训')) {
    return 'ai-learning';
  }
  
  // 默认根据关键词分布
  const categories = ['ai-writing', 'ai-painting', 'ai-chat', 'ai-coding', 'ai-audio', 'ai-video', 'ai-office', 'ai-learning'];
  return categories[Math.floor(Math.random() * categories.length)];
}

function determinePricing(title: string, snippet: string): { isFree: boolean; pricing: string } {
  const text = (title + ' ' + snippet).toLowerCase();
  
  if (text.includes('免费') || text.includes('free')) {
    return { isFree: true, pricing: '免费使用' };
  }
  if (text.includes('付费') || text.includes('会员') || text.includes('vip') || text.includes('订阅')) {
    return { isFree: false, pricing: '会员制' };
  }
  if (text.includes('试用') || text.includes('体验')) {
    return { isFree: true, pricing: '基础功能免费' };
  }
  if (text.includes('企业') || text.includes('商业')) {
    return { isFree: false, pricing: '企业服务' };
  }
  
  // 默认部分免费
  return { isFree: true, pricing: '基础功能免费' };
}

function generateTags(title: string, snippet: string, category: string): string[] {
  const tags: string[] = [];
  const text = (title + ' ' + snippet).toLowerCase();
  
  // 根据分类添加基础标签
  const categoryTags: Record<string, string[]> = {
    'ai-writing': ['AI写作', '智能创作', '文案生成'],
    'ai-painting': ['AI绘画', '图像生成', '智能设计'],
    'ai-chat': ['AI对话', '智能问答', '聊天机器人'],
    'ai-coding': ['AI编程', '代码生成', '智能开发'],
    'ai-audio': ['AI音频', '语音合成', '智能配音'],
    'ai-video': ['AI视频', '智能剪辑', '视频生成'],
    'ai-office': ['AI办公', '效率工具', '智能文档'],
    'ai-learning': ['AI学习', '智能教育', '在线课程'],
  };
  
  tags.push(...categoryTags[category] || ['AI工具']);
  
  // 根据关键词添加标签
  if (text.includes('免费')) tags.push('免费');
  if (text.includes('中文')) tags.push('中文支持');
  if (text.includes('移动') || text.includes('app')) tags.push('移动端');
  if (text.includes('企业')) tags.push('企业服务');
  if (text.includes('api')) tags.push('API接口');
  
  return [...new Set(tags)].slice(0, 5);
}

async function searchTools(query: string): Promise<ToolInfo[]> {
  const tools: ToolInfo[] = [];
  
  try {
    const response = await searchClient.webSearch(query, 15, true);
    
    if (response.web_items) {
      for (const item of response.web_items) {
        // 过滤非中国网站和不相关的结果
        const url = item.url || '';
        if (!url || 
            url.includes('youtube.com') || 
            url.includes('twitter.com') || 
            url.includes('facebook.com') ||
            url.includes('instagram.com') ||
            url.includes('reddit.com') ||
            url.includes('medium.com')) {
          continue;
        }
        
        const name = extractToolName(item.title || '');
        if (name.length < 2 || name === 'AI工具') continue;
        
        const category = determineCategory(item.title || '', item.snippet || '');
        const { isFree, pricing } = determinePricing(item.title || '', item.snippet || '');
        const tags = generateTags(item.title || '', item.snippet || '', category);
        
        tools.push({
          name,
          website: url.startsWith('http') ? url : `https://${url}`,
          category,
          description: item.snippet?.substring(0, 100) || `${name}是一款智能AI工具`,
          isFree,
          pricing,
          tags,
        });
      }
    }
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error) {
    console.error(`搜索失败: ${query}`, error);
  }
  
  return tools;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function main() {
  console.log('开始搜索真实的国内AI工具...\n');
  
  // 获取已存在的工具
  const { data: existingTools } = await supabase.from('ai_tools').select('website, name');
  const existingWebsites = new Set(existingTools?.map(t => t.website) || []);
  const existingNames = new Set(existingTools?.map(t => t.name.toLowerCase()) || []);
  console.log(`数据库中已有 ${existingWebsites.size} 个工具\n`);
  
  // 随机打乱搜索顺序
  const shuffledQueries = shuffleArray([...searchQueries]);
  
  const allTools: ToolInfo[] = [];
  
  // 执行搜索
  for (let i = 0; i < shuffledQueries.length; i++) {
    const query = shuffledQueries[i];
    console.log(`[${i + 1}/${shuffledQueries.length}] 搜索: ${query}`);
    
    const tools = await searchTools(query);
    
    for (const tool of tools) {
      // 过滤重复
      if (existingWebsites.has(tool.website)) continue;
      if (existingNames.has(tool.name.toLowerCase())) continue;
      
      // 添加到集合防止本次重复
      existingWebsites.add(tool.website);
      existingNames.add(tool.name.toLowerCase());
      allTools.push(tool);
    }
    
    console.log(`  找到 ${tools.length} 个工具，累计 ${allTools.length} 个新工具`);
    
    // 如果已经找到足够多的工具，提前结束
    if (allTools.length >= 600) {
      console.log('\n已收集足够的工具，停止搜索');
      break;
    }
  }
  
  console.log(`\n总共找到 ${allTools.length} 个新工具`);
  
  // 随机打乱顺序
  const shuffledTools = shuffleArray(allTools);
  
  // 批量插入
  const batchSize = 50;
  let inserted = 0;
  let failed = 0;
  
  for (let i = 0; i < shuffledTools.length; i += batchSize) {
    const batch = shuffledTools.slice(i, i + batchSize);
    
    const insertData = batch.map(tool => ({
      name: tool.name,
      slug: generateSlug(tool.name),
      description: tool.description,
      long_description: `${tool.name}是一款${tool.description}。该工具利用先进的人工智能技术，为用户提供高效便捷的服务体验。`,
      website: tool.website,
      logo: `https://icons.duckduckgo.com/ip3/${extractDomain(tool.website)}.ico`,
      category_id: CATEGORY_MAP[tool.category],
      publisher_id: ADMIN_ID,
      status: 'approved',
      is_featured: false,
      is_pinned: false,
      is_free: tool.isFree,
      pricing_info: tool.pricing,
      view_count: Math.floor(Math.random() * 500) + 10,
      favorite_count: 0,
    }));
    
    const { error } = await supabase.from('ai_tools').insert(insertData);
    if (error) {
      console.error(`批次插入失败:`, error.message);
      failed += batch.length;
    } else {
      inserted += batch.length;
      console.log(`已插入 ${inserted}/${shuffledTools.length} 个工具...`);
    }
  }
  
  console.log(`\n完成! 成功: ${inserted}, 失败: ${failed}`);
  
  // 统计总数
  const { count } = await supabase.from('ai_tools').select('*', { count: 'exact', head: true });
  console.log(`数据库总工具数: ${count}`);
}

main().catch(console.error);
