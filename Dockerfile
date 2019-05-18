FROM node:10-alpine

ENV HOME "/home/xpub"

WORKDIR ${HOME}

COPY package.json yarn.lock ./
COPY .babelrc .eslintignore .eslintrc .stylelintignore .stylelintrc ./
COPY definitions definitions
COPY dsl dsl
COPY packages packages

ENV NODE_ENV "development"

RUN [ "yarn", "config", "set", "workspaces-experimental", "true" ]

RUN apk --no-cache add --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers make python && \
  npm install --quiet node-gyp -g &&\
  yarn install --frozen-lockfile && \
  yarn cache clean && \
  apk del native-deps

WORKDIR ${HOME}/packages/app
ENV NODE_ENV "production"

RUN [ "npx", "pubsweet", "build"]

EXPOSE 3000

CMD []
