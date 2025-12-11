# Video Analytics & Streaming Dashboard on AWS EKS

### ENPM818R Group Project - Fall 2025

**Group 6**

- **Sumiran** - Infrastructure Engineer
- **Sami** - Frontend Engineer
- **Colin** - Monitoring / Automation Engineer
- **Karen** - Documentation Lead
- **Yixun** - DevOps Engineer
- **Darsh and Purav** - Backend Engineers

[Github Repository](https://github.com/cindy-luck/enpm818r-group6/tree/main)

---

## 📖 Table of Contents

1. [Scenario Overview](#scenario-overview)
2. [System Architecture](#system-architecture)
3. [Microservices](#microservices)
4. [Infrastructure Setup](#infrastructure-setup)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Observability](#observability)
7. [Storage &amp; Persistence](#storage--persistence)
8. [Security](#security)
9. [Project Management](#project-management)

---

## 🎥 Scenario Overview

Our application is a **Video Analytics & Streaming Dashboard** based on microservices. It allows users to view a list of videos, see view counts, and upload new content.

- **User Flow:** When a user uploads a video, it triggers an asynchronous process where the **Processor API** generates a thumbnail using FFmpeg. Once complete, the video and thumbnail appear on the dashboard.
- **Technology Stack:** The solution uses 4 microservices (Frontend, Uploader API, Processing API, Analytics API) deployed on **AWS EKS**.
- **Data Persistence:** Videos and thumbnails are stored in **AWS S3**, while metadata (likes, views, status) is stored in **AWS RDS (PostgreSQL)**. A Kubernetes **Persistent Volume (PVC)** is attached to the Uploader API to handle temporary file buffering during uploads.

---

## 🏗 System Architecture

### High-Level Design

The platform is designed to be scalable and resilient, utilizing **AWS EKS** with distinct namespaces and subnets.

- **Traffic Flow:** User -> ALB -> Ingress Controller -> Service -> Pods.
- **Separation of Concerns:**
  - **Presentation:** React Frontend (Isolated UI).
  - **Business Logic:** Broken into Uploader (Ingestion), Processor (Computation), and Analytics (Engagement).
  - **Data Layer:** S3 for unstructured data (files) and RDS for structured data (SQL).
  - **Observability:** Prometheus/Grafana decoupled from app logic.

### Data Flow

1. **Upload:** User uploads video via Frontend -> Uploader API streams to S3 -> Record created in RDS (Status: `PENDING`).
2. **Processing:** Uploader triggers Processor API -> Downloads video -> Generates Thumbnail (FFmpeg) -> Uploads Thumbnail -> Updates RDS (Status: `COMPLETED`).
3. **Analytics:** Frontend fetches metadata -> User watches/likes video -> Analytics API updates RDS counters.

---

## 🚀 Microservices

| Service           | Purpose                                            | Key Endpoints                                          |
| :---------------- | :------------------------------------------------- | :----------------------------------------------------- |
| **Uploader API**  | Accepts uploads, stores in S3, creates DB records. | `POST /api/upload`                                     |
| **Processor API** | Generates thumbnails using FFmpeg.                 | `POST /process`                                        |
| **Analytics API** | Manages likes and view counts.                     | `POST /api/analytics/like`, `POST /api/analytics/view` |
| **Frontend**      | User Interface for viewing and uploading.          | Serves React App                                       |

---

## ☁️ Virtualization and Container technologies

Our infrastructure is provisioned using **Infrastructure as Code (IaC)** with CloudFormation and `eksctl`.

- **VPC:** Custom VPC (`vpc-080655d5cbc87dc44`) with 2 Public and 2 Private subnets.
- **Database:** Managed **AWS RDS (PostgreSQL)** for reliable and scalable structured data storage.
- **EKS Cluster:**
  - **Namespace:** `video-analytics`
  - **Node Groups:** Managed Node Groups for worker nodes.
  - **RBAC:** Defined ServiceAccounts, Roles, and RoleBindings for secure access.
- **Add-ons:**
  - AWS VPC CNI
  - CoreDNS
  - Kube-proxy
  - AWS EBS CSI Driver (for persistent storage)

---

## 🔄 CI/CD Pipeline

We utilize a multi-environment deployment strategy using **GitHub Actions**, **AWS CodeBuild**, and **Helm**.

- **Workflow:**
  1. **CI:** Linting, Unit Tests, Docker Build, ECR Push (Immutable Tags), Trivy Vulnerability Scan.
  2. **CD:** Helm Upgrade automatically deploys to the EKS cluster.
  3. **Release:** Manual approval required for production promotion.
- **Helm Strategy:** Single chart with values files for dev/prod (`values-dev.yaml`, `values-prod.yaml`).

---

## 📊 Observability

A dedicated monitoring stack is deployed in a separate namespace using the **kube-prometheus-stack**.

- **Grafana:** Provides visualizations for Cluster Compute Resources and Application Health.
- **Prometheus:** Scrapes metrics from services and provides alerting rules.
- **CloudWatch:** Integration for AWS-managed service metrics.

---

## 💾 Storage & Persistence

- **Hybrid Strategy:**
  - **S3:** Raw videos and thumbnails.
  - **RDS:** User data and metadata.
  - **EBS (PVC):** Block storage for temporary processing (e.g., FFmpeg staging).
- **Implementation:**
  - Utilizes **Amazon EBS CSI Driver** with IRSA.
  - **PVC:** `uploader-data` (1Gi, gp2) attached to Uploader pods.
  - **Backup:** AWS-managed snapshots for RDS and EBS; Versioning enabled for S3.

---

## 🔒 Security & Compliance

We implement a **Defense-in-Depth** strategy:

1. **Supply Chain:** All images are scanned for CVEs using Amazon ECR Image Scanning (Clair).
2. **Zero Trust Network:** `NetworkPolicies` restrict traffic flow (e.g., Frontend can only be accessed via Ingress).
3. **IAM (IRSA):** "Least Privilege" access. Pods use IAM Roles for Service Accounts instead of hardcoded AWS keys.
4. **Data Protection:** Encryption at rest (KMS) for S3, EBS, and RDS. Secrets managed via Kubernetes Secrets.

---

## 📆 Project Management

- **Methodology:** Trunk-Based Development with feature branches and mandatory Pull Request reviews.
- **Tracking:** GitHub Projects (Kanban) used to track tasks across Frontend, Backend, and Infra.
- **Documentation:** Comprehensive `CONTRIBUTING.md` and PR templates ensured code quality and standard operating procedures.

### Retrospective

- **Successes:** Automated CI/CD saved significant integration time; IaC allowed cost-effective cluster management.
- **Challenges:** Configuring OIDC and IRSA for S3 access was complex.
- **Improvements:** Plan to adopt local K8s testing (Minikube/Kind) to better mimic Ingress behavior during development.

---

_University of Maryland - ENPM818R_
