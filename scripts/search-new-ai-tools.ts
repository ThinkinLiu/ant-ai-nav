import { SearchClient, Config } from "coze-coding-dev-sdk";

const SEARCH_QUERIES = [
  "new AI tools released January 2025",
  "latest AI productivity tools 2025",
  "new artificial intelligence apps January 2025",
  "AI tools launched December 2024",
  "new AI software 2025 January",
  "recent AI tools 2025",
  "new AI writing tools January 2025",
  "AI image generators new 2025",
  "AI chat tools released 2025",
  "new AI coding assistants 2025",
];

async function searchNewAITools() {
  console.log("🔍 开始搜索最近一个月的新AI工具...");
  
  const config = new Config();
  const client = new SearchClient(config);

  const allTools: any[] = [];
  const seenUrls = new Set<string>();

  for (let i = 0; i < SEARCH_QUERIES.length; i++) {
    const query = SEARCH_QUERIES[i];
    console.log(`\n📝 搜索 ${i + 1}/${SEARCH_QUERIES.length}: ${query}`);
    
    try {
      const response = await client.advancedSearch(query, {
        searchType: "web",
        count: 15,
        timeRange: "1m",
        needSummary: true,
        needUrl: true,
      });

      if (response.web_items) {
        console.log(`   找到 ${response.web_items.length} 个结果`);
        
        for (const item of response.web_items) {
          if (item.url && !seenUrls.has(item.url)) {
            seenUrls.add(item.url);
            
            const toolName = extractToolName(item.title, item.snippet);
            
            if (toolName && isValidAITool(item.title, item.snippet)) {
              allTools.push({
                name: toolName,
                title: item.title,
                url: item.url,
                siteName: item.site_name,
                snippet: item.snippet,
                summary: item.summary || "",
                publishTime: item.publishTime,
              });
              
              console.log(`   ✓ ${toolName}`);
            }
          }
        }
      }
    } catch (error) {
      console.error(`   ❌ 搜索失败: ${error}`);
    }
  }

  console.log(`\n✅ 共找到 ${allTools.length} 个工具`);
  
  // 输出结果
  console.log("\n" + "=".repeat(80));
  console.log("新AI工具列表：");
  console.log("=".repeat(80));
  
  allTools.slice(0, 100).forEach((tool, index) => {
    console.log(`\n${index + 1}. ${tool.name}`);
    console.log(`   标题: ${tool.title}`);
    console.log(`   URL: ${tool.url}`);
    console.log(`   来源: ${tool.siteName}`);
    console.log(`   发布时间: ${tool.publishTime || '未知'}`);
    console.log(`   描述: ${tool.snippet.substring(0, 200)}...`);
  });

  return allTools;
}

function extractToolName(title: string, snippet: string): string | null {
  const patterns = [
    /(?:^|\s)([A-Z][a-zA-Z0-9]+(?:\s+(?:AI|GPT|Llama|Claude|Copilot|Assistant|Agent|Bot|Studio|Pro|Plus|X))?)\s*(?::|is|launches|released|introduces|announces|new)/i,
    /(?:^|\s)([A-Z][a-zA-Z0-9]+)\s*(?:AI|tool|app|platform|software)/i,
    /(?:called|named|titled)\s+["']?([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)*)/i,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  const cleanedTitle = title.replace(/^(?:New|Latest|Introducing|Launching|Announcing)\s+(?:the\s+)?/i, "").trim();
  
  if (cleanedTitle.split(/\s+/).length <= 5) {
    return cleanedTitle;
  }

  return null;
}

function isValidAITool(title: string, snippet: string): boolean {
  const text = `${title} ${snippet}`.toLowerCase();
  
  const excludeKeywords = [
    'news', 'report', 'article', 'study', 'research', 'paper',
    'company', 'startup', 'funding', 'investment', 'acquisition',
    'stock', 'market', 'price', 'trend', 'analysis',
    'guideline', 'regulation', 'law', 'policy',
    'blog post', 'announcement only'
  ];
  
  for (const keyword of excludeKeywords) {
    if (text.includes(keyword)) {
      if (text.includes('ai tool') || text.includes('ai app') || text.includes('ai software')) {
        continue;
      }
      return false;
    }
  }

  const includeKeywords = [
    'ai', 'artificial intelligence', 'gpt', 'llm', 'chatgpt',
    'machine learning', 'nlp', 'computer vision', 'speech',
    'automation', 'copilot', 'assistant', 'agent', 'bot',
    'llama', 'claude', 'gemini', 'mistral'
  ];
  
  return includeKeywords.some(keyword => text.includes(keyword));
}

// 执行搜索
searchNewAITools().then(tools => {
  console.log("\n✅ 搜索完成！");
  console.log(`\n共收集到 ${tools.length} 个新AI工具`);
}).catch(error => {
  console.error("❌ 搜索失败:", error);
});
