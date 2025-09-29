require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// 延遲載入 Prisma，避免啟動失敗
let prisma = null;
let dbConnected = false;

// 嘗試初始化 Prisma
async function initPrisma() {
  try {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
    await prisma.$connect();
    dbConnected = true;
    console.log('✅ 資料庫連線成功');
    return true;
  } catch (error) {
    console.log('⚠️ 資料庫連線失敗，但服務會繼續運行');
    console.log('錯誤詳情:', error.message);
    dbConnected = false;
    return false;
  }
}

// 中間件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ===== 基本路由（不需要資料庫） =====
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <title>小跑豬海運系統</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, 'Microsoft JhengHei', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
        }
        .container {
          text-align: center;
          color: white;
          padding: 40px;
        }
        h1 { font-size: 3em; margin-bottom: 20px; }
        p { font-size: 1.2em; margin-bottom: 30px; }
        .status { 
          background: rgba(255,255,255,0.2); 
          padding: 20px; 
          border-radius: 10px; 
          margin: 20px 0;
        }
        .btn {
          display: inline-block;
          padding: 15px 30px;
          background: white;
          color: #667eea;
          text-decoration: none;
          border-radius: 30px;
          font-weight: 600;
          margin: 10px;
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>��� 小跑豬海運系統</h1>
        <p>專業的傢俱海運服務平台</p>
        <div class="status">
          <p>系統狀態: ✅ 運行中</p>
          <p>資料庫狀態: ${dbConnected ? '✅ 已連線' : '⚠️ 離線模式'}</p>
        </div>
        <a href="/calculator" class="btn">運費計算</a>
        <a href="/tracking" class="btn">貨物追蹤</a>
        <a href="/login" class="btn">登入系統</a>
      </div>
    </body>
    </html>
  `);
});

// 運費計算（不需要資料庫）
app.get('/calculator', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <title>運費計算 - 小跑豬海運</title>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: -apple-system, 'Microsoft JhengHei', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { color: #333; margin-bottom: 30px; }
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
          transform: translateY(-2px);
        }
        .result {
          margin-top: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
          display: none;
        }
        .result.show { display: block; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>��� 運費計算器</h1>
        <form id="calcForm">
          <div class="form-group">
            <label>商品類別</label>
            <select id="category" required>
              <option value="general">一般家具</option>
              <option value="special">特殊家具</option>
            </select>
          </div>
          <div class="form-group">
            <label>重量 (kg)</label>
            <input type="number" id="weight" required min="0.1" step="0.1">
          </div>
          <div class="form-group">
            <label>體積 (才)</label>
            <input type="number" id="volume" required min="0.1" step="0.1">
          </div>
          <button type="submit">計算運費</button>
        </form>
        <div id="result" class="result">
          <h3>計算結果</h3>
          <p id="resultText"></p>
        </div>
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
            '重量計費: NT$ ' + weightCharge.toFixed(0) + '<br>' +
            '材積計費: NT$ ' + volumeCharge.toFixed(0) + '<br>' +
            '<strong>總運費: NT$ ' + total.toLocaleString() + '</strong>';
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
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// API 路由（檢查資料庫狀態）
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: dbConnected ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// 啟動伺服器（不等待資料庫）
async function startServer() {
  try {
    // 嘗試連接資料庫，但不阻擋啟動
    setTimeout(async () => {
      await initPrisma();
    }, 1000);
    
    // 立即啟動伺服器
    app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('=====================================');
      console.log('��� 伺服器啟動成功！');
      console.log(`��� 端口: ${PORT}`);
      console.log('⚠️  資料庫: 稍後連線');
      console.log('=====================================');
      console.log('');
    });
  } catch (error) {
    console.error('❌ 啟動失敗:', error);
    // 5 秒後重試
    setTimeout(startServer, 5000);
  }
}

// 優雅關閉
process.on('SIGINT', async () => {
  console.log('\n正在關閉伺服器...');
  if (prisma) {
    await prisma.$disconnect();
  }
  process.exit(0);
});

// 立即啟動
startServer();
