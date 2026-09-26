import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  SafeAreaView,
  Platform,
  BackHandler,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';

const PRODUCTION_URL = 'https://www.coisasdegaragem.com.br';

export default function App() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef(null);

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

  // Trata o botão físico/gesto de "Voltar" no Android para navegar no histórico da WebView
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const backHandlerSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    return () => backHandlerSubscription.remove();
  }, [canGoBack]);

  const handleRetry = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const renderError = (errorDomain, errorCode, errorDesc) => {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Não foi possível carregar</Text>
          <Text style={styles.errorMessage}>
            Verifique sua conexão com a internet ou tente novamente em alguns instantes.
          </Text>
          {__DEV__ && (
            <Text style={styles.errorDebug}>
              {errorDomain} ({errorCode}): {errorDesc}
            </Text>
          )}
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry} activeOpacity={0.8}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#5B61F4" />
      <Text style={styles.loadingText}>Carregando Coisas de Garagem...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <WebView
        ref={webViewRef}
        source={{ uri: PRODUCTION_URL }}
        style={{ flex: 1 }}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        pullToRefreshEnabled={true}
        startInLoadingState={true}
        renderLoading={renderLoading}
        renderError={renderError}
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    ...Platform.select({
      android: {
        // Evita sobreposição com a barra de status no Android
        paddingTop: 24,
      },
    }),
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 2,
  },
  errorCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  errorDebug: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  retryButton: {
    backgroundColor: '#5B61F4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});

