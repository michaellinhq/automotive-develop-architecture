# AUTOSAR CP/AP 混合架构设计

> 本文档详述 AUTOSAR Classic Platform (CP) 与 Adaptive Platform (AP) 的混合通信架构，包含 SOME/IP、DDS 映射以及 Hypervisor 隔离机制。

## 架构概览

### CP 与 AP 定位对比

| 特性 | Classic Platform (CP) | Adaptive Platform (AP) |
|------|----------------------|------------------------|
| **目标场景** | 深度嵌入式、实时控制 | 高性能计算、服务化架构 |
| **操作系统** | OSEK/AUTOSAR OS | POSIX-based (Linux, QNX) |
| **通信范式** | 信号导向 (Signal-based) | 服务导向 (Service-Oriented) |
| **调度模型** | 静态调度、周期任务 | 动态调度、事件驱动 |
| **更新机制** | 固定配置 | 运行时配置、OTA |
| **典型 ECU** | 传感器/执行器节点 | 域控制器、HPC |
| **安全等级** | 最高支持 ASIL D | 最高支持 ASIL B (典型) |

---

## CP/AP 混合通信架构图

### 整体系统架构

```mermaid
flowchart TB
    subgraph Vehicle["🚗 整车架构"]
        direction TB
        
        subgraph HPC["🖥️ 高性能计算平台 (HPC/域控制器)"]
            subgraph Hypervisor["Type-1 Hypervisor Layer"]
                direction LR
                
                subgraph VM_AP["VM1: Adaptive Platform"]
                    direction TB
                    subgraph AP_Apps["AP Applications"]
                        AD["自动驾驶应用"]
                        DIAG["诊断服务"]
                        OTA["OTA Manager"]
                    end
                    subgraph AP_Services["AP Services (ara::)"]
                        COM_AP["ara::com<br/>(SOME/IP + DDS)"]
                        DIAG_AP["ara::diag"]
                        UCM["ara::ucm"]
                        PHM["ara::phm"]
                    end
                    subgraph AP_OS["POSIX OS"]
                        LINUX["Linux / QNX"]
                    end
                    AP_Apps --> AP_Services --> AP_OS
                end
                
                subgraph VM_CP["VM2: Classic Platform (Safety)"]
                    direction TB
                    subgraph CP_SWC["CP SWCs"]
                        CTRL["控制算法 SWC"]
                        SAFETY["安全监控 SWC"]
                    end
                    subgraph CP_RTE["RTE Layer"]
                        RTE["Runtime Environment"]
                    end
                    subgraph CP_BSW["BSW Layer"]
                        COM_CP["COM Stack"]
                        PDUR["PduR"]
                        CANIF["CanIf"]
                    end
                    subgraph CP_MCAL["MCAL"]
                        CAN_DRV["CAN Driver"]
                        ETH_DRV["ETH Driver"]
                    end
                    CP_SWC --> CP_RTE --> CP_BSW --> CP_MCAL
                end
                
                subgraph VM_Safety["VM3: Safety Monitor"]
                    SM["Safety Manager<br/>(ASIL D)"]
                end
            end
        end
        
        subgraph Network["🔌 车载网络"]
            direction LR
            ETH["Automotive Ethernet<br/>(100BASE-T1/1000BASE-T1)"]
            CAN_FD["CAN FD Bus"]
            CAN_STD["CAN Bus"]
        end
        
        subgraph ECU_Zone["📦 区域/节点 ECU"]
            direction LR
            subgraph Zone1["Zone ECU 1"]
                CP1["CP Stack"]
            end
            subgraph Zone2["Zone ECU 2"]
                CP2["CP Stack"]
            end
            subgraph Sensor["Sensor ECU"]
                SEN["传感器节点"]
            end
            subgraph Actuator["Actuator ECU"]
                ACT["执行器节点"]
            end
        end
    end

    VM_AP <-->|"虚拟网络"| VM_CP
    VM_AP <-->|"健康监控"| VM_Safety
    VM_CP <-->|"安全状态"| VM_Safety
    
    HPC <-->|"SOME/IP over Ethernet"| ETH
    ETH <--> Zone1 & Zone2
    Zone1 <--> CAN_FD
    Zone2 <--> CAN_STD
    CAN_FD <--> Sensor
    CAN_STD <--> Actuator

    style HPC fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style Hypervisor fill:#fff3e0,stroke:#f57c00
    style VM_AP fill:#e8f5e9,stroke:#388e3c
    style VM_CP fill:#fff9c4,stroke:#f9a825
    style VM_Safety fill:#ffcdd2,stroke:#c62828
```

