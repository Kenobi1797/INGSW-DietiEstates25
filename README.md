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
