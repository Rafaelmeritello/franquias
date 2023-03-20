var express = require('express');
var router = express.Router();

const {databaseAdmin} = require('../database_singlenton')
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const bcryptInstance = bcrypt;

const { regioes } = require('../main.js');






// - inicio - funcoes - inicio - //

function separar_produtos_loja(produtos){
separados = {}
produtos.forEach(produto => {
    lista_loja = []
    if(separados[produto.loja] == undefined){
        lista_loja.push(produto)
        separados[produto.loja] = lista_loja
    }else{
        separados[produto.loja].push(produto)
    }

}); 
return separados
}

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
    res.send("acesso negado")
  }
}
// - fim - funções  - fim - //






// login admin
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



// fim login admin









// paineis

router.get('/painel',login_administrador_obrigatorio, function(req, res, next) {
  var msg = req.query.msg;
  res.render('model', {titulo:"Painel de controle", pagina:'adminpainel.ejs'});
})

  
router.get('/painelbusca',function(req,res){
  if(!req.session.administrador){
    res.send('acesso negado')
  }
  res.render('model', {titulo:"Busca", pagina:'buscas/painelbusca.ejs', regioes:regioes})
})



// fim paineis






// ajax

router.post('/codigoexistente', function(req, res, next) {
  var codigo = req.body.codigo;
  databaseAdmin.buscarobjeto_Unico_por_filtro('afiliados', {codigo: codigo}).then((result) => {
    if(result) {
      res.send(true);
    } else {
      res.send(false);
    }
  }).catch((err) => {
    c
    res.send(false);
  });
});

// fim ajax






// afiliados



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
    res.render('model', {titulo: "Cadastro", pagina: 'afiliados/cadastro_afiliado.ejs', regioes: regioes, err: err, code: code});
  }).catch((err) => {

    var mensagemErro = "Erro ao gerar código. Por favor, tente novamente.";
    res.render('model', {titulo: "Cadastro|Afiliados", pagina: 'afiliados/cadastro_afiliado.ejs', regioes: regioes, err: mensagemErro});
  });
});







router.post('/cadastroafiliado',login_administrador_obrigatorio, async function(req, res, next) {
  body = req.body

  err = false
  obrigatorio = ['nome_loja','nome_proprietario','palavra_passe', 'telefone', 'email','cpf_cnpj','assistencia','codigo']
for(item in obrigatorio){
   campo = body[obrigatorio[item]]
   if(campo == undefined){
       
       err = true;
       res.redirect('/admin/cadastroafiliado?err=esta faltando campos para preencher')

    }

}
const hash = await bcrypt.hash(req.body.palavra_passe, 10)
req.body.palavra_passe = hash

await databaseAdmin.buscarobjeto_Unico_por_filtro('afiliados', {codigo: body.codigo}).then((result) => {
  if(result) {
    err = true;
    res.redirect('/admin/cadastroafiliado?err=este codigo ja esta sendo usado')
  }
})



if(err == false){

  databaseAdmin.InserirObjeto('afiliados',body)
  res.redirect(`/dadosafiliado/${body.codigo}`)
}
})

















router.get('/editarafiliado/:codigo?',login_administrador_obrigatorio, async function(req,res){
  afiliado = await databaseAdmin.buscarobjeto_Unico_por_filtro('afiliados',{codigo:req.params.codigo})
  if(afiliado){
    res.render('model',{titulo:'Editar', pagina:'afiliados/editarafiliado.ejs', afiliado:afiliado, regioes:regioes})
  }else{
    res.send("nenhum afiliado encontrado")
  }
})




router.post('/editarafiliado/:codigo', login_administrador_obrigatorio, async function(req,res){

  if(req.body.palavra_passe == ''){
    delete req.body.palavra_passe
  }else{
    const hash = await bcrypt.hash(req.body.palavra_passe, 10)
    req.body.palavra_passe = hash
  }
  console.log(req.body)
  
  await databaseAdmin.atualizarobjeto('afiliados',{codigo:req.params.codigo},req.body)
  res.redirect(`/dadosafiliado/${req.params.codigo}`)
} )














