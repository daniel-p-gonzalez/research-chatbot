FROM node:slim
WORKDIR /app
COPY . .
RUN yarn install --frozen-lockfile

EXPOSE 3000
EXPOSE 8233
#CMD yarn run server:express
#CMD yarn run server:embed
CMD yarn run start
