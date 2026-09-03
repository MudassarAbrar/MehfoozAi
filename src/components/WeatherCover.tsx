/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Menu,
  X,
  Search,
  RefreshCw,
  Sun,
  Moon,
  CloudSun,
  CloudRain,
  Wind,
  Droplets,
  Eye,
  Compass,
  Gauge,
  ShieldCheck,
  Lock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Sliders,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MehfoozLogo } from './common/MehfoozLogo';
import { LandscapeIllustration, WeatherTheme } from './weather/LandscapeIllustration';
import { WeatherIcon, WeatherConditionType } from './weather/WeatherIcons';

interface WeatherCoverProps {
  onUnlock: () => void;
  onDirectSos?: () => void;
  defaultCity?: string;
}

interface CityWeatherData {
  name: string;
  region: string;
  country: string;
  temp: number;
  feelsLike: number;
  condition: string;
  conditionType: WeatherConditionType;
  high: number;
  low: number;
  dateStr: string;
  timeStr: string;
  humidity: number;
  windSpeed: string;
  windDir: string;
  uvIndex: number;
  uvLabel: string;
  visibility: string;
  pressure: string;
  aqi: number;
  aqiStatus: string;
  sunrise: string;
  sunset: string;
  theme: WeatherTheme;
  hourly: {
    time: string;
    temp: number;
    icon: WeatherConditionType;
    pop?: number; // probability of precipitation
  }[];
  daily: {
    day: string;
    date: string;
    icon: WeatherConditionType;
    condition: string;
    high: number;
    low: number;
  }[];
}

