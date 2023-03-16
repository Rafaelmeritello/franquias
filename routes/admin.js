var express = require('express');
var router = express.Router();

const {databaseAdmin} = require('../database_singlenton')
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const bcryptInstance = bcrypt;

const { regioes } = require('../main.js');






// - inicio - funcoes - inicio - //
async function gerarCodigo() {
  let valid = false;
  while(!valid) {
    const code = Math.floor(Math.random()*9000)+1000;
    const result = await databaseAdmin.buscarobjeto_Unico_por_filtro('afiliados', {codigo: code});
    
    if(!result) {
      valid = true;
      return code;
    }
  }
}




function login_administrador_obrigatorio(req,res,next){
  if(req.session.administrador){
    next()
  }else{
    res.redirect('/admin/login')
  }
}
// - fim - funções  - fim - //







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
  var msg = req.query.msg;
  res.render('model', {titulo:"Painel de controle", pagina:'painel.ejs'});
})










router.post('/codigoexistente', function(req, res, next) {
  var codigo = req.body.codigo;
  databaseAdmin.buscarobjeto_Unico_por_filtro('afiliados', {codigo: codigo}).then((result) => {
    if(result) {
      res.send(true);
    } else {
      res.send(false);
    }
  }).catch((err) => {
    console.error(err);
    res.send(false);
  });
});









router.get('/cadastroafiliado',  function(req, res) {
  if(!req.session.administrador){
    res.send('acesso negado')
  }
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  gerarCodigo().then((result) => {
    
    code = result;
    var err = req.query.err;
    res.render('model', {titulo: "Cadastro", pagina: 'cadastro_afiliado.ejs', regioes: regioes, err: err, code: code});
  }).catch((err) => {
    console.error(err);
    var mensagemErro = "Erro ao gerar código. Por favor, tente novamente.";
    res.render('model', {titulo: "Cadastro|Afiliados", pagina: 'cadastro_afiliado.ejs', regioes: regioes, err: mensagemErro});
  });
});







router.post('/cadastroafiliado',login_administrador_obrigatorio, async function(req, res, next) {
  body = req.body

  err = false
  obrigatorio = ['nome_loja','nome_proprietario','palavra_passe', 'telefone', 'email','cpf_cnpj','assistencia','codigo']
for(item in obrigatorio){
   campo = body[obrigatorio[item]]
   if(campo == undefined){
       console.log(campo)
       err = true;
       res.redirect('/admin/cadastroafiliado?err=esta faltando campos para preencher')

    }

}

await databaseAdmin.buscarobjeto_Unico_por_filtro('afiliados', {codigo: body.codigo}).then((result) => {
  if(result) {
    err = true;
    res.redirect('/admin/cadastroafiliado?err=este codigo ja esta sendo usado')
  }
})



if(err == false){

  databaseAdmin.InserirObjeto('afiliados',body)
  res.redirect('/admin/painel')
}
})




module.exports = router;


