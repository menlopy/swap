// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract UserXP is Ownable, ReentrancyGuard {
    // Kullanıcı XP bilgisi
    struct UserInfo {
        uint256 xp;           // Toplam XP
        uint256 level;        // Mevcut seviye
        uint256 swapCount;    // Toplam swap sayısı
        uint256 volumeUSD;    // Toplam işlem hacmi (USD)
        uint256 lastUpdate;   // Son güncelleme zamanı
    }

    // Seviye bilgisi
    struct LevelInfo {
        uint256 requiredXP;   // Gerekli XP
        string badge;         // Seviye rozeti (örn: "🌟", "💫", "⭐️", "🌠", "✨")
        string title;         // Seviye unvanı
    }

    // Kullanıcı => XP bilgisi
    mapping(address => UserInfo) public users;
    
    // Seviye => Seviye bilgisi
    mapping(uint256 => LevelInfo) public levels;
    
    // Router kontratı (sadece bu kontrat XP verebilir)
    address public router;

    // Events
    event XPEarned(address indexed user, uint256 amount, string reason);
    event LevelUp(address indexed user, uint256 newLevel, string badge, string title);
    event SwapXP(address indexed user, uint256 volumeUSD, uint256 xpEarned);

    constructor() {
        // Seviyeleri ayarla
        levels[1] = LevelInfo(0, "🌱", "Novice Trader");
        levels[2] = LevelInfo(100, "⭐️", "Rising Star");
        levels[3] = LevelInfo(500, "🌟", "Trading Expert");
        levels[4] = LevelInfo(1000, "💫", "Swap Master");
        levels[5] = LevelInfo(2500, "✨", "Trading Legend");
        levels[6] = LevelInfo(5000, "🌠", "Swap God");
        levels[7] = LevelInfo(10000, "👑", "Trading Royalty");
        levels[8] = LevelInfo(25000, "🔮", "Mystic Trader");
        levels[9] = LevelInfo(50000, "⚡️", "Trading Oracle");
        levels[10] = LevelInfo(100000, "🌌", "Cosmic Trader");
    }

    // Router'ı ayarla
    function setRouter(address _router) external onlyOwner {
        router = _router;
    }

    // Swap işlemi sonrası XP ver (sadece router çağırabilir)
    function awardSwapXP(address user, uint256 volumeUSD) external nonReentrant {
        require(msg.sender == router, "Only router can award XP");
        require(volumeUSD > 0, "Volume must be greater than 0");

        // XP hesapla (her $100 için 1 XP, minimum 1 XP)
        uint256 xpEarned = (volumeUSD + 99) / 100;
        if (xpEarned == 0) xpEarned = 1;

        UserInfo storage userInfo = users[user];
        userInfo.xp += xpEarned;
        userInfo.swapCount += 1;
        userInfo.volumeUSD += volumeUSD;
        userInfo.lastUpdate = block.timestamp;

        // Seviye kontrolü
        _checkAndUpdateLevel(user);

        emit SwapXP(user, volumeUSD, xpEarned);
    }

    // Kullanıcının seviyesini kontrol et ve güncelle
    function _checkAndUpdateLevel(address user) internal {
        UserInfo storage userInfo = users[user];
        uint256 currentLevel = userInfo.level;
        uint256 nextLevel = currentLevel + 1;

        // Maksimum seviye kontrolü
        if (nextLevel > 10) return;

        // Yeni seviye için yeterli XP var mı?
        if (userInfo.xp >= levels[nextLevel].requiredXP) {
            userInfo.level = nextLevel;
            emit LevelUp(
                user,
                nextLevel,
                levels[nextLevel].badge,
                levels[nextLevel].title
            );
            
            // Recursive olarak sonraki seviyeleri de kontrol et
            _checkAndUpdateLevel(user);
        }
    }

    // Kullanıcının mevcut rozetini getir
    function getCurrentBadge(address user) external view returns (string memory) {
        UserInfo memory userInfo = users[user];
        if (userInfo.level == 0) return levels[1].badge;
        return levels[userInfo.level].badge;
    }

    // Kullanıcının mevcut unvanını getir
    function getCurrentTitle(address user) external view returns (string memory) {
        UserInfo memory userInfo = users[user];
        if (userInfo.level == 0) return levels[1].title;
        return levels[userInfo.level].title;
    }

    // Kullanıcının detaylı bilgilerini getir
    function getUserDetails(address user) external view returns (
        uint256 xp,
        uint256 level,
        uint256 swapCount,
        uint256 volumeUSD,
        string memory badge,
        string memory title,
        uint256 nextLevelXP
    ) {
        UserInfo memory userInfo = users[user];
        uint256 currentLevel = userInfo.level == 0 ? 1 : userInfo.level;
        uint256 nextLevel = currentLevel + 1;
        
        return (
            userInfo.xp,
            currentLevel,
            userInfo.swapCount,
            userInfo.volumeUSD,
            levels[currentLevel].badge,
            levels[currentLevel].title,
            nextLevel > 10 ? 0 : levels[nextLevel].requiredXP
        );
    }
} 