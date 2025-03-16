# My Todo App

แอปพลิเคชันจัดการงานแบบ Async ที่ช่วยให้คุณจัดการโปรเจกต์และงานต่างๆ ได้อย่างมีประสิทธิภาพ มีฟีเจอร์การทำงานแบบออฟไลน์และการซิงค์ข้อมูลอัตโนมัติ

## ✨ คุณสมบัติ

- 🗂️ สร้างและจัดการโปรเจกต์ได้หลากหลาย
- ✅ ระบบการจัดการงานพร้อมระดับความสำคัญ (สูง, กลาง, ต่ำ)
- 🔄 แบ่งงานใหญ่เป็นงานย่อยเพื่อติดตามได้ง่าย
- 📊 แสดงสถิติและความคืบหน้าของงานแบบเรียลไทม์
- 🌓 รองรับโหมดมืดและโหมดสว่าง
- 📱 ออกแบบ UI ที่ใช้งานง่ายและสวยงาม

## 🛠️ เทคโนโลยีที่ใช้

- [React Native](https://reactnative.dev/) - Framework หลักในการพัฒนา
- [TypeScript](https://www.typescriptlang.org/) - เพิ่มความแข็งแกร่งด้วยระบบ Type
- [React Navigation](https://reactnavigation.org/) - การนำทางระหว่างหน้าจอ
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) - จัดเก็บข้อมูลแบบออฟไลน์
- [React Native Vector Icons](https://github.com/oblador/react-native-vector-icons) - ไอคอนสวยงาม

## 🚀 การติดตั้ง

1. Clone โปรเจกต์นี้
   ```bash
   git clone https://github.com/sosawz/my-todo-app.git
   cd my-todo-app
   ```

2. ติดตั้ง dependencies
   ```bash
   expo install
   ```

3. รันแอปพลิเคชัน
   ```bash
   npx expo run
   # หรือ
   yarn start
   ```

4. รันบน Emulator หรืออุปกรณ์
   ```bash
   # สำหรับ Android
   npx expo run:android

   # สำหรับ iOS
   npx expo run:ios
   ```