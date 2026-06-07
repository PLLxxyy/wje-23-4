# 个人菜谱收藏 (pdd-169)

全栈个人菜谱收藏应用，支持菜谱添加、食材清单、步骤、瀑布流展示、筛选、购物清单、收藏评分和关注用户。

## 项目结构

```
pdd-169/
├── frontend/     # React 18 + TypeScript + Vite + TailwindCSS
└── backend/      # Node.js + Express + SQLite
```

## 快速开始

### 前端

```bash
cd frontend
npm install
npm run dev
```

前端运行在 http://localhost:5173

### 后端

```bash
cd backend
npm install
npm run dev
```

后端运行在 http://localhost:3000

## 功能特性

- 用户注册/登录
- 菜谱添加（照片、菜名、食材清单、步骤）
- 食材清单（名称和用量）
- 步骤按顺序排列，每步可配图
- 菜谱瀑布流展示
- 按菜系、难度、烹饪时间筛选
- 一键生成购物清单
- 收藏和评分
- 个人主页展示
- 关注其他用户
