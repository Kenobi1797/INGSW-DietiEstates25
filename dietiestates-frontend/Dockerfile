FROM node:22-alpine AS dev

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copia solo il necessario per la dev experience.
COPY next-env.d.ts ./
COPY next.config.ts ./
COPY postcss.config.mjs ./
COPY eslint.config.mjs ./
COPY tsconfig.json ./
COPY public ./public
COPY src ./src

RUN chown -R node:node /usr/src/app
USER node

EXPOSE 3000

CMD ["npm", "run", "dev"]