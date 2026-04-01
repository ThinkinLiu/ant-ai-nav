import { NextRequest, NextResponse } from "next/server";
import { SearchClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

// 搜索查询列表
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

export async function POST(request: NextRequest) {
  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new SearchClient(config, customHeaders);

    const allTools: any[] = [];
    const seenUrls = new Set<string>();

    // 并行执行所有搜索
    const searchPromises = SEARCH_QUERIES.map(async (query) => {
      try {
        const response = await client.advancedSearch(query, {
          searchType: "web",
          count: 15,
          timeRange: "1m",
          needSummary: true,
          needUrl: true,
        });

        if (response.web_items) {
          response.web_items.forEach((item) => {
            // 去重
            if (item.url && !seenUrls.has(item.url)) {
              seenUrls.add(item.url);
              
              // 提取工具名称
              const toolName = extractToolName(item.title, item.snippet);
              
              if (toolName && isValidAITool(item.title, item.snippet)) {
                allTools.push({
                  name: toolName,
                  title: item.title,
                  url: item.url,
                  siteName: item.site_name,
                  snippet: item.snippet,
                  summary: item.summary || "",
                  publishTime: item.publish_time,
                  description: item.snippet,
                });
              }
            }
          });
        }
      } catch (error) {
        console.error(`Search failed for query: ${query}`, error);
      }
    });

    await Promise.all(searchPromises);

    // 限制为100个
    const tools = allTools.slice(0, 100);

    return NextResponse.json({
      success: true,
      count: tools.length,
      tools: tools.map((tool, index) => ({
        id: index + 1,
        name: tool.name,
        title: tool.title,
        url: tool.url,
        siteName: tool.siteName,
        description: tool.description,
        snippet: tool.snippet,
        summary: tool.summary,
        publishTime: tool.publishTime,
      })),
    });
  } catch (error) {
    console.error("Error fetching new AI tools:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch AI tools" },
      { status: 500 }
    );
  }
}

// 从标题和摘要中提取工具名称
function extractToolName(title: string, snippet: string): string | null {
  // 常见的AI工具命名模式
  const patterns = [
    /(?:^|\s)([A-Z][a-zA-Z0-9]+(?:\s+(?:AI|GPT|Llama|Claude|Copilot|Assistant|Agent|Bot|Studio|Pro|Plus|X|AI))?)\s*(?::|is|launches|released|introduces|announces|new)/i,
    /(?:^|\s)([A-Z][a-zA-Z0-9]+)\s*(?:AI|tool|app|platform|software)/i,
    /(?:called|named|titled)\s+["']?([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)*)/i,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // 如果没有匹配，返回标题本身（清理后）
  const cleanedTitle = title.replace(/^(?:New|Latest|Introducing|Launching|Announcing)\s+(?:the\s+)?/i, "").trim();
  
  // 检查是否看起来像工具名
  if (cleanedTitle.split(/\s+/).length <= 5) {
    return cleanedTitle;
  }

  return null;
}

// 验证是否是有效的AI工具
function isValidAITool(title: string, snippet: string): boolean {
  const text = `${title} ${snippet}`.toLowerCase();
  
  // 排除非AI工具的内容
  const excludeKeywords = [
    'news', 'report', 'article', 'study', 'research', 'paper',
    'company', 'startup', 'funding', 'investment', 'acquisition',
    'stock', 'market', 'price', 'trend', 'analysis',
    'guideline', 'regulation', 'law', 'policy',
    'blog post', 'announcement only'
  ];
  
  for (const keyword of excludeKeywords) {
    if (text.includes(keyword)) {
      // 但如果是"AI tool"、"AI app"等关键词，则不排除
      if (text.includes('ai tool') || text.includes('ai app') || text.includes('ai software')) {
        continue;
      }
      return false;
    }
  }

  // 必须包含AI相关关键词
  const includeKeywords = [
    'ai', 'artificial intelligence', 'gpt', 'llm', 'chatgpt',
    'machine learning', 'nlp', 'computer vision', 'speech',
    'automation', 'copilot', 'assistant', 'agent', 'bot',
    'llama', 'claude', 'gemini', 'mistral'
  ];
  
  return includeKeywords.some(keyword => text.includes(keyword));
}
