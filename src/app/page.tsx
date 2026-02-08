"use client";

import Image from "next/image";
import Link from "next/link";
import { Users, UserCircle, Building2, ArrowRight } from "lucide-react";
import { mockTitleCompany, mockTransaction } from "@/data/mockData";

export default function Home() {
  const titleCompany = mockTitleCompany;
  const transaction = mockTransaction;
  const fullAddress = `${transaction.property.address}, ${transaction.property.city}, ${transaction.property.state} ${transaction.property.zip}`;

  return (
    <div className="min-h-screen bg-mist flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border py-4 px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-center">
          <Image
            src={titleCompany.logo}
            alt={titleCompany.name}
            width={140}
            height={48}
            className="h-10 w-auto"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Title Card */}
          <div className="bg-white rounded-xl shadow-lg border border-border overflow-hidden animate-fade-in-up">
            {/* Card Header */}
            <div className="bg-spruce text-white px-6 py-6 text-center">
              <Building2 className="w-10 h-10 mx-auto mb-3 opacity-80" />
              <h1 className="text-2xl font-semibold">Transaction Portal</h1>
              <p className="text-spruce-100/80 mt-2 text-sm">Demo Portal Selection</p>
            </div>

            {/* Property Info */}
            <div className="bg-mist border-b border-border px-6 py-4 text-center">
              <p className="text-sm text-river-stone">Demo Transaction</p>
              <p className="font-semibold text-storm-gray mt-1">{fullAddress}</p>
              <p className="text-xs text-river-stone mt-1">
                Transaction ID: <span className="font-mono">{transaction.id}</span>
              </p>
            </div>

            {/* Portal Selection */}
            <div className="p-6">
              <p className="text-sm text-river-stone text-center mb-6">
                Select a portal to view the demo:
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Buyer Portal */}
                <Link
                  href={`/tx/${transaction.id}/buyer/login`}
                  className="group block p-6 rounded-xl border-2 border-border hover:border-spruce hover:bg-spruce/5 transition-all"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-spruce/10 text-spruce mb-4 group-hover:bg-spruce group-hover:text-white transition-colors">
                      <UserCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-lg font-semibold text-storm-gray mb-1">
                      Buyer Agent Portal
                    </h2>
                    <p className="text-sm text-river-stone mb-4">
                      Sarah Johnson &bull; ABC Realty
                    </p>
                    <div className="flex items-center gap-1 text-spruce text-sm font-medium group-hover:gap-2 transition-all">
                      <span>Enter Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>

                {/* Seller Portal */}
                <Link
                  href={`/tx/${transaction.id}/seller/login`}
                  className="group block p-6 rounded-xl border-2 border-border hover:border-spruce hover:bg-spruce/5 transition-all"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-river-stone/10 text-river-stone mb-4 group-hover:bg-spruce group-hover:text-white transition-colors">
                      <Users className="w-8 h-8" />
                    </div>
                    <h2 className="text-lg font-semibold text-storm-gray mb-1">
                      Seller Agent Portal
                    </h2>
                    <p className="text-sm text-river-stone mb-4">
                      Mike Williams &bull; XYZ Real Estate
                    </p>
                    <div className="flex items-center gap-1 text-spruce text-sm font-medium group-hover:gap-2 transition-all">
                      <span>Enter Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </div>

              {/* Demo Note */}
              <div className="mt-6 p-4 bg-amber/10 border border-amber/20 rounded-lg">
                <p className="text-sm text-storm-gray">
                  <strong>Demo Mode:</strong> Enter any password to access the portal.
                  Both portals show the same transaction from different perspectives.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-river-stone text-center mt-6">
            Powered by {titleCompany.name}
          </p>
        </div>
      </main>
    </div>
  );
}
