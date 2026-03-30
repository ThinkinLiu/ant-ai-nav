import { SearchClient, Config } from "coze-coding-dev-sdk";

const config = new Config();
const client = new SearchClient(config);

// 搜索2026年3月发布的AI工具
const SEARCH_QUERIES = [
  "\"March 2026\" \"AI tool\" launched released",
  "\"March 2026\" artificial intelligence product launch",
  "Product Hunt March 2026 AI tools new",
  "\"launched\" AI tool \"March 2026\"",
  "\"released\" \"March 2026\" AI software",
  "new AI platform \"March 2026\"",
  "AI startup launch \"March 2026\"",
  "2026年3月 AI工具发布",
  "2026年3月人工智能新产品",
  "Product Hunt 2026年3月新品"
];

async function searchMarch2026Tools() {
  console.log("🔍 搜索2026年3月发布的真实AI工具...\n");

  const tools = new Map<string, any>();
  const seenUrls = new Set<string>();

  for (let i = 0; i < SEARCH_QUERIES.length; i++) {
    const query = SEARCH_QUERIES[i];
    console.log(`📝 搜索 ${i + 1}/${SEARCH_QUERIES.length}: ${query}`);

    try {
      const response = await client.advancedSearch(query, {
        searchType: "web",
        count: 10,
        timeRange: "1m",
        needSummary: true,
        needUrl: true,
      });

      if (response.web_items) {
        console.log(`   找到 ${response.web_items.length} 个结果`);

        for (const item of response.web_items) {
          const url = item.url || '';
          const title = item.title || '';
          const snippet = item.snippet || '';

          if (!url) continue;

          // 分析是否包含发布信息
          const toolInfo = analyzeToolInfo(title, url, snippet);
          if (toolInfo && isMarch2026Tool(title, snippet) && !seenUrls.has(url)) {
            seenUrls.add(url);
            tools.set(toolInfo.name, toolInfo);
            console.log(`   ✓ 找到: ${toolInfo.name}`);
          }
        }
      }
    } catch (error) {
      console.error(`   ❌ 搜索失败: ${error}`);
    }
  }

  console.log(`\n✅ 共找到 ${tools.size} 个候选工具\n`);

  // 输出工具列表
  console.log("=".repeat(80));
  console.log("候选工具列表（2026年3月发布）：");
  console.log("=".repeat(80));

  let index = 1;
  for (const [name, tool] of tools) {
    console.log(`\n${index}. ${name}`);
    console.log(`   链接: ${tool.url}`);
    console.log(`   来源: ${tool.source}`);
    console.log(`   描述: ${tool.description.substring(0, 120)}...`);
    index++;
  }

  return Array.from(tools.values());
}

function analyzeToolInfo(title: string, url: string, snippet: string): any | null {
  // 尝试从标题和内容中提取工具信息
  let name = title
    .split('|')[0]
    .split('-')[0]
    .split(':')[0]
    .trim();

  // 清理常见前缀
  name = name
    .replace(/^(?:New|Latest|Introducing|Launching|Announcing|Meet|Discover|Check out)\s*(?:the\s+)?/i, '')
    .replace(/\s+–.*$/, '')
    .replace(/\s+launched.*$/i, '')
    .replace(/\s+released.*$/i, '')
    .trim();

  if (name.length < 2 || name.length > 60) return null;

  // 判断来源
  let source = 'Other';
  if (url.includes('producthunt.com')) {
    source = 'Product Hunt';
  } else if (url.match(/\.ai$/i)) {
    source = 'Official .ai';
  }

  return {
    name: name,
    url: url,
    source: source,
    description: title || snippet,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  };
}

function isMarch2026Tool(title: string, snippet: string): boolean {
  const text = `${title} ${snippet}`.toLowerCase();

  // 关键词匹配：March 2026相关
  const marchKeywords = [
    'march 2026',
    '2026年3月',
    '2026年03月',
    'mar 2026',
    'mar. 2026',
    '2026/03',
    '2026-03'
  ];

  const hasMarch = marchKeywords.some(keyword => text.includes(keyword));

  // 发布动词
  const launchKeywords = [
    'launched',
    'released',
    'announced',
    'introduced',
    'launched',
    '发布',
    '推出',
    '上线',
    '发布'
  ];

  const hasLaunch = launchKeywords.some(keyword => text.includes(keyword));

  // 必须包含发布信息
  return hasMarch || (hasLaunch && (text.includes('2026') || text.includes('三月')));
}

searchMarch2026Tools().then(tools => {
  console.log("\n" + "=".repeat(80));
  console.log("搜索完成！");
  console.log("=".repeat(80));

  // 保存到临时文件
  const fs = require('fs');
  fs.writeFileSync('/tmp/march-2026-tools.json', JSON.stringify(tools, null, 2));
  console.log(`\n💾 候选工具已保存到: /tmp/march-2026-tools.json`);
}).catch(error => {
  console.error("❌ 搜索失败:", error);
});
