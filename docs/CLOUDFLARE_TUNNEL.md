# 🚇 VN30-Quantum Cloudflare Tunnel Setup

## Zero Trust Security - Không mở port nào trên VPS

---

## 🎯 Mục tiêu

| Trước | Sau |
|-------|-----|
| `http://IP:3000` (exposed) | ❌ Không thể truy cập |
| `http://IP:8086` (exposed) | ❌ Không thể truy cập |
| `http://IP:80` (exposed) | ❌ Không thể truy cập |
| **New** | `https://dashboard.yourdomain.com` ✅ |

---

## 📋 Yêu cầu

1. **Tên miền** (ví dụ: `myquantfund.com`)
   - Mua ở Namecheap/GoDaddy (~$10/năm)
   
2. **Tài khoản Cloudflare** (Miễn phí)
   - https://cloudflare.com

---

## 🔧 Bước 1: Setup Domain trên Cloudflare

1. Đăng nhập Cloudflare
2. **Add a Site** → Nhập domain
3. Chọn plan **Free**
4. Thay đổi Nameservers tại nhà cung cấp domain
5. Đợi DNS propagation (5-30 phút)

---

## 🚇 Bước 2: Tạo Tunnel

1. Vào **Zero Trust** (menu bên trái)
2. **Networks** → **Tunnels**
3. **Create a tunnel**
4. Đặt tên: `vn30-quantum`
5. Chọn **Docker**
6. **COPY TOKEN** (đoạn mã dài sau `--token`)

---

## 🔐 Bước 3: Cấu hình VPS

### Tạo file .env
```bash
cd /root/vn30-quantum
nano .env
```

### Nội dung .env
```bash
# Cloudflare Tunnel
TUNNEL_TOKEN=your_very_long_tunnel_token_here

# Database
INFLUX_TOKEN=my-super-secret-auth-token
INFLUX_PASSWORD=super_secure_password_123

# Grafana
GRAFANA_PASSWORD=another_secure_password
DOMAIN=dashboard.yourdomain.com

# Telegram (Optional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

### Deploy
```bash
docker compose up -d --build
```

---

## 🌐 Bước 4: Cấu hình Public Hostname

1. Quay lại Cloudflare Zero Trust
2. Click vào tunnel `vn30-quantum`
3. Tab **Public Hostname**
4. **Add a public hostname**:

| Field | Value |
|-------|-------|
| Subdomain | `dashboard` |
| Domain | `yourdomain.com` |
| Type | `HTTP` |
| URL | `nginx:80` |

5. **Save hostname**

---

## ✅ Bước 5: Test

Truy cập:
```
https://dashboard.yourdomain.com
```

Kết quả:
- ✅ Ổ khóa xanh (HTTPS)
- ✅ Grafana Dashboard
- ✅ IP thật của VPS bị ẩn

---

## 🔒 Bonus: Access Control (God Mode)

Chỉ cho phép email của bạn truy cập:

1. **Zero Trust** → **Access** → **Applications**
2. **Add an application** → **Self-hosted**
3. Cấu hình:

| Field | Value |
|-------|-------|
| Name | `Trading Dashboard` |
| Subdomain | `dashboard.yourdomain.com` |
| Policy Name | `Owner Only` |
| Action | `Allow` |
| Include | Emails: `your@email.com` |

4. **Save**

Kết quả: Người khác truy cập → Cloudflare yêu cầu xác thực OTP qua email.

---

## 🏗️ Kiến trúc

```
         Internet
            │
            ▼
    ┌───────────────┐
    │  Cloudflare   │
    │   CDN + WAF   │
    └───────┬───────┘
            │ (Encrypted Tunnel)
            ▼
    ┌───────────────┐
    │   cloudflared │  ← Docker container
    │    (Tunnel)   │
    └───────┬───────┘
            │
    ════════╪════════════════════
            │   quantum_net
            ▼   (172.28.0.0/16)
    ┌───────────────┐
    │     Nginx     │
    │   (Internal)  │
    └───────┬───────┘
            │
    ┌───────┴───────┐
    ▼               ▼
┌────────┐   ┌──────────┐
│Grafana │   │ InfluxDB │
└────────┘   └──────────┘
    ▲
    │
┌───┴───────────────┐
│ Hunter │ Analyst  │
└───────────────────┘
```

---

## 🔥 So sánh

| Feature | Iron Dome | Zero Trust |
|---------|-----------|------------|
| Port 80 | ✅ Open | ❌ Closed |
| Port 3000 | ❌ Closed | ❌ Closed |
| Port 8086 | ❌ Closed | ❌ Closed |
| HTTPS | ❌ Need SSL | ✅ Auto |
| DDoS Protection | ❌ No | ✅ Cloudflare |
| IP Hidden | ❌ Visible | ✅ Hidden |
| Access Control | ❌ Password only | ✅ Email OTP |

---

## 📝 Commands

```bash
# Kiểm tra tunnel status
docker compose logs tunnel

# Restart tunnel
docker compose restart tunnel

# Xem tất cả logs
docker compose logs -f
```

---

**Made with 🔮 by VN30-Quantum**
