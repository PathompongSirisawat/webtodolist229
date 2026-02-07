const axios = require('axios');
const nodemailer = require('nodemailer');
const dayjs = require('dayjs');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'todolist.tnclnw007.alert@gmail.com', 
    pass: 'pett wygz xqgg imlm' 
  }
});

const STRAPI_URL = 'https://strapi-backend-231380388494.asia-southeast1.run.app'; 

exports.checkTodos = async (message, context) => {
  try {
    console.log('🚀 เริ่มตรวจสอบ Todo...');

    const response = await axios.get(`${STRAPI_URL}/api/users?populate=*`);
    const users = response.data;

    const emailPromises = [];

    users.forEach(user => {
      if (!user.todos || user.todos.length === 0) return;

      // 1. กรองเฉพาะงานที่ใกล้ถึงกำหนด (ประมาณ 1 ชม.)
      const dueSoonRaw = user.todos.filter(todo => {
        if (todo.completed) return false;

        const now = dayjs();
        const dueDate = dayjs(todo.dueDate);
        const diffInMinutes = dueDate.diff(now, 'minute');

        // คืนค่า true ถ้าเหลือเวลา 50-70 นาที (ครอบคลุม 1 ชม. เผื่อรอบการรัน Scheduler)
        return diffInMinutes >= 50 && diffInMinutes <= 70;
      });

      // 2. กำจัดรายการซ้ำ (De-duplicate) โดยใช้ title เป็นหลัก
      // ถ้าชื่อเหมือนกัน เวลาเดียวกัน จะถูกรวบเหลืออันเดียว
      const uniqueTasks = Array.from(
        dueSoonRaw.reduce((map, item) => {
          const key = `${item.title}-${item.dueDate}`;
          if (!map.has(key)) map.set(key, item);
          return map;
        }, new Map()).values()
      );

      // 3. ถ้ามีรายการเหลืออยู่หลังจากตัดตัวซ้ำแล้ว ให้ส่งเมล
      if (uniqueTasks.length > 0) {
        const todoListText = uniqueTasks
          .map(t => `- ${t.title} (ครบกำหนด: ${dayjs(t.dueDate).format('HH:mm')} น.)`)
          .join('\n');
        
        const mailOptions = {
          from: '"Todo Alert System" <todolist.tnclnw007.alert@gmail.com>',
          to: user.email,
          subject: '⏳ แจ้งเตือน: งานของคุณจะครบกำหนดในอีก 1 ชั่วโมง',
          text: `สวัสดีผู้ใช้บริการเว็บไซต์ Todolist ^^\nคุณ ${user.username},\n\nคุณมีรายการที่ต้องทำในอีกประมาณ 1 ชั่วโมงข้างหน้า:\n\n${todoListText}\n\nอย่าลืมรีบจัดการก่อนหมดเวลานะครับ!\nAdmin`
        };

        console.log(`✉️ กำลังส่งหา ${user.email} (จำนวน ${uniqueTasks.length} รายการ)...`);
        emailPromises.push(transporter.sendMail(mailOptions));
      }
    });

    await Promise.all(emailPromises);
    console.log(`✅ ส่งแจ้งเตือนสำเร็จทั้งหมด ${emailPromises.length} ฉบับ`);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
};