router.get('/apagarafiliado/:codigo', login_administrador_obrigatorio, async function(req,res){

    await databaseAdmin.excluir_objeto_multiplos('afiliados',{codigo:req.params.codigo})

    res.redirect('/admin/painel')

})





router.get('/listagemafiliadosregiao', login_administrador_obrigatorio ,async function(req,res){
  regiao = req.query.regiao
  

  afiliados = []
  if(regiao == 'todas'){
    afiliados = await databaseAdmin.listaObjetos('afiliados', {})

  }else{
    afiliados = await databaseAdmin.listaObjetos('afiliados', {regiao:regiao})
  }


  res.render('model',{titulo:'Listagem', pagina:'buscas/buscaregiao.ejs', regioes:regioes, afiliados:afiliados, regiao:regiao})

})



// afilados - fim



//produtos

router.get("/incluirproduto/:codigoloja",login_administrador_obrigatorio, async function(req,res){
  msg = req.query.msg
  loja = await databaseAdmin.buscarobjeto_Unico_por_filtro('afiliados',{codigo:req.params.codigoloja})
  if (!loja){
    res.send("nenhuma loja com esse codigo foi encontrada")
  }

  res.render('model',{titulo:'Incluir produto', pagina:'produtos/incluirproduto.ejs',codigoloja:req.params.codigoloja, msg:msg})
})



router.post("/incluirproduto/:codigoloja",login_administrador_obrigatorio, async function(req,res){
  loja = await databaseAdmin.buscarobjeto_Unico_por_filtro('afiliados',{codigo:req.params.codigoloja})
  if (!loja){
    res.send("nenhuma loja com esse codigo foi encontrada")
  }
  
  obrigatorio = ['nome','valor','estoque']
  err = false
  for(item in obrigatorio){
    campo = req.body[obrigatorio[item]]
    if(campo == undefined){
      err = true;
      res.redirect(`/admin/incluirproduto/${req.params.codigoloja}?msg=esta faltando campos para preencher`)
    }
  }
  if(err == false){
    req.body.codigo_loja = req.params.codigoloja
    req.body.nome_loja = loja.nome_loja;
    req.body.telefone_loja = loja.telefone; 
    req.body.proprietario_loja = loja.nome_proprietario;
    req.body.vendidos = '0';
    req.body.devolucoes = '0';
    databaseAdmin.InserirObjeto('produtos',req.body)
  }
  res.redirect(`/admin/incluirproduto/${req.params.codigoloja}?msg=produto cadastrado com sucesso`)
})










router.get("/editarproduto/:id",login_administrador_obrigatorio, async function(req,res){
  msg = req.query.msg
  produto = await databaseAdmin.buscarobjeto_por_id('produtos',req.params.id)
  if (!produto){
    res.send("nenhum produto com esse codigo foi encontrado")
  }


  res.render('model',{titulo:'Editar produto', pagina:'produtos/editarproduto.ejs',produto:produto, msg:msg})
})


router.post("/editarproduto/:id",login_administrador_obrigatorio, async function(req,res){
  produto = await databaseAdmin.buscarobjeto_por_id('produtos',req.params.id)
  if (!produto){
    res.send("nenhum produto com esse codigo foi encontrado")
  }
  obrigatorio = ['nome','valor','estoque', 'vendidos','devolucoes']
  err = false
  for(item in obrigatorio){
    campo = req.body[obrigatorio[item]]
    if(campo == undefined){
      err = true;
      res.redirect(`/admin/editarproduto/${req.params.id}?msg=esta faltando campos para preencher`)
    }
  }
  if(err == false){
    databaseAdmin.atualizarobjeto_por_id('produtos',req.params.id,req.body)
    res.redirect(`/dadosafiliado/${produto.codigo_loja}?msg=produto editado com sucesso`)
  }
  })



  









  router.get("/apagarproduto/:id",login_administrador_obrigatorio, async function(req,res){
    produto = await databaseAdmin.buscarobjeto_por_id('produtos',req.params.id)
    if (!produto){
      res.send("nenhum produto com esse codigo foi encontrado")
    }
    await databaseAdmin.excluir_objeto_Unico_por_id('produtos',req.params.id)
    res.redirect(`/dadosafiliado/${produto.codigo_loja}?msg=produto excluido com sucesso`)
  })




// produtos fim

module.exports = router;


