# Aplicativo Mobile - Coisas de Garagem

Aplicativo móvel desenvolvido com [Expo](https://expo.dev) e React Native WebView, permitindo acesso completo ao sistema com suporte à câmera nativa para leitura de QR Code.

## Como Gerar Nova Build (APK)

O projeto utiliza o **EAS Build** (Expo Application Services) para compilação em nuvem.

### 1. Pré-requisitos
- Conta no [Expo](https://expo.dev)
- EAS CLI instalado globalmente ou via npx:
  ```bash
  npm install -g eas-cli
  ```
- Fazer login na sua conta Expo:
  ```bash
  eas login
  ```

### 2. Gerar APK para Android
Entre na pasta `mobile` e execute a build com o perfil `preview` (que gera o arquivo `.apk` diretamente para instalação):

```bash
cd mobile
eas build -p android --profile preview
```

### 3. Atualizar o APK no Frontend
Ao final da build, o EAS fornecerá o link para download do APK gerado.
1. Baixe o arquivo `.apk`.
2. Renomeie para `cdg_app.apk`.
3. Substitua o arquivo em `frontend/public/cdg_app.apk`.
4. Faça o commit e push para o repositório para que o site disponibilize a nova versão para download na página `/mobile`.

## Desenvolvimento Local

Para testar o aplicativo no emulador ou celular com o Expo Go:

```bash
cd mobile
npm start
```
