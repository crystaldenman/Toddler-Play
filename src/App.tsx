/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Baby, 
  Clock, 
  Zap, 
  MapPin, 
  Hand, 
  Sparkles, 
  AlertCircle, 
  PackageX, 
  UserCheck, 
  Heart, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  History,
  Crown,
  Bell,
  Home,
  Calendar,
  Lock,
  Share2
} from 'lucide-react';
import { generateActivities, generateMeltdownActivity, Activity } from './services/geminiService';
import { SEASONAL_PACKS, SeasonalPack } from './constants/seasonalPacks';

type Screen = 'home' | 'generator' | 'results' | 'favorites' | 'meltdown' | 'settings' | 'seasonal' | 'pack-details';

export default function App() {
  const [screen, setScreen] = useState<Screen>('generator');
  const [age, setAge] = useState('18-24 months');
  const [time, setTime] = useState('10 min');
  const [energy, setEnergy] = useState('medium');
  const [location, setLocation] = useState('indoors');
  const [effort, setEffort] = useState('moderate');
  const [noSupplies, setNoSupplies] = useState(false);
  const [independent, setIndependent] = useState(false);
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [favorites, setFavorites] = useState<Activity[]>([]);
  const [selectedPack, setSelectedPack] = useState<SeasonalPack | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Curating safe ideas...');
  const [isPremium, setIsPremium] = useState(true);
  const [generationsToday, setGenerationsToday] = useState(0);
  const [showCopied, setShowCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadingMessages = [
    'Curating safe ideas...',
    'Checking household supplies...',
    'Matching energy levels...',
    'Ensuring toddler safety...',
    'Almost there...'
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      let i = 0;
      interval = setInterval(() => {
        i = (i + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[i]);
      }, 1000); // Faster rotation
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    fetchFavorites();
    fetchUserStatus();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorites');
      const data = await res.json();
      setFavorites(data.map((f: any) => ({
        ...f,
        instructions: JSON.parse(f.instructions),
        supplies: JSON.parse(f.supplies)
      })));
    } catch (e) {
      console.error("Failed to fetch favorites", e);
    }
  };

  const fetchUserStatus = async () => {
    try {
      const res = await fetch('/api/user/status');
      const data = await res.json();
      setIsPremium(!!data.is_premium);
      setGenerationsToday(data.daily_generations_count || 0);
    } catch (e) {
      console.error("Failed to fetch user status", e);
    }
  };

  const handleGenerate = async (count: number = 3) => {
    setLoading(true);
    setError(null);
    setScreen('results');
    try {
      const results = await generateActivities({
        age, time, energy, location, effort, noSupplies, independent
      });
      // If we only wanted 1, slice it (though the prompt now asks for 3, we can still slice for UI)
      setActivities(count === 1 ? results.slice(0, 1) : results);
      setGenerationsToday(prev => prev + 1);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleMeltdown = async () => {
    setLoading(true);
    setError(null);
    setScreen('meltdown');
    try {
      const result = await generateMeltdownActivity();
      setActivities([result]);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'ToddlerPlay Hero',
      text: 'Check out this toddler activity generator! It saves my life every day.',
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };
  const toggleFavorite = async (activity: Activity) => {
    const isFav = favorites.find(f => f.id === activity.id);
    if (isFav) {
      await fetch(`/api/favorites/${activity.id}`, { method: 'DELETE' });
    } else {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity)
      });
    }
    fetchFavorites();
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between px-6 py-4 bg-brand-paper/80 backdrop-blur-md sticky top-0 z-50 border-b border-brand-olive/5">
      <div className="flex items-center gap-2" onClick={() => setScreen('home')}>
        <div className="w-8 h-8 bg-brand-olive rounded-full flex items-center justify-center">
          <Baby className="text-brand-cream w-5 h-5" />
        </div>
        <h1 className="serif text-xl font-semibold text-brand-olive">ToddlerPlay</h1>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => setScreen('favorites')} className="p-2 text-brand-olive/70 hover:text-brand-olive">
          <Heart className="w-6 h-6" fill={screen === 'favorites' ? 'currentColor' : 'none'} />
        </button>
        <button onClick={() => setScreen('settings')} className="p-2 text-brand-olive/70 hover:text-brand-olive">
          <Crown className={`w-6 h-6 ${isPremium ? 'text-brand-clay' : ''}`} />
        </button>
      </div>
    </div>
  );

  const SelectionCard = ({ label, icon: Icon, options, value, onChange }: any) => (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3 px-2">
        <Icon className="w-4 h-4 text-brand-olive/60" />
        <span className="text-xs uppercase tracking-widest font-semibold text-brand-olive/60">{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`py-4 px-4 rounded-2xl text-sm font-medium transition-all duration-200 border ${
              value === opt 
                ? 'bg-brand-olive text-brand-cream border-brand-olive shadow-lg shadow-brand-olive/20' 
                : 'bg-white text-brand-olive/80 border-brand-olive/10 hover:border-brand-olive/30'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-cream pb-24 max-w-md mx-auto shadow-2xl relative overflow-hidden">
      {renderHeader()}

      <main className="p-6">
        <AnimatePresence mode="wait">
          {screen === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-10 text-center">
                <h2 className="serif text-4xl mb-3 text-brand-olive">What's the vibe today?</h2>
                <p className="text-brand-olive/60 text-sm">Quick, realistic play ideas for your toddler.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-10">
                <button 
                  onClick={() => setScreen('generator')}
                  className="group relative overflow-hidden bg-brand-clay text-white p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 shadow-xl shadow-brand-clay/20"
                >
                  <Sparkles className="w-10 h-10" />
                  <span className="serif text-2xl">Find Activities</span>
                  <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                    <Baby className="w-16 h-16" />
                  </div>
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handleMeltdown}
                    className="bg-red-50 text-red-700 p-6 rounded-[2rem] flex flex-col items-center gap-2 border border-red-100"
                  >
                    <AlertCircle className="w-6 h-6" />
                    <span className="font-semibold text-sm">Meltdown Mode</span>
                  </button>
                  <button 
                    onClick={() => { setIndependent(true); setScreen('generator'); }}
                    className="bg-brand-sage/30 text-brand-olive p-6 rounded-[2rem] flex flex-col items-center gap-2 border border-brand-sage/50"
                  >
                    <UserCheck className="w-6 h-6" />
                    <span className="font-semibold text-sm">Independent Play</span>
                  </button>
                </div>

                <button 
                  onClick={() => setScreen('seasonal')}
                  className="bg-white border border-brand-olive/10 p-6 rounded-[2rem] flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-cream rounded-2xl flex items-center justify-center">
                      <Calendar className="text-brand-olive w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <span className="serif text-xl block text-brand-olive">Seasonal Packs</span>
                      <span className="text-xs text-brand-olive/40">Fall, Winter & Holiday fun</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-brand-olive/20 group-hover:translate-x-1 transition-transform" />
                </button>

                <button 
                  onClick={handleShare}
                  className="bg-brand-olive/5 border border-brand-olive/10 p-6 rounded-[2rem] flex items-center justify-between group relative"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                      <Share2 className="text-brand-olive w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <span className="serif text-xl block text-brand-olive">Share with a Friend</span>
                      <span className="text-xs text-brand-olive/40">Send this app to another mom</span>
                    </div>
                  </div>
                  {showCopied ? (
                    <span className="text-xs font-bold text-brand-olive bg-brand-sage px-3 py-1 rounded-full">Copied!</span>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-brand-olive/20 group-hover:translate-x-1 transition-transform" />
                  )}
                </button>
              </div>

              <div className="bg-white/50 rounded-3xl p-6 border border-brand-olive/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="serif text-xl text-brand-olive">Daily Inspiration</h3>
                  <Bell className="w-4 h-4 text-brand-olive/40" />
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-brand-sage rounded-2xl flex items-center justify-center shrink-0">
                    <Hand className="text-brand-olive w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-medium text-brand-olive">Sensory Water Play</p>
                    <p className="text-xs text-brand-olive/60">Just need a bowl and some sponges.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {screen === 'generator' && (
            <motion.div
              key="generator"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setScreen('home')} className="p-2 bg-white rounded-full shadow-sm">
                  <X className="w-5 h-5 text-brand-olive" />
                </button>
                <h2 className="serif text-2xl text-brand-olive">Customize Play</h2>
              </div>

              <SelectionCard 
                label="Age" 
                icon={Baby} 
                options={['12-18 months', '18-24 months', '2 years', '3 years']} 
                value={age} 
                onChange={setAge} 
              />
              <SelectionCard 
                label="Time Available" 
                icon={Clock} 
                options={['5 min', '10 min', '20 min', '30+ min']} 
                value={time} 
                onChange={setTime} 
              />
              <SelectionCard 
                label="Energy Level" 
                icon={Zap} 
                options={['calm', 'medium', 'high energy']} 
                value={energy} 
                onChange={setEnergy} 
              />
              <SelectionCard 
                label="Location" 
                icon={MapPin} 
                options={['indoors', 'backyard', 'park', 'car', 'public place']} 
                value={location} 
                onChange={setLocation} 
              />
              <SelectionCard 
                label="Parent Effort" 
                icon={Hand} 
                options={['very low', 'moderate', 'hands-on']} 
                value={effort} 
                onChange={setEffort} 
              />

              <div className="space-y-4 mb-10">
                <button 
                  onClick={() => setNoSupplies(!noSupplies)}
                  className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${
                    noSupplies ? 'bg-brand-olive/5 border-brand-olive' : 'bg-white border-brand-olive/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <PackageX className={`w-5 h-5 ${noSupplies ? 'text-brand-olive' : 'text-brand-olive/40'}`} />
                    <span className="font-medium text-brand-olive">No Supplies Mode</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    noSupplies ? 'bg-brand-olive border-brand-olive' : 'border-brand-olive/20'
                  }`}>
                    {noSupplies && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </button>

                <button 
                  onClick={() => setIndependent(!independent)}
                  className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${
                    independent ? 'bg-brand-olive/5 border-brand-olive' : 'bg-white border-brand-olive/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserCheck className={`w-5 h-5 ${independent ? 'text-brand-olive' : 'text-brand-olive/40'}`} />
                    <span className="font-medium text-brand-olive">Independent Play</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    independent ? 'bg-brand-olive border-brand-olive' : 'border-brand-olive/20'
                  }`}>
                    {independent && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => handleGenerate(3)}
                  className="w-full bg-brand-olive text-brand-cream py-5 rounded-3xl font-semibold text-lg shadow-xl shadow-brand-olive/20 flex items-center justify-center gap-2"
                >
                  Generate 3 Ideas
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleGenerate(1)}
                  className="w-full bg-white text-brand-olive py-4 rounded-3xl font-semibold border border-brand-olive/10 flex items-center justify-center gap-2"
                >
                  Just 1 Quick Idea
                  <Zap className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {(screen === 'results' || screen === 'meltdown') && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setScreen('home')} className="p-2 bg-white rounded-full shadow-sm">
                  <Home className="w-5 h-5 text-brand-olive" />
                </button>
                <h2 className="serif text-2xl text-brand-olive">
                  {screen === 'meltdown' ? 'Calm Down Ideas' : 'Play Ideas'}
                </h2>
                <div className="w-9" />
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-brand-olive/20 border-t-brand-olive rounded-full animate-spin" />
                  <motion.p 
                    key={loadingMessage}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="serif text-xl text-brand-olive/60"
                  >
                    {loadingMessage}
                  </motion.p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-100 p-8 rounded-[2rem] text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="serif text-xl text-red-700 mb-2">Oops!</h3>
                  <p className="text-red-600/80 text-sm mb-6">{error}</p>
                  <button 
                    onClick={() => setScreen('generator')}
                    className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold text-sm"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {activities.map((activity, idx) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white rounded-[2rem] p-6 shadow-sm border border-brand-olive/5"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="serif text-2xl text-brand-olive leading-tight flex-1 pr-4">{activity.title}</h3>
                        <button 
                          onClick={() => toggleFavorite(activity)}
                          className="p-2"
                        >
                          <Heart 
                            className={`w-6 h-6 ${favorites.find(f => f.id === activity.id) ? 'text-red-500 fill-red-500' : 'text-brand-olive/20'}`} 
                          />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="px-3 py-1 bg-brand-cream text-brand-olive text-[10px] uppercase tracking-wider font-bold rounded-full">
                          {activity.messLevel} Mess
                        </span>
                        <span className="px-3 py-1 bg-brand-sage/20 text-brand-olive text-[10px] uppercase tracking-wider font-bold rounded-full">
                          {activity.benefit}
                        </span>
                      </div>

                      <div className="mb-6">
                        <h4 className="text-xs uppercase tracking-widest font-bold text-brand-olive/40 mb-3">Instructions</h4>
                        <ul className="space-y-3">
                          {activity.instructions.map((step, i) => (
                            <li key={i} className="flex gap-3 text-sm text-brand-olive/80">
                              <span className="w-5 h-5 bg-brand-cream rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-brand-olive/5">
                        <div>
                          <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-olive/40 mb-2">Supplies</h4>
                          <p className="text-xs text-brand-olive/70">{activity.supplies.join(', ') || 'None'}</p>
                        </div>
                        <div>
                          <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-olive/40 mb-2">Safety</h4>
                          <p className="text-xs text-red-600/70">{activity.safety}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  <button 
                    onClick={() => setScreen('generator')}
                    className="w-full py-4 text-brand-olive/60 font-medium flex items-center justify-center gap-2"
                  >
                    <History className="w-4 h-4" />
                    Try different settings
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {screen === 'seasonal' && (
            <motion.div
              key="seasonal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setScreen('home')} className="p-2 bg-white rounded-full shadow-sm">
                  <X className="w-5 h-5 text-brand-olive" />
                </button>
                <h2 className="serif text-2xl text-brand-olive">Seasonal Packs</h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {SEASONAL_PACKS.map((pack) => (
                  <button
                    key={pack.id}
                    onClick={() => { setSelectedPack(pack); setScreen('pack-details'); }}
                    className="p-6 rounded-[2rem] border text-left transition-all bg-white border-brand-olive/10 hover:border-brand-olive/30 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl">{pack.icon}</span>
                    </div>
                    <h3 className="serif text-xl text-brand-olive mb-1">{pack.title}</h3>
                    <p className="text-xs text-brand-olive/60 line-clamp-2">{pack.description}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {screen === 'pack-details' && selectedPack && (
            <motion.div
              key="pack-details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setScreen('seasonal')} className="p-2 bg-white rounded-full shadow-sm">
                  <X className="w-5 h-5 text-brand-olive" />
                </button>
                <h2 className="serif text-2xl text-brand-olive">{selectedPack.title}</h2>
              </div>

              <div className="space-y-6">
                {selectedPack.activities.map((activity, idx) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-[2rem] p-6 shadow-sm border border-brand-olive/5"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="serif text-2xl text-brand-olive leading-tight flex-1 pr-4">{activity.title}</h3>
                      <button 
                        onClick={() => toggleFavorite(activity)}
                        className="p-2"
                      >
                        <Heart 
                          className={`w-6 h-6 ${favorites.find(f => f.id === activity.id) ? 'text-red-500 fill-red-500' : 'text-brand-olive/20'}`} 
                        />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1 bg-brand-cream text-brand-olive text-[10px] uppercase tracking-wider font-bold rounded-full">
                        {activity.messLevel} Mess
                      </span>
                      <span className="px-3 py-1 bg-brand-sage/20 text-brand-olive text-[10px] uppercase tracking-wider font-bold rounded-full">
                        {activity.benefit}
                      </span>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-xs uppercase tracking-widest font-bold text-brand-olive/40 mb-3">Instructions</h4>
                      <ul className="space-y-3">
                        {activity.instructions.map((step, i) => (
                          <li key={i} className="flex gap-3 text-sm text-brand-olive/80">
                            <span className="w-5 h-5 bg-brand-cream rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-brand-olive/5">
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-olive/40 mb-2">Supplies</h4>
                        <p className="text-xs text-brand-olive/70">{activity.supplies.join(', ') || 'None'}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-olive/40 mb-2">Safety</h4>
                        <p className="text-xs text-red-600/70">{activity.safety}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {screen === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setScreen('home')} className="p-2 bg-white rounded-full shadow-sm">
                  <X className="w-5 h-5 text-brand-olive" />
                </button>
                <h2 className="serif text-2xl text-brand-olive">Favorites</h2>
                <div className="w-9" />
              </div>

              {favorites.length === 0 ? (
                <div className="text-center py-20">
                  <Heart className="w-12 h-12 text-brand-olive/10 mx-auto mb-4" />
                  <p className="text-brand-olive/40">No favorites yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {favorites.map((activity) => (
                    <div key={activity.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-brand-olive/5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="serif text-xl text-brand-olive">{activity.title}</h3>
                        <button onClick={() => toggleFavorite(activity)} className="p-2">
                          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        </button>
                      </div>
                      <p className="text-xs text-brand-olive/40 mb-4">{activity.ageGroup}</p>
                      <button 
                        onClick={() => { setActivities([activity]); setScreen('results'); }}
                        className="text-brand-olive font-medium text-sm flex items-center gap-1"
                      >
                        View Details <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {screen === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setScreen('home')} className="p-2 bg-white rounded-full shadow-sm">
                  <X className="w-5 h-5 text-brand-olive" />
                </button>
                <h2 className="serif text-2xl text-brand-olive">Premium</h2>
              </div>

              <div className="bg-brand-clay text-white p-8 rounded-[2.5rem] mb-8 relative overflow-hidden">
                <Crown className="w-12 h-12 mb-4" />
                <h3 className="serif text-3xl mb-2">ToddlerPlay Pro</h3>
                <p className="text-white/80 text-sm mb-6">Unlimited generations, seasonal packs, and milestone tracking.</p>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" /> Unlimited daily ideas
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" /> Seasonal sensory packs
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" /> Printable activity cards
                  </li>
                </ul>

                {!isPremium ? (
                  <button 
                    onClick={async () => {
                      await fetch('/api/user/upgrade', { method: 'POST' });
                      fetchUserStatus();
                    }}
                    className="w-full bg-white text-brand-clay py-4 rounded-2xl font-bold shadow-lg"
                  >
                    Upgrade for $4.99/mo
                  </button>
                ) : (
                  <div className="w-full bg-white/20 backdrop-blur-md py-4 rounded-2xl font-bold text-center">
                    Pro Active
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between p-4 bg-white rounded-2xl text-sm">
                  <span className="text-brand-olive/60">Generations Today</span>
                  <span className="font-bold text-brand-olive">{generationsToday} / {isPremium ? '∞' : '3'}</span>
                </div>
                <div className="p-4 bg-white rounded-2xl text-sm text-brand-olive/60">
                  Daily notification: 8:00 AM
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Nav for one-handed use */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-xl border-t border-brand-olive/5 px-8 py-4 flex justify-between items-center safe-bottom z-50">
        <button onClick={() => setScreen('home')} className={`flex flex-col items-center gap-1 ${screen === 'home' ? 'text-brand-olive' : 'text-brand-olive/30'}`}>
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
        </button>
        <button onClick={() => setScreen('generator')} className={`flex flex-col items-center gap-1 ${screen === 'generator' ? 'text-brand-olive' : 'text-brand-olive/30'}`}>
          <Sparkles className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Play</span>
        </button>
        <button onClick={handleMeltdown} className={`flex flex-col items-center gap-1 ${screen === 'meltdown' ? 'text-red-500' : 'text-brand-olive/30'}`}>
          <AlertCircle className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Calm</span>
        </button>
        <button onClick={() => setScreen('favorites')} className={`flex flex-col items-center gap-1 ${screen === 'favorites' ? 'text-brand-olive' : 'text-brand-olive/30'}`}>
          <Heart className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Saved</span>
        </button>
      </div>
    </div>
  );
}
