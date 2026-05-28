# CashBox 앱을 Android WebView에 통합하는 가이드

## 개요

이 가이드는 CashBox 캐시 리워드 앱을 기존 Android Studio 프로젝트의 WebView에 임베드하는 방법을 설명합니다.

## 1단계: CashBox 웹 버전 빌드

### 1.1 웹 버전 빌드하기

```bash
cd /home/ubuntu/cash-reward-app
npx expo export --platform web
```

빌드 완료 후 `dist` 디렉터리가 생성됩니다.

### 1.2 웹 서버에 배포 (선택사항)

```bash
# 로컬 테스트 서버 실행
npx http-server dist -p 8000

# 또는 프로덕션 서버에 업로드
# dist 폴더의 모든 파일을 웹 서버에 업로드
```

## 2단계: Android 프로젝트 설정

### 2.1 WebView 권한 추가

`AndroidManifest.xml`에 다음 권한을 추가하세요:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### 2.2 WebView 라이브러리 추가

`build.gradle` (Module: app)에 다음을 추가하세요:

```gradle
dependencies {
    // 기존 의존성...
    
    // WebView
    implementation "androidx.webkit:webkit:1.6.1"
}
```

## 3단계: WebView Activity 생성

### 3.1 CashBoxWebViewActivity.kt 생성

`app/src/main/java/com/example/myapplication/CashBoxWebViewActivity.kt` 파일을 생성하고 다음 코드를 추가하세요:

```kotlin
package com.example.myapplication

import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class CashBoxWebViewActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_cashbox_webview)

        webView = findViewById(R.id.webView)
        
        // WebView 설정
        setupWebView()
        
        // CashBox 앱 로드
        loadCashBoxApp()
    }

    private fun setupWebView() {
        webView.apply {
            webViewClient = WebViewClient()
            
            // JavaScript 활성화
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                cacheMode = WebSettings.LOAD_DEFAULT
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                
                // 줌 설정
                builtInZoomControls = false
                displayZoomControls = false
                
                // 기타 설정
                useWideViewPort = true
                loadWithOverviewMode = true
            }
        }
    }

    private fun loadCashBoxApp() {
        // 옵션 1: 로컬 파일 로드 (assets 폴더에 dist 파일 복사)
        webView.loadUrl("file:///android_asset/cashbox/index.html")
        
        // 옵션 2: 원격 서버에서 로드
        // webView.loadUrl("https://your-server.com/cashbox/")
        
        // 옵션 3: 로컬 개발 서버에서 로드 (디버깅용)
        // webView.loadUrl("http://10.0.2.2:8000/")
    }
}
```

### 3.2 Layout XML 파일 생성

`app/src/main/res/layout/activity_cashbox_webview.xml` 파일을 생성하고 다음을 추가하세요:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <WebView
        android:id="@+id/webView"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</LinearLayout>
```

### 3.3 AndroidManifest.xml에 Activity 등록

```xml
<activity
    android:name=".CashBoxWebViewActivity"
    android:label="CashBox - 캐시 리워드"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```

## 4단계: 웹 파일 배포

### 4.1 로컬 파일 로드 (권장)

1. CashBox 웹 버전 빌드:
```bash
npx expo export --platform web
```

2. `dist` 폴더의 모든 파일을 `app/src/main/assets/cashbox/` 디렉터리에 복사

3. 디렉터리 구조:
```
app/src/main/assets/
└── cashbox/
    ├── index.html
    ├── _expo/
    ├── static/
    └── ...
```

### 4.2 원격 서버에서 로드

1. `dist` 폴더의 모든 파일을 웹 서버에 업로드
2. `loadCashBoxApp()` 함수에서 URL 변경:
```kotlin
webView.loadUrl("https://your-server.com/cashbox/")
```

## 5단계: JavaScript 브릿지 (선택사항)

네이티브 Android 코드와 웹앱 간 통신이 필요한 경우:

### 5.1 JavaScript 인터페이스 생성

```kotlin
class CashBoxJavaScriptInterface {
    @JavascriptInterface
    fun showToast(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }
    
    @JavascriptInterface
    fun getUserInfo(): String {
        // 네이티브에서 사용자 정보 반환
        return "{\"userId\": \"123\", \"name\": \"User\"}"
    }
}
```

### 5.2 WebView에 인터페이스 추가

```kotlin
webView.addJavascriptInterface(
    CashBoxJavaScriptInterface(),
    "CashBoxBridge"
)
```

### 5.3 웹앱에서 사용

```javascript
// 웹앱에서 네이티브 함수 호출
if (window.CashBoxBridge) {
    CashBoxBridge.showToast("Hello from Web!");
    const userInfo = JSON.parse(CashBoxBridge.getUserInfo());
    console.log(userInfo);
}
```

## 6단계: 빌드 및 테스트

### 6.1 Android Studio에서 빌드

1. Android Studio 열기
2. File → Open → MyApplication2 디렉터리 선택
3. Build → Build Bundle(s) / APK(s)
4. 에뮬레이터 또는 실제 기기에서 테스트

### 6.2 디버깅

Chrome DevTools를 사용하여 WebView 디버깅:

```kotlin
// MainActivity.kt에 추가
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
    WebView.setWebContentsDebuggingEnabled(true)
}
```

그 후 Chrome에서 `chrome://inspect`로 접속하여 디버깅 가능

## 7단계: 성능 최적화

### 7.1 캐싱 설정

```kotlin
settings.apply {
    cacheMode = WebSettings.LOAD_CACHE_ELSE_NETWORK
}
```

### 7.2 메모리 관리

```kotlin
override fun onDestroy() {
    webView.destroy()
    super.onDestroy()
}
```

## 문제 해결

### 문제: 웹앱이 로드되지 않음
- 해결: AndroidManifest.xml에 INTERNET 권한이 있는지 확인
- 해결: 파일 경로가 올바른지 확인 (`file:///android_asset/...`)

### 문제: JavaScript가 작동하지 않음
- 해결: `javaScriptEnabled = true` 설정 확인
- 해결: Chrome DevTools에서 콘솔 에러 확인

### 문제: 로컬 스토리지가 작동하지 않음
- 해결: `domStorageEnabled = true` 설정 확인
- 해결: `databaseEnabled = true` 설정 확인

## 참고 자료

- [Android WebView 공식 문서](https://developer.android.com/reference/android/webkit/WebView)
- [Expo 웹 빌드 가이드](https://docs.expo.dev/build/setup/)
- [React Native 웹 가이드](https://necolas.github.io/react-native-web/)

## 추가 지원

문제가 발생하면 다음을 확인하세요:
1. CashBox 앱의 GitHub 저장소: https://github.com/cvcvgy809-afk/cash-reward-app
2. Android 개발자 문서
3. Expo 문서
