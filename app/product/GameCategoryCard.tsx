"use client";


interface GameCategoryCardProps {
  title: string;
  gameKey: string;
  coverImage: string;
  logoImage?: string;
  productCount: number;
  minPrice: number;
  isSelected: boolean;
  onSelect: (key: string) => void;
}

export function GameCategoryCard({
  title,
  gameKey,
  coverImage,
  logoImage,
  productCount,
  minPrice,
  isSelected,
  onSelect,
}: GameCategoryCardProps) {
  return (
    <div
      onClick={() => onSelect(gameKey)}
      className={`relative w-full max-w-[340px] h-[450px] rounded-3xl overflow-hidden cursor-pointer select-none transition-all duration-300 transform hover:scale-[1.02] border ${
        isSelected
          ? "border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.4)]"
          : "border-white/[0.08] hover:border-red-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
      }`}
    >
      {/* Arka Plan Görseli */}
      <img
        src={coverImage}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover filter contrast-125 transition-transform duration-500 hover:scale-105"
      />

      {/* Kırmızı/Siyah Gradient Filtre Katmanı */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
      <div className="absolute inset-0 bg-red-950/20 mix-blend-color" />

      {/* Merkez Oyun Logosu / Başlığı */}
      <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
        {logoImage ? (
          <img
            src={logoImage}
            alt={title}
            className="w-44 max-h-24 object-contain filter drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]"
          />
        ) : (
          <h3 className="text-4xl font-black tracking-wider uppercase text-neutral-200 drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
            {title}
          </h3>
        )}
      </div>

      {/* Alt Bilgi Alanı */}
      <div className="absolute bottom-0 inset-x-0 p-6 flex items-end justify-between bg-gradient-to-t from-black/95 to-transparent">
        {/* Sol Taraf: Başlık ve Ürün Adedi */}
        <div className="flex flex-col text-left">
          <span className="text-lg font-extrabold text-white tracking-tight">
            {title}
          </span>
          <span className="text-xs font-semibold text-neutral-400 mt-0.5">
            {productCount} Ürün
          </span>
        </div>

        {/* Sağ Taraf: Başlangıç Fiyatı */}
        <div className="flex flex-col text-right">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Başlangıç
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-white">
              ${minPrice > 0 ? minPrice.toFixed(2) : "0.00"}
            </span>
            <span className="text-xs font-bold text-red-500">USD</span>
          </div>
        </div>
      </div>
    </div>
  );
}