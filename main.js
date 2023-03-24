var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');


var app = express();
app.listen(21057, () => {
  console.log('Servidor iniciado na porta 21057...');
});



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');





app.use(session({
  secret: 'mysecret', // Chave secreta para assinar o cookie da sessão
  resave: false, // Não salva a sessão no servidor a cada requisição
  saveUninitialized: true, // Salva uma sessão vazia se não houver dados
  cookie: {
    maxAge: 24* 60 * 1000 // Tempo de expiração do cookie da sessão em milissegundos
  }
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/public', express.static(__dirname+'/public'));
app.use('/images',express.static(path.join(__dirname, 'public/images')));
app.use('/js',express.static(path.join(__dirname, 'public/javascripts')));
app.use('/css',express.static(path.join(__dirname, 'public/stylesheets')));


app.use(function(req, res, next) {
  res.locals.administrador = req.session.administrador ;
  next();
});












const regioes = [
  'NITERÓI-REGIAO-OCEANICA'
  ,'NITERÓI-CENTRO'
  ,'NITERÓI-OUTROS-BAIRROS'
  ,'RIO DE JANEIRO-CENTRO'
  ,'RIO DE JANEIRO-ZONA NORTE'
  ,'RIO DE JANEIRO-ZONA OESTE'
  ,'RIO DE JANEIRO-ZONA SUL'
  ,'REGIAO DOS LAGOS-MARICA'
  ,'REGIAO DOS LAGOS-CABO FRIO'
  ,'REGIAO DOS LAGOS-SAQUAREMA'
  ,'REGIAO DOS LAGOS-ARARUAMA'
  ,'SAO GONçALO' 
  ,'REGIAO SERRANA'
]


module.exports = {
  app: app,
  regioes: regioes,
};






var adminRouter = require('./routes/admin');
var indexRouter = require('./routes/index');


app.use('/admin', adminRouter);
app.use('/', indexRouter);



