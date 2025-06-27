# 🧠 Design System AI

**Analyze and visualize token and component usage in design systems, and export data to CSV.**  
디자인 시스템의 사용 현황을 정량적으로 분석하고, 시각화 및 CSV 내보내기를 통해 개선을 도모하는 도구입니다.

---

## ✨ 주요 기능

- **토큰 사용량 분석**  
  코드베이스를 자동 스캔하여 색상, 타이포그래피, 간격 등 디자인 토큰의 사용 빈도를 식별하고 분석합니다.

- **컴포넌트 사용량 분석**  
  버튼, 카드, 모달 등의 UI 컴포넌트가 다양한 페이지에서 얼마나 자주 인스턴스화되는지를 추적합니다.

- **대화형 시각화 대시보드**  
  분석 데이터를 직관적인 차트와 그래프로 시각화하여 디자인 시스템 채택 현황을 한눈에 파악할 수 있습니다.

- **CSV 데이터 내보내기**  
  분석된 사용량 데이터를 CSV 파일로 저장하여, 추가 분석이나 다른 도구와의 통합에 활용할 수 있습니다.

- **채택률 및 중복 감지**  
  사용 빈도가 낮거나 중복되는 토큰/컴포넌트를 식별해 디자인 시스템을 최적화할 수 있습니다.

- **코드베이스 통합**  
  Git 저장소 또는 빌드 프로세스와 연동되어 사용량 데이터를 자동으로 수집합니다.

---

## 🚀 시작하기

이 프로젝트는 디자인 시스템의 사용 현황을 투명하게 관리하고 개선하려는 **디자인팀/프론트엔드팀**을 위해 개발되고 있습니다.

---

## 🛠️ 기술 스택

| 영역         | 기술 |
|--------------|------|
| **백엔드**   | Python (AST, RegEx), Node.js (JS/TS용 파서) |
| **프론트엔드** | React, D3.js 또는 Chart.js, Tailwind CSS |
| **데이터베이스** | SQLite, PostgreSQL *(또는 NoSQL 확장 가능)* |
| **데이터 내보내기** | Python `csv` 모듈 또는 유사 라이브러리 |

---

## 📦 설치 및 사용법

(예시 — 실제 코드 구현 후 아래 부분 작성 필요)

```bash
# 1. 저장소 클론
git clone https://github.com/your-username/design-system-AI.git
cd design-system-AI

# 2. 가상환경 및 의존성 설치
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

# 3. 실행
python run.py
