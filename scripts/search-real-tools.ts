import { SearchClient, Config } from "coze-coding-dev-sdk";

const config = new Config();
const client = new SearchClient(config);

// 搜索最近一个月发布的真实AI工具
const SEARCH_QUERIES = [
  "Product Hunt AI tools March 2025",
  "Product Hunt AI tools new released",
  "new AI tool released site:producthunt.com",
  "AI assistant launched March 2025",
  "new AI writing tool 2025",
  "new AI image generator 2025",
  "new AI video tool 2025",
  "AI startup launch 2025",
  "new AI coding tool 2025",
  "new AI productivity tool 2025"
];

async function searchRealAITools() {
  console.log("🔍 搜索最近1个月真实发布的AI工具...\n");

  const tools = new Map<string, any>();
  const seenUrls = new Set<string>();

  for (let i = 0; i < SEARCH_QUERIES.length; i++) {
    const query = SEARCH_QUERIES[i];
    console.log(`📝 搜索 ${i + 1}/${SEARCH_QUERIES.length}: ${query}`);

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
          const url = item.url || '';
          const title = item.title || '';
          const snippet = item.snippet || '';

          // 过滤：必须是真实工具的页面
          if (!url) continue;

          // 优先Product Hunt页面（通常包含真实工具信息）
          if (url.includes('producthunt.com')) {
            // 提取工具名称和URL
            const toolInfo = extractFromProductHunt(title, url, snippet);
            if (toolInfo && !seenUrls.has(url)) {
              seenUrls.add(url);
              tools.set(toolInfo.name, toolInfo);
              console.log(`   ✓ 找到工具: ${toolInfo.name}`);
            }
          }
          // 也可以是官方发布页面
          else if (url.match(/^(https?:\/\/)?(www\.)?[a-z0-9]+([-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i)) {
            // 简单的URL格式检查
            const toolInfo = extractFromOfficialPage(title, url, snippet);
            if (toolInfo && !seenUrls.has(url)) {
              seenUrls.add(url);
              tools.set(toolInfo.name, toolInfo);
              console.log(`   ✓ 找到工具: ${toolInfo.name}`);
            }
          }
        }
      }
    } catch (error) {
      console.error(`   ❌ 搜索失败: ${error}`);
    }
  }

  console.log(`\n✅ 共找到 ${tools.size} 个候选工具`);

  // 输出工具列表
  console.log("\n" + "=".repeat(80));
  console.log("候选工具列表：");
  console.log("=".repeat(80));

  let index = 1;
  for (const [name, tool] of tools) {
    console.log(`\n${index}. ${name}`);
    console.log(`   链接: ${tool.url}`);
    console.log(`   来源: ${tool.source}`);
    console.log(`   描述: ${tool.description.substring(0, 100)}...`);
    index++;
  }

  return Array.from(tools.values());
}

function extractFromProductHunt(title: string, url: string, snippet: string) {
  // Product Hunt URL格式: https://www.producthunt.com/posts/tool-name
  const match = url.match(/producthunt\.com\/posts\/([a-z0-9-]+)/i);
  if (!match) return null;

  const slug = match[1];
  // 转换slug为工具名称
  const name = slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  return {
    name: name,
    url: url,
    source: 'Product Hunt',
    description: title || snippet,
    slug: slug
  };
}

function extractFromOfficialPage(title: string, url: string, snippet: string) {
  // 从标题提取工具名
  let name = title
    .replace(/-.*$/, '') // 移除副标题
    .replace(/\|.*/, '') // 移除站点名称
    .trim();

  // 清理名称
  name = name.replace(/^(?:Launch|Introducing|New|Announcing|Presenting|Meet|Discover)\s*(?:the\s+)?/i, '');

  if (name.length < 2 || name.length > 50) return null;

  return {
    name: name,
    url: url,
    source: 'Official',
    description: title || snippet,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  };
}

searchRealAITools().then(tools => {
  console.log("\n" + "=".repeat(80));
  console.log("搜索完成！");
  console.log("=".repeat(80));

  // 保存到临时文件
  const fs = require('fs');
  fs.writeFileSync('/tmp/candidate-tools.json', JSON.stringify(tools, null, 2));
  console.log(`\n💾 候选工具已保存到: /tmp/candidate-tools.json`);
}).catch(error => {
  console.error("❌ 搜索失败:", error);
});
