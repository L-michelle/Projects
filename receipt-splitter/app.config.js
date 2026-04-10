export default {
  expo: {
    name: 'Receipt Splitter',
    slug: 'receipt-splitter',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: ['CAMERA', 'READ_MEDIA_IMAGES', 'READ_EXTERNAL_STORAGE'],
    },
    extra: {
      visionApiKey: process.env.GOOGLE_CLOUD_VISION_API_KEY ?? '',
    },
  },
};
