const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// 中間件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 根路由 - 必須有回應
app.get('/', (req, res) => {
  console.log('首頁被訪問');
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>小跑豬海運系統</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft JhengHei', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          text-align: center;
          padding: 40px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 600px;
          margin: 20px;
        }
        h1 {
          color: #333;
          font-size: 2.5em;
          margin-bottom: 20px;
        }
        p {
          color: #666;
          font-size: 1.2em;
          margin-bottom: 30px;
        }
        .status {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
        }
        .status-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .status-item:last-child {
          border-bottom: none;
        }
        .buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-top: 30px;
        }
        .btn {
          display: inline-block;
          padding: 15px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 600;
          transition: transform 0.3s;
        }
        .btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        .btn-secondary {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }
        .btn-secondary:hover {
          background: #f8f9fa;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>��� 小跑豬海運系統</h1>
        <p>專業的傢俱海運服務平台</p>
        
        <div class="status">
          <div class="status-item">
            <span>系統狀態</span>
            <span style="color: #4CAF50;">✅ 運行中</span>
          </div>
          <div class="status-item">
            <span>服務端口</span>
            <span>${PORT}</span>
          </div>
          <div class="status-item">
            <span>環境</span>
            <span>${process.env.NODE_ENV || 'production'}</span>
          </div>
          <div class="status-item">
            <span>版本</span>
            <span>v4.0.0</span>
          </div>
        </div>
        
        <div class="buttons">
          <a href="/calculator" class="btn">運費計算</a>
          <a href="/tracking" class="btn">貨物追蹤</a>
          <a href="/login" class="btn btn-secondary">登入系統</a>
          <a href="/health" class="btn btn-secondary">健康檢查</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// 運費計算頁面
app.get('/calculator', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>運費計算 - 小跑豬海運</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, 'Microsoft JhengHei', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          width: 100%;
          max-width: 500px;
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
          color: #333;
          margin-bottom: 30px;
          text-align: center;
        }
        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          margin-bottom: 8px;
          color: #555;
          font-weight: 500;
        }
        input, select {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
        }
        input:focus, select:focus {
          outline: none;
          border-color: #667eea;
        }
        button {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 20px;
        }
        button:hover {
          opacity: 0.9;
        }
        .result {
          margin-top: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
          display: none;
        }
        .result.show {
          display: block;
        }
        .back-link {
          display: block;
          text-align: center;
          margin-top: 20px;
          color: #667eea;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>��� 運費計算器</h1>
        <form id="calcForm">
          <div class="form-group">
            <label>商品類別</label>
            <select id="category">
              <option value="general">一般家具</option>
              <option value="special">特殊家具</option>
            </select>
          </div>
          <div class="form-group">
            <label>重量 (kg)</label>
            <input type="number" id="weight" required min="1" value="10">
          </div>
          <div class="form-group">
            <label>材積 (才)</label>
            <input type="number" id="volume" required min="1" value="5">
          </div>
          <button type="submit">計算運費</button>
        </form>
        
        <div id="result" class="result">
          <h3>計算結果</h3>
          <p id="resultText"></p>
        </div>
        
        <a href="/" class="back-link">← 返回首頁</a>
      </div>
      
      <script>
        document.getElementById('calcForm').addEventListener('submit', function(e) {
          e.preventDefault();
          const weight = parseFloat(document.getElementById('weight').value);
          const volume = parseFloat(document.getElementById('volume').value);
          const category = document.getElementById('category').value;
          
          const weightCharge = weight * 22;
          const volumeCharge = volume * 125;
          const baseCharge = Math.max(weightCharge, volumeCharge);
          const multiplier = category === 'special' ? 1.3 : 1;
          const total = Math.round(baseCharge * multiplier);
          
          document.getElementById('resultText').innerHTML = 
            '<strong>總運費: NT$ ' + total.toLocaleString() + '</strong><br><br>' +
            '重量計費: NT$ ' + weightCharge + '<br>' +
            '材積計費: NT$ ' + volumeCharge;
          document.getElementById('result').classList.add('show');
        });
      </script>
    </body>
    </html>
  `);
});

// 健康檢查
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT
  });
});

// 追蹤頁面
app.get('/tracking', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>貨物追蹤 - 小跑豬海運</title>
      <style>
        body {
          font-family: -apple-system, 'Microsoft JhengHei', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          width: 100%;
          max-width: 500px;
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
          color: #333;
          text-align: center;
          margin-bottom: 30px;
        }
        input {
          width: 100%;
          padding: 15px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          margin-bottom: 20px;
        }
        button {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
        }
        .back-link {
          display: block;
          text-align: center;
          margin-top: 20px;
          color: #667eea;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>��� 貨物追蹤</h1>
        <input type="text" placeholder="請輸入追蹤號碼">
        <button>查詢</button>
        <a href="/" class="back-link">← 返回首頁</a>
      </div>
    </body>
    </html>
  `);
});

// 登入頁面
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>登入 - 小跑豬海運</title>
      <style>
        body {
          font-family: -apple-system, 'Microsoft JhengHei', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          width: 100%;
          max-width: 400px;
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
          color: #333;
          text-align: center;
          margin-bottom: 30px;
        }
        input {
          width: 100%;
          padding: 12px;
          margin-bottom: 20px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
        }
        button {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
        }
        .back-link {
          display: block;
          text-align: center;
          margin-top: 20px;
          color: #667eea;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>��� 系統登入</h1>
        <input type="text" placeholder="帳號" value="admin">
        <input type="password" placeholder="密碼" value="admin123">
        <button>登入</button>
        <a href="/" class="back-link">← 返回首頁</a>
      </div>
    </body>
    </html>
  `);
});

// 404 處理
app.use((req, res) => {
  console.log('404:', req.url);
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>404 - 頁面不存在</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
          padding: 100px 20px;
        }
        h1 { font-size: 100px; margin: 0; }
        p { font-size: 24px; }
        a {
          display: inline-block;
          margin-top: 20px;
          padding: 15px 30px;
          background: white;
          color: #667eea;
          text-decoration: none;
          border-radius: 30px;
        }
      </style>
    </head>
    <body>
      <h1>404</h1>
      <p>找不到頁面</p>
      <a href="/">返回首頁</a>
    </body>
    </html>
  `);
});

// 啟動伺服器
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('=====================================');
  console.log('��� 小跑豬海運系統已啟動！');
  console.log(`��� 端口: ${PORT}`);
  console.log(`��� 訪問: http://localhost:${PORT}`);
  console.log('=====================================');
});

// 錯誤處理
process.on('uncaughtException', (err) => {
  console.error('未捕獲的異常:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('未處理的 Promise 拒絕:', err);
});
