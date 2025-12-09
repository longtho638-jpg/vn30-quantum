# 🚀 VN30-Quantum VPS Deployment Guide

## Hướng dẫn triển khai Bot chạy 24/7 trên Cloud

---

## 📋 Yêu cầu tối thiểu

| Thông số | Giá trị |
|----------|---------|
| **OS** | Ubuntu 22.04 / 24.04 LTS |
| **CPU** | 1-2 vCPU |
| **RAM** | 2GB (InfluxDB cần RAM) |
| **Disk** | 25GB SSD |
| **Giá** | ~$10-12/tháng (~250-300k VND) |

---

## 🌐 Nhà cung cấp VPS đề xuất

### Quốc tế (Độ trễ thấp với Singapore)
- **DigitalOcean**: https://digitalocean.com
- **Vultr**: https://vultr.com
- **Linode**: https://linode.com

### Việt Nam (Độ trễ THẤP NHẤT với HOSE)
- **Long Vân**: https://longvan.net
- **CMC**: https://cmctelecom.vn
- **Viettel IDC**: https://viettelidc.com.vn

---

## 🔧 Bước 1: Cài đặt Docker trên VPS

### SSH vào VPS
```bash
ssh root@YOUR_VPS_IP
```

### Cài Docker (Ubuntu)
```bash
# Cài Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Cài Docker Compose plugin
apt install docker-compose-plugin -y

# Verify
docker --version
docker compose version
```

---

## 📦 Bước 2: Clone Repository

### Option A: Từ GitHub (Khuyến nghị)
```bash
cd ~
git clone https://github.com/longtho638-jpg/vn30-quantum.git
cd vn30-quantum
```

### Option B: Upload từ máy local
```bash
# Chạy trên máy local của bạn
cd /path/to/vn30-quantum
scp -r . root@YOUR_VPS_IP:/root/vn30-quantum
```

---

## ⚙️ Bước 3: Cấu hình Environment

### Tạo file .env
```bash
cd /root/vn30-quantum
cp .env.example .env
nano .env
```

### Nội dung .env
```bash
# Database
INFLUX_URL=http://influxdb:8086
INFLUX_TOKEN=my-super-secret-auth-token
INFLUX_ORG=vnquant
INFLUX_BUCKET=market_data

# Telegram Alerts (Optional)
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here

# Grafana
GF_SECURITY_ADMIN_USER=admin
GF_SECURITY_ADMIN_PASSWORD=your_secure_password
```

---

## 🚀 Bước 4: Deploy Stack

### Build và chạy tất cả services
```bash
cd /root/vn30-quantum
docker compose up -d --build
```

### Kiểm tra status
```bash
docker compose ps
```

Output kỳ vọng:
```
NAME              STATUS              PORTS
vn30_influxdb     running (healthy)   0.0.0.0:8086->8086/tcp
vn30_redis        running (healthy)   0.0.0.0:6379->6379/tcp
vn30_grafana      running             0.0.0.0:3000->3000/tcp
vn30_hunter       running             
vn30_analyst      running             
```

---

## 🎨 Bước 5: Truy cập Dashboard

### Grafana Dashboard
```
http://YOUR_VPS_IP:3000
```
- Username: `admin`
- Password: `admin123` (hoặc password bạn đã set)

### InfluxDB UI
```
http://YOUR_VPS_IP:8086
```
- Username: `admin`
- Password: `admin12345678`

---

## 📊 Bước 6: Xem Logs

### Real-time logs tất cả services
```bash
docker compose logs -f
```

### Chỉ xem Hunter
```bash
docker compose logs -f hunter
```

### Chỉ xem Analyst (Oracle)
```bash
docker compose logs -f analyst
```

---

## 🔒 Bước 7: Bảo mật (Quan trọng!)

### Đổi password mặc định
```bash
# Edit docker-compose.yml
nano docker-compose.yml

# Thay đổi:
# - DOCKER_INFLUXDB_INIT_PASSWORD=YOUR_SECURE_PASSWORD
# - GF_SECURITY_ADMIN_PASSWORD=YOUR_SECURE_PASSWORD
```

