FROM node:22-alpine AS base

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm prune \
	&& npm install \
	&& npm dedupe \
	&& npm audit fix

COPY . .
EXPOSE 5000

# Configurazione ottimizzata per ridurre riavvii in sviluppo
CMD ["npm", "run", "dev"]
