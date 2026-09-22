import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  AppState,
  Image,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";
import { Base64 } from "js-base64";
import {
  api,
  restoreToken,
  saveToken,
  User,
  API_URL,
  onUnauthorized,
  clearPendingMutations,
} from "./src/api";
import { Button, Input, styles, colours } from "./src/ui";
import { Visits, People, Inbox, More } from "./src/screens";
export default function App() {
  const [user, setUser] = useState<User | null>(null),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [info, setInfo] = useState(""),
    [email, setEmail] = useState(""),
    [link, setLink] = useState(""),
    [tab, setTab] = useState("Visits"),
    [refreshVersion, setRefreshVersion] = useState(0);
  const exchanging = useRef(false);
  const lastActivity = useRef(Date.now()), endingSession = useRef(false);
  const markActivity = () => { lastActivity.current = Date.now(); };
  async function signIn(url: string) {
    if (exchanging.current) return;
    exchanging.current = true;
    setBusy(true);
    setError("");
    try {
      const token = new URL(url.trim()).searchParams.get("token");
      if (!token)
        throw new Error("Paste the complete sign-in link from your email.");
      const decoded = Base64.decode(token),
        separator = decoded.indexOf(":");
      if (separator < 1) throw new Error("Invalid sign-in link");
      const result = await api<{ user: User; accessToken: string }>(
        "/api/auth/get-token",
        "POST",
        {
          email: decoded.slice(0, separator),
          password: decoded.slice(separator + 1),
        },
      );
      await saveToken(result.accessToken);
      setUser(result.user);
      setLink("");
      setInfo("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      exchanging.current = false;
    }
  }
  useEffect(() => {
    onUnauthorized(() => {
      void saveToken(null);
      setUser(null);
      setError("Your session expired. Please sign in again.");
    });
    let active = true;
    const startupTimeout = setTimeout(() => {
      if (!active) return;
      void saveToken(null);
      setUser(null);
      setReady(true);
      setError("A previous session could not be restored. Please sign in again.");
    }, 6000);
    (async () => {
      try {
        if (await restoreToken()) {
          const result = await api<{ user: User; token?: string }>(
            "/api/auth/validate-token",
            "POST",
          );
          if (result.token) await saveToken(result.token);
          if (active) setUser(result.user);
        }
        const initial = await Linking.getInitialURL();
        if (initial && new URL(initial).searchParams.has("token"))
          await signIn(initial);
      } catch {
        await saveToken(null);
      } finally {
        clearTimeout(startupTimeout);
        if (active) setReady(true);
      }
    })();
    const sub = Linking.addEventListener("url", (e) => {
      if (e.url.includes("token=")) void signIn(e.url);
    });
    return () => {
      active = false;
      clearTimeout(startupTimeout);
      sub.remove();
    };
  }, []);
  async function finishLogout(message = "", clearOfflineRecords = false) {
    if (endingSession.current) return;
    endingSession.current = true;
    setBusy(true);
    try {
      await api("/api/auth/logout", "POST");
    } catch {
    } finally {
      await saveToken(null);
      if (clearOfflineRecords) await clearPendingMutations();
      setUser(null);
      setTab("Visits");
      setError(message);
      setBusy(false);
      endingSession.current = false;
    }
  }
  async function logout() { await finishLogout("", true); }
  useEffect(() => {
    if (!user) return;
    markActivity();
    const refresh = async () => {
      try {
        const result = await api<{ token?: string }>("/api/auth/validate-token", "POST");
        if (result.token) await saveToken(result.token);
        if (AppState.currentState === "active" && Date.now() - lastActivity.current >= 60000)
          setRefreshVersion((version) => version + 1);
      } catch {
        await finishLogout("Your session is no longer available. Please sign in again.");
      }
    };
    const heartbeat = setInterval(() => { void refresh(); }, 5 * 60 * 1000);
    const appState = AppState.addEventListener("change", (next) => {
      if (next === "active") {
        lastActivity.current = 0;
        void refresh();
      }
    });
    return () => { clearInterval(heartbeat); appState.remove(); };
  }, [user]);
  async function requestLink() {
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/request-link", "POST", {
        email: email.trim().toLowerCase(),
        client: "mobile",
      });
      setInfo(
        "Check your email. Open the newest link, or paste it below. It works once and expires in 15 minutes.",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const tabs =
    user?.role === "CAREGIVER"
      ? ["Visits", "Clients", "Inbox", "More"]
      : ["Visits", "Clients", "Team", "Inbox", "More"];
  return (
    <SafeAreaProvider>
      <SafeAreaView onTouchStart={markActivity} style={{ flex: 1, backgroundColor: colours.background }}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {!ready ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colours.navy, gap: 24 }}>
              <Image source={require("./assets/icon.png")} resizeMode="contain" style={{ width: 136, height: 136, borderRadius: 30 }} accessibilityLabel="AniProTech" />
              <ActivityIndicator color={colours.cyanBright} />
            </View>
          ) : !user ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[styles.page, { paddingTop: 60 }]}
            >
              <Image source={require("./assets/brand-logo.png")} resizeMode="contain" style={{ width: "100%", height: 120, borderRadius: 16 }} accessibilityLabel="AniProTech" />
              <Text style={[styles.badge, { letterSpacing: 2 }]}>CAREMONITOR</Text>
              <Text style={styles.title}>Care, connected.</Text>
              <Text style={styles.muted}>
                Sign in to view your visits and stay in touch with your team.
              </Text>
              {error && (
                <Text accessibilityRole="alert" style={styles.error}>
                  {error}
                </Text>
              )}
              {info && <Text style={styles.text}>{info}</Text>}
              <Input
                label="Email address"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
              <Button
                title={busy ? "Please wait..." : "Send sign-in link"}
                disabled={busy || !email.trim()}
                onPress={() => void requestLink()}
              />
              <View style={{ height: 12 }} />
              <Input
                label="Or paste your email sign-in link"
                autoCapitalize="none"
                autoCorrect={false}
                value={link}
                onChangeText={setLink}
              />
              <Button
                title="Continue with link"
                disabled={busy || !link.trim()}
                onPress={() => void signIn(link)}
              />
              {__DEV__ && (
                <Text style={styles.muted}>Development server: {API_URL}</Text>
              )}
            </ScrollView>
          ) : (
            <>
              <View
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  backgroundColor: "white",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottomWidth: 1,
                  borderBottomColor: "#D8EAF3",
                }}
              >
                <Image source={require("./assets/brand-logo.png")} resizeMode="contain" style={{ width: 150, height: 44 }} accessibilityLabel="AniProTech" />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Sign out of Caremonitor"
                  disabled={busy}
                  onPress={() => void logout()}
                  style={({ pressed }) => ({
                    paddingHorizontal: 14,
                    paddingVertical: 9,
                    borderRadius: 9,
                    borderWidth: 1,
                    borderColor: "#B9D5E3",
                    backgroundColor: "white",
                    opacity: busy ? 0.45 : pressed ? 0.7 : 1,
                  })}
                >
                  <Text style={{ color: colours.navy, fontWeight: "700", fontSize: 14 }}>
                    Sign out
                  </Text>
                </Pressable>
              </View>
              <View key={refreshVersion} style={{ flex: 1 }}>
                {tab === "Visits" ? (
                  <Visits user={user} />
                ) : tab === "Clients" ? (
                  <People kind="clients" />
                ) : tab === "Team" ? (
                  <People kind="team" />
                ) : tab === "Inbox" ? (
                  <Inbox />
                ) : (
                  <More user={user} logout={() => void logout()} />
                )}
              </View>
              <View style={styles.tabs}>
                {tabs.map((t) => (
                  <Pressable
                    key={t}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: tab === t }}
                    onPress={() => setTab(t)}
                    style={styles.tab}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        tab === t && { color: colours.cyan, fontWeight: "700" },
                      ]}
                    >
                      {t}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
