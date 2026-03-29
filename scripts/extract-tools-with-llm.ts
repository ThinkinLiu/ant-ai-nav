import { LLMClient, Config } from "coze-coding-dev-sdk";

const config = new Config();
const llmClient = new LLMClient(config);

async function extractAITools(searchResults: any[]) {
  console.log("🤖 使用LLM提取和验证AI工具信息...\n");
  
  // 分批处理，每次处理10个结果
  const batchSize = 10;
  const validTools: any[] = [];
  
  for (let i = 0; i < searchResults.length; i += batchSize) {
    const batch = searchResults.slice(i, i + batchSize);
    console.log(`\n处理第 ${Math.floor(i / batchSize) + 1}/${Math.ceil(searchResults.length / batchSize)} 批 (${batch.length} 个结果)`);
    
    const prompt = `你是一个AI工具专家。请分析以下搜索结果，提取出真实的、近期发布的AI工具信息。

搜索结果（JSON格式）：
\`\`\`json
${JSON.stringify(batch, null, 2)}
\`\`\`

请仔细判断每条结果是否代表一个真实的AI工具（而非新闻文章、研究报告、公司新闻、融资信息等）。对于真实的AI工具，提取以下信息：

1. **工具名称**（必需）：工具的官方名称
2. **工具类型**（必需）：如"聊天助手"、"图像生成"、"代码辅助"、"视频编辑"、"数据分析"、"智能体"、"自动化工具"等
3. **简短描述**（必需）：1-2句话描述工具的主要功能和特点
4. **官方网址**（必需）：如果搜索结果中的URL是工具官网，直接使用；如果是文章链接，尝试从描述中提取工具的官网域名
5. **发布状态**（可选）：如"已发布"、"Beta测试"、"即将发布"等
6. **核心特性**（可选）：列出2-3个核心功能

判断标准：
- ✅ 是工具：有明确的工具名称、功能描述、可用于实际任务的AI产品
- ❌ 不是工具：新闻报道、公司新闻、融资信息、研究论文、趋势分析、产品榜单、评测文章

请以JSON数组格式返回结果，只包含确认为真实AI工具的条目。格式如下：
\`\`\`json
[
  {
    "name": "工具名称",
    "type": "工具类型",
    "description": "简短描述",
    "url": "官方网址",
    "releaseStatus": "发布状态",
    "features": ["特性1", "特性2"]
  }
]
\`\`\`

如果没有找到真实的AI工具，返回空数组：[]`;

    try {
      const response = await llmClient.invoke({
        model: "doubao-pro-256k",
        messages: [
          { role: "system", content: "你是AI工具识别专家，擅长从搜索结果中提取真实AI工具信息。只返回有效的JSON格式结果。" },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        maxTokens: 2000
      });

      const content = response.getAnswer();
      
      // 提取JSON
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const tools = JSON.parse(jsonMatch[0]);
        validTools.push(...tools);
        
        console.log(`   ✅ 提取到 ${tools.length} 个有效工具`);
        tools.forEach(tool => {
          console.log(`      - ${tool.name}: ${tool.type}`);
        });
      }
    } catch (error) {
      console.error(`   ❌ 处理失败: ${error}`);
    }
  }

  // 去重
  const uniqueTools = removeDuplicates(validTools);
  
  console.log(`\n✅ 共提取到 ${uniqueTools.length} 个真实的AI工具`);
  
  return uniqueTools;
}

function removeDuplicates(tools: any[]): any[] {
  const seen = new Map<string, any>();
  
  for (const tool of tools) {
    const key = tool.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seen.has(key)) {
      seen.set(key, tool);
    }
  }
  
  return Array.from(seen.values());
}

// 读取搜索结果
const fs = require('fs');
const searchResults = JSON.parse(fs.readFileSync('/tmp/new-ai-tools.json', 'utf-8'));

// 提取工具
extractAITools(searchResults).then(tools => {
  // 保存结果
  fs.writeFileSync('/tmp/extracted-ai-tools.json', JSON.stringify(tools, null, 2));
  console.log(`\n💾 提取的工具列表已保存到: /tmp/extracted-ai-tools.json`);
  
  // 生成导入SQL
  generateSQL(tools);
}).catch(error => {
  console.error("❌ 提取失败:", error);
});

function generateSQL(tools: any[]) {
  console.log("\n📊 生成SQL插入语句...");
  
  let sqlStatements: string[] = [];
  
  // 默认分类ID（根据实际情况调整）
  const categoryMap: Record<string, number> = {
    "聊天助手": 1,
    "文本生成": 1,
    "写作工具": 1,
    "图像生成": 2,
    "图像编辑": 2,
    "视频生成": 3,
    "视频编辑": 3,
    "代码辅助": 4,
    "编程工具": 4,
    "数据分析": 5,
    "数据可视化": 5,
    "智能体": 6,
    "Agent": 6,
    "自动化工具": 7,
    "工作流自动化": 7,
    "办公工具": 8,
    "生产力工具": 8
  };

  // 获取当前时间戳
  const now = new Date();
  const timestamp = now.toISOString();
  
  tools.forEach((tool, index) => {
    const categoryId = categoryMap[tool.type] || 1; // 默认分类
    
    // 构造工具数据
    const toolData = {
      name: tool.name,
      slug: tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: tool.description,
      url: tool.url,
      category_id: categoryId,
      logo: '', // 空logo，让系统自动生成
      tags: JSON.stringify([tool.type, "新工具"]),
      rating: 4.5, // 默认评分
      visits: 0,
      is_hot: true, // 标记为热门
      is_featured: false,
      created_at: timestamp,
      updated_at: timestamp
    };
    
    const sql = `INSERT INTO ai_tools (name, slug, description, url, category_id, logo, tags, rating, visits, is_hot, is_featured, created_at, updated_at) VALUES ('${toolData.name.replace(/'/g, "''")}', '${toolData.slug}', '${toolData.description.replace(/'/g, "''")}', '${toolData.url}', ${toolData.category_id}, '${toolData.logo}', '${toolData.tags.replace(/'/g, "''")}', ${toolData.rating}, ${toolData.visits}, ${toolData.is_hot}, ${toolData.is_featured}, '${toolData.created_at}', '${toolData.updated_at}');`;
    
    sqlStatements.push(sql);
  });
  
  // 保存SQL文件
  fs.writeFileSync('/tmp/insert-tools.sql', sqlStatements.join('\n'));
  console.log(`\n💾 SQL插入语句已保存到: /tmp/insert-tools.sql`);
  console.log(`\n📝 提示：将这些SQL语句在Supabase SQL编辑器中执行即可导入工具`);
}
