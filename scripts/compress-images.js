/**
 * 图片压缩脚本
 * 使用 sharp 库压缩 PNG 和 JPG 图片
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 需要压缩的文件（按优先级排序）
const filesToCompress = [
  // public/assets 目录
  'public/assets/home.png',
  'public/assets/area.png',
  'public/assets/person.png',
  'public/assets/search.png',
  'public/assets/categories.png',
  'public/assets/details.png',
  'public/assets/manage.png',
  'public/assets/publish.png',
  'public/assets/publishdata.png',

  // public 根目录
  'public/og-image.png',
  'public/logo.png',
  'public/favicon.png',
  'public/blog-logo.png',
  'public/android-chrome-512x512.png',
  'public/android-chrome-blog-512x512.png',
  'public/android-chrome-blog-384x384.png',
  'public/android-chrome-blog-192x192.png',
  'public/android-chrome-192x192.png',
  'public/apple-touch-icon.png',
  'public/apple-touch-icon-blog.png',

  // assets 目录
  'assets/image.png',

  // icon 目录
  'public/icon-blog-256x256.png',
  'public/icon-blog-152x152.png',
  'public/icon-blog-144x144.png',
  'public/icon-blog-128x128.png',
  'public/icon-blog-96x96.png',
  'public/icon-blog-72x72.png',
  'public/icon-blog-48x48.png',
];

// 压缩配置
const compressionConfig = {
  png: {
    quality: 80,
    compressionLevel: 9,
  },
  jpg: {
    quality: 85,
  },
};

async function compressImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const stats = fs.statSync(filePath);
  const originalSize = stats.size;

  if (!['.png', '.jpg', '.jpeg'].includes(ext)) {
    console.log(`  ⏭️  跳过 ${filePath} (非 PNG/JPG)`);
    return { skipped: true };
  }

  try {
    let pipeline = sharp(filePath);

    if (ext === '.png') {
      pipeline = pipeline.png({
        quality: compressionConfig.png.quality,
        compressionLevel: compressionConfig.png.compressionLevel,
        adaptiveFiltering: true,
      });
    } else {
      pipeline = pipeline.jpeg({
        quality: compressionConfig.jpg.quality,
        mozjpeg: true,
      });
    }

    const outputBuffer = await pipeline.toBuffer();
    const newSize = outputBuffer.length;

    // 只有当压缩后更小时才保存
    if (newSize < originalSize) {
      fs.writeFileSync(filePath, outputBuffer);
      const saved = originalSize - newSize;
      const percent = ((saved / originalSize) * 100).toFixed(1);
      console.log(`  ✅ ${filePath}`);
      console.log(`     ${formatSize(originalSize)} → ${formatSize(newSize)} (节省 ${percent}%)`);
      return {
        original: originalSize,
        compressed: newSize,
        saved,
        percent,
      };
    } else {
      console.log(`  ⏭️  跳过 ${filePath} (压缩后更大或无变化)`);
      return { skipped: true };
    }
  } catch (error) {
    console.log(`  ❌ 错误 ${filePath}: ${error.message}`);
    return { error: true };
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

async function main() {
  console.log('🖼️  图片压缩工具\n');
  console.log('开始压缩...\n');

  let totalOriginal = 0;
  let totalCompressed = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of filesToCompress) {
    if (!fs.existsSync(file)) {
      console.log(`  ⚠️  文件不存在: ${file}`);
      continue;
    }

    const result = await compressImage(file);

    if (result.error) {
      errors++;
    } else if (result.skipped) {
      skipped++;
    } else {
      totalOriginal += result.original;
      totalCompressed += result.compressed;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n📊 压缩统计:');

  if (totalOriginal > 0) {
    const totalSaved = totalOriginal - totalCompressed;
    const totalPercent = ((totalSaved / totalOriginal) * 100).toFixed(1);
    console.log(`  原始大小: ${formatSize(totalOriginal)}`);
    console.log(`  压缩后: ${formatSize(totalCompressed)}`);
    console.log(`  节省: ${formatSize(totalSaved)} (${totalPercent}%)`);
  }

  console.log(`  跳过: ${skipped} 个文件`);
  console.log(`  错误: ${errors} 个文件`);
  console.log('\n✅ 压缩完成!\n');
}

main().catch(console.error);
