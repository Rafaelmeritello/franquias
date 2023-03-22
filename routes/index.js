var express = require('express');
var router = express.Router();
const {databaseAdmin} = require('../database_singlenton')
const bcrypt = require('bcryptjs');
const bcryptInstance = bcrypt;


// login inicio
router.get('/', function(req, res, next) {
  erro = req.query.erro
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  if(req.session.afiliado){
    res.redirect('/dadosafiliado/'+req.session.afiliado)
  }else{
    delete req.session.administrador
    delete req.session.afiliado
  res.render('afiliado_login.ejs',{erro:erro});
  }
});







router.post('/login',  async function(req,res){


  codigo_loja = req.body.codigo

  databaseAdmin.buscarobjeto_Unico_por_filtro('afiliados',{codigo:codigo_loja}).then((loja) => {

    if(loja == null){
 
      res.redirect('/?erro=Usuario ou senha incorretos')
    }else{
     
      bcryptInstance.compare(req.body.senha, loja.palavra_passe, function(err, result) {

        if(result){
          req.session.afiliado = codigo_loja
      
          res.redirect(`/dadosafiliado/${codigo_loja}`)
        }else{

          res.redirect('/?erro=Usuario ou senha incorretos')
        }
      });
    }
  }).catch((err) => {

    res.redirect('/?erro=Usuario ou senha incorretos')

  })
  })



  router.get('/logout', function(req,res){
    delete req.session.administrador
    delete req.session.afiliado
    res.redirect('/')
  })


// login fim





router.get('/dadosafiliado/:codigo?',async function(req,res){
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  if(!req.session.afiliado && !req.session.administrador){
    res.redirect('/')
    return;
  }
  if(req.session.afiliado && req.session.afiliado != req.params.codigo){
    res.redirect('/dadosafiliado/'+req.session.afiliado)
    return;
  }

  msg = req.query.msg
  
 codigo = req.params.codigo || req.query.codigo  
 afiliado = await databaseAdmin.buscarobjeto_Unico_por_filtro('afiliados',{codigo:codigo})
 if(! afiliado){
    afiliado = await databaseAdmin.buscarobjeto_Unico_por_filtro('afiliados',{cpf_cnpj:req.query.codigo})
    res.redirect('/dadosafiliado/'+afiliado.codigo)
 }

  if(! afiliado){
    res.send("não foi encontrada nenhum afiliado com esse codigo") 
  }
  avisodasemana = await databaseAdmin.buscarobjeto_por_id('avisodasemana','641981ad8ba8c3a9a4503972')
  produtos = await databaseAdmin.listaObjetos('produtos',{codigo_loja:afiliado.codigo})
  res.render('model.ejs', {aviso:avisodasemana.texto,msg:msg,pagina:'afiliados/verafiliado.ejs',titulo:afiliado.nome_loja, afiliado:afiliado, produtos:produtos})
})




router.get("/informavenda/:id/:quantidade",async function(req,res){
  produto = await databaseAdmin.buscarobjeto_por_id('produtos',req.params.id)
  if (!produto){
    res.send("nenhum produto com esse codigo foi encontrado")
  }
  if(!req.session.afiliado && !req.session.administrador){
    res.redirect('/')
  }
  if(produto.codigo_loja != req.session.afiliado && !req.session.administrador){
    res.redirect('/dadosafiliado/'+req.session.afiliado)
  }


  quantidade = req.params.quantidade
  if (quantidade <=0 ){
    res.send('erro')
  }
  if(parseInt(quantidade) > parseInt(produto.estoque)){
    console.log(`quantidade: ${quantidade} estoque: ${produto.estoque}`)
    res.redirect(`/dadosafiliado/${produto.codigo_loja}?msg=quantidade maior que o estoque`)
  }else{
    produto.estoque = produto.estoque - quantidade
    produto.vendidos = parseInt(produto.vendidos) + parseInt(quantidade)
    await databaseAdmin.atualizarobjeto_por_id('produtos',req.params.id,produto)
    res.redirect(`/dadosafiliado/${produto.codigo_loja}?msg=Solicitacao de venda enviada com sucesso, lembre-se de anotar o valor a pagar`)
  }
})




router.get("/informadevolucao/:id/:quantidade",async function(req,res){
  produto = await databaseAdmin.buscarobjeto_por_id('produtos',req.params.id)
  if (!produto){
    res.send("nenhum produto com esse codigo foi encontrado")
  }
  if(!req.session.afiliado && !req.session.administrador){
    res.redirect('/')
  }
  if(produto.codigo_loja != req.session.afiliado && !req.session.administrador){
    res.redirect('/dadosafiliado/'+req.session.afiliado)
  }

  quantidade = req.params.quantidade
  if (quantidade <=0 ){
    res.send('erro')
  }
    
    produto.devolucoes = parseInt(produto.devolucoes) + parseInt(quantidade)
    await databaseAdmin.atualizarobjeto_por_id('produtos',req.params.id,produto)
    res.redirect(`/dadosafiliado/${produto.codigo_loja}?msg=Solicitacao de devolucao enviada com sucesso, o recolhimento podera ser feito a qualquer momento`)
  
})



router.use((req, res, next) => {
  res.status(404).render('model', { titulo: 'Página não encontrada' , pagina:'404.ejs'});
});
module.exports = router;
