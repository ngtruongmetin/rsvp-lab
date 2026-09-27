# RSVP Lab

Monorepo gồm frontend React/Vite và backend Express/PostgreSQL.

## Local

```bash
npm install
cp .env.example .env
npm run dev
```

Frontend: `http://localhost:5077`; API: `http://localhost:4005`.

## Docker

```bash
docker compose up --build
```

Backend modules tổ chức theo nghiệp vụ: `routes -> service -> repository -> database`.
