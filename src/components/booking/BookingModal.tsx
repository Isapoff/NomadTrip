import { useState } from "react";
import { X, Check } from "lucide-react";
import { trpc } from "@/providers/trpc";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeName: string;
  routeId: string;
  region: string;
  days: number;
  pricePerDay: number;
}

export default function BookingModal({
  isOpen,
  onClose,
  routeName,
  routeId,
  region,
  days,
  pricePerDay,
}: BookingModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [pax, setPax] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const booking = trpc.booking.create.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  if (!isOpen) return null;

  const total = pricePerDay * days * pax;

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) return;
    booking.mutate({
      routeId,
      routeName,
      name,
      phone,
      date: date || undefined,
      pax,
      total,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[14px] w-full max-w-[460px] overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {!submitted ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-serif text-xl text-[#0A1017]">Забронировать тур</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Route Info */}
            <div className="px-6 py-4 bg-gray-50">
              <p className="font-semibold text-[#0A1017]">{routeName}</p>
              <p className="text-sm text-gray-500 mt-1">
                {region} · {days} дней · от {pricePerDay.toLocaleString()} сом/день
              </p>
            </div>

            {/* Form */}
            <div className="px-6 py-5 grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-[#0A1017] focus:outline-none focus:border-[#C9973A] transition-colors"
                  placeholder="Ваше имя"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Телефон</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-[#0A1017] focus:outline-none focus:border-[#C9973A] transition-colors"
                  placeholder="+996..."
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Дата</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-[#0A1017] focus:outline-none focus:border-[#C9973A] transition-colors"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Кол-во человек</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={pax}
                  onChange={(e) => setPax(Math.max(1, Math.min(20, Number(e.target.value))))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-[#0A1017] focus:outline-none focus:border-[#C9973A] transition-colors"
                />
              </div>
            </div>

            {/* Total */}
            <div className="px-6 py-3 flex justify-between items-center border-t border-gray-100">
              <span className="text-sm text-gray-600">Итого:</span>
              <span className="text-lg font-semibold text-[#C9973A]">{total.toLocaleString()} сом</span>
            </div>

            {/* Submit */}
            <div className="px-6 pb-6 pt-2">
              <button
                onClick={handleSubmit}
                disabled={booking.isPending}
                className="w-full py-3 bg-[#1A3A5C] text-white rounded-lg text-sm font-medium hover:bg-[#234a73] transition-colors disabled:opacity-50"
              >
                {booking.isPending ? "Отправка..." : "Отправить → WhatsApp"}
              </button>
            </div>
          </>
        ) : (
          /* Success */
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="text-green-600" size={32} />
            </div>
            <h3 className="font-serif text-2xl text-[#0A1017] mb-2">Заявка отправлена!</h3>
            <p className="text-sm text-gray-500 mb-6">Агентство свяжется с вами в течение 2 часов</p>
            {booking.data?.whatsappUrl && (
              <a
                href={booking.data.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-2.5 bg-[#25D366] text-white rounded-lg text-sm font-medium hover:bg-[#20BD5A] transition-colors"
              >
                Открыть WhatsApp
              </a>
            )}
            <button
              onClick={onClose}
              className="block mx-auto mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
