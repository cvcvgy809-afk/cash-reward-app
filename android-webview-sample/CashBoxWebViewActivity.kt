package com.example.myapplication

import android.os.Build
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

/**
 * CashBox 앱을 WebView에서 실행하는 Activity
 */
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
        
        // 디버깅 활성화 (개발 중에만)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true)
        }
    }

    /**
     * WebView 설정
     */
    private fun setupWebView() {
        webView.apply {
            webViewClient = CashBoxWebViewClient()
            
            // JavaScript 인터페이스 추가
            addJavascriptInterface(
                CashBoxJavaScriptInterface(this@CashBoxWebViewActivity),
                "CashBoxBridge"
            )
            
            // WebView 설정
            settings.apply {
                // JavaScript 활성화
                javaScriptEnabled = true
                
                // 스토리지 활성화
                domStorageEnabled = true
                databaseEnabled = true
                
                // 캐싱 설정
                cacheMode = WebSettings.LOAD_DEFAULT
                
                // 혼합 콘텐츠 허용 (HTTP + HTTPS)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                }
                
                // 줌 설정
                builtInZoomControls = false
                displayZoomControls = false
                
                // 뷰포트 설정
                useWideViewPort = true
                loadWithOverviewMode = true
                
                // 기타 설정
                defaultTextEncodingName = "utf-8"
                userAgentString = userAgentString + " CashBoxApp/1.0"
            }
        }
    }

    /**
     * CashBox 앱 로드
     */
    private fun loadCashBoxApp() {
        try {
            // 옵션 1: 로컬 assets 파일에서 로드 (권장)
            webView.loadUrl("file:///android_asset/cashbox/index.html")
            
            // 옵션 2: 원격 서버에서 로드
            // webView.loadUrl("https://your-server.com/cashbox/")
            
            // 옵션 3: 로컬 개발 서버에서 로드 (디버깅용)
            // webView.loadUrl("http://10.0.2.2:8000/")
        } catch (e: Exception) {
            Toast.makeText(
                this,
                "CashBox 앱 로드 실패: ${e.message}",
                Toast.LENGTH_SHORT
            ).show()
        }
    }

    /**
     * WebView 클라이언트
     */
    private class CashBoxWebViewClient : WebViewClient() {
        override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
            super.onPageStarted(view, url, favicon)
            // 페이지 로딩 시작
        }

        override fun onPageFinished(view: WebView?, url: String?) {
            super.onPageFinished(view, url)
            // 페이지 로딩 완료
        }

        override fun onReceivedError(
            view: WebView?,
            request: android.webkit.WebResourceRequest?,
            error: android.webkit.WebResourceError?
        ) {
            super.onReceivedError(view, request, error)
            // 에러 처리
        }
    }

    /**
     * JavaScript 인터페이스
     */
    class CashBoxJavaScriptInterface(private val activity: CashBoxWebViewActivity) {
        
        @android.webkit.JavascriptInterface
        fun showToast(message: String) {
            Toast.makeText(activity, message, Toast.LENGTH_SHORT).show()
        }
        
        @android.webkit.JavascriptInterface
        fun getUserInfo(): String {
            // 네이티브에서 사용자 정보 반환
            return """{"userId": "123", "name": "User", "email": "user@example.com"}"""
        }
        
        @android.webkit.JavascriptInterface
        fun closeApp() {
            activity.finish()
        }
        
        @android.webkit.JavascriptInterface
        fun getDeviceInfo(): String {
            return """{
                "manufacturer": "${Build.MANUFACTURER}",
                "model": "${Build.MODEL}",
                "osVersion": "${Build.VERSION.RELEASE}",
                "sdkInt": ${Build.VERSION.SDK_INT}
            }"""
        }
    }

    override fun onBackPressed() {
        // WebView에서 뒤로 가기 처리
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
