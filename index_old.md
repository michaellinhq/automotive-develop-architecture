---
layout: default
title: Home
---

# 🏎️ Automotive Functional Safety & Software Architecture Knowledge Base

<p align="center">
<img src="https://img.shields.io/badge/ISO_26262-ASIL_D-DC143C?style=for-the-badge" alt="ISO 26262">
<img src="https://img.shields.io/badge/ISO_21434-Cybersecurity-2E8B57?style=for-the-badge" alt="ISO 21434">
<img src="https://img.shields.io/badge/AUTOSAR-CP_|_AP-0066CC?style=for-the-badge" alt="AUTOSAR">
<img src="https://img.shields.io/badge/ASPICE-CL3-FF8C00?style=for-the-badge" alt="ASPICE">
</p>

---

## 🎯 About This Knowledge Base

本知识库为 **高级汽车软件架构师**、**功能安全工程师** 和 **E/E 系统工程师** 提供从法规合规到代码实现的全栈技术资产。

> *"Excellence in automotive software is not an option — it's a mandate."*

---

## 📚 Knowledge Funnel - 分层导航

### 🔷 Level 1 — 法规与标准层

| 文档 | 描述 |
|:-----|:-----|
| [**Regulations Matrix**](./docs/01_Standards_Level/Regulations_Matrix.md) | UN R79, R152, R155, R156, R171 核心边界约束 |

---

### 🔶 Level 2 — 系统分析层

| 文档 | 描述 |
|:-----|:-----|
| [**HARA / TARA / STPA Guide**](./docs/02_System_Analysis/HARA_TARA_STPA_Guide.md) | 功能安全与网络安全风险分析方法论 |
| [**Hardware Reliability**](./docs/02_System_Analysis/Hardware_Reliability.md) | FTA/FMEA/FMEDA 硬件度量计算 |

---

### 🟢 Level 3 — 软件架构层

| 文档 | 描述 |
|:-----|:-----|
| [**CP/AP Hybrid Architecture**](./docs/03_Software_Architecture/CP_AP_Hybrid_Arch.md) | AUTOSAR Classic + Adaptive, SOME/IP, DDS, Hypervisor |
| [**DoIP Routing Strategy**](./docs/03_Software_Architecture/DoIP_Routing_Strategy.md) | 诊断路由完整序列图，DoIP-to-CAN 转发 |

---

### 🟡 Level 4 — 详细设计与实现层

| 文档 | 描述 |
|:-----|:-----|
| [**UDS 0x27 Security Access**](./docs/04_Implementation/UDS_0x27_SecurityAccess.md) | 完整调用栈 PduR → Dcm → Callout → Crypto |
| [**MISRA C++ Golden Rules**](./docs/04_Implementation/MISRA_Cpp_Golden_Rules.md) | 10 条核心规则 Bad vs Good 对比 |
| [**Memory Mapping Design**](./docs/04_Implementation/Memory_Mapping_Design.md) | AUTOSAR MemMap + 链接器脚本 + MPU |

---

### 🔴 Level 5 — 测试与验证层

| 文档 | 描述 |
|:-----|:-----|
| [**Testing Strategy**](./docs/05_Verification/Testing_Strategy.md) | ASIL 分级测试矩阵, MC/DC, 故障注入 |

---

## 📐 V-Model 架构总览

➡️ [**查看完整 V-Model 架构图**](./ASPICE_V_Model_Map.md)

---

## 🛠️ 技术栈覆盖

| 领域 | 标准/框架 |
|:----:|:----------|
| **功能安全** | ISO 26262:2018, IEC 61508 |
| **网络安全** | ISO/SAE 21434, UN R155/R156 |
| **过程** | ASPICE 3.1, ISO/IEC 33000 |
| **架构** | AUTOSAR Classic 4.4, Adaptive R22-11 |
| **诊断** | ISO 14229 (UDS), ISO 13400 (DoIP) |
| **编码规范** | MISRA C:2012, MISRA C++:2023 |

---

<p align="center">
<strong>Engineered with Precision. Validated with Rigor. Delivered with Excellence.</strong>
<br/><br/>
<em>© 2026 Automotive Software Excellence Center</em>
</p>
