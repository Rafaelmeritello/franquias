const { Db, ObjectId } = require('mongodb');
let sing;
const url_db = 'mongodb://alternattiva01:1babuska7@mongodb.alternattiva.kinghost.net/alternattiva01'
const db_name = 'alternattiva01'
const MongoClient = require('mongodb').MongoClient;



// singleton para realizar o controle do banco de dados mongodb
class Sing{




    constructor(){
        if(sing){
            throw new Error('Uma nova instancia da classe de banco de dados não pode ser criada, ela é um singleton');
        }else{
        sing = this
        }
        this.client = new MongoClient(url_db,{useNewUrlParser:true});
        this.db_name = db_name
        this.connectado = false
        this.db = this.client.db(this.db_name)
    }



    // Essa função insere um objeto em uma determinada coleção no banco de dados.
    async InserirObjeto(Colecao,objeto){
        try{
       
            await this.client.db(this.db_name).collection(Colecao).insertOne(objeto)
        }catch(e){
            throw Error(`Erro ao inserir objeto na coleção ${Colecao}, Erro ${e}`)
        }
    }


   async atualizarobjetos(colecao, filtro,novo){
    try{

        await this.client.db(this.db_name).collection(colecao).updateOne(filtro,{$set:novo})

    }catch(e){
        console.log(e)
    }
   }    

    // Essa função lista os objetos de uma determinada coleção, com a possibilidade de filtrar os objetos retornados.
    async listaObjetos(colecao, filtro = {},requerido={}){
        try{
            
            var dado = await this.db.collection(colecao).find(filtro,{projection: requerido}).toArray();
           
            return dado
        }catch(e){
            throw Error(`Erro ao listar objetos na coleção ${colecao},filtro ${filtro} e Erro ${e}`);
        }
    }




    // Essa função lista os objetos de uma determinada coleção de forma paginada, com a possibilidade de filtrar os objetos retornados
    async listaObjetos_Paginada(colecao, filtro = {},requerido={}, pagina=1, item_por_pagina=10){
        try{
           
            var dado = await this.db.collection(colecao).find(filtro,{projection: requerido}).skip(pagina).limit(item_por_pagina).toArray();
      
            return dado
        }catch(e){
            throw Error(`Erro ao listar objetos paginados na coleção ${colecao},filtro ${filtro} e Erro ${e}`)
        } 
    }



    //Essa função exclui um objeto único de uma determinada coleção, com base no id.
    async excluir_objeto_Unico(colecao,id){
        try{
          
            await this.db.collection(colecao).deleteOne({_id:ObjectId(id)});
        }catch(e){
            throw Error(`Erro ao excluir objeto na coleção ${colecao},filtro ${filtro} e Erro ${e}`)
        } 
    }




    // excluir_objeto_multiplos: Essa função exclui múltiplos objetos de uma determinada coleção, com base em um filtro específico
    async excluir_objeto_multiplos(colecao,filtro){
        try{
            
            await this.db.collection(colecao).deleteMany(filtro);
        }catch(e){
            throw Error(`Erro ao excluir objeto na coleção ${colecao},filtro ${filtro} e Erro ${e}`)
        } 
    }



    // buscarobjeto_por_id: Essa função busca um objeto único de uma determinada coleção, com base no ID do objeto.
    async buscarobjeto_por_id(colecao,id='',requerido={}){
        try{
            
           var objeto =  await this.db.collection(colecao).findOne({_id:ObjectId(id)},{projection: requerido})
           
           return objeto
        }catch(e){
            throw Error(`Erro ao buscar objeto por id na coleção ${colecao},id ${id} e Erro ${e}`)
        } 
    }


    // busca um objeto unico atravez de um filtro especificado
    async buscarobjeto_Unico_por_filtro(colecao,filtro={},requerido={}){
        try{
            
           var objeto =  await this.db.collection(colecao).findOne(filtro,{projection: requerido})
           
           return objeto
        }catch(e){
            throw Error(`Erro ao buscar objeto por id na coleção ${colecao},id ${id} e Erro ${e}`)
        } 
    }
}




sing = new Sing()

module.exports = {
    databaseAdmin: sing,
}