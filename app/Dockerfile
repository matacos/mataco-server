FROM node
RUN mkdir /usr/app
WORKDIR /usr/app
COPY package.json package.json
RUN npm install
COPY *.js ./
COPY routes ./routes
CMD ["npm", "start"]