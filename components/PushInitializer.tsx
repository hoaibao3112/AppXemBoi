// Applying pattern from: nextjs-frontend-best-practices
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function PushInitializer() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initPush = async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        const { PushNotifications } = await import("@capacitor/push-notifications");

        if (!Capacitor.isNativePlatform()) {
          console.log("ℹ️ Standard web platform detected. Skipping native push registration.");
          return;
        }

        console.log("🚀 Initializing Capacitor Push Notifications...");

        // 1. Request notification permissions
        const permission = await PushNotifications.requestPermissions();
        if (permission.receive !== "granted") {
          console.warn("⚠️ Push notification permission denied by lữ khách.");
          return;
        }

        // 2. Register for APNS/FCM native tokens
        await PushNotifications.register();

        // 3. Listen to registration token events
        await PushNotifications.addListener("registration", (token) => {
          console.log("📲 FCM/APNS token acquired:", token.value);
          const userToken = localStorage.getItem("token");
          
          fetch("/api/user/push-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(userToken ? { Authorization: `Bearer ${userToken}` } : {}),
            },
            body: JSON.stringify({ pushToken: token.value }),
          })
            .then((res) => {
              if (res.ok) {
                console.log("✅ Device token synchronized with Postgres backend.");
              } else {
                console.error("❌ Failed to sync token with backend.");
              }
            })
            .catch(console.error);
        });

        // 4. Listen to errors
        await PushNotifications.addListener("registrationError", (err) => {
          console.error("❌ Capacitor push registration error:", err.error);
        });

        // 5. Action performed listener (when user clicks the notification banner)
        await PushNotifications.addListener(
          "pushNotificationActionPerformed",
          (action) => {
            console.log("🔗 Push banner clicked:", action);
            const data = action.notification.data;
            const pushLogId = data?.pushLogId || data?.push_log_id || "";
            
            // Redirect user to the diary logs with the tracking ID query param
            if (pushLogId) {
              router.push(`/nhat-ky?pushLogId=${pushLogId}`);
            } else {
              router.push("/nhat-ky");
            }
          }
        );

      } catch (err) {
        console.error("❌ Failed to setup native PushNotifications bridge:", err);
      }
    };

    // Delay initialization slightly to let app hydration stabilize
    const timer = setTimeout(initPush, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return null;
}
