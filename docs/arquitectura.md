# Arquitectura del Laboratorio Forense

## 1. Topología de Red e Infraestructura

El entorno simula una red corporativa interna donde se aloja una aplicación de acceso (login) vulnerable por falta de cifrado.

```mermaid
graph TD
    subgraph Host Machine [Máquina Física del Usuario]
        Playwright[Cliente Automático Playwright]
        HostPort[Puerto Host: 8080]
    end

    subgraph Vagrant VM [Vagrant: Rocky Linux 9 - IP: 192.168.56.10]
        Nginx[Reverse Proxy Nginx: Puerto 80]
        TShark_Forensics[Forense: TShark PCAP Dump]
        TShark_Attacker[Atacante: TShark Sniffing]
        
        subgraph Podman Network [Podman Compose]
            WebApp[Contenedor Next.js: Puerto 3000]
            DB[(PostgreSQL: Puerto 5432)]
        end
    end

    Playwright -- "HTTP POST (Plaintext)" --> HostPort
    HostPort -- "Port Forwarding" --> Nginx
    Nginx -- "Proxy Pass" --> WebApp
    WebApp -- "SQL Queries" --> DB
    
    TShark_Forensics -. "Monitoreo" .-> Nginx
    TShark_Attacker -. "Monitoreo" .-> Nginx
```

## 2. Flujo de Vulnerabilidad y Captura (Sequence Diagram)

Este diagrama explica cómo viaja la credencial y en qué momento es robada/capturada por los actores.

```mermaid
sequenceDiagram
    participant User as Cliente (Playwright)
    participant Attacker as Atacante (tshark)
    participant Nginx as Nginx Proxy
    participant Web as Aplicación Next.js
    participant Forense as Analista Forense (tshark)

    Note over User,Nginx: Tráfico HTTP Plano (Vulnerable)
    
    User->>Nginx: POST /api/login {"username":"admin", "password":"... "}
    
    par Captura de Red
        Nginx->>Web: Reenvía Petición Local
        Attacker->>Attacker: Analiza el paquete al vuelo y extrae el JSON
        Forense->>Forense: Guarda el paquete en evidence.pcap
    end
    
    Web->>User: 200 OK {"success": true}
```

## 3. Justificación de los Componentes

- **Rocky Linux 9**: Emula un entorno de servidor empresarial realista moderno, sucesor de CentOS.
- **Nginx sin SSL**: Punto crítico de la vulnerabilidad. Las credenciales viajan en texto plano, lo que permite el éxito del sniffing.
- **TShark (Wireshark CLI)**: Herramienta de captura fundamental tanto para atacantes (espionaje pasivo) como para peritos (preservación de evidencia de red).
- **Playwright**: Permite generar tráfico legítimo realista sin intervención manual constante.