---

## SOME/IP 通信机制

### SOME/IP 协议栈位置

```mermaid
flowchart TB
    subgraph AP_Stack["Adaptive Platform"]
        direction TB
        APP_AP["Application Layer"]
        ARA_COM["ara::com API"]
        SOMEIP_AP["SOME/IP Binding"]
        UDP_TCP["UDP/TCP"]
        ETH_AP["Ethernet Driver"]
        
        APP_AP --> ARA_COM --> SOMEIP_AP --> UDP_TCP --> ETH_AP
    end
    
    subgraph CP_Stack["Classic Platform"]
        direction TB
        SWC["SWC Layer"]
        RTE["RTE"]
        SOMEIP_CP["SomeIpXf + SomeIpTp"]
        SOAD["SoAd (Socket Adaptor)"]
        TCPIP["TcpIp Stack"]
        ETHIF["EthIf"]
        ETH_CP["Eth Driver"]
        
        SWC --> RTE --> SOMEIP_CP --> SOAD --> TCPIP --> ETHIF --> ETH_CP
    end
    
    ETH_AP <-.->|"SOME/IP Messages"| ETH_CP

    style AP_Stack fill:#e8f5e9,stroke:#388e3c
    style CP_Stack fill:#fff9c4,stroke:#f9a825
```

### SOME/IP 服务发现流程

```mermaid
sequenceDiagram
    participant Server as Service Provider<br/>(AP/CP)
    participant SD as SOME/IP-SD<br/>(Multicast)
    participant Client as Service Consumer<br/>(AP/CP)
    
    Note over Server,Client: 服务发现阶段
    
    Server->>SD: OfferService (Multicast)
    SD-->>Client: OfferService
    
    Client->>SD: FindService (Multicast)
    SD-->>Server: FindService
    
    Server->>Client: OfferService (Unicast)
    
    Note over Server,Client: 服务订阅阶段
    
    Client->>Server: SubscribeEventgroup
    Server->>Client: SubscribeEventgroupAck
    
    Note over Server,Client: 服务通信阶段
    
    Client->>Server: Request (Method Call)
    Server->>Client: Response
    
    Server->>Client: Event Notification
    Server->>Client: Event Notification
```

### SOME/IP 消息格式

| 字段 | 大小 | 描述 |
|------|------|------|
| Service ID | 16 bit | 服务标识符 |
| Method ID | 16 bit | 方法/事件标识符 |
| Length | 32 bit | 消息长度 |
| Client ID | 16 bit | 客户端标识 |
| Session ID | 16 bit | 会话标识 |
| Protocol Version | 8 bit | 协议版本 |
| Interface Version | 8 bit | 接口版本 |
| Message Type | 8 bit | 消息类型 (Request/Response/Notification) |
| Return Code | 8 bit | 返回码 |
| Payload | Variable | 序列化数据 |

---

## DDS 集成与映射

### DDS 在 AP 中的位置

