# HARA / TARA / STPA 分析指南

> 本文档详述功能安全分析 (HARA)、信息安全分析 (TARA) 和系统理论过程分析 (STPA) 的方法论、输入输出映射及实施指南。

---

!!! success "💡 Michael Lin 的实战经验"
    **项目背景**: MAGNA 某制动系统 ASIL D 功能安全认证 + ISO 21434 网络安全合规
    
    **核心挑战**: 
    
    - HARA 与 TARA 分析团队各自为战，风险评估结果无法对齐
    - 传统 FMEA 方法遗漏了多个系统级交互风险
    - 德国 OEM 客户要求功能安全与网络安全分析可追溯关联
    
    **我的解决方案**:
    
    1. 设计 **HARA-TARA 联合评审模板**，将功能安全与网络安全风险统一映射
    2. 引入 **STPA 控制结构分析**，识别出传统 FMEA 遗漏的 3 个 UCA
    3. 建立 **跨部门风险协调会议机制**，每周同步分析进展
    
    **量化成果**:
    
    | 指标 | 改进前 | 改进后 | 提升 |
    |:-----|:------:|:------:|:----:|
    | 安全分析覆盖率 | 72% | 100% | +40% |
    | 评审周期 | 6 周 | 2 周 | -67% |
    | OEM 退回次数 | 3 次/项目 | 0 次 | -100% |

---

## 方法论概览

| 分析方法 | 标准来源 | 分析目标 | 核心输出 |
|----------|----------|----------|----------|
| **HARA** | ISO 26262 | 功能安全风险 | ASIL等级 & 安全目标 |
| **TARA** | ISO 21434 | 网络安全风险 | CAL等级 & 安全目标 |
| **STPA** | MIT/Leveson | 系统性危害 | 控制缺陷 & 约束 |

---

## STPA 系统理论过程分析

### STPA 核心概念

STPA (System-Theoretic Process Analysis) 是一种基于系统理论的危害分析方法，由MIT的Nancy Leveson教授提出。其核心理念是：

> **事故不仅仅是组件失效的结果，更是控制结构不充分的结果。**

### STPA 控制回路图 - 通用模型

```mermaid
flowchart TB
    subgraph Controller["🎮 控制器 (Controller)"]
        direction TB
        PM["过程模型<br/>Process Model"]
        CA["控制算法<br/>Control Algorithm"]
        PM --> CA
    end

    subgraph Actuator["⚙️ 执行器 (Actuator)"]
        ACT["执行机构"]
    end

    subgraph Process["🔄 被控过程 (Controlled Process)"]
        CP["物理过程/系统状态"]
    end

    subgraph Sensor["📡 传感器 (Sensor)"]
        SEN["感知设备"]
    end

    Controller -->|"控制动作<br/>(Control Action)"| Actuator
    Actuator -->|"物理输入"| Process
    Process -->|"物理输出"| Sensor
    Sensor -->|"反馈信息<br/>(Feedback)"| Controller

    subgraph UCA["⚠️ 不安全控制动作类型"]
        direction LR
        UCA1["1. 未提供必要的控制动作"]
        UCA2["2. 提供了不安全的控制动作"]
        UCA3["3. 控制动作时机不当"]
        UCA4["4. 控制动作持续时间不当"]
    end

    Controller -.->|"可能导致"| UCA

    style Controller fill:#e3f2fd,stroke:#1976d2
    style Actuator fill:#fff3e0,stroke:#f57c00
    style Process fill:#e8f5e9,stroke:#388e3c
    style Sensor fill:#fce4ec,stroke:#c2185b
    style UCA fill:#ffebee,stroke:#c62828
```

### STPA 分析步骤

```mermaid
flowchart LR
    subgraph Step1["Step 1: 定义分析目的"]
        S1A[识别系统级损失]
        S1B[识别系统级危害]
        S1C[建立危害-损失关联]
    end

    subgraph Step2["Step 2: 建模控制结构"]
        S2A[识别控制器]
        S2B[识别控制动作]
        S2C[识别反馈通道]
        S2D[绘制控制结构图]
    end

    subgraph Step3["Step 3: 识别UCA"]
        S3A[分析每个控制动作]
        S3B[应用4种UCA类型]
        S3C[记录不安全控制动作]
    end

    subgraph Step4["Step 4: 识别致因场景"]
        S4A[控制器致因]
        S4B[控制路径致因]
        S4C[反馈路径致因]
        S4D[过程模型致因]
    end

    Step1 --> Step2 --> Step3 --> Step4
```

### ADAS 系统 STPA 控制结构示例

