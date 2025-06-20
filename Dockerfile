FROM node:18-alpine

# Переключаемся на пользователя node (UID 1000, как у ns на хосте)
USER node

# Создаем и устанавливаем рабочую директорию
WORKDIR /home/node/app

# Копируем весь проект
COPY --chown=node:node . .

# Устанавливаем зависимости
RUN npm install

# Запускаем development сервер с hot reload
CMD ["npm", "run", "dev"] 