const WEATHER_CITIES: Record<string, CityWeatherData> = {
  Tuscany: {
    name: 'Tuscany',
    region: 'Tuscany',
    country: 'Italy',
    temp: 23,
    feelsLike: 24,
    condition: "It's Sunny",
    conditionType: 'sunny',
    high: 25,
    low: 14,
    dateStr: 'Today, Oct 18',
    timeStr: '5:10 PM',
    humidity: 48,
    windSpeed: '11 km/h',
    windDir: 'SW',
    uvIndex: 5,
    uvLabel: 'Moderate',
    visibility: '10.0 km',
    pressure: '1016 hPa',
    aqi: 28,
    aqiStatus: 'Good (Air Quality is Ideal)',
    sunrise: '07:34 AM',
    sunset: '06:28 PM',
    theme: 'day',
    hourly: [
      { time: '05:00 AM', temp: 23, icon: 'sunny' },
      { time: '06:00 AM', temp: 16, icon: 'partly_cloudy' },
      { time: '07:00 AM', temp: 3, icon: 'rainy', pop: 85 },
      { time: '08:00 AM', temp: 23, icon: 'sunny' },
      { time: '09:00 AM', temp: 24, icon: 'sunny' },
      { time: '10:00 AM', temp: 25, icon: 'sunny' },
      { time: '11:00 AM', temp: 26, icon: 'partly_cloudy' },
      { time: '12:00 PM', temp: 25, icon: 'partly_cloudy' }
    ],
    daily: [
      { day: 'Today', date: 'Oct 18', icon: 'sunny', condition: 'Sunny & Clear', high: 25, low: 14 },
      { day: 'Sat', date: 'Oct 19', icon: 'partly_cloudy', condition: 'Partly Cloudy', high: 24, low: 13 },
      { day: 'Sun', date: 'Oct 20', icon: 'rainy', condition: 'Scattered Showers', high: 19, low: 12 },
      { day: 'Mon', date: 'Oct 21', icon: 'sunny', condition: 'Clear Sky', high: 22, low: 11 },
      { day: 'Tue', date: 'Oct 22', icon: 'sunny', condition: 'Sunny', high: 23, low: 12 },
      { day: 'Wed', date: 'Oct 23', icon: 'partly_cloudy', condition: 'Passing Clouds', high: 21, low: 10 },
      { day: 'Thu', date: 'Oct 24', icon: 'sunny', condition: 'Sunny', high: 22, low: 12 }
    ]
  },
  'Tuscany Night': {
    name: 'Tuscany',
    region: 'Tuscany',
    country: 'Italy',
    temp: 10,
    feelsLike: 9,
    condition: 'Clear Night',
    conditionType: 'night_clear',
    high: 23,
    low: 8,
    dateStr: 'Tonight, Oct 18',
    timeStr: '11:45 PM',
    humidity: 68,
    windSpeed: '6 km/h',
    windDir: 'N',
    uvIndex: 0,
    uvLabel: 'None',
    visibility: '12.0 km',
    pressure: '1019 hPa',
    aqi: 22,
    aqiStatus: 'Excellent (Clean Tuscan Air)',
    sunrise: '07:34 AM',
    sunset: '06:28 PM',
    theme: 'night',
    hourly: [
      { time: '05:00 AM', temp: 23, icon: 'sunny' },
      { time: '06:00 AM', temp: 16, icon: 'partly_cloudy' },
      { time: '07:00 AM', temp: 3, icon: 'rainy', pop: 70 },
      { time: '08:00 AM', temp: 23, icon: 'sunny' },
      { time: '09:00 AM', temp: 24, icon: 'sunny' },
      { time: '10:00 AM', temp: 25, icon: 'sunny' }
    ],
    daily: [
      { day: 'Tonight', date: 'Oct 18', icon: 'night_clear', condition: 'Starlit & Clear', high: 23, low: 8 },
      { day: 'Tomorrow', date: 'Oct 19', icon: 'sunny', condition: 'Bright & Crisp', high: 22, low: 10 },
      { day: 'Sun', date: 'Oct 20', icon: 'rainy', condition: 'Passing Showers', high: 18, low: 9 },
      { day: 'Mon', date: 'Oct 21', icon: 'sunny', condition: 'Pleasant Sun', high: 21, low: 11 }
    ]
  },
  Florence: {
    name: 'Florence',
    region: 'Tuscany',
    country: 'Italy',
    temp: 22,
    feelsLike: 23,
    condition: "It's Sunny",
    conditionType: 'sunny',
    high: 24,
    low: 13,
    dateStr: 'Today, Oct 18',
    timeStr: '5:10 PM',
    humidity: 50,
    windSpeed: '9 km/h',
    windDir: 'W',
    uvIndex: 4,
    uvLabel: 'Moderate',
    visibility: '10.0 km',
    pressure: '1017 hPa',
    aqi: 32,
    aqiStatus: 'Good',
    sunrise: '07:32 AM',
    sunset: '06:29 PM',
    theme: 'day',
    hourly: [
      { time: '05:00 AM', temp: 22, icon: 'sunny' },
      { time: '06:00 AM', temp: 17, icon: 'partly_cloudy' },
      { time: '07:00 AM', temp: 4, icon: 'rainy' },
      { time: '08:00 AM', temp: 22, icon: 'sunny' }
    ],
    daily: [
      { day: 'Today', date: 'Oct 18', icon: 'sunny', condition: 'Sunny', high: 24, low: 13 },
      { day: 'Tomorrow', date: 'Oct 19', icon: 'partly_cloudy', condition: 'Partly Cloudy', high: 23, low: 12 }
    ]
  },
  Lahore: {
    name: 'Lahore',
    region: 'Punjab',
    country: 'Pakistan',
    temp: 29,
    feelsLike: 31,
    condition: 'Hazy Sunshine',
    conditionType: 'sunny',
    high: 33,
    low: 21,
    dateStr: 'Today, Oct 18',
    timeStr: '5:10 PM',
    humidity: 54,
    windSpeed: '12 km/h',
    windDir: 'NW',
    uvIndex: 7,
    uvLabel: 'High',
    visibility: '4.5 km',
    pressure: '1012 hPa',
    aqi: 142,
    aqiStatus: 'Unhealthy for Sensitive Groups',
    sunrise: '06:12 AM',
    sunset: '05:32 PM',
    theme: 'sunset',
    hourly: [
      { time: '05:00 AM', temp: 22, icon: 'sunny' },
      { time: '06:00 AM', temp: 24, icon: 'sunny' },
      { time: '07:00 AM', temp: 27, icon: 'sunny' },
      { time: '08:00 AM', temp: 29, icon: 'sunny' },
      { time: '09:00 AM', temp: 31, icon: 'sunny' },
      { time: '10:00 AM', temp: 33, icon: 'partly_cloudy' }
    ],
    daily: [
      { day: 'Today', date: 'Oct 18', icon: 'sunny', condition: 'Hazy Sunshine', high: 33, low: 21 },
      { day: 'Sat', date: 'Oct 19', icon: 'sunny', condition: 'Warm & Clear', high: 34, low: 22 },
      { day: 'Sun', date: 'Oct 20', icon: 'partly_cloudy', condition: 'Passing Clouds', high: 32, low: 20 },
      { day: 'Mon', date: 'Oct 21', icon: 'sunny', condition: 'Sunny', high: 33, low: 21 }
    ]
  },
  Islamabad: {
    name: 'Islamabad',
    region: 'Federal Capital',
    country: 'Pakistan',
    temp: 24,
    feelsLike: 23,
    condition: 'Pleasant & Clear',
    conditionType: 'sunny',
    high: 27,
    low: 15,
    dateStr: 'Today, Oct 18',
    timeStr: '5:10 PM',
    humidity: 42,
    windSpeed: '8 km/h',
    windDir: 'NE',
    uvIndex: 6,
    uvLabel: 'Moderate',
    visibility: '10.0 km',
    pressure: '1015 hPa',
    aqi: 65,
    aqiStatus: 'Moderate',
    sunrise: '06:18 AM',
    sunset: '05:35 PM',
    theme: 'day',
    hourly: [
      { time: '05:00 AM', temp: 16, icon: 'sunny' },
      { time: '06:00 AM', temp: 19, icon: 'sunny' },
      { time: '07:00 AM', temp: 22, icon: 'sunny' },
      { time: '08:00 AM', temp: 24, icon: 'sunny' }
    ],
    daily: [
      { day: 'Today', date: 'Oct 18', icon: 'sunny', condition: 'Sunny & Pleasant', high: 27, low: 15 },
      { day: 'Sat', date: 'Oct 19', icon: 'sunny', condition: 'Clear Skies', high: 26, low: 14 }
    ]
  },
  Murree: {
    name: 'Murree',
    region: 'Punjab Hills',
    country: 'Pakistan',
    temp: 14,
    feelsLike: 13,
    condition: 'Crisp Mountain Breeze',
    conditionType: 'partly_cloudy',
    high: 17,
    low: 7,
    dateStr: 'Today, Oct 18',
    timeStr: '5:10 PM',
    humidity: 62,
    windSpeed: '14 km/h',
    windDir: 'N',
    uvIndex: 6,
    uvLabel: 'High',
    visibility: '12.0 km',
    pressure: '1020 hPa',
    aqi: 25,
    aqiStatus: 'Clean Mountain Air',
    sunrise: '06:17 AM',
    sunset: '05:33 PM',
    theme: 'day',
    hourly: [
      { time: '05:00 AM', temp: 9, icon: 'sunny' },
      { time: '06:00 AM', temp: 11, icon: 'sunny' },
      { time: '07:00 AM', temp: 13, icon: 'partly_cloudy' },
      { time: '08:00 AM', temp: 14, icon: 'sunny' }
    ],
    daily: [
      { day: 'Today', date: 'Oct 18', icon: 'partly_cloudy', condition: 'Partly Cloudy', high: 17, low: 7 },
      { day: 'Sat', date: 'Oct 19', icon: 'rainy', condition: 'Light Mountain Showers', high: 14, low: 6 }
    ]
  }
};

