/**
 * ATHLETE CORE - Icon Generator
 * 
 * Gera ícones PNG a partir do SVG base para PWA e App Stores
 * 
 * Uso: npm run generate-icons
 * Requer: npm install sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '../public/icons');
const SPLASH_DIR = path.join(__dirname, '../public/splash');
const SOURCE_SVG = path.join(ICONS_DIR, 'icon.svg');

// Tamanhos necessários para PWA
const PWA_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Tamanhos para iOS Splash Screens
const IOS_SPLASH_SIZES = [
  { width: 2048, height: 2732, name: 'apple-splash-2048-2732' },
  { width: 1668, height: 2388, name: 'apple-splash-1668-2388' },
  { width: 1536, height: 2048, name: 'apple-splash-1536-2048' },
  { width: 1125, height: 2436, name: 'apple-splash-1125-2436' },
  { width: 1242, height: 2688, name: 'apple-splash-1242-2688' },
  { width: 750, height: 1334, name: 'apple-splash-750-1334' },
  { width: 1242, height: 2208, name: 'apple-splash-1242-2208' },
  { width: 640, height: 1136, name: 'apple-splash-640-1136' },
];

async function generateIcons() {
  console.log('🎨 Gerando ícones PWA...\n');

  // Garante que os diretórios existem
  if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true });
  if (!fs.existsSync(SPLASH_DIR)) fs.mkdirSync(SPLASH_DIR, { recursive: true });

  // Verifica se o SVG existe
  if (!fs.existsSync(SOURCE_SVG)) {
    console.error('❌ Arquivo icon.svg não encontrado em', SOURCE_SVG);
    process.exit(1);
  }

  // Gera ícones PWA
  for (const size of PWA_SIZES) {
    const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
    
    await sharp(SOURCE_SVG)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✅ icon-${size}x${size}.png`);
  }

  // Gera ícones especiais
  await sharp(SOURCE_SVG)
    .resize(96, 96)
    .png()
    .toFile(path.join(ICONS_DIR, 'workout-96x96.png'));
  console.log('✅ workout-96x96.png');

  await sharp(SOURCE_SVG)
    .resize(96, 96)
    .png()
    .toFile(path.join(ICONS_DIR, 'meal-96x96.png'));
  console.log('✅ meal-96x96.png');

  await sharp(SOURCE_SVG)
    .resize(72, 72)
    .png()
    .toFile(path.join(ICONS_DIR, 'badge-72x72.png'));
  console.log('✅ badge-72x72.png');

  console.log('\n🖼️ Gerando splash screens iOS...\n');

  // Gera splash screens
  for (const splash of IOS_SPLASH_SIZES) {
    const outputPath = path.join(SPLASH_DIR, `${splash.name}.png`);
    
    // Cria um fundo escuro com o ícone centralizado
    const iconSize = Math.min(splash.width, splash.height) * 0.3;
    
    await sharp({
      create: {
        width: splash.width,
        height: splash.height,
        channels: 4,
        background: { r: 10, g: 10, b: 11, alpha: 1 }
      }
    })
      .composite([{
        input: await sharp(SOURCE_SVG)
          .resize(Math.round(iconSize), Math.round(iconSize))
          .toBuffer(),
        gravity: 'center'
      }])
      .png()
      .toFile(outputPath);
    
    console.log(`✅ ${splash.name}.png`);
  }

  console.log('\n✨ Todos os ícones foram gerados com sucesso!');
}

generateIcons().catch(console.error);

