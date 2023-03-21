var express = require('express');
var router = express.Router();
const {databaseAdmin} = require('../database_singlenton')

router.get('/', function(req, res, next) {
  res.send('Em Construção');
});



router.get('/dadosafiliado/:codigo?',async function(req,res){
  msg = req.query.msg
 codigo = req.params.codigo || req.query.codigo  
 afiliado = await databaseAdmin.buscarobjeto_Unico_por_filtro('afiliados',{codigo:codigo})
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
  quantidade = req.params.quantidade
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
  quantidade = req.params.quantidade

    
    produto.devolucoes = parseInt(produto.devolucoes) + parseInt(quantidade)
    await databaseAdmin.atualizarobjeto_por_id('produtos',req.params.id,produto)
    res.redirect(`/dadosafiliado/${produto.codigo_loja}?msg=Solicitacao de devolucao enviada com sucesso, o recolhimento podera ser feito a qualquer momento`)
  
})


module.exports = router;
