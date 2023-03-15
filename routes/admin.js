var express = require('express');
var router = express.Router();

const {databaseAdmin} = require('../database_singlenton')
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const bcryptInstance = bcrypt;

const { regioes } = require('../main.js');

function login_administrador_obrigatorio(req,res,next){
  if(req.session.administrador){
    next()
  }else{
    res.redirect('/admin/login')
  }
}

router.get('/login/:numero?', function(req, res, next) {
  console.log(regioes)
  delete req.session.administrador
    param = req.params.numero
    erro = undefined;
    if(param == 1){
      erro = 'usuario ou senha incorretos'
    }
    if(param == 2){
      erro = 'erro ao logar'
    }
      res.render('admin_login', {erro:erro});
    

  
  
});


router.post('/login', function(req,res){


  nome_administrador = req.body.administrador
  databaseAdmin.buscarobjeto_Unico_por_filtro('administradores',{nome:nome_administrador}).then((administrador) => {
    if(administrador == null){
 
      res.redirect('/admin/login/1')
    }else{
      bcryptInstance.compare(req.body.senha, administrador.senha, function(err, result) {
        if(result){
          req.session.administrador = administrador.nome

          res.redirect('/admin/painel')
        }else{

          res.redirect('/admin/login/1')
        }
      });
    }
  }).catch((err) => {

    res.redirect('/admin/login/2')

  })
  })










router.get('/painel',login_administrador_obrigatorio, function(req, res, next) {
  
  res.render('model', {titulo:"Painel de controle", pagina:'painel.ejs'});
})



//make a route for render model page including titulo and pagina variables
router.get('/cadastroloja',login_administrador_obrigatorio, function(req, res, next) {


 
  res.render('model', {titulo:"Cadastro", pagina:'cadastro_loja.ejs', regioes:regioes});
})

module.exports = router;