```mermaid
flowchart TB
    subgraph AP_DDS["Adaptive Platform with DDS"]
        direction TB
        
        subgraph Apps["Applications"]
            AD_App["AD Planning"]
            Perception["Perception"]
            Fusion["Sensor Fusion"]
        end
        
        subgraph ARA["ara::com Layer"]
            PROXY["Service Proxy"]
            SKEL["Service Skeleton"]
        end
        
        subgraph Binding["Communication Binding"]
            direction LR
            SOMEIP_B["SOME/IP Binding"]
            DDS_B["DDS Binding"]
        end
        
        subgraph DDS_Stack["DDS Middleware"]
            direction TB
            DDS_API["DDS API (DCPS)"]
            RTPS["RTPS Protocol"]
            QOS["QoS Policies"]
        end
        
        subgraph Transport["Transport Layer"]
            UDP_M["UDP Multicast"]
            SHM["Shared Memory"]
        end
        
        Apps --> ARA --> Binding
        SOMEIP_B --> ETH_OUT["Ethernet"]
        DDS_B --> DDS_Stack --> Transport
    end

    style DDS_Stack fill:#e1f5fe,stroke:#0288d1
    style Binding fill:#fff3e0,stroke:#f57c00
```

### SOME/IP vs DDS 对比

| 特性 | SOME/IP | DDS |
|------|---------|-----|
| **发现机制** | SOME/IP-SD (Service Discovery) | RTPS Discovery |
| **通信模式** | Request/Response, Pub/Sub | Pub/Sub (Data-Centric) |
| **QoS 支持** | 有限 | 丰富 (22+ QoS 策略) |
| **序列化** | SOME/IP Serialization | CDR (Common Data Representation) |
| **适用场景** | SOA 服务调用 | 高频数据分发 |
| **典型应用** | 诊断、OTA、远程服务 | 传感器数据、点云、图像 |
| **实时性** | 中等 | 高 (可配置) |

### DDS QoS 关键策略

| QoS 策略 | 描述 | ADAS 应用示例 |
|----------|------|---------------|
| **Reliability** | 可靠/尽力传输 | 感知数据: BEST_EFFORT |
| **Durability** | 数据持久性 | 地图数据: TRANSIENT_LOCAL |
| **Deadline** | 数据更新截止时间 | 雷达数据: 50ms |
| **Liveliness** | 存活检测 | 传感器健康监控 |
| **History** | 历史数据保留 | 点云缓存: KEEP_LAST(5) |
| **Ownership** | 数据所有权 | 主备传感器切换 |

---

## Hypervisor 隔离机制

### Type-1 Hypervisor 架构

```mermaid
flowchart TB
    subgraph Hardware["🔧 硬件平台"]
        CPU["多核 CPU<br/>(ARM/x86)"]
        MEM["物理内存"]
        IO["I/O 设备"]
        IOMMU["IOMMU/SMMU"]
    end
    
    subgraph Hypervisor["⚙️ Type-1 Hypervisor"]
        direction TB
        SCHED["调度器<br/>(Partitioning Scheduler)"]
        MMU["内存虚拟化<br/>(Stage-2 Translation)"]
        VIRT_IO["I/O 虚拟化<br/>(Para-virtualization)"]
        HEALTH["健康监控<br/>(Health Monitor)"]
    end
    
    subgraph VMs["🖥️ 虚拟机分区"]
        direction LR
        
        subgraph VM1["VM1: Safety Critical"]
            OS1["AUTOSAR OS"]
            APP1["ASIL D SWC"]
        end
        
        subgraph VM2["VM2: Performance"]
            OS2["Linux"]
            APP2["AD Stack"]
        end
        
        subgraph VM3["VM3: Connectivity"]
            OS3["Linux"]
            APP3["Telematics"]
        end
    end
    
    Hardware --> Hypervisor --> VMs
    
    VM1 <-.->|"Virtual Network"| VM2
    VM2 <-.->|"Virtual Network"| VM3
    
    style VM1 fill:#ffcdd2,stroke:#c62828
    style VM2 fill:#e8f5e9,stroke:#388e3c
    style VM3 fill:#e3f2fd,stroke:#1976d2
    style Hypervisor fill:#fff3e0,stroke:#f57c00,stroke-width:2px
```

### 隔离机制层次

| 隔离层次 | 机制 | 功能 |
|----------|------|------|
| **时间隔离** | Partitioning Scheduler | 确保各 VM 获得确定性 CPU 时间 |
| **空间隔离** | Stage-2 MMU | 虚拟机间内存隔离 |
| **I/O 隔离** | IOMMU/SMMU | DMA 访问隔离 |
| **中断隔离** | Virtual Interrupt Controller | 中断路由隔离 |
| **通信隔离** | Virtual Network | 受控的 VM 间通信 |

