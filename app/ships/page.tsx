import Link from "next/link";
import { IconShip, IconArrowLeft } from "@tabler/icons-react";

export default function ShipsPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 h-full p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-white border border-[rgba(15,52,96,0.1)] shadow-sm flex items-center justify-center">
          <IconShip size={40} className="text-[#144272]" />
        </div>
        <h1 className="text-3xl font-semibold text-[#0a2540]">Ships</h1>
        <p className="text-[#475569]">Fleet management — coming soon</p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[rgba(15,52,96,0.15)] text-[#0a2540] text-sm hover:bg-[#eff6ff] hover:border-[#1e5a96] transition-colors"
      >
        <IconArrowLeft size={15} />
        Back to home
      </Link>
    </div>
  );
}
