package com.atoenglish.shell;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.json.JSONObject;

/**
 * Thin WebView shell for AtoEnglish (mission 007).
 *
 * Two WebViews:
 *  - appView: the production web app, unmodified — playback uses the
 *    official embedded YouTube player.
 *  - collector: a hidden WebView that loads youtube.com/embed/<id> as its
 *    OWN main frame (full evaluateJavascript access — the same trust
 *    position as the browser extension's import tab). The injected bridge
 *    reads the player response + fetches timedtext in the device's own
 *    session, then hands the payload to native, which relays it into the
 *    app page as a same-origin window.postMessage — the exact contract the
 *    web app already accepts (src/lib/video/extension-bridge.ts).
 *
 * Only caption text/timing crosses the boundary: no cookies, no request
 * URLs, no media bytes.
 */
public class MainActivity extends Activity {

    private static final String APP_ORIGIN =
        "https://atoenglish.thunderkill016.workers.dev";
    private static final Pattern WATCH_ROUTE =
        Pattern.compile("^/watch/([A-Za-z0-9_-]{11})");
    /** Same ceiling the extension import flow uses. */
    private static final long COLLECT_TIMEOUT_MS = 45_000L;
    /** Probe the watch page's opt-in marker before relaying captions. */
    private static final String PROBE =
        "window.__atoTranscriptReady === true ? 'ready' : 'open'";

    private WebView appView;
    private WebView collector;
    private String collectingFor;
    private String bridgeScript;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable collectorTimeout =
        new Runnable() {
            @Override
            public void run() {
                stopCollector();
            }
        };

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        appView = new WebView(this);
        WebSettings s = appView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        // The embedded YouTube iframe needs its own cookie storage.
        CookieManager.getInstance().setAcceptThirdPartyCookies(appView, true);
        appView.setWebChromeClient(new WebChromeClient());
        appView.setWebViewClient(
            new WebViewClient() {
                @Override
                public void onPageFinished(WebView view, String url) {
                    maybeCollect(url);
                }

                @Override
                public void doUpdateVisitedHistory(
                    WebView view, String url, boolean isReload) {
                    // SPA (pushState) navigation lands here, not onPageFinished.
                    maybeCollect(url);
                }
            });
        setContentView(appView);
        if (!handleIntent(getIntent())) appView.loadUrl(APP_ORIGIN);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleIntent(intent);
    }

    /** Share/open intake → the web app's /share route canonicalizes the URL. */
    private boolean handleIntent(Intent intent) {
        if (intent == null) return false;
        String shared = null;
        if (Intent.ACTION_SEND.equals(intent.getAction())) {
            shared = intent.getStringExtra(Intent.EXTRA_TEXT);
        } else if (Intent.ACTION_VIEW.equals(intent.getAction())
            && intent.getData() != null) {
            shared = intent.getData().toString();
        }
        if (shared == null) return false;
        appView.loadUrl(
            APP_ORIGIN + "/share?text=" + Uri.encode(shared));
        return true;
    }

    private void maybeCollect(String url) {
        String path = url == null ? null : Uri.parse(url).getPath();
        Matcher m = path == null ? null : WATCH_ROUTE.matcher(path);
        if (m == null || !m.find()) {
            stopCollector();
            return;
        }
        final String videoId = m.group(1);
        if (videoId.equals(collectingFor)) return;
        // Skip collection entirely when the page already has a transcript
        // (cache hit / learner paste) — relaying would overwrite it.
        appView.evaluateJavascript(
            PROBE,
            state -> {
                if ("\"open\"".equals(state)) startCollector(videoId);
            });
    }

    private void startCollector(String videoId) {
        stopCollector();
        collectingFor = videoId;
        collector = new WebView(this);
        WebSettings s = collector.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        collector.addJavascriptInterface(new CaptionBridge(), "AtoBridge");
        collector.setWebViewClient(
            new WebViewClient() {
                @Override
                public void onPageFinished(WebView view, String url) {
                    view.evaluateJavascript(bridgeScript(), null);
                }
            });
        collector.setAlpha(0f);
        // Attached but invisible + 1px — a detached WebView still runs JS on
        // most versions, but attaching guarantees its lifecycle.
        addContentView(collector, new ViewGroup.LayoutParams(1, 1));
        collector.loadUrl("https://www.youtube.com/embed/" + videoId);
        handler.postDelayed(collectorTimeout, COLLECT_TIMEOUT_MS);
    }

    private void stopCollector() {
        handler.removeCallbacks(collectorTimeout);
        collectingFor = null;
        if (collector != null) {
            ViewGroup parent = (ViewGroup) collector.getParent();
            if (parent != null) parent.removeView(collector);
            collector.destroy();
            collector = null;
        }
    }

    /** Re-check the marker at relay time: a paste may have arrived meanwhile. */
    private void relayIfNeeded(final String json) {
        appView.evaluateJavascript(
            PROBE,
            state -> {
                if (!"\"open\"".equals(state)) return;
                appView.evaluateJavascript(
                    "window.postMessage(JSON.parse("
                        + JSONObject.quote(json)
                        + "), location.origin)",
                    null);
            });
    }

    private String bridgeScript() {
        if (bridgeScript != null) return bridgeScript;
        try {
            InputStream in = getAssets().open("ato-bridge.js");
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            for (int n; (n = in.read(buf)) != -1; ) out.write(buf, 0, n);
            bridgeScript = out.toString("UTF-8");
        } catch (Exception e) {
            bridgeScript = "void(0)";
        }
        return bridgeScript;
    }

    private class CaptionBridge {
        /** Called by ato-bridge.js on the collector's JS thread. */
        @JavascriptInterface
        public void onCaptions(final String json) {
            handler.post(
                () -> {
                    if (json != null && json.contains("\"atoenglish:youtube-captions\"")) {
                        relayIfNeeded(json);
                    }
                    stopCollector();
                });
        }
    }

    @Override
    public void onBackPressed() {
        if (appView != null && appView.canGoBack()) appView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        stopCollector();
        if (appView != null) {
            appView.destroy();
            appView = null;
        }
        super.onDestroy();
    }
}
