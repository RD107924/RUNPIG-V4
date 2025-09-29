const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

// 設定正確的內容類型
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 根路由 - 最簡單的 HTML
app.get('/', (req, res) => {
  console.log('Home page accessed');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>小跑豬海運系統</title>
    <style>
        body {
            margin: 0;
            padding: 40px;
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            text-align: center;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            color: #333;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { color: #333; margin-bottom: 20px; }
        p { color: #666; margin-bottom: 30px; }
        .buttons { margin-top: 30px; }
        .btn {
            display: inline-block;
            padding: 12px 30px;
            margin: 10px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
        }
        .btn:hover {
            background: #5567d8;
        }
        .status {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>��� 小跑豬海運系統</h1>
        <p>專業的傢俱海運服務平台</p>
        
        <div class="status">
            <p><strong>系統狀態:</strong> ✅ 運行中</p>
            <p><strong>版本:</strong> v4.0.0</p>
            <p><strong>時間:</strong> ${new Date().toLocaleString('zh-TW')}</p>
        </div>
        
        <div class="buttons">
            <a href="/test" class="btn">測試頁面</a>
            <a href="/api/test" class="btn">API 測試</a>
            <a href="/health" class="btn">健康檢查</a>
        </div>
    </div>
</body>
</html>`);
});

// 測試頁面
app.get('/test', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>測試頁面</title>
</head>
<body style="padding: 40px; font-family: Arial, sans-serif;">
    <h1>測試頁面</h1>
    <p>如果您能看到這個頁面，表示系統運作正常！</p>
    <p>當前時間: ${new Date().toLocaleString('zh-TW')}</p>
    <a href="/">返回首頁</a>
</body>
</html>`);
});

// API 測試
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: '小跑豬海運系統 API 運作正常',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// 健康檢查
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'runpig-v4',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    port: PORT
  });
});

// 404 處理
app.use((req, res) => {
  console.log(`404 - ${req.url}`);
  res.status(404).send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>404 - 找不到頁面</title>
</head>
<body style="text-align: center; padding: 100px; font-family: Arial, sans-serif;">
    <h1 style="font-size: 100px; margin: 0;">404</h1>
    <p style="font-size: 24px;">找不到頁面</p>
    <p>請求的路徑: ${req.url}</p>
    <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">返回首頁</a>
</body>
</html>`);
});

// 啟動服務器
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('========================================');
  console.log('��� 小跑豬海運系統啟動成功！');
  console.log(`��� Port: ${PORT}`);
  console.log(`��� URL: http://localhost:${PORT}`);
  console.log('========================================');
});

// 錯誤處理
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