### Firewall (UFW)
```bash
# Cho phép SSH
ufw allow 22

# Cho phép Grafana
ufw allow 3000

# Cho phép InfluxDB (chỉ nếu cần truy cập từ xa)
ufw allow 8086

# Bật firewall
ufw enable
```

### Optional: Nginx Reverse Proxy + SSL
```bash
# Cài Nginx
apt install nginx certbot python3-certbot-nginx -y

# Config domain
# nano /etc/nginx/sites-available/vn30-quantum
# certbot --nginx -d yourdomain.com
```

---

## 🔄 Bước 8: Auto-restart (Systemd)

Services đã có `restart: always` trong docker-compose.yml.
Để đảm bảo Docker tự khởi động khi VPS reboot:

```bash
systemctl enable docker
```

---

## 📱 Bước 9: Setup Telegram Alerts

### Tạo Bot
1. Chat với @BotFather trên Telegram
2. Gửi `/newbot`
3. Đặt tên bot, nhận TOKEN

### Lấy Chat ID
1. Chat với bot của bạn
2. Truy cập: `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. Copy `chat_id`

### Cập nhật config
```bash
# Edit docker-compose.yml
nano docker-compose.yml

# Thêm vào phần analyst environment:
#  - TELEGRAM_BOT_TOKEN=your_token
#  - TELEGRAM_CHAT_ID=your_chat_id

# Restart
docker compose up -d analyst
```

---

## 🛠️ Commands hữu ích

```bash
# Restart tất cả
docker compose restart

# Restart một service
docker compose restart analyst

# Stop tất cả
docker compose down

# Stop và xóa volumes (RESET DATA!)
docker compose down -v

# Update code từ GitHub
cd /root/vn30-quantum
git pull origin main
docker compose up -d --build

# Xem disk usage
docker system df

# Dọn dẹp Docker
docker system prune -a
```

---

## 🔍 Troubleshooting

### InfluxDB không start
```bash
# Kiểm tra logs
docker compose logs influxdb

# Có thể do RAM không đủ
free -h
```

### Hunter không có data
```bash
# Kiểm tra logs
docker compose logs hunter

# Thử restart
docker compose restart hunter
```

### Grafana báo "No data"
1. Kiểm tra InfluxDB đã healthy: `docker compose ps`
2. Kiểm tra datasource trong Grafana
3. Kiểm tra query đúng bucket

---

## 📈 Kiến trúc Hybrid (Tối ưu)

```
┌─────────────────────────────────────────────────┐
│                    VPS (Vietnam)                │
│  ┌─────────┐ ┌──────────┐ ┌─────────────┐      │
│  │ Hunter  │ │ Analyst  │ │  InfluxDB   │      │
│  │  (Bot)  │ │ (Oracle) │ │   (Data)    │      │
│  └────┬────┘ └────┬─────┘ └──────┬──────┘      │
│       │           │              │              │
│       └───────────┴──────────────┘              │
│                    │                            │
│              ┌─────┴─────┐                      │
│              │  Grafana  │ :3000                │
│              │(Dashboard)│                      │
│              └───────────┘                      │
└─────────────────────────────────────────────────┘
                     │
                     │ (Optional)
                     ▼
┌─────────────────────────────────────────────────┐
│                   Vercel                        │
│              ┌───────────┐                      │
│              │  Next.js  │                      │
│              │(Public UI)│                      │
│              └───────────┘                      │
└─────────────────────────────────────────────────┘
```

---

## ✅ Checklist Deploy

- [ ] Thuê VPS (2GB RAM, Ubuntu)
- [ ] Cài Docker
- [ ] Clone repository
- [ ] Cấu hình .env
- [ ] docker compose up -d --build
- [ ] Truy cập Grafana
- [ ] Setup Telegram (optional)
- [ ] Đổi password mặc định
- [ ] Bật firewall
- [ ] Test tắt máy local, VPS vẫn chạy

---

## 🎉 Kết quả

Sau khi deploy thành công:

- **Bot chạy 24/7** - Tắt laptop đi ngủ, bot vẫn chạy
- **Real-time alerts** - Telegram báo signal ngay lập tức
- **Dashboard từ xa** - Truy cập http://VPS_IP:3000 từ điện thoại
- **Độ trễ thấp** - VPS đặt tại VN, API nhanh hơn

---

**Made with 🔮 by VN30-Quantum**
