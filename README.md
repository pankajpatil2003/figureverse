# Figure Verse — Collector Action Figure & Statue Store

Inspired by **Superhero Toy Store** and **BigBadToyStore (BBTS)**, **Figure Verse** is a full-stack e-commerce application built with **React (Vite)**, **Node.js (Express)**, and **PostgreSQL**.

## Key Features
- **8 Signature Catalog Categories**:
  - **Marvel**, **DC**, **Fondjoy**, **CT Toys**, **ZD Toys**, **Anime**, **Mafex**, and **Gaming Figures**
- **Guest & Optional Registered Checkout**:
  - Buy any figure **without registering an account** (Guest Checkout), or optionally create an account / sign in to autofill shipping info and view past orders.
- **Online Payment Gateway (Razorpay)**:
  - Server-side Razorpay Order creation and HMAC-SHA256 payment verification, with an interactive Razorpay Sandbox Checkout modal for local testing without external credentials.
- **Guest Order Tracker (`/track-order`)**:
  - Track order status anytime using **Order Number + Email** without logging in.
- **Custom Admin Panel Built From Scratch (`/admin`)**:
  - **Dashboard KPIs**: Revenue, paid orders, low-stock alerts, category distribution, and recent order feed.
  - **Figures & Pricing CRUD (`/admin/figures`)**: Add, update, and remove figures, plus **inline quick-price (Selling Price & MRP)** and stock editing.
  - **Categories, Tags & Teams CRUD (`/admin/taxonomy`)**: Add, update, and remove **Categories**, **Tags**, and **Teams**.
  - **Orders & Fulfillment Manager (`/admin/orders`)**: Inspect guest and registered orders and update fulfillment status.

## Default Admin Login
- **Email**: `admin@figureverse.com`
- **Password**: `Admin@123`

## Quick Start

```powershell
# 1. Start the Backend API (http://localhost:5000)
cd D:\Learning\figureverse\server
npm install
npm run dev

# 2. Start the React Frontend (http://localhost:5173)
cd D:\Learning\figureverse\client
npm install
npm run dev
```
