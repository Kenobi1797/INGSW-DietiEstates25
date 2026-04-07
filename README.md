# INGSW-DietiEstates25

## Avvio consigliato (Docker Compose)

Per evitare mismatch tra servizi applicativi e database, usare direttamente Docker Compose.

### Prerequisiti
- Docker
- Docker Compose (plugin `docker compose`)

### Avvio stack completo
Dal root del repository:

```bash
docker compose up --build
```

Nota: questo comando resta in foreground e mostra i log live dei servizi.

Servizi esposti:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- PostgreSQL: localhost:5433

### Verifica rapida
```bash
docker compose ps
curl -sS -o /dev/null -w '%{http_code}\n' http://localhost:5000
curl -sS -o /dev/null -w '%{http_code}\n' http://localhost:3000
```

Se tutto e' ok, i `curl` restituiscono `200`.

### Logs
```bash
docker compose logs -f
```

### Stop
```bash
docker compose down
```

Per fermare ed eliminare anche i volumi (reset dati DB):

```bash
docker compose down -v
```

## Test

I test automatici sono presenti nel backend.

Con stack gia' avviato via Compose:

```bash
docker compose exec -T dietiestates-backend npm test
```

Per report coverage in formato sonar:

```bash
docker compose exec -T dietiestates-backend npm run test:coverage:sonar
```

Senza Docker (locale):

```bash
cd dietiestates-backend
npm ci
npm test
```

Coverage locale:

```bash
cd dietiestates-backend
npm run test:coverage:sonar
```

## Avvio senza Docker (opzionale)

Usare questa modalita' solo se hai un database Postgres locale configurato in modo coerente con le variabili ambiente del backend.

Backend:

```bash
cd dietiestates-backend
npm ci
npm run dev
```

Frontend:

```bash
cd dietiestates-frontend
npm ci
npm run dev
```

URL locali:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Troubleshooting

### Errore: `Bind for 0.0.0.0:5000 failed: port is already allocated`
Un altro container/processo sta usando la porta 5000 (spesso anche 3000).

Controllo rapido:
```bash
docker ps --filter publish=5000 --format '{{.ID}} {{.Names}}'
docker ps --filter publish=3000 --format '{{.ID}} {{.Names}}'
```

Ferma i container in conflitto e rilancia:
```bash
docker stop <container_id_5000> <container_id_3000>
docker compose down --remove-orphans
docker compose up -d --build
```