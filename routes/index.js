var express = require('express');
var router = express.Router();
const {databaseAdmin} = require('../database_singlenton')

router.get('/', function(req, res, next) {
  res.send('Em Construção');
});


router.get('/dadosloja/:codigo',async function(req,res){

 afiliado = await databaseAdmin.buscarobjeto_Unico_por_filtro('afiliados',{codigo:req.params.codigo})
  if(afiliado){
    console.log(afiliado.regiao)
    res.render('model.ejs', {pagina:'verloja.ejs',titulo:afiliado.nome_loja, afiliado:afiliado})


  }else{
    res.send("não foi encontrada nenhuma loja com esse codigo")
  }
})

module.exports = router;