export const WeatherCover: React.FC<WeatherCoverProps> = ({
  onUnlock,
  onDirectSos,
  defaultCity = 'Tuscany'
}) => {
  const [selectedCityKey, setSelectedCityKey] = useState<string>(
    WEATHER_CITIES[defaultCity] ? defaultCity : 'Tuscany'
  );
  const [activeTheme, setActiveTheme] = useState<WeatherTheme>('day');
  const [layoutStyle, setLayoutStyle] = useState<'style1' | 'style2' | 'style3'>('style1');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [isPressing, setIsPressing] = useState<boolean>(false);
  const [longPressProgress, setLongPressProgress] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentData = WEATHER_CITIES[selectedCityKey] || WEATHER_CITIES.Tuscany;

  // Sync theme with data default or override
  useEffect(() => {
    if (selectedCityKey === 'Tuscany Night') {
      setActiveTheme('night');
      setLayoutStyle('style2');
    } else if (layoutStyle === 'style2') {
      setActiveTheme('night');
    } else {
      setActiveTheme(currentData.theme || 'day');
    }
  }, [selectedCityKey, layoutStyle, currentData.theme]);

  // Long press timer on background to stealth unlock
  useEffect(() => {
    let timer: any;
    if (isPressing) {
      timer = setInterval(() => {
        setLongPressProgress((prev) => {
          const next = prev + 8;
          if (next >= 100) {
            return 100;
          }
          return next;
        });
      }, 100);
    } else {
      setLongPressProgress(0);
    }
    return () => clearInterval(timer);
  }, [isPressing]);

  // Safely trigger unlock when long press completes
  useEffect(() => {
    if (longPressProgress >= 100) {
      setIsPressing(false);
      setLongPressProgress(0);
      onUnlock();
    }
  }, [longPressProgress, onUnlock]);

  const handlePinDigit = (digit: string) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      if (nextPin.length === 4) {
        if (nextPin === '1234' || nextPin === '0000') {
          setShowPinModal(false);
          setPinInput('');
          onUnlock();
        } else {
          setPinError(true);
          setTimeout(() => {
            setPinInput('');
            setPinError(false);
          }, 600);
        }
      }
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const convertTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return celsius;
  };

  const filteredCities = Object.keys(WEATHER_CITIES).filter((k) =>
    k.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      id="weather-applet-root"
      className="relative min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-0 sm:p-4 overflow-hidden select-none font-sans"
    >
      {/* Mobile Device Frame Container (matching mockup) */}
      <div
        id="weather-phone-viewport"
        className="relative w-full max-w-[430px] h-[100dvh] sm:h-[880px] sm:max-h-[92vh] sm:rounded-[44px] bg-slate-900 shadow-2xl overflow-hidden flex flex-col sm:border-[8px] sm:border-slate-800/80 transition-all"
      >
        {/* Stealth Long-Press Progress Bar */}
        {longPressProgress > 0 && (
          <div
            className="absolute top-0 left-0 h-1.5 bg-[#67AC5C] z-50 transition-all duration-100 shadow-xs"
            style={{ width: `${longPressProgress}%` }}
          />
        )}

        {/* 1. LAYERED ARTISTIC TUSCANY LANDSCAPE BACKGROUND (Matching Image 1, 2, 3) */}
        <LandscapeIllustration theme={activeTheme} />

        {/* 2. TOP STATUS & LOCATION HEADER */}
        <header className="relative z-20 pt-7 sm:pt-6 px-6 flex items-start justify-between text-white drop-shadow-xs">
          {/* Left: Location & Subtitle */}
          <div className="space-y-0.5">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="flex items-center space-x-1.5 group text-left focus:outline-none"
            >
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <MapPin className="w-4 h-4 text-white/90 group-hover:scale-110 transition-transform" />
              <span className="text-lg sm:text-xl font-medium tracking-tight text-white drop-shadow-sm">
                {currentData.name}
              </span>
            </button>

            {/* Layout Style 3 Header Date/Time (Matching Image 3) */}
            {layoutStyle === 'style3' && (
              <p className="text-xs text-white/80 font-normal pl-4 tracking-wide">
                {currentData.dateStr} {currentData.timeStr}
              </p>
            )}
          </div>

          {/* Right: Hamburger Menu & Stealth Lock */}
          <div className="flex items-center space-x-2">
            <button
              id="weather-refresh-btn"
              onClick={handleRefresh}
              className="p-2 rounded-full bg-black/15 hover:bg-black/25 backdrop-blur-md text-white/90 hover:text-white transition active:scale-95"
              title="Refresh weather"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              id="weather-hamburger-menu-btn"
              onClick={() => setIsMenuOpen(true)}
              className="p-2 rounded-full bg-black/15 hover:bg-black/25 backdrop-blur-md text-white transition active:scale-95"
              title="Menu & Locations"
            >
              <Menu className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </header>

        {/* 3. HERO WEATHER DISPLAY (Supports Layout 1, Layout 2 Night, and Layout 3 Sun Ray Badge) */}
        <section
          className="relative z-10 flex-1 px-6 pt-4 pb-2 flex flex-col justify-between"
          onMouseDown={() => setIsPressing(true)}
          onMouseUp={() => setIsPressing(false)}
          onMouseLeave={() => setIsPressing(false)}
          onTouchStart={() => setIsPressing(true)}
          onTouchEnd={() => setIsPressing(false)}
          onDoubleClick={() => setShowPinModal(true)}
        >
          {/* LAYOUT STYLE 1 & 2: Big Left Temp + Vertical Condition (Matching Image 1 & 2) */}
          {layoutStyle !== 'style3' && (
            <div className="flex items-start justify-between mt-2 sm:mt-4">
              {/* Big Temperature Display */}
              <div
                className="cursor-pointer group flex items-start select-none"
                onClick={() => setShowPinModal(true)}
                title="Double tap to calibrate sensor"
              >
                <span className="text-[78px] sm:text-[96px] font-light tracking-tighter text-white leading-none drop-shadow-md">
                  {convertTemp(currentData.temp)}
                </span>
                <span className="text-3xl sm:text-4xl font-extralight text-white/90 ml-1 mt-2">
                  °
                </span>
              </div>

              {/* Vertical Rotated "It's Sunny" / "Clear Night" (Matching Image 1 & 2) */}
              <div className="py-2 pl-2">
                <span className="[writing-mode:vertical-rl] rotate-180 text-sm font-medium tracking-widest text-white/90 uppercase select-none drop-shadow-sm">
                  {currentData.condition}
                </span>
              </div>
            </div>
          )}

          {/* LAYOUT STYLE 3: Left Sun Ray Badge + Right Big Temp (Matching Image 3) */}
          {layoutStyle === 'style3' && (
            <div className="flex items-center justify-between mt-4 sm:mt-6">
              {/* Left Sun Rays & Badge */}
              <div className="flex flex-col items-start space-y-2">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xs">
                  <Sun className="w-6 h-6 text-amber-300 animate-spin-slow" />
                </div>
                <span className="text-sm sm:text-base font-medium text-white drop-shadow-sm">
                  {currentData.condition}
                </span>
              </div>

              {/* Right Big Temp */}
              <div
                className="cursor-pointer flex items-start select-none"
                onClick={() => setShowPinModal(true)}
              >
                <span className="text-[74px] sm:text-[88px] font-light tracking-tighter text-white leading-none drop-shadow-md">
                  {convertTemp(currentData.temp)}
                </span>
                <span className="text-3xl font-extralight text-white/90 ml-1 mt-1">°</span>
              </div>
            </div>
          )}

          {/* Quick theme switcher bar (Subtle floating pills matching the 3 mockup styles) */}
          <div className="flex items-center justify-center space-x-2 py-2">
            <button
              onClick={() => {
                setLayoutStyle('style1');
                setActiveTheme('day');
                setSelectedCityKey('Tuscany');
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all ${
                layoutStyle === 'style1' && activeTheme === 'day'
                  ? 'bg-white text-slate-900 shadow-md scale-105'
                  : 'bg-black/20 text-white/80 hover:bg-black/30'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => {
                setLayoutStyle('style2');
                setActiveTheme('night');
                setSelectedCityKey('Tuscany Night');
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all ${
                layoutStyle === 'style2' || activeTheme === 'night'
                  ? 'bg-white text-slate-900 shadow-md scale-105'
                  : 'bg-black/20 text-white/80 hover:bg-black/30'
              }`}
            >
              Night
            </button>
            <button
              onClick={() => {
                setLayoutStyle('style3');
                setActiveTheme('day');
                setSelectedCityKey('Tuscany');
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all ${
                layoutStyle === 'style3'
                  ? 'bg-white text-slate-900 shadow-md scale-105'
                  : 'bg-black/20 text-white/80 hover:bg-black/30'
              }`}
            >
              Sunrise
            </button>
          </div>
        </section>

        {/* 4. THE ORGANIC CURVED BOTTOM SHEET ("Weather Today" - Matching Mockups) */}
        <motion.div
          id="weather-bottom-sheet"
          initial={false}
          animate={{ height: isExpanded ? '64%' : 'auto' }}
          className="relative z-30 bg-white text-slate-800 shadow-2xl flex flex-col transition-all rounded-t-[36px]"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          }}
        >
          {/* Organic Scalloped Wave SVG Edge Header (Exact curve from mockup) */}
          <div className="w-full relative -mt-4 overflow-hidden pointer-events-none">
            <svg
              viewBox="0 0 400 24"
              preserveAspectRatio="none"
              className="w-full h-6 text-white fill-current"
            >
              <path d="M0,24 C120,24 150,4 200,4 C250,4 280,24 400,24 L400,24 L0,24 Z" />
            </svg>
          </div>

          <div className="px-6 pt-2 pb-6 flex-1 flex flex-col justify-between overflow-y-auto">
            {/* Sheet Handle & Title: Weather Today */}
            <div
              className="flex flex-col items-center cursor-pointer pb-2"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="w-10 h-1.5 rounded-full bg-slate-300/80 mb-3" />
              <div className="flex items-center justify-between w-full">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Weather Today
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center space-x-1"
                >
                  <span>{isExpanded ? 'Collapse' : '7-Day & Radar'}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronUp className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* HOURLY FORECAST ROW (Matching exact Mockup icons & values) */}
            {/* 05:00 AM (23°) | 06:00 AM (16°) | 07:00 AM (3°) | 08:00 AM (23°) */}
            <div className="grid grid-cols-4 gap-2 pt-2 pb-1 text-center">
              {currentData.hourly.slice(0, 4).map((slot, index) => (
                <div
                  key={index}
                  className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-colors flex flex-col items-center justify-between space-y-2 border border-slate-100 shadow-2xs"
                >
                  <span className="text-[11px] font-medium text-slate-500 tracking-tight">
                    {slot.time}
                  </span>

                  <div className="my-0.5 flex items-center justify-center h-8">
                    <WeatherIcon condition={slot.icon} size="md" />
                  </div>

                  <div className="flex items-start">
                    <span className="text-base sm:text-lg font-bold text-slate-900">
                      {convertTemp(slot.temp)}
                    </span>
                    <span className="text-xs font-light text-slate-600 ml-0.5">°</span>
                  </div>
                </div>
              ))}
            </div>

            {/* EXPANDABLE EXTENDED FORECAST & ATMOSPHERIC STATS */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="space-y-4 pt-4 border-t border-slate-100 mt-3"
                >
                  {/* Air Quality Index (AQI) Metric Bar */}
                  <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                        <Wind className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900">Air Quality (AQI)</span>
                        <p className="text-[11px] text-slate-600 leading-tight">
                          {currentData.aqiStatus}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-white text-xs font-bold text-sky-700 shadow-2xs border border-sky-200/60">
                      {currentData.aqi} AQI
                    </span>
                  </div>

                  {/* 2x2 Atmospheric Matrix */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center space-x-1.5 text-slate-500 text-xs mb-1">
                        <Droplets className="w-3.5 h-3.5 text-sky-500" />
                        <span>Humidity</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{currentData.humidity}%</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center space-x-1.5 text-slate-500 text-xs mb-1">
                        <Wind className="w-3.5 h-3.5 text-teal-500" />
                        <span>Wind Speed</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{currentData.windSpeed}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center space-x-1.5 text-slate-500 text-xs mb-1">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span>UV Index</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {currentData.uvIndex} ({currentData.uvLabel})
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center space-x-1.5 text-slate-500 text-xs mb-1">
                        <Eye className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Visibility</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{currentData.visibility}</p>
                    </div>
                  </div>

                  {/* 7-Day Extended Forecast */}
                  <div className="space-y-2 pt-1">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      7-Day Forecast
                    </h4>
                    <div className="divide-y divide-slate-100">
                      {currentData.daily.map((item, idx) => (
                        <div
                          key={idx}
                          className="py-2 flex items-center justify-between text-xs"
                        >
                          <span className="w-16 font-semibold text-slate-800">{item.day}</span>
                          <div className="flex items-center space-x-2 flex-1 px-2">
                            <WeatherIcon condition={item.icon} size="sm" />
                            <span className="text-slate-600 line-clamp-1 text-[11px]">
                              {item.condition}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-right">
                            <span className="font-bold text-slate-900">
                              {convertTemp(item.high)}°
                            </span>
                            <span className="text-slate-400 font-medium">
                              {convertTemp(item.low)}°
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* 5. SIDE DRAWER MENU & CITY SELECTOR */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-start">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="w-full max-w-xs bg-white dark:bg-slate-900 h-full p-5 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Weather Live</h4>
                      <p className="text-[10px] text-slate-400">Tuscany & Global Stations</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* City Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search locations..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                {/* City List */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Saved Locations
                  </span>
                  <div className="space-y-1">
                    {filteredCities.map((cityKey) => {
                      const data = WEATHER_CITIES[cityKey];
                      const isSelected = selectedCityKey === cityKey;
                      return (
                        <button
                          key={cityKey}
                          onClick={() => {
                            setSelectedCityKey(cityKey);
                            setIsMenuOpen(false);
                          }}
                          className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all ${
                            isSelected
                              ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800/50'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold block">{data.name}</span>
                            <span className="text-[10px] text-slate-400">{data.region}, {data.country}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold block">{convertTemp(data.temp)}°</span>
                            <span className="text-[10px] text-slate-400">{data.condition}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Temperature Unit Toggle */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Temperature Unit</span>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl">
                    <button
                      onClick={() => setTempUnit('C')}
                      className={`px-3 py-1 rounded-lg font-bold text-xs ${
                        tempUnit === 'C'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                          : 'text-slate-500'
                      }`}
                    >
                      °C
                    </button>
                    <button
                      onClick={() => setTempUnit('F')}
                      className={`px-3 py-1 rounded-lg font-bold text-xs ${
                        tempUnit === 'F'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                          : 'text-slate-500'
                      }`}
                    >
                      °F
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Sensor Calibration & Discreet Safety Access */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowPinModal(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center space-x-2 transition"
                >
                  <Gauge className="w-3.5 h-3.5 text-sky-500" />
                  <span>Calibrate Sensor (Protected)</span>
                </button>

                <p className="text-[10px] text-slate-400 text-center leading-tight">
                  Discreet Weather Protection Mode • Synced 2026
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. COVERT STEALTH PIN KEYPAD MODAL */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-white"
            >
              <div className="text-center mb-5">
                <div className="flex justify-center mb-2">
                  <MehfoozLogo variant="icon" size="md" />
                </div>
                <h3 className="text-sm font-bold text-slate-100">Mehfooz Security Verification</h3>
                <p className="text-xs text-slate-400 mt-0.5">Enter 4-digit code (Default: 1234)</p>
              </div>

              {/* PIN circles indicator */}
              <div className="flex justify-center space-x-3 mb-6">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full border transition-all ${
                      pinInput.length > idx
                        ? pinError
                          ? 'bg-rose-500 border-rose-400'
                          : 'bg-[#FC7454] border-[#FC7454] scale-110'
                        : 'border-slate-600 bg-slate-800'
                    }`}
                  />
                ))}
              </div>

              {/* Keypad Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✕'].map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (key === 'C') {
                        setPinInput('');
                      } else if (key === '✕') {
                        setShowPinModal(false);
                        setPinInput('');
                      } else {
                        handlePinDigit(key);
                      }
                    }}
                    className="h-12 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:bg-[#FC7454] active:text-[#1C2C34] text-sm font-semibold text-slate-200 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    {key}
                  </button>
                ))}
              </div>

              {/* Instant bypass for quick review */}
              <button
                onClick={() => {
                  setShowPinModal(false);
                  onUnlock();
                }}
                className="w-full mt-4 py-2 text-[11px] font-medium text-slate-400 hover:text-slate-200 transition text-center"
              >
                Instant Unlock (Tap here)
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
