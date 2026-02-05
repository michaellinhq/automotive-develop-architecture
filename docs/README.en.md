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

This knowledge base provides **senior automotive software architects**, **functional safety engineers**, and **E/E system engineers** with end-to-end technical assets — from regulatory compliance to code implementation.

It covers the **full V-Model lifecycle**: UN ECE regulations, MISRA C++ coding rules, STPA system analysis, and MC/DC test coverage, forming a complete knowledge loop.

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

> A layered knowledge architecture, from regulations down to code.

### 🔷 Level 1 — Regulatory & Standards Foundation

*Building Compliance from Ground Zero*

| Document | Scope | Key Content |
|:---------|:------|:------------|
| 📄 [**Regulations Matrix**](./docs/01_Standards_Level/Regulations_Matrix.md) | UN ECE Regulations | Core boundaries: R79 (Steering), R152 (AEBS), R155 (CSMS), R156 (SUMS), R171 (CMS) |

**Core Competencies:**
- UN Type Approval interpretation and system boundary definition
- CSMS/SUMS management system certification requirements
- Regulation linkage matrix and compliance checklist

---

### 🔶 Level 2 — System Analysis & Safety Engineering

*Hazard to Safety Goal — Mastering HARA, TARA, and STPA*

| Document | Scope | Key Content |
|:---------|:------|:------------|
| 📄 [**HARA / TARA / STPA Guide**](./docs/02_System_Analysis/HARA_TARA_STPA_Guide.md) | Risk Analysis | Functional & cybersecurity analysis comparison, STPA control loop modeling |
| 📄 [**Hardware Reliability**](./docs/02_System_Analysis/Hardware_Reliability.md) | HW Metrics | FTA/FMEA/FMEDA for SPFM/LFM/PMHF calculations |

**Core Competencies:**
- STPA control structures and UCA identification
- HARA vs TARA input/output mapping
- ISO 26262 hardware metrics (ASIL D: SPFM ≥ 99%, LFM ≥ 90%)

---

### 🟢 Level 3 — Software Architecture Design

*AUTOSAR, SOA, and Secure Communication Patterns*

| Document | Scope | Key Content |
|:---------|:------|:------------|
| 📄 [**CP/AP Hybrid Architecture**](./docs/03_Software_Architecture/CP_AP_Hybrid_Arch.md) | AUTOSAR | CP + AP hybrid communication, SOME/IP, DDS, Hypervisor isolation |
| 📄 [**DoIP Routing Strategy**](./docs/03_Software_Architecture/DoIP_Routing_Strategy.md) | Diagnostics | DoIP sequences, Routing Activation, DoIP-to-CAN conversion |

**Core Competencies:**
- SOME/IP service discovery and DDS QoS selection
- Type-1 Hypervisor partitioning
- MPU memory protection and FFI (ASIL D + QM coexistence)
- DoIP gateway routing table and protocol conversion

---

### 🟡 Level 4 — Detailed Design & Implementation

*From Specification to MISRA-Compliant Code*

| Document | Scope | Key Content |
|:---------|:------|:------------|
| 📄 [**UDS 0x27 Security Access**](./docs/04_Implementation/UDS_0x27_SecurityAccess.md) | Diagnostics | PduR → Dcm → Callout → Crypto Driver stack, Seed/Key implementation |
| 📄 [**MISRA C++ Golden Rules**](./docs/04_Implementation/MISRA_Cpp_Golden_Rules.md) | Coding Standard | Top 10 critical rules, Bad vs Good, static analysis integration |
| 📄 [**Memory Mapping Design**](./docs/04_Implementation/Memory_Mapping_Design.md) | MemMap | AUTOSAR MemMap.h, linker script ASIL partitioning, MPU linkage |

**Core Competencies:**
- UDS security access state machine and anti-bruteforce mechanisms
- MISRA C++:2008/2023 practical application
- Linker script design (ASIL D code → dedicated Flash sector)
- Callout design patterns and async handling

---

### 🔴 Level 5 — Verification & Validation

*Closing the V-Model Loop with Rigor*

| Document | Scope | Key Content |
|:---------|:------|:------------|
| 📄 [**Testing Strategy**](./docs/05_Verification/Testing_Strategy.md) | SWE.5/SWE.6 | ASIL test matrix, MC/DC, fault injection, HIL/SIL/MIL environments |

**Core Competencies:**
- MC/DC design and test case derivation
- Fault injection matrix (safety mechanism verification)
- Bidirectional traceability (Requirement ↔ Test ↔ Code)
- CI/CD automated test pipelines

---
