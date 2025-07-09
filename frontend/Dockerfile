# --- Build-Phase ---
FROM --platform=linux/amd64 node:20-bullseye AS builder

ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

# Optional (nur falls TLS-Fehler auftreten):
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

WORKDIR /app
COPY package*.json ./
RUN npm cache clean --force
RUN npm config set strict-ssl false
RUN npm install --force
RUN npm install lightningcss@latest --force
COPY . .
RUN npm run build

# --- Produktionsserver ---
FROM --platform=linux/amd64 node:20-bullseye
WORKDIR /app
COPY --from=builder /app ./
RUN npm install --omit=dev

EXPOSE 3000
CMD ["npm", "start"]
