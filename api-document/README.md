# Skeleton project for Swagger

# api-document
with swagger node


### swagger
```
npm install swagger -g

swagger project create [project name]

swagger project start

swagger project edit -s
```

### swagger start시 에러발생하면
```
[node_modules/bagpipes/lib/fittingTypes/user.js] 해당 경로로 들어가서
var split = err.message.split(path.sep);부분을
var split = err.message.split('\n')[0].split(path.sep); 이렇게 변경해주면 해결할 수 있다
```

### swagger ui, swagger-jsdoc
```
npm install --save-dev swagger-ui-express swagger-jsdoc 

swagger-ui-express: express에 swagger ui를 쉽게 붙일 수 있습니다.
swagger-jsdoc: Comment 형식으로 문서를 작성할 수 있습니다.
```

