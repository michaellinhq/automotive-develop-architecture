# ASPICE V-Model 架构图

> 本文档展示 Automotive SPICE V模型的完整架构，将 SYS (系统工程) 和 SWE (软件工程) 过程域映射到设计侧（左）与验证侧（右）。

## V-Model 整体架构

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#e1f5fe', 'primaryTextColor': '#01579b', 'primaryBorderColor': '#0288d1', 'lineColor': '#0288d1', 'secondaryColor': '#fff3e0', 'tertiaryColor': '#f3e5f5'}}}%%
flowchart TB
    subgraph Level1["📋 Level 1: 法规与标准层"]
        direction LR
        REG["UN Regulations<br/>R79 | R152 | R155 | R156 | R171"]
        STD["ISO Standards<br/>ISO 26262 | ISO 21434 | ISO 21448"]
    end

    subgraph LeftSide["⬇️ 设计侧 (Design Phase)"]
        direction TB
        subgraph Level2_L["Level 2: 系统分析"]
            SYS1["SYS.1<br/>需求抽取<br/>Requirements Elicitation"]
            SYS2["SYS.2<br/>系统需求分析<br/>System Requirements Analysis"]
        end
        
        subgraph Level3_L["Level 3: 架构设计"]
            SYS3["SYS.3<br/>系统架构设计<br/>System Architectural Design"]
            SWE1["SWE.1<br/>软件需求分析<br/>SW Requirements Analysis"]
            SWE2["SWE.2<br/>软件架构设计<br/>SW Architectural Design"]
        end
        
        subgraph Level4_L["Level 4: 详细设计"]
            SWE3["SWE.3<br/>软件详细设计<br/>SW Detailed Design"]
        end
        
        subgraph Level5_L["Level 5: 实现"]
            SWE4["SWE.4<br/>软件单元验证<br/>SW Unit Verification"]
        end
    end

    subgraph RightSide["⬆️ 验证侧 (Verification Phase)"]
        direction TB
        subgraph Level5_R["Level 5: 单元测试"]
            SWE4_T["单元测试<br/>Unit Testing"]
        end
        
        subgraph Level4_R["Level 4: 集成测试"]
            SWE5["SWE.5<br/>软件集成与测试<br/>SW Integration & Testing"]
        end
        
        subgraph Level3_R["Level 3: 系统集成"]
            SWE6["SWE.6<br/>软件确认测试<br/>SW Qualification Testing"]
            SYS4["SYS.4<br/>系统集成与测试<br/>System Integration & Testing"]
        end
        
        subgraph Level2_R["Level 2: 系统验证"]
            SYS5["SYS.5<br/>系统确认测试<br/>System Qualification Testing"]
        end
    end

    %% 垂直流程连接
    Level1 --> Level2_L
    SYS1 --> SYS2
    SYS2 --> SYS3
    SYS3 --> SWE1
    SWE1 --> SWE2
    SWE2 --> SWE3
    SWE3 --> SWE4

    SWE4 -.->|实现| SWE4_T
    SWE4_T --> SWE5
    SWE5 --> SWE6
    SWE6 --> SYS4
    SYS4 --> SYS5

    %% 水平追溯连接
    SYS2 <-.->|需求追溯| SYS5
    SYS3 <-.->|架构验证| SYS4
    SWE1 <-.->|需求验证| SWE6
    SWE2 <-.->|架构验证| SWE5
    SWE3 <-.->|设计验证| SWE4_T

    style Level1 fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style LeftSide fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style RightSide fill:#fff3e0,stroke:#f57c00,stroke-width:2px
```

## 过程域详细映射表

### 系统工程过程域 (SYS)

| 过程ID | 过程名称 | V模型位置 | 主要输出物 | 对应验证活动 |
|--------|----------|-----------|------------|--------------|
| SYS.1 | 需求抽取 | Level 2 左侧 | 利益相关者需求 | SYS.5 系统确认 |
| SYS.2 | 系统需求分析 | Level 2 左侧 | 系统需求规格 | SYS.5 系统确认 |
| SYS.3 | 系统架构设计 | Level 3 左侧 | 系统架构描述 | SYS.4 系统集成测试 |
| SYS.4 | 系统集成与测试 | Level 3 右侧 | 集成测试报告 | - |
| SYS.5 | 系统确认测试 | Level 2 右侧 | 确认测试报告 | - |

### 软件工程过程域 (SWE)

| 过程ID | 过程名称 | V模型位置 | 主要输出物 | 对应验证活动 |
|--------|----------|-----------|------------|--------------|
| SWE.1 | 软件需求分析 | Level 3 左侧 | 软件需求规格 | SWE.6 软件确认测试 |
| SWE.2 | 软件架构设计 | Level 3 左侧 | 软件架构描述 | SWE.5 软件集成测试 |
| SWE.3 | 软件详细设计 | Level 4 左侧 | 详细设计文档 | SWE.4 单元验证 |
| SWE.4 | 软件单元验证 | Level 5 | 单元测试报告 | - |
| SWE.5 | 软件集成与测试 | Level 4 右侧 | 集成测试报告 | - |
| SWE.6 | 软件确认测试 | Level 3 右侧 | 确认测试报告 | - |

## 层级关系说明

```mermaid
flowchart LR
    subgraph 抽象层级
        L1[Level 1<br/>法规/标准] --> L2[Level 2<br/>系统分析]
        L2 --> L3[Level 3<br/>架构设计]
        L3 --> L4[Level 4<br/>详细设计]
        L4 --> L5[Level 5<br/>实现/单元]
    end

    subgraph 核心活动
        A1["合规性分析<br/>HARA/TARA"] -.-> L1
        A2["需求工程<br/>功能安全目标"] -.-> L2
        A3["架构分解<br/>安全机制设计"] -.-> L3
        A4["模块设计<br/>接口定义"] -.-> L4
        A5["编码实现<br/>单元测试"] -.-> L5
    end

    style L1 fill:#e3f2fd
    style L2 fill:#e8f5e9
    style L3 fill:#fff9c4
    style L4 fill:#ffe0b2
    style L5 fill:#ffccbc
```

## 双向追溯性要求

V模型的核心原则是 **双向追溯性 (Bidirectional Traceability)**：

1. **向下追溯 (Forward Traceability)**
   - 需求 → 设计 → 实现
   - 确保所有需求都被实现

2. **向上追溯 (Backward Traceability)**
   - 测试用例 → 需求
   - 确保每个测试都对应明确的需求

3. **水平追溯 (Horizontal Traceability)**
   - 设计阶段 ↔ 验证阶段
   - 确保验证活动覆盖对应的设计决策

---

*最后更新: 2026-01-25*
