import React, { useState } from 'react';
import { Star, X, Heart } from 'lucide-react';
import PawussRiderLogo from './PawussRiderLogo';
import { submitRating } from '../services/api';

export default function RatingModal({ order, onClose, onSuccess }) {
  const [score, setScore] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [addToFavorites, setAddToFavorites] = useState(true);
  const [nicknameLabel, setNicknameLabel] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await submitRating(order.id, {
        score,
        reviewText,
        addToFavorites,
        nicknameLabel: nicknameLabel || `Mitra ${order.driver?.name || 'Langganan'}`
      });
      if (res.success) {
        onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="flex justify-center mx-auto">
            <PawussRiderLogo size={52} />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Nilai Perjalanan Anda</h3>
          <p className="text-xs text-slate-500">
            Bagaimana pengalaman Anda bersama mitra {order.driver?.name || 'Driver PaWuss'}?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Star Selector */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setScore(star)}
                className="p-1 focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-7 h-7 ${
                    star <= score
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>

          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Tulis ulasan Anda (misal: Sopir ramah, helm bersih, berkendara aman)..."
            rows={2}
            className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />

          {/* Add to Favorite Driver Checkbox */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-amber-900">
              <input
                type="checkbox"
                checked={addToFavorites}
                onChange={(e) => setAddToFavorites(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
              />
              <span className="flex items-center space-x-1">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>Simpan sebagai Driver Langganan</span>
              </span>
            </label>

            {addToFavorites && (
              <input
                type="text"
                value={nicknameLabel}
                onChange={(e) => setNicknameLabel(e.target.value)}
                placeholder={`Nama Panggilan (cth: Pak ${order.driver?.name || 'Agus'} - Ojek Langganan)`}
                className="w-full text-[11px] bg-white border border-amber-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-emerald-600/20 transition"
          >
            {submitting ? 'Mengirim Ulasan...' : 'Kirim Ulasan & Simpan'}
          </button>
        </form>

      </div>
    </div>
  );
}
