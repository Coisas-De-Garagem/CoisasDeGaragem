import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, Platform, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useEffect } from 'react';

export default function App() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();

  useEffect(() => {
    (async () => {
      // Solicita permissões logo que o app inicia na primeira vez
      if (!cameraPermission?.granted && cameraPermission?.canAskAgain) {
        await requestCameraPermission();
      }
      if (!microphonePermission?.granted && microphonePermission?.canAskAgain) {
        await requestMicrophonePermission();
      }
    })();
  }, [cameraPermission, microphonePermission]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <WebView
        // 👇👇 COLOQUE A URL DO SEU SITE EM PRODUÇÃO AQUI 👇👇
        // Exemplo: 'https://coisasdegaragem.vercel.app'
        source={{ uri: 'https://coisas-de-garagem-test.vercel.app/' }}
        style={{ flex: 1 }}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    ...Platform.select({
      android: {
        // Para evitar que a webview fique por baixo da status bar no Android
        paddingTop: 24,
      },
    }),
  },
});
