# Express-boilerplate

Node Express Best Practices

## 참고

- 항상 npm init를 사용하여 노드 프로젝트를 시작하십시오 .

- 항상 --save 또는 --save-dev를 사용하여 종속성을 설치하십시오 . 이렇게하면 다른 플랫폼으로 이동할 경우 npm install 을 실행 하여 모든 종속성을 설치할 수 있습니다 .

- 소문자 파일 이름과 camelCase 변수를 사용하십시오. npm 모듈을 보면 소문자로 이름이 지정되고 대시로 구분됩니다. 이 모듈이 필요할 때마다 camelCase를 사용하십시오.

- node_modules를 저장소로 푸시하지 마십시오. 대신 npm은 개발 시스템에 모든 것을 설치합니다.

- 구성 파일을 사용하여 변수 저장markdown previewmarkdown preview
- 경로를 자신의 파일로 그룹화하고 격리합니다. 예를 들어 REST API 페이지에서 본 영화 예제에서 CRUD 작업을 수행하십시오.

## 프로젝트 구조 (웹 사이트)

```
test-project/
   node_modules/
   config/
      db.js                //Database connection and configuration
      credentials.js       //Passwords/API keys for external services used by your app
      config.js            //Other environment variables
   models/                 //For mongoose schemas
      users.js
      things.js
   routes/                 //All routes for different entities in different files
      users.js
      things.js
   views/
      index.pug
      404.pug
        ...
   public/                 //All static content being served
      images/
      css/
      javascript/
   app.js
   routes.js               //Require all routes in this and then require this file in
   app.js
   package.json
```

## 프로젝트 구조 (RESTful API)

```
test-project/
   node_modules/
   config/
      db.js                //Database connection and configuration
      credentials.js       //Passwords/API keys for external services used by your app
   models/                 //For mongoose schemas
      users.js
      things.js
   routes/                 //All routes for different entities in different files
      users.js
      things.js
   app.js
   routes.js               //Require all routes in this and then require this file in
   app.js
   package.json
```

### Express

```
npm install express-generator -g
express --view=ejs myapp
npm install --save cookie-parser
```

### nodemon

```
npm install -g nodemon
```

### morgan

```
npm install --save morgan
```

### helmet

```
npm install --save helmet
```

### pug

```
npm install --save pug
```

### mongoose

```
npm install --save mongoose
```

### dotenv

```
npm install --save-dev dotenv
```

### multer

```
npm install --save-dev multer
```

### eslint

```
npm install --save-dev eslint -g
```

### webpack

```
npm install --save-dev webpack webpack-cli
npm install --save-dev extract-text-webpack-plugin@next
npm install --save-dev autoprefixer
npm install --save-dev css-loader
npm install --save-dev node-sass
npm install --save-dev postcss-loader
npm install --save-dev sass-loader
npm install --save-dev @babel/core @babel/cli @babel/preset-env
npm install --save-dev babel-loader
npm install --save-dev @babel/node@7.8.4
```

### passport

```
npm install --save passport
npm install --save passport-local
npm install --save passport-local-mongoose
npm install --save passport-jwt
npm install --save jsonwebtoken
```

### cors

```
npm install --save cors
```

### nodemailer

```
npm install --save nodemailer
```

### multer

```
npm install --save multer
```