### 虚拟机间通信 (Inter-VM Communication)

```mermaid
flowchart LR
    subgraph VM_A["VM A (AP)"]
        APP_A["Application"]
        VIRTIO_A["VirtIO Driver"]
    end
    
    subgraph Hypervisor["Hypervisor"]
        direction TB
        VSWITCH["Virtual Switch"]
        SHM["Shared Memory Region"]
        DOORBELL["Doorbell Interrupt"]
    end
    
    subgraph VM_B["VM B (CP)"]
        VIRTIO_B["VirtIO Driver"]
        APP_B["Application"]
    end
    
    APP_A --> VIRTIO_A
    VIRTIO_A -->|"1. Write Data"| SHM
    VIRTIO_A -->|"2. Notify"| DOORBELL
    DOORBELL -->|"3. Interrupt"| VIRTIO_B
    SHM -->|"4. Read Data"| VIRTIO_B
    VIRTIO_B --> APP_B
    
    VSWITCH -.->|"管理"| SHM
    VSWITCH -.->|"管理"| DOORBELL

    style Hypervisor fill:#fff3e0,stroke:#f57c00
```

---

## MPU 内存隔离方案 (Spatial Isolation)

### ASIL D 与 QM 共存架构

```mermaid
flowchart TB
    subgraph CPU_Core["CPU Core with MPU"]
        direction TB
        
        subgraph MPU["Memory Protection Unit"]
            REG["MPU Regions (8-16 个)"]
        end
        
        subgraph Memory_Map["内存布局"]
            direction TB
            
            subgraph ASIL_D_Region["🔴 ASIL D 区域"]
                ASIL_CODE["ASIL D Code<br/>(R-X)"]
                ASIL_DATA["ASIL D Data<br/>(R-W)"]
                ASIL_STACK["ASIL D Stack<br/>(R-W)"]
            end
            
            subgraph ASIL_B_Region["🟡 ASIL B 区域"]
                ASILB_CODE["ASIL B Code<br/>(R-X)"]
                ASILB_DATA["ASIL B Data<br/>(R-W)"]
            end
            
            subgraph QM_Region["🟢 QM 区域"]
                QM_CODE["QM Code<br/>(R-X)"]
                QM_DATA["QM Data<br/>(R-W)"]
                QM_STACK["QM Stack<br/>(R-W)"]
            end
            
            subgraph Shared_Region["⚪ 共享区域"]
                SHARED["Exchange Buffer<br/>(受控访问)"]
            end
        end
    end
    
    MPU -->|"保护"| Memory_Map
    
    style ASIL_D_Region fill:#ffcdd2,stroke:#c62828
    style ASIL_B_Region fill:#fff9c4,stroke:#f9a825
    style QM_Region fill:#c8e6c9,stroke:#388e3c
    style Shared_Region fill:#e0e0e0,stroke:#757575
```

### MPU 内存隔离配置表

| MPU Region | 起始地址 | 大小 | 属性 | ASIL 等级 | 访问权限 | 说明 |
|------------|----------|------|------|-----------|----------|------|
| Region 0 | 0x0000_0000 | 4KB | Code | ASIL D | R-X (Privileged) | ASIL D 安全启动代码 |
| Region 1 | 0x0000_1000 | 32KB | Code | ASIL D | R-X | ASIL D 应用代码 |
| Region 2 | 0x0000_9000 | 16KB | Data | ASIL D | R-W (No Execute) | ASIL D 数据段 |
| Region 3 | 0x0000_D000 | 4KB | Stack | ASIL D | R-W (No Execute) | ASIL D 栈空间 |
| Region 4 | 0x0001_0000 | 16KB | Code | ASIL B | R-X | ASIL B 应用代码 |
| Region 5 | 0x0001_4000 | 8KB | Data | ASIL B | R-W (No Execute) | ASIL B 数据段 |
| Region 6 | 0x0002_0000 | 64KB | Code | QM | R-X | QM 应用代码 |
| Region 7 | 0x0003_0000 | 32KB | Data | QM | R-W (No Execute) | QM 数据段 |
| Region 8 | 0x0004_0000 | 4KB | Shared | Mixed | R-W (Controlled) | 数据交换缓冲区 |
| Region 9 | 0x0005_0000 | 8KB | Peripheral | - | R-W (Device) | 外设寄存器映射 |

