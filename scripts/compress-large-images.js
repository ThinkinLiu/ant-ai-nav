/**
 * 大图片深度压缩脚本
 * 使用更激进的压缩策略处理被跳过的图片
 */

const sharp = require('sharp');
const fs = require('fs');

// 被跳过的文件 - 尝试更激进的压缩
const filesToProcess = [
  'public/og-image.png',
  'public/logo.png',
  'public/favicon.png',
  'public/blog-logo.png',
];

async function compressImage(filePath) {
  const stats = fs.statSync(filePath);
  const originalSize = stats.size;

  console.log(`处理 ${filePath}...`);
  console.log(`  原始大小: ${formatSize(originalSize)}`);

  // 策略1: 使用更低质量重新压缩
  try {
    const buffer1 = await sharp(filePath)
      .png({
        quality: 60,
        compressionLevel: 9,
        adaptiveFiltering: true,
      })
      .toBuffer();

    console.log(`  策略1 (quality=60): ${formatSize(buffer1.length)}`);

    // 策略2: 转换为 WebP（通常更小）
    const webpPath = filePath.replace('.png', '.webp');
    const buffer2 = await sharp(filePath)
      .webp({
        quality: 80,
        effort: 6,
      })
      .toBuffer();

    console.log(`  策略2 (WebP): ${formatSize(buffer2.length)}`);

    // 策略3: 尝试渐进式 JPEG
    const buffer3 = await sharp(filePath)
      .jpeg({
        quality: 80,
        mozjpeg: true,
        progressive: true,
      })
      .toBuffer();

    console.log(`  策略3 (JPEG): ${formatSize(buffer3.length)}`);

    // 选择最小的
    const results = [
      { name: 'PNG(60)', buffer: buffer1, path: filePath },
      { name: 'WebP', buffer: buffer2, path: webpPath },
      { name: 'JPEG', buffer: buffer3, path: filePath.replace('.png', '.jpg') },
    ].filter(r => r.buffer.length < originalSize);

    if (results.length === 0) {
      console.log(`  ❌ 所有策略都无法减小文件大小，保持原样`);
      return { skipped: true };
    }

    // 选择最小的
    const best = results.reduce((min, r) => r.buffer.length < min.buffer.length ? r : min);

    fs.writeFileSync(best.path, best.buffer);

    const saved = originalSize - best.buffer.length;
    const percent = ((saved / originalSize) * 100).toFixed(1);

    console.log(`  ✅ 最佳: ${best.name}, ${formatSize(originalSize)} → ${formatSize(best.buffer.length)} (节省 ${percent}%)`);
    console.log(`     保存为: ${best.path}`);

    return {
      original: originalSize,
      compressed: best.buffer.length,
      saved,
      path: best.path,
    };
  } catch (error) {
    console.log(`  ❌ 错误: ${error.message}`);
    return { error: true };
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

async function main() {
  console.log('🔧 大图片深度压缩工具\n');

  let totalOriginal = 0;
  let totalCompressed = 0;

  for (const file of filesToProcess) {
    if (!fs.existsSync(file)) {
      console.log(`⚠️  文件不存在: ${file}\n`);
      continue;
    }

    const result = await compressImage(file);
    if (result && !result.skipped && !result.error) {
      totalOriginal += result.original;
      totalCompressed += result.compressed;
    }
    console.log('');
  }

  if (totalOriginal > 0) {
    const saved = totalOriginal - totalCompressed;
    const percent = ((saved / totalOriginal) * 100).toFixed(1);
    console.log('='.repeat(50));
    console.log(`📊 总计: ${formatSize(totalOriginal)} → ${formatSize(totalCompressed)} (节省 ${percent}%)`);
  }

  console.log('\n✅ 完成!\n');
}

main().catch(console.error);
