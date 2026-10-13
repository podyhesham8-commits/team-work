# منصة فريق المبرمجين | CodeCollab Hub 🚀

منصة برمجية تعاونية شاملة ومتكاملة لفرق العمل والمطورين، مبنية بواسطة **React + TypeScript + Vite + Tailwind CSS** ومدعومة سحابياً بقاعدة بيانات **Firebase Firestore** وتسجيل الدخول عبر **Google Auth**.

---

## 🌟 الميزات الرئيسية (Features)

1. **تسجيل الدخول بجوجل (Google Authentication):**
   - دخول فوري وآمن بحساب Google وحفظ تلقائي لبيانات البروفايل في Firebase.
2. **إدارة غرف العمل (Tables & Workspaces):**
   - إنشاء غرف عامة أو خاصة محمية برمز مرور (Passcode).
   - تحديد سعة الفريق (2 - 50 مبرمج) ومجال البرمجة (Web, Mobile, AI, Fullstack, etc.).
3. **محرر أكواد حي ومباشر (Live Collaborative IDE):**
   - كتابة الأكواد وتعديلها مع مزامنة لحظية بين أعضاء الفريق.
   - دعم إنشاء ملفات متعددة بأي لغة برمجة (`HTML`, `CSS`, `JS`, `Python`, `JSON`...).
   - معاينة حية تفاعلية (Live Preview) وشاشة كونسول لتشغيل الأكواد واختبارها.
4. **شات وتواصل مخصص للمشروع (Dedicated Team Chat):**
   - محادثات فورية مقتصرة على أعضاء التيم فقط.
   - مشاركة مقتطفات الأكواد البرمجية مباشرة وتفاعلات الإيموجي والمؤثرات الصوتية.
5. **لوحة مهام وتواريخ متطورة (Tasks & Milestones Kanban):**
   - تتبع سير العمل عبر 4 مراحل (قيد الانتظار، جاري العمل، مراجعة الكود، منجز).
   - تعيين الأولويات والمسؤوليات وتواريخ الاستحقاق.
6. **التوثيق والمعمارية البرمجية (Docs & API Specs):**
   - مساحة لتوثيق معمارية النظام، مخططات واجهات البرمجة (APIs)، ومذكرات الاجتماعات.
7. **سجل الإصدارات وتصدير المشروع (Releases & Project Export):**
   - حفظ نسخ الـ Commits وتصدير كامل ملفات المشروع بضغطة زر.
8. **دعم كامل للغتين والمظهر (i18n & Themes):**
   - التبديل الفوري بين اللغة العربية (RTL) والإنجليزية (LTR).
   - الوضع الداكن (Dark) والوضع الفاتح (Light).

---

## 🚀 التشغيل محلياً (Run Locally)

```bash
# 1. تثبيت الحزم والمكتبات
npm install

# 2. تشغيل سيرفر التطوير المحلي
npm run dev

# 3. بناء المشروع للإنتاج (Production Build)
npm run build
```

---

## 📦 الرفع على GitHub (Push to GitHub)

المشروع مهيأ تماماً لرفعه على GitHub والعمل بشكل مباشر:

```bash
git init
git add .
git commit -m "Initial commit: CodeCollab Hub"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

### النشر على GitHub Pages:
تم ضبط `base: './'` في ملف `vite.config.ts`، بحيث تعمل الروابط والملفات النسبية بشكل سليم تماماً عند رفع مجلد `dist` على GitHub Pages أو Vercel أو Netlify.
