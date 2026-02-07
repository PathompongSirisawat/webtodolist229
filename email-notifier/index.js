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

// URL ของ Backend บน Cloud Run (ห้ามใช้ localhost)
const STRAPI_URL = 'https://strapi-backend-231380388494.asia-southeast1.run.app'; 

exports.checkTodos = async (message, context) => {
  try {
    console.log('🚀 เริ่มตรวจสอบ Todo...');

    // 1. ดึงข้อมูล User และ Todos จาก Strapi
    // ถ้า API มีการล็อค Token ต้องใส่ headers: { Authorization: 'Bearer ...' }
    const response = await axios.get(`${STRAPI_URL}/api/users?populate=*`);
    const users = response.data;

    const emailPromises = [];

    // 2. วนลูปทุก User
    users.forEach(user => {
      if (!user.todos || user.todos.length === 0) return;

      const tasksDueSoon = user.todos.filter(todo => {
        if (todo.completed) return false; // ข้ามงานที่เสร็จแล้ว

        const now = dayjs();
        const dueDate = dayjs(todo.dueDate);
        
        // คำนวณส่วนต่างเป็นนาที
        const diffInMinutes = dueDate.diff(now, 'minute');

        // ⚠️ แก้ตรงนี้ชั่วคราว: ส่งทุกงานที่ยังไม่หมดอายุ (ค่าเป็นบวก)
        // จากเดิม: return diffInMinutes >= 55 && diffInMinutes <= 65;
        return diffInMinutes > 0;
      });

      // 4. ถ้ามีงานใกล้หมดเวลา ให้เตรียมส่ง Email
      if (tasksDueSoon.length > 0) {
        const todoListText = tasksDueSoon.map(t => `- ${t.title} (ครบกำหนด: ${dayjs(t.dueDate).format('HH:mm')})`).join('\n');
        
        const mailOptions = {
          from: '"Todo Alert System" <noreply@example.com>',
          to: user.email,
          subject: '⏳ แจ้งเตือน: งานของคุณจะหมดเวลาใน 1 ชม.',
          text: `สวัสดีคุณ ${user.username},\n\nคุณมีรายการที่ต้องทำในอีก 1 ชั่วโมงข้างหน้า:\n\n${todoListText}\n\nรีบจัดการนะครับ!\nAdmin`
        };

        console.log(`✉️ กำลังส่งหา ${user.email}...`);
        emailPromises.push(transporter.sendMail(mailOptions));
      }
    });

    // รอให้ส่งครบทุกคน
    await Promise.all(emailPromises);
    console.log(`✅ ส่งแจ้งเตือนสำเร็จทั้งหมด ${emailPromises.length} ฉบับ`);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
};