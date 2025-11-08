const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs-extra');
const app = express();

// ПОРТ И ПАПКА
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = '/app/uploads';
fs.ensureDirSync(UPLOAD_DIR);

// MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const id = uuidv4().slice(0, 12);
    cb(null, id + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

// ГЛАВНАЯ СТРАНИЦА
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>FASTDROP • 500 МБ</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
  <link rel="manifest" href="/manifest.json">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>fastdrop</text></svg>">
  <meta name="theme-color" content="#00d4ff">
  <style>
    :root { --p:#00d4ff; --bg:#0a0a1a; --c:#1a1a2e; --t:#e2e8f0; --tl:#94a3b8; --s:#00ff88; }
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',sans-serif;background:linear-gradient(135deg,#0a0a1a,#1a1a2e);color:var(--t);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
    .box{background:var(--c);border-radius:24px;padding:32px;max-width:500px;width:100%;box-shadow:0 20px 40px rgba(0,212,255,.1);animation:f 0.8s ease-out;border:1px solid rgba(0,212,255,.2)}
    @keyframes f{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
    h1{font-size:32px;font-weight:700;background:linear-gradient(90deg,#00d4ff,#00ff88);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center;margin-bottom:8px}
    .sub{color:var(--tl);text-align:center;margin-bottom:24px;font-size:15px}
    .dz{border:3px dashed #00d4ff;border-radius:16px;padding:40px;text-align:center;cursor:pointer;transition:all .3s;position:relative;overflow:hidden}
    .dz:hover{border-color:#00ff88;background:rgba(0,255,136,.05);transform:translateY(-4px);box-shadow:0 12px 24px rgba(0,212,255,.3)}
    .dz.dragover{border-color:var(--s);background:rgba(0,255,136,.15);animation:p 1.5s infinite}
    @keyframes p{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
    .dz i{font-size:48px;color:#00d4ff;margin-bottom:16px;display:block;animation:bounce 2s infinite}
    @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    .prog{margin-top:20px;display:none}
    .bar{height:10px;background:rgba(255,255,255,.1);border-radius:5px;overflow:hidden}
    .fill{height:100%;background:linear-gradient(90deg,#00d4ff,#00ff88);width:0%;transition:width .1s;border-radius:5px}
    .ptxt{text-align:center;margin-top:8px;font-size:14px;color:var(--tl);font-weight:600}
    .res{margin-top:24px;padding:20px;background:rgba(0,255,136,.1);border-radius:12px;border:1px solid rgba(0,255,136,.3);display:none;animation:f .5s}
    .res input{width:100%;padding:14px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:10px;color:white;font-family:monospace;margin-top:10px;font-size:15px}
    .copy-btn,.pass-btn{margin-top:8px;padding:8px 16px;font-size:14px;border-radius:8px}
    .copy-btn{background:#00d4ff;color:#000}
    .pass-btn{background:#ff6b6b;color:white}
    button{background:linear-gradient(90deg,#00d4ff,#00ff88);color:#0a0a1a;border:none;padding:14px 28px;border-radius:10px;font-weight:700;cursor:pointer;transition:all .3s;font-size:16px}
    button:hover{transform:translateY(-3px);box-shadow:0 10px 20px rgba(0,212,255,.4)}
    .pass-input{margin-top:16px;display:none}
    .pass-input input{width:100%;padding:12px;background:rgba(255,255,255,.1);border:1px solid #ff6b6b;border-radius:8px;color:white}
    .counter{margin-top:8px;font-size:13px;color:var(--tl)}
    @media (max-width:480px){.box{padding:24px}h1{font-size:28px}.dz{padding:32px}}
  </style>
</head>
<body>
  <div class="box">
    <h1>FASTDROP</h1>
    <p class="sub">До 500 МБ • Бесплатно • 7 дней</p>
    <div class="dz" id="dz">
      <i class="fas fa-cloud-upload-alt"></i>
      <p>Перетащи или кликни</p>
      <input type="file" id="fileInput" style="display:none"/>
      <button onclick="document.getElementById('fileInput').click()">ВЫБРАТЬ ФАЙЛ</button>
    </div>
    <div class="prog" id="progress">
      <div class="bar"><div class="fill" id="fill"></div></div>
      <div class="ptxt" id="percent">0%</div>
    </div>
    <div class="res" id="result">
      <p><i class="fas fa-check-circle" style="color:#00ff88"></i> Готово! Ссылка:</p>
      <input type="text" id="link" readonly/>
      <button class="copy-btn" onclick="copyLink()">Копировать</button>
      <button class="pass-btn" onclick="togglePassword()">Пароль</button>
      <div class="pass-input" id="passInput">
        <input type="text" id="password" placeholder="Введите пароль (опционально)" />
      </div>
      <p class="counter">Загрузок: <span id="downloads">0</span></p>
      <p style="font-size:12px;margin-top:8px;color:var(--tl)">Клик → скачивание на Рабочий стол</p>
    </div>
  </div>

  <script>
    const dropzone = document.getElementById('dz');
    const fileInput = document.getElementById('fileInput');
    const progress = document.getElementById('progress');
    const fill = document.getElementById('fill');
    const percent = document.getElementById('percent');
    const result = document.getElementById('result');
    const link = document.getElementById('link');
    const passInput = document.getElementById('passInput');
    const password = document.getElementById('password');
    const downloads = document.getElementById('downloads');

    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => { if (fileInput.files[0]) uploadFile(fileInput.files[0]); });

    ['dragover', 'dragenter'].forEach(e => dropzone.addEventListener(e, ev => { ev.preventDefault(); dropzone.classList.add('dragover'); }));
    ['dragleave', 'drop'].forEach(e => dropzone.addEventListener(e, () => dropzone.classList.remove('dragover')));
    dropzone.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files[0]) uploadFile(e.dataTransfer.files[0]); });

    function uploadFile(file) {
      const formData = new FormData();
      formData.append('file', file);
      const pass = password.value.trim();
      if (pass) formData.append('password', pass);

      progress.style.display = 'block';
      result.style.display = 'none';
      dropzone.innerHTML = '<i class="fas fa-spinner fa-spin"></i><p>Загружаем...</p>';

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/upload');
      xhr.upload.onprogress = e => {
        if (e.lengthComputable) {
          const p = (e.loaded / e.total) * 100;
          fill.style.width = p + '%';
          percent.textContent = Math.round(p) + '%';
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          link.value = location.href + data.id + (pass ? '?p=' + pass : '');
          result.style.display = 'block';
          progress.style.display = 'none';
          dropzone.innerHTML = '<i class="fas fa-check"></i><p>Готово!</p><button onclick="document.getElementById(\'fileInput\').click()">ЕЩЁ</button>';
          fetchDownloads(data.id);
        }
      };
      xhr.send(formData);
    }

    function copyLink() {
      link.select();
      document.execCommand('copy');
      alert('Скопировано!');
    }

    function togglePassword() {
      passInput.style.display = passInput.style.display === 'block' ? 'none' : 'block';
    }

    function fetchDownloads(id) {
      fetch('/stats/' + id).then(r => r.json()).then(d => {
        downloads.textContent = d.downloads || 0;
      });
    }

    // PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  </script>
</body>
</html>
  `);
});

// ЗАГРУЗКА
app.post('/upload', upload.single('file'), (req, res) => {
  const id = req.file.filename.split('.')[0];
  const meta = {
    name: req.file.originalname,
    size: req.file.size,
    password: req.body.password || null,
    downloads: 0
  };
  fs.writeJsonSync(path.join(UPLOAD_DIR, id + '.json'), meta);
  setTimeout(() => {
    fs.remove(path.join(UPLOAD_DIR, req.file.filename)).catch(() => {});
    fs.remove(path.join(UPLOAD_DIR, id + '.json')).catch(() => {});
  }, 7 * 24 * 60 * 60 * 1000);
  res.json({ id });
});

// СКАЧИВАНИЕ
app.get('/:id', (req, res) => {
  const id = req.params.id.split('?')[0];
  const metaPath = path.join(UPLOAD_DIR, id + '.json');
  if (!fs.existsSync(metaPath)) return res.status(404).send('Файл удалён');
  const meta = fs.readJsonSync(metaPath);
  const pass = req.query.p;

  if (meta.password && meta.password !== pass) {
    return res.send('<h1>Введите пароль</h1><input type="text" id="p"><button onclick="location.href=location.pathname+\'?p=\'+document.getElementById(\'p\').value">OK</button>');
  }

  meta.downloads = (meta.downloads || 0) + 1;
  fs.writeJsonSync(metaPath, meta);

  const filePath = path.join(UPLOAD_DIR, id + path.extname(meta.name));
  res.download(filePath, meta.name);
});

// СТАТИСТИКА
app.get('/stats/:id', (req, res) => {
  const metaPath = path.join(UPLOAD_DIR, req.params.id + '.json');
  if (!fs.existsSync(metaPath)) return res.json({ downloads: 0 });
  const meta = fs.readJsonSync(metaPath);
  res.json({ downloads: meta.downloads || 0 });
});

// PWA
app.get('/manifest.json', (req, res) => {
  res.json({
    name: "FASTDROP",
    short_name: "FASTDROP",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a1a",
    theme_color: "#00d4ff",
    icons: [{ src: "/icon.png", sizes: "192x192", type: "image/png" }]
  });
});

app.get('/sw.js', (req, res) => {
  res.send(`self.addEventListener('install', e => self.skipWaiting());`);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('FASTDROP (PWA + Пароль + Счётчик) запущен на порту ' + PORT);
});
