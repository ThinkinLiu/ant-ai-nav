import { SearchClient, Config } from "coze-coding-dev-sdk";

// 更精确的搜索查询，专注于具体工具发布
const SEARCH_QUERIES = [
  "Product Hunt AI tools January 2025",
  "Futurepedia new AI tools January 2025",
  "\"just launched\" AI tool January 2025",
  "product launch AI app 2025",
  "AI startup launched January 2025",
  "beta release AI tool 2025",
  "AI software release January 2025",
  "newly launched AI assistant 2025",
  "AI product announcement January 2025",
  "open source AI tool released 2025",
];

async function searchNewAITools() {
  console.log("🔍 开始搜索最近一个月的新AI工具（更精确模式）...");
  
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
        count: 20,
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
            
            if (toolName && isValidAITool(item.title, item.snippet, item.siteName || "")) {
              allTools.push({
                name: toolName,
                title: item.title,
                url: item.url,
                siteName: item.siteName,
                snippet: item.snippet,
                summary: item.summary || "",
                publishTime: item.publish_time,
              });
              
              console.log(`   ✓ ${toolName} (${item.siteName})`);
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
  console.log("新AI工具列表（待确认）：");
  console.log("=".repeat(80));
  
  const uniqueTools = removeDuplicates(allTools);
  const finalTools = uniqueTools.slice(0, 100);
  
  finalTools.forEach((tool, index) => {
    console.log(`\n${index + 1}. ${tool.name}`);
    console.log(`   标题: ${tool.title}`);
    console.log(`   URL: ${tool.url}`);
    console.log(`   来源: ${tool.siteName}`);
    console.log(`   发布时间: ${tool.publishTime || '未知'}`);
    console.log(`   描述: ${tool.snippet.substring(0, 150)}...`);
  });

  // 保存为JSON文件供查看
  const fs = require('fs');
  fs.writeFileSync('/tmp/new-ai-tools.json', JSON.stringify(finalTools, null, 2));
  console.log(`\n💾 工具列表已保存到: /tmp/new-ai-tools.json`);

  return finalTools;
}

function removeDuplicates(tools: any[]): any[] {
  const seen = new Set<string>();
  const unique: any[] = [];
  
  for (const tool of tools) {
    const key = tool.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(tool);
    }
  }
  
  return unique;
}

function extractToolName(title: string, snippet: string): string | null {
  const combined = `${title} ${snippet}`;
  
  // 更精确的工具名称提取模式
  const patterns = [
    // 直接匹配产品名称（大写开头，包含常见AI后缀）
    /([A-Z][a-zA-Z0-9]+(?:\s+(?:AI|GPT|Llama|Claude|Copilot|Assistant|Agent|Bot|Studio|Pro|Plus|X|App|Lab|Hub|Cloud|Flow|Mind|Brain|Core|Zen|Nova|Spark|Beam|Pulse|Wave|Ray|Flux|Vertex|Matrix|Nexus|Sphere|Prime|Elite|Master|Chief|Captain|Genius|Gen|Studio|Work|Craft|Forge|Build|Create|Make|Design|Write|Code|Chat|Talk|Speak|Listen|See|Watch|View|Observe|Analyze|Think|Reason|Learn|Know|Understand|Help|Guide|Lead|Manage|Organize|Plan|Track|Monitor|Report|Alert|Notify|Remind|Schedule|Book|Reserve|Order|Buy|Sell|Trade|Invest|Save|Store|Share|Send|Receive|Connect|Link|Join|Meet|Collaborate|Team|Group|Community|Network|Platform|Service|Tool|Utility|Helper|Assistant|Companion|Partner|Friend|Buddy|Pal|Mate)))\s*(?::|–|—|-|\s+is\s+|\s+launches|\s+released|\s+introduces|\s+announces|\s+presents|\s+unveils|\s+debuts|\s+now\s+available|\s+now\s+live|\s+beta|\s+v[0-9]|alpha|preview)/i,
    // 产品名称 + AI
    /([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)*)\s+AI/i,
    // AI + 产品名称
    /AI\s+([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)*)/i,
    // 简单的产品名称（2-3个单词）
    /(?:launch|release|introduce|announce|present|unveil|debut)\s+(?:the\s+)?(?:new\s+)?(?:AI\s+)?([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)?)/i,
  ];

  for (const pattern of patterns) {
    const match = combined.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      // 过滤掉太短或太长的名称
      if (name.length >= 2 && name.length <= 50 && !/^(?:The|A|An|This|New|Latest|Best|Top|Most|All|Every)\s+$/i.test(name)) {
        return name;
      }
    }
  }

  // 如果没有匹配，返回清理后的标题
  const cleanedTitle = title
    .replace(/^(?:New|Latest|Introducing|Launching|Announcing|Presenting|Unveiling|Debuting|Meet|Discover|Check out)\s+(?:the\s+)?(?:new\s+)?(?:AI\s+)?/i, "")
    .replace(/:\s+Everything\s+you\s+need\s+to\s+know.*/i, "")
    .replace(/:\s+(?:A\s+)?Comprehensive\s+(?:Guide|Review|Overview).*/i, "")
    .replace(/\|\s+Product\s+Hunt.*/i, "")
    .replace(/\s+\-\s+Product\s+Hunt.*/i, "")
    .replace(/\s+\|\s+Futurepedia.*/i, "")
    .trim();
  
  // 检查是否看起来像工具名
  const wordCount = cleanedTitle.split(/\s+/).length;
  if (wordCount >= 1 && wordCount <= 4 && cleanedTitle.length >= 2) {
    return cleanedTitle;
  }

  return null;
}

function isValidAITool(title: string, snippet: string, siteName: string): boolean {
  const text = `${title} ${snippet}`.toLowerCase();
  
  // 排除非工具内容
  const excludeKeywords = [
    'news article', 'news report', 'news update', 'blog post', 'opinion piece',
    'research paper', 'academic paper', 'study results', 'research findings',
    'company funding', 'investment round', 'acquisition deal', 'merger announcement',
    'stock market', 'price analysis', 'market trend', 'financial report',
    'guideline document', 'regulatory policy', 'law proposal', 'legal notice',
    'job posting', 'hiring announcement', 'career opportunity',
    'press release', 'media coverage', 'interview transcript',
    'podcast episode', 'video summary', 'review article', 'comparison chart',
    'listicle', 'top 10 list', 'best of list', 'ranking list',
    'startup news', 'company profile', 'team announcement'
  ];
  
  for (const keyword of excludeKeywords) {
    if (text.includes(keyword)) {
      return false;
    }
  }

  // 必须包含AI相关关键词或来自AI工具网站
  const includeKeywords = [
    'ai', 'artificial intelligence', 'gpt', 'llm', 'chatgpt', 'claude', 'gemini', 'llama',
    'machine learning', 'deep learning', 'nlp', 'natural language', 'computer vision',
    'automation', 'copilot', 'assistant', 'agent', 'bot', 'chatbot', 'ai assistant',
    'ai tool', 'ai app', 'ai software', 'ai platform', 'ai service'
  ];
  
  const hasAIKeyword = includeKeywords.some(keyword => text.includes(keyword));
  const isAIToolSite = /producthunt|futurepedia|thereisanaiforthat|aitools|toolify|superhuman|explodingtopics/i.test(siteName);
  
  return hasAIKeyword || isAIToolSite;
}

// 执行搜索
searchNewAITools().then(tools => {
  console.log("\n✅ 搜索完成！");
  console.log(`\n共收集到 ${tools.length} 个新AI工具`);
}).catch(error => {
  console.error("❌ 搜索失败:", error);
});
