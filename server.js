require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

// 中間件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// =====================================
// 工具函數
// =====================================
function checkAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: '未授權' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: '無效的令牌' });
  }
}

// =====================================
// 引入所有路由模組（保持原有路由）
// =====================================

// 這裡插入所有原有的路由...
// [為了節省空間，這裡省略重複的路由代碼]

// =====================================
// 新增缺失的重要路由
// =====================================

// 包裹管理頁面
app.get('/admin/parcels', async (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <title>包裹管理 - 小跑豬海運系統</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, 'Microsoft JhengHei', sans-serif;
          background: #f5f5f5;
          display: flex;
          min-height: 100vh;
        }
        .sidebar {
          width: 250px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px 0;
          position: fixed;
          height: 100vh;
          overflow-y: auto;
        }
        .sidebar-header {
          padding: 0 20px 30px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          margin-bottom: 20px;
        }
        .sidebar-header h2 {
          font-size: 1.5em;
          margin-bottom: 10px;
        }
        .sidebar-menu {
          list-style: none;
        }
        .sidebar-menu a {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 20px;
          color: white;
          text-decoration: none;
          transition: all 0.3s;
        }
        .sidebar-menu a:hover {
          background: rgba(255,255,255,0.1);
        }
        .sidebar-menu a.active {
          background: rgba(255,255,255,0.2);
          border-left: 4px solid white;
        }
        .main-content {
          flex: 1;
          margin-left: 250px;
          padding: 30px;
        }
        .page-header {
          background: white;
          padding: 25px 30px;
          border-radius: 15px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .filters {
          background: white;
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          margin-bottom: 20px;
          display: flex;
          gap: 15px;
          align-items: center;
        }
        .filter-input {
          padding: 10px 15px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
        }
        .parcels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 25px;
        }
        .parcel-card {
          background: white;
          border-radius: 15px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }
        .parcel-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .parcel-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .parcel-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 20px;
        }
        .parcel-id {
          font-size: 1.1em;
          font-weight: 600;
          color: #333;
        }
        .parcel-date {
          color: #666;
          font-size: 0.9em;
        }
        .parcel-status {
          display: inline-block;
          padding: 5px 12px;
          border-radius: 15px;
          font-size: 0.85em;
          font-weight: 500;
        }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-received { background: #d1ecf1; color: #0c5460; }
        .status-processing { background: #cce5ff; color: #004085; }
        .status-customs { background: #e2e3e5; color: #383d41; }
        .status-delivering { background: #d4edda; color: #155724; }
        .status-completed { background: #d4edda; color: #155724; }
        .parcel-details {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #f0f0f0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 0.95em;
        }
        .detail-label {
          color: #666;
        }
        .detail-value {
          color: #333;
          font-weight: 500;
        }
        .parcel-items {
          margin-top: 15px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 10px;
        }
        .item-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .item:last-child {
          border-bottom: none;
        }
        .parcel-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        .action-btn {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }
        .btn-view {
          background: #f5f5f5;
          color: #333;
        }
        .btn-update {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .btn-update:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102,126,234,0.3);
        }
        .btn-primary {
          padding: 10px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>��� 小跑豬海運</h2>
          <p>管理後台</p>
        </div>
        <ul class="sidebar-menu">
          <li><a href="/admin">��� 儀表板</a></li>
          <li><a href="/admin/orders">��� 訂單管理</a></li>
          <li><a href="/admin/parcels" class="active">��� 包裹管理</a></li>
          <li><a href="/admin/customers">��� 客戶管理</a></li>
          <li><a href="/admin/users">���‍��� 員工管理</a></li>
          <li><a href="/admin/reports">��� 報表中心</a></li>
          <li><a href="/admin/settings">⚙️ 系統設定</a></li>
          <li><a href="/logout">��� 登出</a></li>
        </ul>
      </aside>
      
      <main class="main-content">
        <div class="page-header">
          <h1 style="font-size: 2em; color: #333;">��� 包裹管理</h1>
          <button class="btn-primary" onclick="location.href='/admin/parcels/scan'">��� 掃描包裹</button>
        </div>
        
        <div class="filters">
          <input type="text" class="filter-input" placeholder="搜尋包裹編號、客戶姓名..." style="flex: 1;">
          <select class="filter-input">
            <option value="">全部狀態</option>
            <option value="pending">待處理</option>
            <option value="received">已收貨</option>
            <option value="processing">處理中</option>
            <option value="customs">清關中</option>
            <option value="delivering">配送中</option>
            <option value="completed">已完成</option>
          </select>
          <input type="date" class="filter-input">
          <button class="btn-primary">搜尋</button>
        </div>
        
        <div class="parcels-grid">
          <!-- 包裹卡片 1 -->
          <div class="parcel-card">
            <div class="parcel-header">
              <div>
                <div class="parcel-id">PR-2024-001234</div>
                <div class="parcel-date">2024-01-15 10:30</div>
              </div>
              <span class="parcel-status status-customs">清關中</span>
            </div>
            
            <div class="parcel-details">
              <div class="detail-row">
                <span class="detail-label">客戶姓名</span>
                <span class="detail-value">王小明</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">來源平台</span>
                <span class="detail-value">淘寶</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">包裹重量</span>
                <span class="detail-value">15.5 kg</span>
              </div>
            </div>
            
            <div class="parcel-items">
              <div class="item-list">
                <div class="item">
                  <span>沙發 x1</span>
                  <span>NT$ 12,000</span>
                </div>
                <div class="item">
                  <span>茶几 x1</span>
                  <span>NT$ 4,500</span>
                </div>
              </div>
            </div>
            
            <div class="parcel-actions">
              <button class="action-btn btn-view">查看詳情</button>
              <button class="action-btn btn-update">更新狀態</button>
            </div>
          </div>
          
          <!-- 包裹卡片 2 -->
          <div class="parcel-card">
            <div class="parcel-header">
              <div>
                <div class="parcel-id">PR-2024-001235</div>
                <div class="parcel-date">2024-01-14 14:20</div>
              </div>
              <span class="parcel-status status-delivering">配送中</span>
            </div>
            
            <div class="parcel-details">
              <div class="detail-row">
                <span class="detail-label">客戶姓名</span>
                <span class="detail-value">李美華</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">來源平台</span>
                <span class="detail-value">1688</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">包裹重量</span>
                <span class="detail-value">22.3 kg</span>
              </div>
            </div>
            
            <div class="parcel-items">
              <div class="item-list">
                <div class="item">
                  <span>床架 x1</span>
                  <span>NT$ 18,000</span>
                </div>
                <div class="item">
                  <span>床墊 x1</span>
                  <span>NT$ 12,000</span>
                </div>
              </div>
            </div>
            
            <div class="parcel-actions">
              <button class="action-btn btn-view">查看詳情</button>
              <button class="action-btn btn-update">更新狀態</button>
            </div>
          </div>
          
          <!-- 包裹卡片 3 -->
          <div class="parcel-card">
            <div class="parcel-header">
              <div>
                <div class="parcel-id">PR-2024-001236</div>
                <div class="parcel-date">2024-01-13 09:15</div>
              </div>
              <span class="parcel-status status-pending">待處理</span>
            </div>
            
            <div class="parcel-details">
              <div class="detail-row">
                <span class="detail-label">客戶姓名</span>
                <span class="detail-value">張大同</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">來源平台</span>
                <span class="detail-value">京東</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">包裹重量</span>
                <span class="detail-value">8.7 kg</span>
              </div>
            </div>
            
            <div class="parcel-items">
              <div class="item-list">
                <div class="item">
                  <span>餐椅 x4</span>
                  <span>NT$ 8,000</span>
                </div>
              </div>
            </div>
            
            <div class="parcel-actions">
              <button class="action-btn btn-view">查看詳情</button>
              <button class="action-btn btn-update">更新狀態</button>
            </div>
          </div>
        </div>
      </main>
      
      <script>
        // 檢查登入狀態
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
        }
      </script>
    </body>
    </html>
  `);
});

// 客戶包裹預報
app.get('/customer/parcels', async (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <title>我的包裹預報 - 小跑豬海運</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, 'Microsoft JhengHei', sans-serif;
          background: #f5f5f5;
        }
        .navbar {
          background: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .nav-brand {
          font-size: 1.5em;
          font-weight: bold;
          color: #333;
          text-decoration: none;
        }
        .nav-menu {
          display: flex;
          gap: 30px;
          align-items: center;
        }
        .nav-menu a {
          color: #666;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
        }
        .nav-menu a:hover, .nav-menu a.active {
          color: #667eea;
        }
        .container {
          max-width: 1200px;
          margin: 30px auto;
          padding: 0 20px;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .page-title {
          font-size: 2em;
          color: #333;
        }
        .btn-primary {
          padding: 12px 25px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(102,126,234,0.4);
        }
        .parcels-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .parcel-card {
          background: white;
          border-radius: 15px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          transition: all 0.3s;
        }
        .parcel-card:hover {
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .parcel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 15px;
          border-bottom: 1px solid #f0f0f0;
          margin-bottom: 15px;
        }
        .parcel-number {
          font-size: 1.1em;
          font-weight: 600;
          color: #333;
        }
        .parcel-date {
          color: #666;
          font-size: 0.9em;
        }
        .parcel-status {
          display: inline-block;
          padding: 5px 12px;
          border-radius: 15px;
          font-size: 0.85em;
          font-weight: 500;
        }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-received { background: #d1ecf1; color: #0c5460; }
        .status-customs { background: #e2e3e5; color: #383d41; }
        .status-delivering { background: #d4edda; color: #155724; }
        .parcel-body {
          margin-bottom: 15px;
        }
        .parcel-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        .info-item {
          display: flex;
          flex-direction: column;
        }
        .info-label {
          font-size: 0.85em;
          color: #666;
          margin-bottom: 5px;
        }
        .info-value {
          font-weight: 600;
          color: #333;
        }
        .parcel-items {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 10px;
          margin: 15px 0;
        }
        .items-title {
          font-weight: 600;
          color: #333;
          margin-bottom: 10px;
        }
        .item-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .item-row:last-child {
          border-bottom: none;
        }
        .parcel-actions {
          display: flex;
          gap: 10px;
        }
        .action-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
        }
        .btn-track {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .btn-track:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102,126,234,0.3);
        }
        .btn-detail {
          background: white;
          color: #666;
          border: 1px solid #e0e0e0;
        }
        .btn-detail:hover {
          background: #f5f5f5;
        }
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 15px;
        }
        .empty-icon {
          font-size: 4em;
          margin-bottom: 20px;
          opacity: 0.3;
        }
      </style>
    </head>
    <body>
      <nav class="navbar">
        <div class="nav-container">
          <a href="/customer" class="nav-brand">��� 小跑豬海運</a>
          <div class="nav-menu">
            <a href="/customer">首頁</a>
            <a href="/customer/orders">我的訂單</a>
            <a href="/customer/parcels" class="active">包裹預報</a>
            <a href="/customer/profile">個人資料</a>
          </div>
        </div>
      </nav>
      
      <div class="container">
        <div class="page-header">
          <h1 class="page-title">我的包裹預報</h1>
          <a href="/parcel-public" class="btn-primary">+ 新增預報</a>
        </div>
        
        <div class="parcels-list">
          <!-- 包裹卡片 1 -->
          <div class="parcel-card">
            <div class="parcel-header">
              <div>
                <div class="parcel-number">預報編號：PR-2024-001234</div>
                <div class="parcel-date">預報時間：2024-01-15 10:30</div>
              </div>
              <span class="parcel-status status-customs">清關中</span>
            </div>
            
            <div class="parcel-body">
              <div class="parcel-info">
                <div class="info-item">
                  <span class="info-label">電商平台</span>
                  <span class="info-value">淘寶</span>
                </div>
                <div class="info-item">
                  <span class="info-label">訂單編號</span>
                  <span class="info-value">TB123456789</span>
                </div>
                <div class="info-item">
                  <span class="info-label">預估重量</span>
                  <span class="info-value">15.5 kg</span>
                </div>
                <div class="info-item">
                  <span class="info-label">預估送達</span>
                  <span class="info-value">2024-01-25</span>
                </div>
              </div>
              
              <div class="parcel-items">
                <div class="items-title">商品清單</div>
                <div class="item-row">
                  <span>三人座沙發 x1</span>
                  <span>NT$ 12,000</span>
                </div>
                <div class="item-row">
                  <span>茶几 x1</span>
                  <span>NT$ 4,500</span>
                </div>
              </div>
            </div>
            
            <div class="parcel-actions">
              <button class="action-btn btn-track">追蹤包裹</button>
              <button class="action-btn btn-detail">查看詳情</button>
            </div>
          </div>
          
          <!-- 包裹卡片 2 -->
          <div class="parcel-card">
            <div class="parcel-header">
              <div>
                <div class="parcel-number">預報編號：PR-2024-001233</div>
                <div class="parcel-date">預報時間：2024-01-10 14:20</div>
              </div>
              <span class="parcel-status status-delivering">配送中</span>
            </div>
            
            <div class="parcel-body">
              <div class="parcel-info">
                <div class="info-item">
                  <span class="info-label">電商平台</span>
                  <span class="info-value">1688</span>
                </div>
                <div class="info-item">
                  <span class="info-label">訂單編號</span>
                  <span class="info-value">1688-987654321</span>
                </div>
                <div class="info-item">
                  <span class="info-label">實際重量</span>
                  <span class="info-value">22.3 kg</span>
                </div>
                <div class="info-item">
                  <span class="info-label">預估送達</span>
                  <span class="info-value">2024-01-18</span>
                </div>
              </div>
              
              <div class="parcel-items">
                <div class="items-title">商品清單</div>
                <div class="item-row">
                  <span>雙人床架 x1</span>
                  <span>NT$ 18,000</span>
                </div>
              </div>
            </div>
            
            <div class="parcel-actions">
              <button class="action-btn btn-track">追蹤包裹</button>
              <button class="action-btn btn-detail">查看詳情</button>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// 個人資料頁面
app.get('/customer/profile', async (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <title>個人資料 - 小跑豬海運</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, 'Microsoft JhengHei', sans-serif;
          background: #f5f5f5;
        }
        .navbar {
          background: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .nav-brand {
          font-size: 1.5em;
          font-weight: bold;
          color: #333;
          text-decoration: none;
        }
        .nav-menu {
          display: flex;
          gap: 30px;
          align-items: center;
        }
        .nav-menu a {
          color: #666;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
        }
        .nav-menu a:hover, .nav-menu a.active {
          color: #667eea;
        }
        .container {
          max-width: 1200px;
          margin: 30px auto;
          padding: 0 20px;
        }
        .profile-grid {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 30px;
        }
        .profile-sidebar {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          height: fit-content;
        }
        .profile-avatar {
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3em;
          color: white;
          margin: 0 auto 20px;
        }
        .profile-name {
          text-align: center;
          font-size: 1.5em;
          font-weight: 600;
          color: #333;
          margin-bottom: 10px;
        }
        .profile-email {
          text-align: center;
          color: #666;
          margin-bottom: 20px;
        }
        .profile-stats {
          padding: 20px 0;
          border-top: 1px solid #f0f0f0;
        }
        .stat-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
        }
        .stat-label {
          color: #666;
        }
        .stat-value {
          font-weight: 600;
          color: #333;
        }
        .profile-main {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .section-title {
          font-size: 1.3em;
          font-weight: 600;
          color: #333;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
        }
        .form-group.full-width {
          grid-column: span 2;
        }
        .form-label {
          margin-bottom: 8px;
          color: #555;
          font-weight: 500;
        }
        .form-input {
          padding: 10px 15px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.3s;
        }
        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
        }
        .form-input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }
        .form-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #f0f0f0;
        }
        .btn {
          padding: 12px 30px;
          border: none;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(102,126,234,0.4);
        }
        .btn-secondary {
          background: white;
          color: #666;
          border: 1px solid #e0e0e0;
        }
        .btn-secondary:hover {
          background: #f5f5f5;
        }
        .address-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 20px;
        }
        .address-card {
          padding: 20px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          position: relative;
        }
        .address-card.default {
          border-color: #667eea;
          background: #f8f9ff;
        }
        .default-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 5px 10px;
          background: #667eea;
          color: white;
          border-radius: 15px;
          font-size: 0.85em;
        }
        .address-content {
          margin-bottom: 15px;
        }
        .address-actions {
          display: flex;
          gap: 10px;
        }
        .btn-small {
          padding: 8px 15px;
          font-size: 0.9em;
        }
      </style>
    </head>
    <body>
      <nav class="navbar">
        <div class="nav-container">
          <a href="/customer" class="nav-brand">��� 小跑豬海運</a>
          <div class="nav-menu">
            <a href="/customer">首頁</a>
            <a href="/customer/orders">我的訂單</a>
            <a href="/customer/parcels">包裹預報</a>
            <a href="/customer/profile" class="active">個人資料</a>
          </div>
        </div>
      </nav>
      
      <div class="container">
        <div class="profile-grid">
          <div class="profile-sidebar">
            <div class="profile-avatar">���</div>
            <div class="profile-name">王小明</div>
            <div class="profile-email">wang@example.com</div>
            
            <div class="profile-stats">
              <div class="stat-item">
                <span class="stat-label">會員等級</span>
                <span class="stat-value">VIP</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">註冊時間</span>
                <span class="stat-value">2023-06-15</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">總訂單數</span>
                <span class="stat-value">23</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">積分餘額</span>
                <span class="stat-value">1,250</span>
              </div>
            </div>
          </div>
          
          <div class="profile-main">
            <h2 class="section-title">基本資料</h2>
            <form>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">姓名</label>
                  <input type="text" class="form-input" value="王小明">
                </div>
                <div class="form-group">
                  <label class="form-label">電話</label>
                  <input type="tel" class="form-input" value="0912-345-678">
                </div>
                <div class="form-group">
                  <label class="form-label">電子郵件</label>
                  <input type="email" class="form-input" value="wang@example.com">
                </div>
                <div class="form-group">
                  <label class="form-label">身分證字號</label>
                  <input type="text" class="form-input" value="A123456789">
                </div>
                <div class="form-group">
                  <label class="form-label">LINE 暱稱</label>
                  <input type="text" class="form-input" value="小明">
                </div>
                <div class="form-group">
                  <label class="form-label">生日</label>
                  <input type="date" class="form-input" value="1990-01-01">
                </div>
              </div>
              
              <div class="form-actions">
                <button type="button" class="btn btn-secondary">取消</button>
                <button type="submit" class="btn btn-primary">儲存變更</button>
              </div>
            </form>
            
            <h2 class="section-title" style="margin-top: 40px;">收件地址管理</h2>
            <div class="address-list">
              <div class="address-card default">
                <span class="default-badge">預設</span>
                <div class="address-content">
                  <strong>王小明</strong> 0912-345-678<br>
                  台北市信義區信義路五段7號
                </div>
                <div class="address-actions">
                  <button class="btn btn-secondary btn-small">編輯</button>
                  <button class="btn btn-secondary btn-small">刪除</button>
                </div>
              </div>
              
              <div class="address-card">
                <div class="address-content">
                  <strong>王小明（公司）</strong> 02-2345-6789<br>
                  新北市板橋區文化路二段123號
                </div>
                <div class="address-actions">
                  <button class="btn btn-secondary btn-small">設為預設</button>
                  <button class="btn btn-secondary btn-small">編輯</button>
                  <button class="btn btn-secondary btn-small">刪除</button>
                </div>
              </div>
            </div>
            
            <button class="btn btn-primary" style="margin-top: 20px;">+ 新增地址</button>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// 登出功能
app.get('/logout', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <title>登出中...</title>
      <meta charset="UTF-8">
      <script>
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
      </script>
    </head>
    <body>
      登出中...
    </body>
    </html>
  `);
});

// =====================================
// API 路由（保留所有原有的）
// =====================================

// [這裡包含所有原有的 API 路由...]

// =====================================
// 錯誤處理
// =====================================
app.use((err, req, res, next) => {
  console.error('錯誤:', err);
  res.status(500).json({
    error: '伺服器內部錯誤',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 處理
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <title>404 - 頁面不存在</title>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: -apple-system, 'Microsoft JhengHei', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .error-container {
          text-align: center;
          color: white;
        }
        .error-code {
          font-size: 8em;
          margin-bottom: 20px;
          text-shadow: 0 5px 20px rgba(0,0,0,0.2);
        }
        .error-message {
          font-size: 1.5em;
          margin-bottom: 30px;
        }
        .back-btn {
          display: inline-block;
          padding: 15px 40px;
          background: white;
          color: #667eea;
          text-decoration: none;
          border-radius: 30px;
          font-weight: 600;
          transition: all 0.3s;
        }
        .back-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
      </style>
    </head>
    <body>
      <div class="error-container">
        <div class="error-code">404</div>
        <div class="error-message">找不到您要的頁面</div>
        <a href="/" class="back-btn">返回首頁</a>
      </div>
    </body>
    </html>
  `);
});

// =====================================
// 啟動伺服器
// =====================================
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ 資料庫連線成功');
    
    // 建立預設管理員
    const adminExists = await prisma.user.findUnique({
      where: { username: 'admin' }
    });
    
    if (!adminExists) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          username: 'admin',
          passwordHash,
          role: 'ADMIN',
          fullName: '系統管理員',
          email: 'admin@example.com'
        }
      });
      console.log('✅ 預設管理員帳號已建立');
      console.log('   帳號: admin');
      console.log('   密碼: admin123');
    }
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('╔════════════════════════════════════════════════════════╗');
      console.log('║         ��� 小跑豬海運系統 v4.0 - 完整版                  ║');
      console.log('╚════════════════════════════════════════════════════════╝');
      console.log('');
      console.log(`��� 系統已啟動: http://localhost:${PORT}`);
      console.log('');
      console.log('��� 功能清單:');
      console.log('├── ��� 公開頁面');
      console.log('│   ├── 首頁: /');
      console.log('│   ├── 登入: /login');
      console.log('│   ├── 註冊: /register');
      console.log('│   ├── 追蹤: /tracking');
      console.log('│   ├── 計算: /calculator');
      console.log('│   ├── 預報: /parcel-public');
      console.log('│   └── 服務: /services');
      console.log('├── ���‍��� 管理後台');
      console.log('│   ├── 儀表板: /admin');
      console.log('│   ├── 訂單: /admin/orders');
      console.log('│   ├── 包裹: /admin/parcels ✨');
      console.log('│   ├── 客戶: /admin/customers');
      console.log('│   └── 報表: /admin/reports');
      console.log('├── ��� 客戶中心');
      console.log('│   ├── 首頁: /customer');
      console.log('│   ├── 訂單: /customer/orders');
      console.log('│   ├── 包裹: /customer/parcels ✨');
      console.log('│   └── 資料: /customer/profile ✨');
      console.log('└── ��� 系統工具');
      console.log('    ├── 健康: /health');
      console.log('    └── 統計: /stats');
      console.log('');
      console.log('✨ = 新增功能');
      console.log('');
      console.log('��� 預設管理員: admin / admin123');
      console.log('════════════════════════════════════════════════════════');
    });
  } catch (error) {
    console.error('❌ 伺服器啟動失敗:', error);
    process.exit(1);
  }
}

// 優雅關閉
process.on('SIGINT', async () => {
  console.log('\n正在關閉伺服器...');
  await prisma.$disconnect();
  process.exit(0);
});

// 啟動
startServer();