### 访问权限矩阵

| 访问者 \ 被访问区域 | ASIL D Code | ASIL D Data | ASIL B Code | ASIL B Data | QM Code | QM Data | Shared |
|---------------------|-------------|-------------|-------------|-------------|---------|---------|--------|
| **ASIL D Task** | R-X | R-W | R | R | R | R | R-W |
| **ASIL B Task** | - | - | R-X | R-W | R | R | R-W |
| **QM Task** | - | - | - | - | R-X | R-W | R-W |
| **ISR (ASIL D)** | R-X | R-W | R | R | R | R | R-W |

> **说明**: "-" 表示无访问权限，MPU 违规将触发异常

### Freedom from Interference (FFI) 实现

```mermaid
flowchart TB
    subgraph FFI["Freedom from Interference 机制"]
        direction TB
        
        subgraph Spatial["空间隔离 (Spatial)"]
            S1["MPU 内存保护"]
            S2["栈溢出检测"]
            S3["NULL 指针保护"]
        end
        
        subgraph Temporal["时间隔离 (Temporal)"]
            T1["Watchdog 监控"]
            T2["执行时间监控"]
            T3["调度保护"]
        end
        
        subgraph Communication["通信隔离"]
            C1["数据交换验证"]
            C2["CRC 校验"]
            C3["序列号检查"]
        end
    end
    
    subgraph Protection["违规处理"]
        P1["MPU 异常"]
        P2["Watchdog 复位"]
        P3["错误上报"]
    end
    
    Spatial & Temporal & Communication --> Protection
    
    style Spatial fill:#ffcdd2,stroke:#c62828
    style Temporal fill:#fff9c4,stroke:#f9a825
    style Communication fill:#c8e6c9,stroke:#388e3c
```

### ASIL 分解与隔离策略

| 隔离策略 | 实现方法 | ISO 26262 要求 |
|----------|----------|----------------|
| **相同 ASIL 共存** | 软件分区 + MPU | Part 6 要求 |
| **不同 ASIL 共存** | MPU + FFI 证明 | ASIL Decomposition 证据 |
| **ASIL D + QM** | 严格 MPU 隔离 + 诊断 | QM 不得影响 ASIL D |
| **多核分配** | 核间隔离 + 共享内存保护 | 多核安全手册 |

### MPU 配置最佳实践

| 实践项 | 建议 | 理由 |
|--------|------|------|
| 最小权限原则 | 只授予必要的访问权限 | 减少故障传播 |
| 代码区域 No-Write | 禁止运行时代码修改 | 防止代码注入 |
| 数据区域 No-Execute | 禁止数据区执行 | 防止缓冲区攻击 |
| 栈保护区 | 在栈底设置只读 guard page | 检测栈溢出 |
| 外设隔离 | 按 ASIL 等级划分外设访问 | 防止外设误操作 |
| 默认拒绝 | 未配置区域默认无访问权限 | 捕获非法访问 |

---

## 总结：混合架构设计要点

```mermaid
mindmap
  root((CP/AP 混合架构))
    通信
      SOME/IP
        服务发现
        方法调用
        事件通知
      DDS
        高频数据
        QoS 策略
        零拷贝
      CAN/CAN-FD
        信号传输
        实时性
    隔离
      Hypervisor
        时间隔离
        空间隔离
        I/O 隔离
      MPU
        ASIL/QM 隔离
        FFI 实现
        违规检测
    安全
      ASIL D on CP
      ASIL B on AP
      安全监控 VM
```

---

*最后更新: 2026-01-25*
