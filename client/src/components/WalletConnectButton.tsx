/**
 * WalletConnectButton — Luxurious Habbits
 * Connects a Web3 wallet (MetaMask, WalletConnect, etc.) and either:
 *  - Logs in as a new user via wallet address
 *  - Links the wallet to an existing logged-in account
 *
 * Uses Reown AppKit (formerly WalletConnect) for the connect modal.
 */
import { useState, useEffect } from "react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useSignMessage } from "wagmi";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Wallet, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WalletConnectButtonProps {
  /** "login" — wallet is used as login method; "link" — link wallet to existing account */
  mode?: "login" | "link";
  onSuccess?: () => void;
  className?: string;
}

export default function WalletConnectButton({
  mode = "login",
  onSuccess,
  className,
}: WalletConnectButtonProps) {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { signMessageAsync } = useSignMessage();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<"idle" | "signing" | "verifying" | "done" | "error">("idle");
  const [pendingAddress, setPendingAddress] = useState<string | null>(null);

  const getNonce = trpc.walletAuth.getNonce.useQuery(
    { address: pendingAddress ?? "" },
    { enabled: !!pendingAddress }
  );

  const loginMutation = trpc.walletAuth.login.useMutation({
    onSuccess: () => {
      setStep("done");
      toast.success("Wallet connected — welcome to Luxurious Habbits");
      setTimeout(() => {
        window.location.reload(); // refresh to pick up new session cookie
      }, 800);
      onSuccess?.();
    },
    onError: (err) => {
      setStep("error");
      toast.error(err.message ?? "Wallet login failed");
    },
  });

  const linkMutation = trpc.walletAuth.linkWallet.useMutation({
    onSuccess: () => {
      setStep("done");
      toast.success("Wallet linked to your account");
      onSuccess?.();
    },
    onError: (err) => {
      setStep("error");
      toast.error(err.message ?? "Failed to link wallet");
    },
  });

  // When wallet connects and we have a nonce, sign the message
  useEffect(() => {
    if (!isConnected || !address || !pendingAddress) return;
    if (!getNonce.data) return;
    if (step !== "signing") return;

    const { message } = getNonce.data;

    signMessageAsync({ message })
      .then((signature) => {
        setStep("verifying");
        if (mode === "link" && isAuthenticated) {
          linkMutation.mutate({ address, signature, message });
        } else {
          loginMutation.mutate({
            address,
            signature,
            message,
            origin: window.location.origin,
          });
        }
      })
      .catch((err) => {
        setStep("error");
        toast.error(err?.message?.includes("rejected") ? "Signature rejected" : "Signing failed");
      });
  }, [isConnected, address, pendingAddress, getNonce.data, step]);

  const handleClick = async () => {
    if (step === "done") return;
    setStep("idle");

    if (!isConnected) {
      // Open the wallet connect modal
      await open();
      // After connecting, address will be set via useAppKitAccount
      // We watch for it in a separate effect
    } else if (address) {
      // Already connected — go straight to signing
      setPendingAddress(address.toLowerCase());
      setStep("signing");
    }
  };

  // Watch for wallet connection after modal opens
  useEffect(() => {
    if (isConnected && address && step === "idle" && !pendingAddress) {
      setPendingAddress(address.toLowerCase());
      setStep("signing");
    }
  }, [isConnected, address, step, pendingAddress]);

  const label = () => {
    if (step === "signing") return "Sign message in wallet…";
    if (step === "verifying") return "Verifying…";
    if (step === "done") return mode === "link" ? "Wallet Linked" : "Connected";
    if (mode === "link") return user?.walletAddress ? "Wallet Linked" : "Link Wallet";
    return "Connect Wallet";
  };

  const icon = () => {
    if (step === "signing" || step === "verifying") return <Loader2 size={16} className="animate-spin" />;
    if (step === "done") return <CheckCircle size={16} />;
    if (step === "error") return <XCircle size={16} />;
    return <Wallet size={16} />;
  };

  const isLinked = mode === "link" && !!user?.walletAddress;
  const isDisabled = step === "signing" || step === "verifying" || step === "done" || isLinked;

  return (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      className={className}
      style={{
        background: step === "done" || isLinked
          ? "linear-gradient(135deg, oklch(0.35 0.08 280), oklch(0.25 0.06 280))"
          : "linear-gradient(135deg, oklch(0.45 0.15 280), oklch(0.35 0.12 280))",
        border: "1px solid oklch(0.75 0.15 280 / 30%)",
        color: "oklch(0.96 0 0)",
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.72rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        gap: "0.5rem",
        transition: "all 200ms ease",
      }}
    >
      {icon()}
      {isLinked ? `Linked: ${user.walletAddress?.slice(0, 6)}…${user.walletAddress?.slice(-4)}` : label()}
    </Button>
  );
}
