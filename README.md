# fp-main
This is a ready to use bundle for development purposes.

## Prerequisites

Git and nodejs should be installed.

For Windows users, please install first Git for Windows: https://windows.github.com/

Then download NodeJS should be installed and follow instructions on the website.
https://nodejs.org/en/download/


## Preparation: Install components

Install Express. More info at http://expressjs.com 
```
npm install express --save
```


Install requirejs.
More info at http://requirejs.org/docs/node.html
```
npm install --save requirejs
```

Now install winston for logging.
More info at https://github.com/winstonjs/winston
```
npm install --save winston
```

Install gulp globally
```
npm install -g gulp
```

Install gulp for dev
```
npm install --save-dev gulp
```

Install browserify, rectify and vinyl-source-stream.

// http://browserify.org/
// https://github.com/andreypopp/reactify
// https://github.com/hughsk/vinyl-source-stream
```
npm install --save-dev browserify reactify vinyl-source-stream
```

Install bower. 
More info http://bower.io/
```
npm install -g bower
```

Install bootstrap
```
bower install --save bootstrap-sass-official
```

Set up our Gulp file to automatically build our SASS and add it to our application.
```
npm install --save-dev gulp-sass
```

Install & save react and react-dom.
More info at https://facebook.github.io/react
```
bower install --save react
```

## Custom Javascript files
Source files of `javascript` and `jsx` are located in `./public/javascripts/src/`

Compiled files of `javascript` and `jsx` are located in `./public/javascripts/build/`


// end
