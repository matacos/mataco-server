FROM node
RUN mkdir /usr/app
WORKDIR /usr/app
COPY package.json package.json
RUN npm install
COPY *.js .
COPY wait-and-run.sh wait-and-run.sh
ENTRYPOINT ["bash","wait-and-run.sh"]