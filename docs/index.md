# 🏎️ Automotive Functional Safety & Software Architecture Knowledge Base

<div align="center">

<!-- Professional Badges -->
![ISO 26262](https://img.shields.io/badge/ISO_26262-ASIL_D-DC143C?style=for-the-badge&logo=iso&logoColor=white)
![ISO 21434](https://img.shields.io/badge/ISO_21434-Cybersecurity-2E8B57?style=for-the-badge&logo=security&logoColor=white)
![AUTOSAR](https://img.shields.io/badge/AUTOSAR-CP_|_AP-0066CC?style=for-the-badge&logo=autodesk&logoColor=white)
![ASPICE](https://img.shields.io/badge/ASPICE-CL3-FF8C00?style=for-the-badge&logo=checkmarx&logoColor=white)
![ISO 14229](https://img.shields.io/badge/ISO_14229-UDS_Diagnostics-6A5ACD?style=for-the-badge&logo=buffer&logoColor=white)
![UN R155/R156](https://img.shields.io/badge/UN_ECE-R155_|_R156-4169E1?style=for-the-badge&logo=united-nations&logoColor=white)

<br/>

**Enterprise-Grade Knowledge Repository for Automotive E/E Architecture, Functional Safety, and ASPICE-Compliant Software Development**

*Architecting the Future of Software-Defined Vehicles*

---

[![Documentation](https://img.shields.io/badge/docs-comprehensive-brightgreen?style=flat-square)](./docs)
[![Mermaid Diagrams](https://img.shields.io/badge/diagrams-mermaid.js-FF3670?style=flat-square)](https://mermaid.js.org/)
[![License](https://img.shields.io/badge/license-proprietary-red?style=flat-square)]()
[![Last Updated](https://img.shields.io/badge/updated-2026.01-blue?style=flat-square)]()

</div>

---

## 🎯 Executive Summary

本知识库为 **高级汽车软件架构师**、**功能安全工程师** 和 **E/E 系统工程师** 提供从法规合规到代码实现的全栈技术资产。

覆盖 **V-Model 全生命周期**，从 UN ECE 法规解读到 MISRA C++ 编码规范，从 STPA 系统分析到 MC/DC 测试覆盖，构建完整的知识闭环。

> *"Excellence in automotive software is not an option — it's a mandate."*

---

## 📐 V-Model Architecture Map

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#e1f5fe', 'primaryTextColor': '#01579b', 'primaryBorderColor': '#0288d1', 'lineColor': '#0288d1', 'secondaryColor': '#fff3e0', 'tertiaryColor': '#f3e5f5'}}}%%
flowchart TB
    subgraph Level1["📋 LEVEL 1: Regulatory & Standards Layer"]
        direction LR
        REG["UN R79 | R152 | R155 | R156 | R171"]
        STD["ISO 26262 | ISO 21434 | ISO 21448"]
    end

    subgraph LeftSide["⬇️ DESIGN PHASE"]
        direction TB
        subgraph Level2_L["LEVEL 2: System Analysis"]
            SYS1["SYS.1 Requirements Elicitation"]
            SYS2["SYS.2 System Requirements"]
            HARA["HARA / TARA / STPA"]
        end
        
        subgraph Level3_L["LEVEL 3: Architecture Design"]
            SYS3["SYS.3 System Architecture"]
            SWE1["SWE.1 SW Requirements"]
            SWE2["SWE.2 SW Architecture"]
        end
        
        subgraph Level4_L["LEVEL 4: Detailed Design"]
            SWE3["SWE.3 Detailed Design"]
            IMPL["Implementation & Coding"]
        end
    end

    subgraph RightSide["⬆️ VERIFICATION PHASE"]
        direction TB
        subgraph Level5_R["LEVEL 5: Unit Testing"]
            SWE4["SWE.4 Unit Verification"]
            COVERAGE["MC/DC | Branch | Statement"]
        end
        
        subgraph Level4_R["LEVEL 4: Integration Testing"]
            SWE5["SWE.5 SW Integration Test"]
            FAULT["Fault Injection Testing"]
        end
        
        subgraph Level3_R["LEVEL 3: Qualification Testing"]
            SWE6["SWE.6 SW Qualification"]
            SYS4["SYS.4 System Integration"]
        end
        
        subgraph Level2_R["LEVEL 2: System Validation"]
            SYS5["SYS.5 System Qualification"]
            VAL["HIL | VIL | Track Testing"]
        end
    end

    Level1 --> Level2_L
    SYS1 --> SYS2 --> HARA
    HARA --> SYS3 --> SWE1 --> SWE2
    SWE2 --> SWE3 --> IMPL

    IMPL -.->|"Code"| SWE4
    SWE4 --> COVERAGE
    COVERAGE --> SWE5 --> FAULT
    FAULT --> SWE6 --> SYS4
    SYS4 --> SYS5 --> VAL

    SYS2 <-.->|"Traceability"| SYS5
    SWE2 <-.->|"Traceability"| SWE5
    SWE3 <-.->|"Traceability"| SWE4

    style Level1 fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style LeftSide fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style RightSide fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
```

---

## 🗂️ Knowledge Funnel — Hierarchical Navigation

> 从宏观法规到微观代码，逐层下钻的知识架构

### 🔷 Level 1 — Regulatory & Standards Foundation

*Building Compliance from Ground Zero*

| Document | Scope | Key Content |
|:---------|:------|:------------|
| 📄 [**Regulations Matrix**](01_Standards_Level/Regulations_Matrix.md) | UN ECE Regulations | R79 (Steering), R152 (AEBS), R155 (CSMS), R156 (SUMS), R171 (CMS) 核心边界约束 |

**Core Competencies:**
- UN Type Approval 法规解读与系统边界定义
- CSMS/SUMS 管理体系认证要求
- 法规间关联矩阵与合规检查清单

---

### 🔶 Level 2 — System Analysis & Safety Engineering

*Hazard to Safety Goal — Mastering HARA, TARA, and STPA*

| Document | Scope | Key Content |
|:---------|:------|:------------|
| 📄 [**HARA / TARA / STPA Guide**](02_System_Analysis/HARA_TARA_STPA_Guide.md) | Risk Analysis | 功能安全与网络安全风险分析方法论对比，STPA 控制回路建模 |
| 📄 [**Hardware Reliability**](02_System_Analysis/Hardware_Reliability.md) | HW Metrics | FTA/FMEA/FMEDA 在 SPFM/LFM/PMHF 计算中的应用 |

**Core Competencies:**
- STPA 控制结构图绘制与 UCA 识别
- HARA vs TARA 输入/输出映射
- ISO 26262 硬件度量计算 (ASIL D: SPFM ≥ 99%, LFM ≥ 90%)

---

### 🟢 Level 3 — Software Architecture Design

*AUTOSAR, SOA, and Secure Communication Patterns*

| Document | Scope | Key Content |
|:---------|:------|:------------|
| 📄 [**CP/AP Hybrid Architecture**](03_Software_Architecture/CP_AP_Hybrid_Arch.md) | AUTOSAR | Classic + Adaptive Platform 混合通信，SOME/IP, DDS, Hypervisor 隔离 |
| 📄 [**DoIP Routing Strategy**](03_Software_Architecture/DoIP_Routing_Strategy.md) | Diagnostics | DoIP 完整序列图，Routing Activation, DoIP-to-CAN 协议转换 |

**Core Competencies:**
- SOME/IP 服务发现与 DDS QoS 策略选择
- Type-1 Hypervisor 多分区隔离设计
- MPU 内存保护实现 Freedom from Interference (ASIL D + QM 共存)
- DoIP 诊断网关路由表与协议转换

---

### 🟡 Level 4 — Detailed Design & Implementation

*From Specification to MISRA-Compliant Code*

| Document | Scope | Key Content |
|:---------|:------|:------------|
| 📄 [**UDS 0x27 Security Access**](04_Implementation/UDS_0x27_SecurityAccess.md) | Diagnostics | PduR → Dcm → Callout → Crypto Driver 完整调用栈，Seed/Key 实现 |
| 📄 [**MISRA C++ Golden Rules**](04_Implementation/MISRA_Cpp_Golden_Rules.md) | Coding Standard | 10 条致命规则 Bad vs Good 对比，静态分析工具链集成 |
| 📄 [**Memory Mapping Design**](04_Implementation/Memory_Mapping_Design.md) | MemMap | AUTOSAR MemMap.h 原理，链接器脚本 ASIL 分区，MPU 联动配置 |

**Core Competencies:**
- UDS 安全访问状态机与防暴力攻击机制
- MISRA C++:2008/2023 规则实战应用
- 链接器脚本设计 (ASIL D 代码 → 独立 Flash Sector)
- Callout 函数设计模式与异步操作处理

---

### 🔴 Level 5 — Verification & Validation

*Closing the V-Model Loop with Rigor*

| Document | Scope | Key Content |
|:---------|:------|:------------|
| 📄 [**Testing Strategy**](05_Verification/Testing_Strategy.md) | SWE.5/SWE.6 | ASIL 分级测试方法矩阵，MC/DC 覆盖率，故障注入策略，HIL/SIL/MIL 测试环境 |

**Core Competencies:**
- MC/DC 覆盖率设计与测试用例推导
- 故障注入测试矩阵 (安全机制验证)
- 双向追溯性实现 (Requirement ↔ Test Case ↔ Code)
- CI/CD 集成自动化测试流水线

---

## 🏛️ Architecture Decision Records

```
📁 knowledge-base/
├── 📄 README.md                           # You are here
├── 📄 ASPICE_V_Model_Map.md               # V-Model 完整架构图
│
└── 📁 docs/
    ├── 📁 01_Standards_Level/             # 法规与标准
    │   └── 📄 Regulations_Matrix.md
    │
    ├── 📁 02_System_Analysis/             # 系统分析
    │   ├── 📄 HARA_TARA_STPA_Guide.md
    │   └── 📄 Hardware_Reliability.md
    │
    ├── 📁 03_Software_Architecture/       # 软件架构
    │   ├── 📄 CP_AP_Hybrid_Arch.md
    │   └── 📄 DoIP_Routing_Strategy.md
    │
    ├── 📁 04_Implementation/              # 详细设计与实现
    │   ├── 📄 UDS_0x27_SecurityAccess.md
    │   ├── 📄 MISRA_Cpp_Golden_Rules.md
    │   └── 📄 Memory_Mapping_Design.md
    │
    └── 📁 05_Verification/                # 测试与验证
        └── 📄 Testing_Strategy.md
```

---

## 🛠️ Technology Stack & Toolchain

<div align="center">

| Domain | Standards & Frameworks |
|:------:|:----------------------|
| **Functional Safety** | ISO 26262:2018, IEC 61508 |
| **Cybersecurity** | ISO/SAE 21434, UN R155/R156, TARA |
| **SOTIF** | ISO 21448 (Safety of the Intended Functionality) |
| **Process** | ASPICE 3.1, ISO/IEC 33000 |
| **Architecture** | AUTOSAR Classic 4.4, Adaptive R22-11 |
| **Diagnostics** | ISO 14229 (UDS), ISO 13400 (DoIP), ISO 15765 (CAN TP) |
| **Coding Standard** | MISRA C:2012, MISRA C++:2023, CERT C |
| **Verification** | MC/DC, Fault Injection, SIL/HIL/VIL |

</div>

---

## 🎓 Target Audience

<table>
<tr>
<td width="33%" align="center">

### 🏗️ System Architects

E/E 架构师、功能安全经理<br/>
*Designing the next-gen zonal architecture*

</td>
<td width="33%" align="center">

### 💻 Software Engineers

嵌入式开发工程师、BSW 集成工程师<br/>
*Building ASIL D compliant software*

</td>
<td width="33%" align="center">

### ✅ Quality & Safety

功能安全工程师、测试架构师<br/>
*Ensuring ISO 26262 compliance*

</td>
</tr>
</table>

---

## 📊 Compliance Coverage Matrix

| Standard | Covered Topics | Documentation |
|:---------|:---------------|:--------------|
| **ISO 26262** | HARA, ASIL, TSR/FSR, HSI, FFI, SPFM/LFM/PMHF | ✅ Comprehensive |
| **ISO 21434** | TARA, CAL, CSMS, Threat Scenarios | ✅ Comprehensive |
| **ASPICE** | SYS.1-5, SWE.1-6, SUP.8, MAN.3 | ✅ Comprehensive |
| **AUTOSAR** | CP BSW, AP ara::, SOME/IP, DDS | ✅ Comprehensive |
| **UN R155/R156** | CSMS, SUMS, RXSWIN, Type Approval | ✅ Comprehensive |
| **MISRA C++** | 2008/2023 Rules, Deviations | ✅ Comprehensive |

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/automotive-safety-kb.git

# Navigate to documentation
cd automotive-safety-kb/docs

# Start with the V-Model overview
open ../ASPICE_V_Model_Map.md
```

---

## 📈 Roadmap

- [x] Level 1: Regulatory Matrix (UN R79, R152, R155, R156, R171)
- [x] Level 2: HARA/TARA/STPA Guide + Hardware Reliability
- [x] Level 3: AUTOSAR CP/AP Architecture + DoIP Routing
- [x] Level 4: UDS Implementation + MISRA Rules + MemMap
- [x] Level 5: Testing Strategy & Coverage Metrics
- [ ] **Coming Soon**: OTA Update Workflow (A/B Partition)
- [ ] **Coming Soon**: Secure Boot Chain Design
- [ ] **Coming Soon**: SOTIF Analysis Templates

---

## 📜 License & Disclaimer

This knowledge base is proprietary and intended for internal reference only.

All standards referenced (ISO, UN ECE, AUTOSAR) are trademarks of their respective organizations.

---

<div align="center">

**Engineered with Precision. Validated with Rigor. Delivered with Excellence.**

<br/>

*© 2026 Automotive Software Excellence Center*

</div>
