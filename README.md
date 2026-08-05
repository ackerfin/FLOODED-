# FLOODED

> **Offline-First Hybrid Emergency SOS Communications & Rescue Coordination Network**

FLOODED is a resilient, offline-first emergency communications system designed for flood disaster response when cellular networks and internet infrastructure fail. It combines short-range **Bluetooth Low Energy (BLE)** mesh relaying with a long-range **LoRa (433MHz)** backbone to route rescue requests directly to local command centers.

---

---

## ⚡ Key Features

- **Zero-Infrastructure Dependency**: Fully operational without GSM, 4G/5G, or internet connections.
- **Hybrid Protocol Stack**:
  - **BLE GATT**: Handles localized phone-to-phone and phone-to-relay data exchange.
  - **LoRa (433MHz)**: Provides long-range transmission back to the command hub.
- **Efficient Fallback Routing**: Direct-to-Gateway transmission by default; automatically falls back to LoRa multi-hop if `GATEWAY_STORED_ACK` is not received.
- **Store-Before-ACK**: Fixed Gateway writes payloads to local non-volatile storage before issuing ACKs to guarantee zero data loss.
- **Volunteer Mobile Gateway**: Allows field responders' phones (active-scan mode) to collect SOS payloads directly from isolated victims.

---

## 🛠 Hardware Specifications

| Component                 | Specifications                                                         | Primary Role             |
| :------------------------ | :--------------------------------------------------------------------- | :----------------------- |
| **Access Relay Node**     | LILYGO TTGO T-Beam V1.1 (SX1278 433MHz), 2x 18650 3400mAh              | Field BLE-to-LoRa relay  |
| **Fixed Command Gateway** | ESP32 DevKitC V4, Ra-02 LoRa (433MHz), W5500 Ethernet, MicroSD, 5V UPS | Central HQ receiver node |
| **Mobile Gateway**        | Responders' Smartphones (App active-scan mode)                         | Mobile field collector   |

---

## 🚀 App Quickstart

### Prerequisites

- **Node.js**: `>= 18.x`
- **npm** / **pnpm** / **yarn**

### Local Setup

```bash
# Clone the repository
git clone [https://github.com/ackerfin/FLOODED-.git](https://github.com/ackerfin/FLOODED-.git)

# Enter project directory
cd FLOODED-

# Install dependencies
npm install

# Run development server
npm run dev
📜 License
This project is licensed under the MIT License.
```
