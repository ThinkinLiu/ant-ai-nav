import { createClient } from '@supabase/supabase-js';

const fs = require('fs');

// 从环境变量读取Supabase配置
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 错误: 缺少Supabase配置');
  console.error('请设置环境变量 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 分类映射
const categoryMap: Record<string, number> = {
  "聊天助手": 1,
  "文本生成": 1,
  "写作工具": 1,
  "大型语言模型": 1,
  "图像生成": 2,
  "图像编辑": 2,
  "图像处理工具": 2,
  "艺术创作工具": 2,
  "视频生成": 3,
  "视频编辑工具": 3,
  "视频翻译工具": 3,
  "动画制作工具": 3,
  "代码辅助": 4,
  "编程工具": 4,
  "代码开发工具": 4,
  "代码审查工具": 4,
  "数据分析": 5,
  "数据可视化工具": 5,
  "数据科学工具": 6,
  "智能体": 6,
  "Agent框架": 6,
  "智能体平台": 6,
  "Agent": 6,
  "自动化工具": 7,
  "工作流自动化": 7,
  "办公自动化工具": 7,
  "任务管理工具": 7,
  "项目管理工具": 7,
  "办公工具": 8,
  "生产力工具": 8,
  "会议助手": 8,
  "邮件管理工具": 8,
  "日程管理工具": 8,
  "笔记工具": 8,
  "文档处理工具": 8,
  "AI助手": 1,
  "推理模型": 1,
  "应用生成工具": 4,
  "知识管理工具": 8,
  "本地化AI产品": 1,
  "办公助手": 8,
  "情感AI助手": 1,
  "机器人智能": 6,
  "研究助手": 1,
  "营销自动化工具": 7,
  "内容创作工具": 1,
  "Agent工具生成器": 6,
  "生成式AI": 1,
  "AI处理器": 4,
  "智能体协作工具": 6,
  "代码安全工具": 4,
  "AI搜索引擎": 1,
  "代码生成工具": 4,
  "AI平台": 1,
  "视觉模型": 2,
  "社交AI": 7,
  "音频生成工具": 2,
  "AI工具搜索": 1,
  "AI招聘工具": 7,
  "AI部署工具": 4,
  "内容生成套件": 1,
  "设计工具": 2,
  "思维导图工具": 8,
  "简历优化工具": 7,
  "面试培训工具": 7,
  "技能匹配工具": 7,
  "学习助手": 1,
  "在线辅导工具": 1,
  "测验生成工具": 1,
  "财务管理工具": 5,
  "投资分析工具": 5,
  "税务工具": 7,
  "法律助手": 1,
  "医疗助手": 1,
  "旅行规划工具": 7,
  "美食推荐工具": 7,
  "健身助手": 7,
  "睡眠分析工具": 7,
  "心理健康工具": 1,
  "关系管理工具": 1,
  "宠物护理工具": 7,
  "园艺助手": 7,
  "家居设计工具": 2,
  "时尚助手": 7,
  "美容助手": 7,
  "音乐创作工具": 2,
  "故事创作工具": 1,
  "游戏开发工具": 4,
  "3D建模工具": 2,
  "VR内容工具": 2,
  "AR内容工具": 2,
  "元宇宙工具": 7,
  "区块链工具": 4,
  "加密货币工具": 5,
  "NFT工具": 7,
  "Web3工具": 4,
  "物联网工具": 6,
  "边缘计算工具": 4,
  "机器人控制工具": 6,
  "无人机工具": 6,
  "卫星分析工具": 5,
  "气候分析工具": 5,
  "能源管理工具": 7,
  "水资源管理工具": 7,
  "农业助手": 7,
  "林业管理工具": 7,
  "海洋分析工具": 5,
  "航天工具": 5
};

async function insertTools() {
  console.log("🚀 开始插入AI工具到Supabase数据库...\n");

  // 读取工具列表
  const tools = JSON.parse(fs.readFileSync('/tmp/manual-tools-list.json', 'utf-8'));
  
  console.log(`📋 共 ${tools.length} 个工具待插入\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  const now = new Date().toISOString();

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    
    try {
      // 检查工具是否已存在（通过slug）
      const { data: existing } = await supabase
        .from('ai_tools')
        .select('id')
        .eq('slug', tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
        .single();

      if (existing) {
        console.log(`⏭️  [${i + 1}/${tools.length}] ${tool.name} - 已存在，跳过`);
        skipCount++;
        continue;
      }

      // 插入工具
      const toolData = {
        name: tool.name,
        slug: tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: tool.description,
        url: tool.url,
        category_id: categoryMap[tool.type] || 1, // 默认分类1
        logo: '', // 空logo，让系统自动生成
        tags: JSON.stringify([tool.type, "新工具", "2025"]),
        rating: 4.5, // 默认评分
        visits: Math.floor(Math.random() * 1000), // 随机访问量
        is_hot: true, // 标记为热门
        is_featured: i < 10, // 前10个标记为精选
        created_at: now,
        updated_at: now
      };

      const { error } = await supabase
        .from('ai_tools')
        .insert(toolData);

      if (error) {
        console.error(`❌ [${i + 1}/${tools.length}] ${tool.name} - 插入失败: ${error.message}`);
        errorCount++;
      } else {
        console.log(`✅ [${i + 1}/${tools.length}] ${tool.name} - 插入成功`);
        successCount++;
      }

      // 添加延迟，避免速率限制
      if (i > 0 && i % 10 === 0) {
        console.log(`   ⏸️  等待1秒...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error: any) {
      console.error(`❌ [${i + 1}/${tools.length}] ${tool.name} - 错误: ${error.message}`);
      errorCount++;
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("📊 插入统计:");
  console.log("=".repeat(80));
  console.log(`✅ 成功插入: ${successCount} 个`);
  console.log(`⏭️  跳过已存在: ${skipCount} 个`);
  console.log(`❌ 插入失败: ${errorCount} 个`);
  console.log(`📊 总计处理: ${tools.length} 个`);
  console.log("=".repeat(80));

  // 验证插入结果
  const { count } = await supabase
    .from('ai_tools')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📈 当前数据库中的AI工具总数: ${count || 0} 个`);
}

// 执行插入
insertTools()
  .then(() => {
    console.log("\n✅ 任务完成！");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 任务失败:", error);
    process.exit(1);
  });
