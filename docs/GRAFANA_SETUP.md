# 🎛️ VN30-Quantum Grafana Dashboard Setup

## Hướng dẫn tạo Dashboard "Command Center" với Variables

---

## 📋 BƯỚC 1: TẠO BIẾN SỐ "SUPER DROPDOWN"

### 1.1 Vào Dashboard Settings
- Click vào **⚙️ Dashboard settings** (góc phải trên)
- Chọn **Variables** → **Add variable**

### 1.2 Cấu hình Variable

| Field | Value |
|-------|-------|
| **Name** | `symbol` |
| **Label** | `Chọn Mã CP` |
| **Type** | `Query` |
| **Data source** | `InfluxDB` |

### 1.3 Query (Copy vào ô Query):

```flux
import "influxdata/influxdb/schema"
schema.tagValues(bucket: "market_data", tag: "symbol")
```

### 1.4 Options
- **Sort**: `Alphabetical (asc)`
- **Multi-value**: ✅ On
- **Include All option**: ✅ On

### 1.5 Click **Run query** để test → Phải thấy list `ACB, BID, FPT, HPG...`

### 1.6 Click **Apply**

---

## 📉 BƯỚC 2: BIỂU ĐỒ GIÁ ĐỘNG

### Query cho Price Chart:

```flux
from(bucket: "market_data")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["_measurement"] == "stock_price")
  |> filter(fn: (r) => r["_field"] == "price")
  |> filter(fn: (r) => r["symbol"] =~ /^${symbol:regex}$/)
  |> aggregateWindow(every: v.windowPeriod, fn: last, createEmpty: false)
  |> yield(name: "price")
```

### Panel Options:
- **Title**: `📈 Biểu đồ giá ${symbol}`
- **Graph style**: `Time series`
- **Fill opacity**: `20%`
- **Gradient mode**: `Opacity`

---

## 🎯 BƯỚC 3: PANEL TÍN HIỆU AI

### Query cho Signal Panel:

```flux
from(bucket: "market_data")
  |> range(start: -1h)
  |> filter(fn: (r) => r["_measurement"] == "trading_signal")
  |> filter(fn: (r) => r["symbol"] =~ /^${symbol:regex}$/)
  |> filter(fn: (r) => r["_field"] == "signal_value")
  |> last()
```

### Value Mappings (Stat Panel):
| Value | Display | Color |
|-------|---------|-------|
| 2 | 🟢🟢 MUA MẠNH | Green |
| 1 | 🟢 MUA | Light Green |
| 0 | ⚪ GIỮ | Gray |
| -1 | 🔴 BÁN | Light Red |
| -2 | 🔴🔴 BÁN MẠNH | Red |

---

## 📊 BƯỚC 4: RSI GAUGE

### Query:

```flux
from(bucket: "market_data")
  |> range(start: -1h)
  |> filter(fn: (r) => r["_measurement"] == "trading_signal")
  |> filter(fn: (r) => r["symbol"] =~ /^${symbol:regex}$/)
  |> filter(fn: (r) => r["_field"] == "rsi")
  |> last()
```

### Panel Type: `Gauge`

### Thresholds:
- 0-30: 🟢 Green (Oversold - Buy zone)
- 30-70: 🟡 Yellow (Neutral)
- 70-100: 🔴 Red (Overbought - Sell zone)

---

## 📈 BƯỚC 5: MACD CHART

### Query:

```flux
from(bucket: "market_data")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["_measurement"] == "trading_signal")
  |> filter(fn: (r) => r["symbol"] =~ /^${symbol:regex}$/)
  |> filter(fn: (r) => r["_field"] == "macd" or r["_field"] == "macd_signal")
  |> aggregateWindow(every: v.windowPeriod, fn: last, createEmpty: false)
```

---

## 🔔 BƯỚC 6: ALERT TABLE

### Query (Top Signals):

```flux
from(bucket: "market_data")
  |> range(start: -1h)
  |> filter(fn: (r) => r["_measurement"] == "trading_signal")
  |> filter(fn: (r) => r["_field"] == "signal_value")
  |> filter(fn: (r) => r["_value"] == 2 or r["_value"] == -2)
  |> last()
  |> group()
```

---

## 🏗️ LAYOUT GỢI Ý

```
┌─────────────────────────────────────────────────────────┐
│  [Dropdown: Chọn Mã CP ▼]                               │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │  TÍN HIỆU   │ │    RSI      │ │ CONFIDENCE  │       │
│  │  MUA MẠNH   │ │   [GAUGE]   │ │    85%      │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│           📈 BIỂU ĐỒ GIÁ ${symbol}                     │
│           [CANDLESTICK / LINE CHART]                    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                        MACD                             │
│           [MACD LINE + SIGNAL LINE]                     │
├─────────────────────────────────────────────────────────┤
│                   TOP SIGNALS                           │
│  ┌─────────┬──────────┬──────────┬────────────┐        │
│  │ Symbol  │ Signal   │ RSI      │ Confidence │        │
│  ├─────────┼──────────┼──────────┼────────────┤        │
│  │ HPG     │ MUA MẠNH │ 28.5     │ 92%        │        │
│  │ TCB     │ BÁN MẠNH │ 75.2     │ 88%        │        │
│  └─────────┴──────────┴──────────┴────────────┘        │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 CHẠY SIGNAL AGENT

```bash
# Chạy trực tiếp
cd hunter
python signal_agent.py

# Hoặc với Docker
docker-compose exec hunter python signal_agent.py
```

---

## ✅ KẾT QUẢ

- Dropdown chọn bất kỳ mã VN30
- Biểu đồ tự động update theo mã
- Tín hiệu MUA/BÁN realtime
- RSI Gauge với màu sắc
- MACD crossover chart
- Table top signals
