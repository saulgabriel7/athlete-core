# 📱 ATHLETE CORE - Guia Mobile App

Este guia explica como transformar o ATHLETE CORE em um app mobile nativo para iOS e Android.

## Fase 1: PWA (Progressive Web App) ✅

A PWA já está configurada! Os usuários podem "instalar" o app direto do navegador.

### Como Instalar (Usuários)

**No iPhone/Safari:**
1. Abra o site no Safari
2. Toque no botão "Compartilhar" (ícone de seta para cima)
3. Role e toque em "Adicionar à Tela de Início"
4. Confirme tocando em "Adicionar"

**No Android/Chrome:**
1. Abra o site no Chrome
2. Um banner aparecerá sugerindo "Adicionar à tela inicial"
3. Ou toque no menu (3 pontos) → "Instalar app"

### Gerar Ícones

```bash
# Instale o Sharp
npm install sharp --save-dev

# Adicione o script ao package.json
# "generate-icons": "node scripts/generate-icons.js"

# Execute
npm run generate-icons
```

---

## Fase 2: Capacitor (App Nativo)

O [Capacitor](https://capacitorjs.com/) permite empacotar o app web como app nativo para publicação na App Store e Google Play.

### Pré-requisitos

- **iOS**: macOS + Xcode (gratuito na App Store)
- **Android**: Android Studio (gratuito)
- Node.js 18+

### Instalação

```bash
# 1. Instale o Capacitor
npm install @capacitor/core @capacitor/cli

# 2. Inicialize o projeto
npx cap init "ATHLETE CORE" "com.athletecore.app"

# 3. Instale as plataformas
npm install @capacitor/ios @capacitor/android

# 4. Adicione as plataformas
npx cap add ios
npx cap add android
```

### Configuração

Edite o arquivo `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.athletecore.app',
  appName: 'ATHLETE CORE',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0a0a0b',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0a0b'
    },
    Keyboard: {
      resize: 'native'
    }
  },
  ios: {
    contentInset: 'always'
  }
};

export default config;
```

### Build & Deploy

```bash
# 1. Build do Astro
npm run build

# 2. Sincroniza com as plataformas nativas
npx cap sync

# 3. Abre no Xcode (iOS)
npx cap open ios

# 4. Abre no Android Studio (Android)
npx cap open android
```

### Plugins Úteis

```bash
# Notificações Push
npm install @capacitor/push-notifications

# Armazenamento local
npm install @capacitor/preferences

# Câmera (fotos de progresso)
npm install @capacitor/camera

# Haptics (feedback tátil)
npm install @capacitor/haptics

# App Info
npm install @capacitor/app

# Status Bar
npm install @capacitor/status-bar

# Splash Screen
npm install @capacitor/splash-screen
```

### Exemplo: Configurar Push Notifications

```typescript
// src/services/notifications.ts
import { PushNotifications } from '@capacitor/push-notifications';

export async function setupPushNotifications() {
  // Solicita permissão
  let permStatus = await PushNotifications.checkPermissions();
  
  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }
  
  if (permStatus.receive !== 'granted') {
    console.log('Permissão de notificação negada');
    return;
  }

  // Registra para receber notificações
  await PushNotifications.register();

  // Listeners
  PushNotifications.addListener('registration', (token) => {
    console.log('Push token:', token.value);
    // Envie o token para seu backend
  });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Notificação recebida:', notification);
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Ação na notificação:', notification);
  });
}
```

---

## Publicação nas Stores

### Apple App Store

1. **Conta de Desenvolvedor**: $99/ano em [developer.apple.com](https://developer.apple.com)
2. **Certificados**: Crie em Certificates, Identifiers & Profiles
3. **App Store Connect**: Configure o app, screenshots, descrição
4. **Archive**: No Xcode, Product → Archive → Distribute App

### Google Play Store

1. **Conta de Desenvolvedor**: $25 única em [play.google.com/console](https://play.google.com/console)
2. **Keystore**: Gere uma chave de assinatura
3. **Play Console**: Configure o app, screenshots, descrição
4. **Build**: No Android Studio, Build → Generate Signed Bundle/APK

---

## Estrutura Recomendada

```
athlete-core-web/
├── android/                 # Projeto Android (gerado pelo Capacitor)
├── ios/                     # Projeto iOS (gerado pelo Capacitor)
├── public/
│   ├── icons/              # Ícones do app
│   ├── splash/             # Splash screens
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service Worker
│   └── offline.html        # Página offline
├── src/
│   ├── services/
│   │   └── capacitor.ts    # Integrações Capacitor
│   └── ...
├── capacitor.config.ts     # Config do Capacitor
└── package.json
```

---

## Checklist de Publicação

### iOS
- [ ] Ícone 1024x1024 (sem transparência)
- [ ] Screenshots iPhone (6.5", 5.5")
- [ ] Screenshots iPad (12.9", 11")
- [ ] Descrição do app
- [ ] Palavras-chave
- [ ] Política de privacidade URL
- [ ] Categoria: Saúde e Fitness

### Android
- [ ] Ícone 512x512
- [ ] Feature Graphic 1024x500
- [ ] Screenshots (min. 2)
- [ ] Descrição curta (80 chars)
- [ ] Descrição completa (4000 chars)
- [ ] Política de privacidade URL
- [ ] Categoria: Saúde e Fitness

---

## Recursos

- [Capacitor Docs](https://capacitorjs.com/docs)
- [PWA Builder](https://www.pwabuilder.com/) - Testa e melhora sua PWA
- [Maskable.app](https://maskable.app/) - Editor de ícones maskable
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/console/about/guides/grow/)

