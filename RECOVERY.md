# Raspberry Pi Recovery Guide

This document describes how to rebuild the Territories API infrastructure
if the Raspberry Pi or its SD card is lost.

> ⚠️ IMPORTANT
>
> This procedure is intended for a NEW Raspberry Pi / fresh installation.
> Do NOT execute destructive database commands on the production Raspberry Pi.

---

## Recovery checkpoint

**Last verified:** 2026-10-08

The database was migrated from Supabase to PostgreSQL on the Raspberry Pi.
The frontend was tested against the Raspberry Pi API and the data was
verified against the existing Supabase-based application.

Current verified database:

- People: 186
- Territories: 118
- Territory areas: 19
- Territory types: 2
- Assignments: 573
- Active assignments: 80

---

## Architecture

```text
Internet
   |
   v
Cloudflare
   |
   v
api.sidneijustino.dev
   |
   v
Nginx :443
   |
   v
Express API :3000
   |
   v
PostgreSQL :5432
```

The API runs in Docker using `docker-compose.yml`.

The PostgreSQL database is stored in the Docker volume:

```text
territories_db_data
```

---

# 1. Requirements

A new Raspberry Pi with:

- Debian / Raspberry Pi OS
- Internet access
- Docker
- Git
- Nginx

You also need access to:

- GitHub repository
- PostgreSQL backup (`.sql`)
- Firebase service account JSON
- Cloudflare account
- Cloudflare Origin Certificate and private key, if preserving the existing certificate

---

# 2. Clone the repository

Clone the repository:

```bash
git clone <REPOSITORY_URL>
cd api
```

Checkout the self-hosted branch:

```bash
git checkout feature/self-hosted
```

---

# 3. Restore Firebase credentials

Create the secrets directory:

```bash
mkdir -p secrets
```

Copy the Firebase service account file into:

```text
secrets/firebase-service-account.json
```

The API Docker container mounts this directory as:

```text
/app/secrets
```

The secret file must NOT be committed to Git.

---

# 4. Start PostgreSQL and the API

From the project directory:

```bash
docker compose up -d --build
```

Check the containers:

```bash
docker ps
```

Expected containers:

```text
api-api-1
api-db-1
```

Check the API logs:

```bash
docker compose logs api
```

---

# 5. Restore the PostgreSQL database

Make sure the PostgreSQL container is running:

```bash
docker ps
```

Copy the database backup into the PostgreSQL container:

```bash
docker cp territories_backup.sql api-db-1:/tmp/territories_backup.sql
```

Restore it:

```bash
docker exec -i api-db-1   psql -U territories_user   -d territories   -f /tmp/territories_backup.sql
```

> Replace `territories_backup.sql` with the actual backup filename.

After the restore, verify the database:

```bash
docker exec -it api-db-1   psql -U territories_user   -d territories
```

Example checks:

```sql
SELECT COUNT(*) FROM people;
SELECT COUNT(*) FROM territories;
SELECT COUNT(*) FROM assignments;
```

Expected values for the current production database:

```text
people       = 186
territories  = 118
assignments  = 573
```

---

# 6. Run database migrations

Run:

```bash
docker exec -it api-api-1 npm run db:migrate
```

Already-applied migrations should be skipped because the restored database
contains the `schema_migrations` table.

Verify:

```sql
SELECT * FROM schema_migrations ORDER BY version;
```

---

# 7. Test the API locally

From the Raspberry:

```bash
curl http://127.0.0.1:3000/health
```

Expected:

```json
{"status":"ok"}
```

The territories endpoint should require authentication:

```bash
curl http://127.0.0.1:3000/territories
```

Expected:

```text
401 Unauthorized
```

---

# 8. Configure Nginx

Create:

```text
/etc/nginx/sites-available/api.sidneijustino.dev
```

Use:

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name api.sidneijustino.dev;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;

    server_name api.sidneijustino.dev;

    ssl_certificate /etc/nginx/ssl/api.sidneijustino.dev.pem;
    ssl_certificate_key /etc/nginx/ssl/api.sidneijustino.dev.key;

    location / {
        proxy_pass http://127.0.0.1:3000;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s   /etc/nginx/sites-available/api.sidneijustino.dev   /etc/nginx/sites-enabled/api.sidneijustino.dev
```

Test:

```bash
sudo nginx -t
```

Reload:

```bash
sudo systemctl reload nginx
```

---

# 9. Restore SSL certificate

Create:

```bash
sudo mkdir -p /etc/nginx/ssl
```

Restore these files:

```text
api.sidneijustino.dev.pem
api.sidneijustino.dev.key
```

to:

```text
/etc/nginx/ssl/
```

Set permissions:

```bash
sudo chmod 644 /etc/nginx/ssl/api.sidneijustino.dev.pem
sudo chmod 600 /etc/nginx/ssl/api.sidneijustino.dev.key
```

Test:

```bash
sudo nginx -t
```

---

# 10. Cloudflare

Configure DNS:

```text
Type: A
Name: api
Target: <CURRENT_PUBLIC_IP>
Proxy: Proxied
```

SSL/TLS mode:

```text
Full (strict)
```

The Raspberry must be reachable through HTTPS.

---

# 11. Router

Configure port forwarding:

```text
Protocol: TCP
External port: 443
Internal IP: 192.168.1.10
Internal port: 443
```

Do NOT expose PostgreSQL port 5432 to the Internet.

Do NOT expose API port 3000 directly to the Internet.

---

# 12. Final tests

Test locally:

```bash
curl -k -I   --resolve api.sidneijustino.dev:443:127.0.0.1   https://api.sidneijustino.dev/health
```

Test externally:

```text
https://api.sidneijustino.dev/health
```

Expected:

```json
{"status":"ok"}
```

Test authentication through the frontend.

Verify:

- Login works
- Territories load
- People load
- Territory details load
- Assign territory works
- Return territory works
- Delete assignment works
- Sync status works

---

# 13. Backup strategy

The PostgreSQL database is backed up using `pg_dump`.

Backups should be kept in at least two locations outside the Raspberry.

Current strategy:

```text
Raspberry
    |
    +-- PostgreSQL backup

PC
    |
    +-- PostgreSQL backup

Online Drive
    |
    +-- PostgreSQL backup
```

The Firebase service account and SSL private key must be stored separately
and securely.

---

# 14. Important Docker information

Current PostgreSQL Docker volume:

```text
territories_db_data
```

Current containers:

```text
api-api-1
api-db-1
```

The API image is built from the repository:

```text
Dockerfile
```

The PostgreSQL image is:

```text
postgres:15
```

The PostgreSQL volume does NOT need to be copied for disaster recovery.
The database should be restored from the PostgreSQL backup instead.

---

# 15. Secrets

The following files contain sensitive information and must NOT be committed
to Git:

```text
secrets/firebase-service-account.json
/etc/nginx/ssl/api.sidneijustino.dev.key
```

Keep secure external copies of these files.

---

# 16. Recovery principle

The system should be rebuilt from:

```text
Git repository
        +
PostgreSQL backup
        +
Firebase credentials
        +
Nginx configuration
        +
Cloudflare configuration
```

The Docker containers themselves do not need to be backed up.

They can be recreated using:

```bash
docker compose up -d --build
```

---

## Important notes

- Do not expose PostgreSQL port 5432 to the Internet.
- Do not expose API port 3000 directly to the Internet.
- Do not commit secrets or private SSL keys to Git.
- The PostgreSQL Docker volume is disposable from a disaster-recovery
  perspective because the database can be rebuilt from the external backup.
- Keep at least one PostgreSQL backup outside the Raspberry.
