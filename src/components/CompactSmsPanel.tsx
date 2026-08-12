import React, { useState, useEffect } from 'react';
import { Send, Car } from 'lucide-react';
import { Language, ParkingLotData, ParkingZone } from '../types';
import { ZONE_DETAILS, getSmsNumber } from '../data/parkingData';
import { TRANSLATIONS } from '../data/translations';
import {
  calculateParkingCost,
  formatPlateDisplay,
  getSavedPlates,
  sanitizePlate,
} from '../services/smsService';

interface CompactSmsPanelProps {
  selectedLot: ParkingLotData | null;
  filterZone: ParkingZone | 'all';
  onFilterZoneChange: (zone: ParkingZone | 'all') => void;
  onOpenSmsPay: (lot?: ParkingLotData) => void;
  currentLang: Language;
}

export const CompactSmsPanel: React.FC<CompactSmsPanelProps> = ({
  selectedLot,
  onOpenSmsPay,
  currentLang,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [activeZone, setActiveZone] = useState<ParkingZone>('1');
  const [licensePlate, setLicensePlate] = useState<string>('');
  const [hours, setHours] = useState<number>(1);
  const [isDayTicket, setIsDayTicket] = useState<boolean>(false);
  const [savedPlates, setSavedPlates] = useState<string[]>([]);

  useEffect(() => {
    if (selectedLot) setActiveZone(selectedLot.zone);
  }, [selectedLot]);

  useEffect(() => {
    const plates = getSavedPlates();
    setSavedPlates(plates);
    if (plates.length > 0) setLicensePlate(plates[0]);
  }, []);

  const cleanPlate = sanitizePlate(licensePlate);
  const activeSmsNumber = getSmsNumber(activeZone, isDayTicket);
  const totalPrice = calculateParkingCost(activeZone, hours, isDayTicket);

  const zoneColors: Record<string, string> = {
    '0': 'border-red-500/60',
    '1': 'border-sky-500/60',
    '2': 'border-emerald-500/60',
  };

  const zoneTextColors: Record<string, string> = {
    '0': 'text-red-400',
    '1': 'text-sky-400',
    '2': 'text-emerald-400',
  };

  return (
    <div className="flex flex-col h-full px-3 pt-2 pb-1 gap-2">

      {/* Zone buttons row */}
      <div className="flex gap-1.5">
        {(['0', '1', '2'] as ParkingZone[]).map((zone) => {
          const details = ZONE_DETAILS[zone];
          const isSelected = activeZone === zone;
          const smsNum = getSmsNumber(zone, isDayTicket);
          return (
            <button
              key={zone}
              type="button"
              onClick={() => setActiveZone(zone)}
              className={`flex-1 py-1.5 rounded-lg border text-center transition-all ${zoneColors[zone]} ${
                isSelected
                  ? 'bg-[#08224d] border-[#d4af37] ring-1 ring-[#d4af37] shadow-md'
                  : 'bg-[#061938]/60 hover:bg-[#08224d]'
              }`}
            >
              <div className={`font-black text-[11px] uppercase ${isSelected ? 'text-white' : zoneTextColors[zone]}`}>
                Zona {zone}
              </div>
              <div className="text-[10px] text-slate-300 font-semibold">{details.hourlyPrice.toFixed(1)} KM/h</div>
              <div className="text-[9px] text-slate-400 font-mono">{smsNum}</div>
            </button>
          );
        })}
      </div>

      {/* License plate input */}
      <div className="relative">
        <Car className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#d4af37]" />
        <input
          type="text"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
          placeholder={t.smsPayment.licensePlatePlaceholder}
          className="w-full bg-[#0a1128] border border-[#d4af37]/40 rounded-lg pl-8 pr-3 py-2 text-sm font-bold text-white tracking-widest placeholder-slate-500 focus:outline-none focus:border-[#d4af37] transition-colors"
        />
      </div>

      {/* Saved plates quick-select */}
      {savedPlates.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {savedPlates.slice(0, 4).map((plate) => (
            <button
              key={plate}
              type="button"
              onClick={() => setLicensePlate(plate)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                sanitizePlate(licensePlate) === sanitizePlate(plate)
                  ? 'bg-[#d4af37] text-[#0a1128] font-bold border-[#d4af37]'
                  : 'bg-[#1a2a44] text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              {formatPlateDisplay(plate)}
            </button>
          ))}
        </div>
      )}

      {/* Duration row */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => { setHours(h); setIsDayTicket(false); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              !isDayTicket && hours === h
                ? 'bg-[#d4af37] text-[#0a1128] border-[#d4af37] shadow-md'
                : 'bg-[#14213d] text-slate-300 border-slate-700 hover:bg-[#1a2a44]'
            }`}
          >
            {h}h
          </button>
        ))}
        <button
          type="button"
          onClick={() => setIsDayTicket(true)}
          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
            isDayTicket
              ? 'bg-[#d4af37] text-[#0a1128] border-[#d4af37] shadow-md'
              : 'bg-[#14213d] text-slate-300 border-slate-700 hover:bg-[#1a2a44]'
          }`}
        >
          Dan
        </button>
      </div>

      {/* Price box + Send SMS button */}
      <div className="flex gap-2 items-stretch">
        <div className="bg-[#08224d] border border-[#d4af37]/30 rounded-xl px-3 py-2 flex flex-col justify-center min-w-[80px]">
          <div className="text-[9px] text-slate-400 font-medium uppercase tracking-wide">Ukupno</div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-black text-[#d4af37] leading-none">{totalPrice.toFixed(2)}</span>
            <span className="text-[10px] font-bold text-slate-300">KM</span>
          </div>
          <div className="text-[9px] text-slate-400 font-mono truncate">SMS {activeSmsNumber}</div>
        </div>

        <button
          onClick={() => onOpenSmsPay(selectedLot || undefined)}
          className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#b8860b] text-[#0a1128] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/20 hover:brightness-110 active:scale-95 transition-all border border-[#ffe58f]/40"
        >
          <Send className="w-4 h-4 fill-current" />
          <span>{t.smsPayment.sendSmsButton}</span>
        </button>
      </div>
    </div>
  );
};
