FROM node:18-alpine

# Создаем и устанавливаем рабочую директорию
WORKDIR /home/node/app

# Копируем весь проект (сначала копируем как root)
COPY . .

# Меняем владельца файлов на пользователя node
RUN chown -R node:node /home/node/app

# Переключаемся на пользователя node
USER node

# Устанавливаем зависимости
RUN npm install

# Запускаем development сервер с hot reload
CMD ["npm", "run", "dev"] 