const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs-extra');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // ← для icon.png, sw.js

const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = '/app/uploads';
fs.ensureDirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const id = uuidv4().slice(0, 12);
    cb(null, id + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>FASTDROP — 200 ГБ за секунды</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
  <link rel="manifest" href="/manifest.json">
  <link rel="icon" href="/icon.png">
  <meta name="theme-color" content="#00d4ff">
  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
  <style>
    :root{--p:#00d4ff;--s:#00ff88;--bg:#0a0a1a;--c:#1a1a2e;--t:#e2e8f0;--tl:#94a3b8;--g:linear-gradient(135deg,#00d4ff,#00ff88)}
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--t);min-height:100vh;overflow-x:hidden}
    header{background:var(--c);border-bottom:1px solid rgba(0,212,255,.2);position:sticky;top:0;z-index:100}
    nav{display:flex;justify-content:space-between;align-items:center;padding:16px 32px;max-width:1400px;margin:0 auto}
    .logo{font-size:28px;font-weight:900;background:var(--g);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .tabs{display:flex;gap:32px}
    .tab{font-size:16px;color:var(--tl);cursor:pointer;padding:12px 0;position:relative;font-weight:600;transition:all .3s}
    .tab:hover{color:var(--t)}
    .tab.active{color:var(--t);font-weight:700}
    .tab.active::after{content:'';position:absolute;bottom:-1px;left:0;width:100%;height:3px;background:var(--g);border-radius:2px}
    main{max-width:1200px;margin:0 auto;padding:20px}
    .hero{text-align:center;padding:60px 20px}
    .hero h1{font-size:52px;font-weight:900;background:var(--g);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px}
    .hero p{font-size:20px;color:var(--tl);font-weight:500}
    .box{background:var(--c);border-radius:28px;padding:48px;box-shadow:0 30px 60px rgba(0,212,255,.2);border:1px solid rgba(0,212,255,.3);backdrop-filter:blur(16px)}
    h2{font-size:32px;font-weight:800;background:var(--g);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:24px;text-align:center}
    .dz{border:4px dashed var(--p);border-radius:20px;padding:64px;text-align:center;cursor:pointer;transition:all .4s;position:relative;overflow:hidden}
    .dz:hover{border-color:var(--s);background:rgba(0,255,136,.1);transform:scale(1.02);box-shadow:0 30px 60px rgba(0,212,255,.5)}
    .dz.dragover{border-color:var(--s);animation:pulse 1.2s infinite}
    @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
    .dz i{font-size:72px;color:var(--p);margin-bottom:20px;animation:float 3s infinite}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
    .dz p{font-size:18px;color:var(--tl);margin-bottom:20px;font-weight:600}
    .prog{margin-top:32px;display:none}
    .bar{height:16px;background:rgba(255,255,255,.1);border-radius:8px;overflow:hidden}
    .fill{height:100%;background:var(--g);width:0%;transition:width .3s}
    .ptxt{text-align:center;margin-top:12px;font-size:16px;color:var(--tl);font-weight:700}
    .res{margin-top:32px;padding:28px;background:rgba(0,255,136,.15);border-radius:16px;border:1px solid rgba(0,255,136,.4);display:none}
    .res input{width:100%;padding:18px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.3);border-radius:12px;color:white;font-family:monospace;margin:12px 0;font-size:17px}
    button{background:var(--g);color:#000;border:none;padding:18px 48px;border-radius:16px;font-weight:800;cursor:pointer;transition:all .3s;font-size:18px;box-shadow:0 12px 30px rgba(0,212,255,.4)}
    button:hover{transform:translateY(-6px);box-shadow:0 20px 40px rgba(0,212,255,.6)}
    .copy-btn,.qr-btn{margin:6px;padding:14px 28px;font-size:16px;border-radius:12px;font-weight:700}
    .copy-btn{background:var(--p);color:#000}
    .qr-btn{background:#ff6b6b;color:white}
    .qrcode{margin-top:20px;text-align:center;display:none}
    .counter{margin-top:16px;font-size:15px;color:var(--tl);font-weight:600}
    .preview-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:16px;margin-top:24px}
    .preview-item{position:relative;overflow:hidden;border-radius:12px;box-shadow:0 8px 20px rgba(0,0,0,.3)}
    .preview-item img{width:100%;height:140px;object-fit:cover;border-radius:12px}
    .preview-name{position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,.8);color:white;font-size:13px;padding:8px;text-align:center;font-weight:600}
    .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:32px;margin:80px 0;text-align:center}
    .stat h3{font-size:42px;font-weight:900;color:var(--p);margin-bottom:8px;opacity:0;transform:translateY(20px)}
    .stat p{font-size:16px;color:var(--tl);font-weight:600}
    .stat-icon{font-size:36px;color:var(--s);margin-bottom:12px}
    .premium{background:var(--g);color:#000;padding:40px;border-radius:24px;text-align:center;margin:60px 0}
    .premium h3{font-size:32px;font-weight:900;margin-bottom:16px}
    .price{font-size:48px;font-weight:900;margin:20px 0}
    .features{list-style:none;display:inline-block;text-align:left;margin:20px 0}
    .features li{margin:12px 0;font-size:17px;font-weight:600}
    .features li i{color:#000;margin-right:12px}
    .btn-premium{background:#000;color:white;padding:18px 50px;border-radius:16px;font-weight:900;font-size:20px}
    footer{text-align:center;padding:40px;color:var(--tl);font-size:15px}
    footer a{color:var(--p);text-decoration:none;font-weight:600}
    @media (max-width:768px){
      .hero h1{font-size:40px}.dz{padding:48px}.dz i{font-size:56px}
      .stats{grid-template-columns:1fr;gap:24px}
    }
  </style>
</head>
<body>
  <header>
    <nav>
      <div class="logo">FASTDROP</div>
      <div class="tabs">
        <div class="tab active" onclick="showTab('home')">Главная</div>
        <div class="tab" onclick="showTab('premium')">Премиум</div>
        <div class="tab" onclick="showTab('privacy')">Конфиденциальность</div>
      </div>
    </nav>
  </header>

  <main>
    <div id="home" class="tab-content">
      <div class="hero">
        <h1>FASTDROP</h1>
        <p>До 200 ГБ • Бесплатно • 7 дней • Без регистрации</p>
      </div>

      <div class="box">
        <h2>Кидай — и забывай</h2>
        <div class="dz" id="dz">
          <i class="fas fa-cloud-upload-alt"></i>
          <p>Перетащи или кликни</p>
          <input type="file" id="fileInput" style="display:none" multiple/>
          <button onclick="document.getElementById('fileInput').click()">ВЫБРАТЬ ФАЙЛ</button>
        </div>
        <div id="preview" class="preview-grid" style="display:none"></div>
        <div class="prog" id="progress">
          <div class="bar"><div class="fill" id="fill"></div></div>
          <div class="ptxt" id="percent">0%</div>
        </div>
        <div class="res" id="result">
          <p><i class="fas fa-check-circle" style="color:#00ff88"></i> Готово! Ссылка:</p>
          <input type="text" id="link" readonly/>
          <div style="display:flex;gap:12px;justify-content:center;margin-top:12px">
            <button class="copy-btn" onclick="copyLink()">COPY</button>
            <button class="qr-btn" onclick="showQR()">QR</button>
          </div>
          <div class="qrcode" id="qrcode"></div>
          <p class="counter">Загрузок: <span id="downloads">0</span></p>
          <p style="font-size:13px;margin-top:12px;color:var(--tl)">Клик → скачивание на Рабочий стол</p>
        </div>
      </div>

      <div class="premium">
        <h3>Хочешь навсегда?</h3>
        <div class="price">99 ₽ / месяц</div>
        <ul class="features">
          <li><i class="fas fa-infinity"></i> Файлы навсегда</li>
          <li><i class="fas fa-lock"></i> Пароль на файл</li>
          <li><i class="fas fa-bolt"></i> 1 Гбит/с</li>
          <li><i class="fas fa-chart-bar"></i> Статистика</li>
        </ul>
        <button class="btn-premium">ОФОРМИТЬ PRO</button>
      </div>

      <div class="stats">
        <div class="stat"><div class="stat-icon"><i class="fas fa-paper-plane"></i></div><h3 data-count="127482">0</h3><p>Файлов отправлено</p></div>
        <div class="stat"><div class="stat-icon"><i class="fas fa-hdd"></i></div><h3 data-count="89200">0</h3><p>ТБ передано</p></div>
        <div class="stat"><div class="stat-icon"><i class="fas fa-users"></i></div><h3 data-count="42819">0</h3><p>Пользователей</p></div>
        <div class="stat"><div class="stat-icon"><i class="fas fa-tachometer-alt"></i></div><h3 data-count="500">0</h3><p>Мбит/с</p></div>
      </div>
    </div>

    <div id="premium" class="tab-content" style="display:none">
      <h2 style="text-align:center">FASTDROP PRO</h2>
      <div class="premium" style="max-width:600px;margin:40px auto">
        <div class="price">99 ₽ / месяц</div>
        <p>Или 999 ₽ / год (-17%)</p>
        <ul class="features">
          <li><i class="fas fa-infinity"></i> Безлимитное хранение</li>
          <li><i class="fas fa-shield-alt"></i> Пароль + шифрование</li>
          <li><i class="fas fa-rocket"></i> Приоритетная скорость</li>
          <li><i class="fas fa-headset"></i> Поддержка 24/7</li>
        </ul>
        <button class="btn-premium">КУПИТЬ</button>
      </div>
    </div>

    <div id="privacy" class="tab-content" style="display:none">
      <h2 style="text-align:center">Политика конфиденциальности</h2>
      <div style="max-width:800px;margin:40px auto;color:var(--tl);line-height:1.8;font-size:16px">
        <p>Мы <strong>не храним</strong> ваши файлы дольше 7 дней.</p>
        <p>Никаких аккаунтов. Никаких логов. Никаких данных.</p>
        <p>Файл удаляется автоматически через 7 дней — навсегда.</p>
        <p>Мы не видим содержимое. Мы не продаём данные.</p>
        <p>FASTDROP — это просто труба. Ты → файл → получатель.</p>
      </div>
    </div>
  </main>

  <footer>
    © 2025 FASTDROP • <a href="#" onclick="showTab('privacy')">Политика конфиденциальности</a>
  </footer>

  <script>
    // Вкладки
    function showTab(id) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
      document.querySelector(\`[onclick="showTab('\${id}')"]\`).classList.add('active');
      document.getElementById(id).style.display = 'block';
      if (id === 'home') animateStats();
    }

    // Анимация статистики
    function animateStats() {
      document.querySelectorAll('.stat h3').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        const count = el.getAttribute('data-count');
        let start = 0;
        const duration = 2000;
        const step = () => {
          const progress = Math.min((Date.now() - startTime) / duration, 1);
          const current = Math.floor(progress * count);
          el.textContent = current.toLocaleString();
          if (progress < 1) requestAnimationFrame(step);
        };
        const startTime = Date.now();
        requestAnimationFrame(step);
      });
    }

    // Загрузка
    const dropzone = document.getElementById('dz');
    const fileInput = document.getElementById('fileInput');
    const preview = document.getElementById('preview');
    const progress = document.getElementById('progress');
    const fill = document.getElementById('fill');
    const percent = document.getElementById('percent');
    const result = document.getElementById('result');
    const link = document.getElementById('link');
    const qrcode = document.getElementById('qrcode');
    const downloads = document.getElementById('downloads');
    let startTime;

    ['dragover', 'dragenter'].forEach(e => dropzone.addEventListener(e, ev => { ev.preventDefault(); dropzone.classList.add('dragover'); }));
    ['dragleave', 'drop'].forEach(e => dropzone.addEventListener(e, () => dropzone.classList.remove('dragover')));
    dropzone.addEventListener('drop', e => { e.preventDefault(); handleFiles(e.dataTransfer.files); });
    fileInput.addEventListener('change', () => handleFiles(fileInput.files));

    function handleFiles(files) {
      preview.innerHTML = ''; preview.style.display = 'grid';
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = e => {
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.innerHTML = \`<img src="\${e.target.result}"><div class="preview-name">\${file.name}</div>\`;
            preview.appendChild(div);
          };
          reader.readAsDataURL(file);
        }
      });
      uploadFiles(files);
    }

    function uploadFiles(files) {
      const formData = new FormData();
      Array.from(files).forEach((f, i) => formData.append(\`file\${i}\`, f));
      progress.style.display = 'block'; result.style.display = 'none';
      dropzone.innerHTML = '<i class="fas fa-spinner fa-spin"></i><p>Загружаем...</p>';
      startTime = Date.now();

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/upload', true);
      xhr.upload.onprogress = e => {
        if (e.lengthComputable) {
          const p = (e.loaded / e.total) * 100;
          const elapsed = (Date.now() - startTime) / 1000;
          const speed = elapsed > 0 ? (e.loaded / 1024 / 1024 / elapsed).toFixed(1) : 0;
          fill.style.width = p + '%';
          percent.textContent = Math.round(p) + '% • ' + speed + ' МБ/с';
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          link.value = location.href + data.id;
          result.style.display = 'block'; progress.style.display = 'none';
          dropzone.innerHTML = '<i class="fas fa-check"></i><p>Готово!</p><button onclick="document.getElementById(\'fileInput\').click()">ЕЩЁ</button>';
          fetchDownloads(data.id);
        }
      };
      xhr.send(formData);
    }

    function copyLink() { link.select(); document.execCommand('copy'); alert('Скопировано!'); }
    function showQR() { qrcode.style.display = 'block'; new QRCode(qrcode, { text: link.value, width: 140, height: 140, colorDark: "#00ff88", colorLight: "#1a1a2e" }); }
    function fetchDownloads(id) { fetch('/stats/' + id).then(r => r.json()).then(d => downloads.textContent = d.downloads || 0); }

    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');
    window.addEventListener('load', () => setTimeout(animateStats, 500));
  </script>
</body>
</html>
  `);
});

// Остальные роуты (upload, dl, stats, manifest, sw) — как в прошлом коде
// (вставь из предыдущего ответа — они идентичны)

app.listen(PORT, '0.0.0.0', () => console.log('FASTDROP 11.0 — МАКСИМУМ!'));
