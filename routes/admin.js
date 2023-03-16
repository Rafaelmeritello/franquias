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
router.get('/cadastroafiliado',login_administrador_obrigatorio, function(req, res, next) {
  console.log(req.query.err)
  var err = req.query.err
  console.log(databaseAdmin.buscarobjeto_Unico_por_filtro('afiliados',{'codigo':'2723'}))
  res.render('model', {titulo:"Cadastro", pagina:'cadastro_afiliado.ejs', regioes:regioes, err:err});
})




router.post('/cadastroafiliado',login_administrador_obrigatorio, function(req, res, next) {
  body = req.body
  
//obrigatorio = ['nome_loja','nome_proprietario','palavra_passe', 'telefone', 'email','','cpf_cnpj','assistencia']
//for(item in obrigatorio){
//    campo = body[obrigatorio[item]]
  //  if(campo == undefined){
    //    res.redirect('/admin/cadastroafiliado?err=esta faltando campos para preencher')
    //}

//}

  databaseAdmin.InserirObjeto('afiliados',body)
  res.redirect('/admin/painel')
})
module.exports = router;


