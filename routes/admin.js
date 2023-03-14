var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
  
  res.render('index', { usuario: req.session.usuario });
});


router.post('/login', function(req,res){
  req.session.usuario = req.body.usuario
  req.session.senha = req.body.senha
  console.log(req.session)
  console.log('aaa')
  res.redirect('/')
})



module.exports = router;