```mermaid
flowchart TB
    subgraph Environment["🌍 外部环境"]
        OBJ["目标物体<br/>(车辆/行人)"]
        ROAD["道路环境"]
    end

    subgraph Driver["👤 驾驶员"]
        DRV["驾驶员输入"]
    end

    subgraph ADAS_Controller["🖥️ ADAS 控制器"]
        direction TB
        subgraph ProcessModel["过程模型"]
            PM1["目标状态估计"]
            PM2["本车状态估计"]
            PM3["环境模型"]
        end
        subgraph Algorithm["决策算法"]
            ALG1["风险评估"]
            ALG2["路径规划"]
            ALG3["控制策略"]
        end
        ProcessModel --> Algorithm
    end

    subgraph Perception["📷 感知系统"]
        CAM["摄像头"]
        RAD["毫米波雷达"]
        LID["激光雷达"]
        USS["超声波"]
    end

    subgraph Actuation["⚙️ 执行系统"]
        BRK["制动系统"]
        STR["转向系统"]
        ACC["动力系统"]
    end

    subgraph Vehicle["🚗 车辆动力学"]
        VEH["车辆状态"]
    end

    Environment --> Perception
    Driver --> ADAS_Controller
    Perception -->|"感知数据"| ADAS_Controller
    ADAS_Controller -->|"制动请求"| BRK
    ADAS_Controller -->|"转向请求"| STR
    ADAS_Controller -->|"加速请求"| ACC
    BRK & STR & ACC --> VEH
    VEH -->|"车辆状态反馈"| ADAS_Controller
    VEH -->|"影响"| Environment

    style ADAS_Controller fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style Perception fill:#fff3e0,stroke:#f57c00
    style Actuation fill:#e8f5e9,stroke:#388e3c
```

### UCA 分析表模板

| 控制动作 | 未提供 | 错误提供 | 时机过早/过晚 | 持续时间不当 |
|----------|--------|----------|---------------|--------------|
| 制动请求 | 前方有碰撞风险时未制动 | 无风险时误制动 | 制动时机过晚无法避障 | 制动持续过长导致追尾 |
| 转向请求 | 需规避时未转向 | 错误方向转向 | 转向时机导致失控 | 转向角度持续过大 |
| 加速请求 | 需汇入时未加速 | 危险区域加速 | 加速时机不当 | 加速持续过长 |

---

## HARA vs TARA 对比分析

### 输入输出映射图

```mermaid
flowchart TB
    subgraph Inputs["📥 共同输入"]
        I1["系统定义 & 边界"]
        I2["功能描述"]
        I3["运行场景"]
        I4["利益相关者信息"]
    end

    subgraph HARA_Process["🛡️ HARA 过程 (ISO 26262)"]
        direction TB
        H1["Item 定义"]
        H2["危害识别<br/>(Hazard Identification)"]
        H3["危害场景分析"]
        H4["S/E/C 评估"]
        H5["ASIL 确定"]
        H6["安全目标定义"]
        H1 --> H2 --> H3 --> H4 --> H5 --> H6
    end

    subgraph TARA_Process["🔐 TARA 过程 (ISO 21434)"]
        direction TB
        T1["资产识别"]
        T2["威胁识别<br/>(Threat Identification)"]
        T3["攻击路径分析"]
        T4["影响/可行性评估"]
        T5["CAL 确定"]
        T6["安全目标定义"]
        T1 --> T2 --> T3 --> T4 --> T5 --> T6
    end

    subgraph HARA_Outputs["📤 HARA 输出"]
        HO1["危害清单"]
        HO2["ASIL 等级"]
        HO3["功能安全目标"]
        HO4["安全需求"]
    end

    subgraph TARA_Outputs["📤 TARA 输出"]
        TO1["威胁清单"]
        TO2["CAL 等级"]
        TO3["网络安全目标"]
        TO4["安全需求"]
    end

    Inputs --> HARA_Process
    Inputs --> TARA_Process
    HARA_Process --> HARA_Outputs
    TARA_Process --> TARA_Outputs

    style HARA_Process fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style TARA_Process fill:#fff3e0,stroke:#f57c00,stroke-width:2px
```

### 关键概念对比

| 维度 | HARA (功能安全) | TARA (信息安全) |
|------|-----------------|-----------------|
| **标准依据** | ISO 26262 | ISO 21434 |
| **分析对象** | Item (系统/功能) | Asset (资产/数据) |
| **风险来源** | 系统故障/失效 | 恶意攻击/威胁 |
| **场景描述** | 危害场景 (Hazardous Event) | 攻击场景 (Attack Scenario) |
| **影响评估** | Severity (严重度) | Impact (影响程度) |
| **暴露评估** | Exposure (暴露度) | Attack Feasibility (攻击可行性) |
| **可控评估** | Controllability (可控性) | - |
| **风险等级** | ASIL (A/B/C/D) | CAL (1/2/3/4) |
| **输出目标** | 功能安全目标 (FSG) | 网络安全目标 (CSG) |

