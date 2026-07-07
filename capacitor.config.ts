import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.appxemboi.tarot',
  appName: 'Cõi Vô Thường',
  webDir: 'out',
  server: {
    // Sẽ kết nối trực tiếp đến IP máy tính của bạn khi chạy thử nghiệm
    url: 'http://192.168.1.33:3000', 
    cleartext: true
  }
};

export default config;
