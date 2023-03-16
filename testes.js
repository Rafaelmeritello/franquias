
obrigatorio = ['nome_loja','nome_proprietario','palavra_passe', 'telefone', 'email','regiao','cpf_cnpj','assistencia']
for(item in obrigatorio){
    campo = body[obrigatorio[item]]
    if(campo == undefined){
        console.log(`esta faltando um campo ${obrigatorio[item]}`)
    }

}