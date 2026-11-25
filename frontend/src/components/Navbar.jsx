import React from 'react';
import { Bike, Car, User, ShieldCheck, Wallet, RefreshCw, MapPin } from 'lucide-react';
import PawussRiderLogo from './PawussRiderLogo';

export default function Navbar({ activeRole, setActiveRole, walletBalance, isConnected }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand with Motorcycle Rider Logo */}
        <div className="flex items-center space-x-3">
          <PawussRiderLogo size={42} />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Pa<span className="text-emerald-600">Wuss</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Bandar Lampung
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-emerald-600 inline" />
              <span>Ojek & Transportasi Online Lampung</span>
            </p>
          </div>
        </div>

        {/* Center: Realtime status */}
        <div className="hidden md:flex items-center space-x-2 text-xs">
          <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-red-400'}`}></span>
          <span className="text-slate-600 font-medium">
            {isConnected ? 'Socket.io Terhubung (Real-time)' : 'Menghubungkan ke Server...'}
          </span>
        </div>

        {/* Right Action: Wallet & Role Switcher */}
        <div className="flex items-center space-x-3">
          
          {/* PaWuss Pay */}
          <div className="hidden sm:flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-emerald-900">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <div>
              <p className="text-[10px] font-semibold text-emerald-700 leading-none">PaWussPay</p>
              <p className="text-xs font-bold leading-none mt-0.5">
                Rp {walletBalance.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200">
            <button
              onClick={() => setActiveRole('USER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                activeRole === 'USER'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>

            <button
              onClick={() => setActiveRole('DRIVER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                activeRole === 'DRIVER'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Mitra Driver</span>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