### 严重度评估对比

#### HARA - Severity (S)

| 等级 | 描述 | 伤害程度 |
|------|------|----------|
| S0 | 无伤害 | - |
| S1 | 轻微伤害 | 可能轻伤 |
| S2 | 严重伤害 | 可能重伤, 生存概率高 |
| S3 | 致命伤害 | 可能致命 |

#### TARA - Impact

| 等级 | 安全影响 | 财务影响 | 运营影响 | 隐私影响 |
|------|----------|----------|----------|----------|
| Severe | 致命伤害 | 巨额损失 | 无法运营 | 大规模泄露 |
| Major | 严重伤害 | 重大损失 | 严重中断 | 敏感泄露 |
| Moderate | 轻微伤害 | 中等损失 | 部分中断 | 一般泄露 |
| Negligible | 无伤害 | 微小损失 | 轻微影响 | 无泄露 |

### HARA-TARA 关联场景

```mermaid
flowchart LR
    subgraph Scenario["场景: 自动紧急制动失效"]
        direction TB
        FUNC["功能失效<br/>(HARA视角)"]
        CYBER["网络攻击<br/>(TARA视角)"]
    end

    subgraph HARA_Analysis["HARA 分析"]
        HA1["危害: AEB 误触发/漏触发"]
        HA2["S3: 可能致命碰撞"]
        HA3["E4: 高暴露度"]
        HA4["C2: 正常可控性"]
        HA5["ASIL D"]
    end

    subgraph TARA_Analysis["TARA 分析"]
        TA1["威胁: CAN 注入攻击"]
        TA2["Impact: Severe (Safety)"]
        TA3["Attack Feasibility: Medium"]
        TA4["CAL 4"]
    end

    FUNC --> HARA_Analysis
    CYBER --> TARA_Analysis

    HARA_Analysis -->|"同一失效模式"| Integration
    TARA_Analysis -->|"攻击可导致"| Integration

    subgraph Integration["🔗 综合安全需求"]
        INT1["需同时满足 ASIL D 和 CAL 4"]
        INT2["安全机制需抵抗故障+攻击"]
    end
```

---

## 分析方法选择指南

```mermaid
flowchart TD
    Start[开始分析] --> Q1{分析目标?}

    Q1 -->|功能安全合规| HARA
    Q1 -->|网络安全合规| TARA
    Q1 -->|系统级危害理解| STPA

    HARA --> Q2{需要系统级视角?}
    TARA --> Q3{需要理解控制缺陷?}

    Q2 -->|是| STPA_H[STPA 补充分析]
    Q2 -->|否| HARA_Done[完成 HARA]

    Q3 -->|是| STPA_T[STPA 补充分析]
    Q3 -->|否| TARA_Done[完成 TARA]

    STPA --> Q4{需要合规评级?}
    Q4 -->|功能安全| HARA_S[HARA 补充]
    Q4 -->|网络安全| TARA_S[TARA 补充]
    Q4 -->|否| STPA_Done[完成 STPA]
```

### 方法协同应用

| 项目阶段 | 推荐方法 | 说明 |
|----------|----------|------|
| 概念阶段 | STPA | 系统级危害识别，理解控制结构 |
| Item 定义 | HARA + TARA | 建立安全等级基线 |
| 架构设计 | STPA + HARA/TARA | 验证架构决策的安全性 |
| 详细设计 | FMEA/FTA | 组件级失效分析 |
| 变更影响 | 增量 STPA | 评估变更对控制结构的影响 |

---

## 实施模板

### HARA 工作表模板

| Item | 功能失效 | 危害 | 场景 | S | E | C | ASIL | 安全目标 |
|------|----------|------|------|---|---|---|------|----------|
| AEB | 制动不足 | 碰撞 | 城市道路 | S3 | E4 | C2 | D | FSG-001 |
| LKA | 转向错误 | 偏离车道 | 高速公路 | S3 | E3 | C2 | C | FSG-002 |

### TARA 工作表模板

| Asset | 威胁 | 攻击路径 | 影响 | 可行性 | Risk | CAL | 安全目标 |
|-------|------|----------|------|--------|------|-----|----------|
| 制动ECU | 消息伪造 | CAN注入 | Severe | Medium | High | 4 | CSG-001 |
| OTA服务器 | 篡改固件 | 网络入侵 | Severe | Low | Medium | 3 | CSG-002 |

---

*最后更新: 2026-01-25*
