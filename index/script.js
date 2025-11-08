document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
    if (tab.dataset.tab === 'home') animateStats();
  });
});

function animateStats() {
  document.querySelectorAll('.count').forEach(el => {
    const target = +el.dataset.target;
    let num = 0;
    const inc = target / 80;
    const timer = setInterval(() => {
      num += inc;
      if (num >= target) {
        el.textContent = el.parentElement.innerHTML.includes('ТБ') ? target + ' ТБ' : target.toLocaleString();
        clearInterval(timer);
      } else {
        el.textContent = el.parentElement.innerHTML.includes('ТБ') ? Math.floor(num) + ' ТБ' : Math.floor(num).toLocaleString();
      }
    }, 20);
  });
}

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const progress = document.getElementById('progress');
const fill = document.getElementById('fill');
const percent = document.getElementById('percent');
const result = document.getElementById('result');
const link = document.getElementById('link');
const qrcode = document.getElementById('qrcode');
const downloads = document.getElementById('downloads');

dropzone.addEventListener('click', () => fileInput.click());
['dragover', 'dragenter'].forEach(e => dropzone.addEventListener(e, ev => { ev.preventDefault(); dropzone.style.borderColor = '#00ff88'; }));
['dragleave', 'drop'].forEach(e => dropzone.addEventListener(e, () => dropzone.style.borderColor = '#00d4ff'));
dropzone.addEventListener('drop', e => { e.preventDefault(); handleFiles(e.dataTransfer.files); });
fileInput.addEventListener('change', () => handleFiles(fileInput.files));

function handleFiles(files) {
  if (!files.length) return;
  uploadFiles(files);
}

function uploadFiles(files) {
  const formData = new FormData();
  Array.from(files).forEach(f => formData.append('file', f));
  progress.style.display = 'block';
  result.style.display = 'none';
  dropzone.innerHTML = '<i class="fas fa-spinner fa-spin"></i><p>Загружаем...</p>';

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/upload', true);
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
      link.value = location.href + data.id;
      result.style.display = 'block';
      progress.style.display = 'none';
      dropzone.innerHTML = '<i class="fas fa-check"></i><p>Готово!</p><button>ЕЩЁ</button>';
      pollDownloads(data.id);
    }
  };
  xhr.send(formData);
}

document.querySelector('.copy-btn').onclick = () => { link.select(); document.execCommand('copy'); alert('Скопировано!'); };
document.querySelector('.qr-btn').onclick = () => { qrcode.style.display = 'block'; new QRCode(qrcode, { text: link.value, width: 100, height: 100 }); };

function pollDownloads(id) {
  setInterval(() => {
    fetch('/stats/' + id).then(r => r.json()).then(d => downloads.textContent = d.downloads || 0);
  }, 3000);
}

window.addEventListener('load', () => setTimeout(animateStats, 300));
