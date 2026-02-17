"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { mockTitleCompany, mockTransaction } from "@/data/mockData";
import { AmbientBackground } from "@/components/layout";

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params.transactionId as string;
  const side = params.side as "buyer" | "seller";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // For demo, use mock data
  const titleCompany = mockTitleCompany;
  const transaction = mockTransaction;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);

    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For demo purposes, accept any password
    // In production, this would validate against the backend
    if (password.length >= 1) {
      // Store auth token in sessionStorage (demo only)
      sessionStorage.setItem(`portal_auth_${transactionId}_${side}`, "authenticated");
      router.push(`/tx/${transactionId}/${side}`);
    } else {
      setError("Invalid password. Please try again.");
      setIsLoading(false);
    }
  };

  const fullAddress = `${transaction.property.address}, ${transaction.property.city}, ${transaction.property.state} ${transaction.property.zip}`;
  const sideLabel = side === "buyer" ? "Buyer" : "Seller";

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative">
      <AmbientBackground persona="client" />
      {/* Header */}
      <header className="glass-nav py-4 px-6 relative z-10">
        <div className="max-w-md mx-auto flex items-center justify-center">
          <Image
            src={titleCompany.logo}
            alt={titleCompany.name}
            width={120}
            height={40}
            className="h-8 w-auto"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="glass-strong rounded-xl border border-[var(--glass-border)] overflow-hidden animate-fade-in-up">
            {/* Card Header */}
            <div className="bg-royal/10 border-b border-[var(--glass-border-subtle)] px-6 py-4">
              <h1 className="text-lg font-semibold text-[var(--text-primary)] text-center">
                {sideLabel} Portal
              </h1>
              <p className="text-sm text-[var(--text-secondary)] text-center mt-1">
                {fullAddress}
              </p>
            </div>

            {/* Card Body */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-royal/10 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-royal" />
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Enter your password to access the transaction portal
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password Input */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[var(--text-primary)] mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className={`w-full px-4 py-3 pr-12 border rounded-lg bg-white/[0.06] text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        error
                          ? "border-signal-red focus:ring-signal-red/20"
                          : "border-[var(--glass-border)] focus:ring-royal/20"
                      }`}
                      disabled={isLoading}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors p-1"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 text-sm text-signal-red bg-signal-red/5 px-3 py-2 rounded-lg animate-fade-in">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-royal text-white py-3 px-4 rounded-lg font-medium transition-all hover:bg-royal/90 focus:outline-none focus:ring-2 focus:ring-royal/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-hover-lift flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Help Text */}
              <p className="text-xs text-[var(--text-tertiary)] text-center mt-6">
                Password was sent to you via email from {titleCompany.name}.
                <br />
                Contact{" "}
                <a
                  href={`mailto:${titleCompany.email}`}
                  className="text-royal hover:underline"
                >
                  {titleCompany.email}
                </a>{" "}
                if you need assistance.
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-[var(--text-disabled)] text-center mt-6">
            Powered by Contre Title
          </p>
        </div>
      </main>
    </div>
  );
}
