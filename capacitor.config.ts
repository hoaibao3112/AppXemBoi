import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.appxemboi.tarot',
  appName: 'Cõi Vô Thường',
  webDir: 'out',
  server: {
    // Thay đổi URL này thành địa chỉ website online thực tế của bạn sau khi deploy (ví dụ: https://appxemboi.com)
    url: 'http://192.168.1.2:3000', 
    cleartext: true
  }
};

export default config;
