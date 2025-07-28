# Criação de Usuário Administrador

Este diretório contém um script para criar um novo usuário administrador no sistema.

## Instruções

Para criar um novo usuário administrador, siga os passos abaixo:

1. Certifique-se de que o ambiente Node.js está configurado corretamente
2. Navegue até a pasta raiz do projeto no terminal
3. Execute o seguinte comando:

```bash
node scripts/create_admin.js
```

4. O script criará um novo usuário administrador com as seguintes credenciais:
   - Email: novo.admin@sistema.com
   - Senha: admin123

## Personalização

Se desejar personalizar as informações do usuário administrador, edite o arquivo `scripts/create_admin.js` e modifique os seguintes campos no objeto `userData`:

```javascript
const userData = {
  nome: 'Novo Administrador',      // Nome do administrador
  email: 'novo.admin@sistema.com', // Email do administrador
  senha: 'admin123',               // Senha do administrador
  tipo_usuario: 'admin',           // Tipo de usuário (mantenha como 'admin')
  ativo: true                      // Status do usuário
};
```

## Segurança

**Importante**: Em ambiente de produção, certifique-se de:

1. Usar uma senha forte e segura
2. Alterar a senha imediatamente após o primeiro login
3. Não compartilhar as credenciais de administrador
4. Remover ou proteger este script após a criação do usuário
