import React, { useState, useRef, useEffect } from 'react';

interface XPBadgeProps {
  account: string | null;
  userXPAddress: string;
}

// Test için dummy data
const DUMMY_USER_DETAILS = {
  xp: 750,
  level: 3,
  swapCount: 45,
  volumeUSD: 25000,
  badge: "⬡",  // Altıgen şekli
  title: "Trading Expert",
  nextLevelXP: 1000
};

const XPBadge: React.FC<XPBadgeProps> = ({ account }) => {
  const [showCard, setShowCard] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    if (!showCard) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current && 
        !popupRef.current.contains(e.target as Node) &&
        badgeRef.current && 
        !badgeRef.current.contains(e.target as Node)
      ) {
        setShowCard(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCard]);

  if (!account) return null;

  const progress = DUMMY_USER_DETAILS.nextLevelXP 
    ? (DUMMY_USER_DETAILS.xp / DUMMY_USER_DETAILS.nextLevelXP) * 100 
    : 100;

  // Prepare tweet text
  const tweetText = `🚀 Level ${DUMMY_USER_DETAILS.level} ${DUMMY_USER_DETAILS.title} on @MonadDEX!\n💫 XP: ${DUMMY_USER_DETAILS.xp}\n📊 Swaps: ${DUMMY_USER_DETAILS.swapCount}\n💎 Volume: $${DUMMY_USER_DETAILS.volumeUSD.toLocaleString()}`;
  
  // Function to share on Twitter
  const shareOnTwitter = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="inline-flex items-center relative">
      {/* Badge and Level */}
      <div className="flex items-center gap-2 mr-2">
        <div 
          ref={badgeRef}
          onClick={() => setShowCard(!showCard)}
          className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent cursor-pointer"
        >
          {DUMMY_USER_DETAILS.badge}
        </div>
        <div className="text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Lvl {DUMMY_USER_DETAILS.level}
        </div>
      </div>
      
      {/* Share Button */}
      <button
        onClick={shareOnTwitter}
        className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white text-xs font-medium py-1 px-2 rounded-lg transition-colors flex items-center gap-1"
        title="Share your achievement on Twitter"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085a4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
        Share
      </button>

      {/* Popup Card */}
      {showCard && (
        <div 
          ref={popupRef}
          className="absolute left-0 top-full mt-2 w-72 bg-[#1a1a1a] rounded-xl p-4 shadow-xl border border-gray-800 z-50"
        >
          {/* Title */}
          <div className="text-center mb-4">
            <div className="text-3xl mb-1 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              {DUMMY_USER_DETAILS.badge}
            </div>
            <div className="text-sm font-medium text-white">{DUMMY_USER_DETAILS.title}</div>
          </div>

          {/* Stats */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Level</span>
              <span className="text-white">{DUMMY_USER_DETAILS.level}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">XP</span>
              <span className="text-white">{DUMMY_USER_DETAILS.xp.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Swaps</span>
              <span className="text-white">{DUMMY_USER_DETAILS.swapCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Volume</span>
              <span className="text-white">${DUMMY_USER_DETAILS.volumeUSD.toLocaleString()}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress to Level {DUMMY_USER_DETAILS.level + 1}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default XPBadge; 