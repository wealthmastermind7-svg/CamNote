import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { Platform } from "react-native";
import Purchases, {
  LOG_LEVEL,
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";
import { REVENUECAT } from "@/constants/config";

const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS || "";
const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID || "";

interface RevenueCatContextType {
  isProUser: boolean;
  customerInfo: CustomerInfo | null;
  currentOffering: PurchasesOffering | null;
  isLoading: boolean;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshCustomerInfo: () => Promise<void>;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined);

interface RevenueCatProviderProps {
  children: ReactNode;
}

export function RevenueCatProvider({ children }: RevenueCatProviderProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isProUser = customerInfo?.entitlements.active[REVENUECAT.ENTITLEMENT_ID] !== undefined;

  useEffect(() => {
    const initRevenueCat = async () => {
      try {
        if (Platform.OS === "web") {
          setIsLoading(false);
          return;
        }

        Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

        const apiKey = Platform.OS === "ios" ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

        if (apiKey) {
          await Purchases.configure({ apiKey });

          const info = await Purchases.getCustomerInfo();
          setCustomerInfo(info);

          const offerings = await Purchases.getOfferings();
          if (offerings.current) {
            setCurrentOffering(offerings.current);
          }

          Purchases.addCustomerInfoUpdateListener((info) => {
            setCustomerInfo(info);
          });
        } else {
          console.warn("RevenueCat API key not configured for this platform");
        }
      } catch (error) {
        console.error("RevenueCat initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initRevenueCat();
  }, []);

  const purchasePackage = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      if (Platform.OS === "web") {
        console.log("Purchases not available on web");
        return false;
      }

      const { customerInfo: updatedInfo } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(updatedInfo);

      if (updatedInfo.entitlements.active[REVENUECAT.ENTITLEMENT_ID] !== undefined) {
        return true;
      }
      return false;
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error("Purchase error:", error);
      }
      return false;
    }
  }, []);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === "web") {
        console.log("Restore not available on web");
        return false;
      }

      const restoredInfo = await Purchases.restorePurchases();
      setCustomerInfo(restoredInfo);

      if (restoredInfo.entitlements.active[REVENUECAT.ENTITLEMENT_ID] !== undefined) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Restore error:", error);
      return false;
    }
  }, []);

  const refreshCustomerInfo = useCallback(async () => {
    try {
      if (Platform.OS === "web") {
        return;
      }

      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
    } catch (error) {
      console.error("Refresh customer info error:", error);
    }
  }, []);

  return (
    <RevenueCatContext.Provider
      value={{
        isProUser,
        customerInfo,
        currentOffering,
        isLoading,
        purchasePackage,
        restorePurchases,
        refreshCustomerInfo,
      }}
    >
      {children}
    </RevenueCatContext.Provider>
  );
}

export function useRevenueCat() {
  const context = useContext(RevenueCatContext);
  if (context === undefined) {
    throw new Error("useRevenueCat must be used within a RevenueCatProvider");
  }
  return context;
}

export function useIsProUser() {
  const { isProUser } = useRevenueCat();
  return isProUser;
}
