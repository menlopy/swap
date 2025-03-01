// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./StakingToken.sol";

contract LPStaking is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Staking için LP token
    IERC20 public lpToken;
    // Ödül tokeni
    StakingToken public rewardToken;

    // Kullanıcı başına stake bilgisi
    struct StakeInfo {
        uint256 amount;        // Stake edilen miktar
        uint256 startTime;     // Stake başlangıç zamanı
        uint256 lastClaimTime; // Son ödül claim zamanı
    }

    // Stake seviyeleri ve karşılık gelen çarpanlar (x100)
    struct StakeLevel {
        uint256 duration;      // Stake süresi (saniye)
        uint256 multiplier;    // Ödül çarpanı (x100)
    }

    // Stake seviyeleri
    StakeLevel[] public stakeLevels;
    
    // Saniye başına ödül oranı (x1e18)
    uint256 public rewardRate;
    
    // Kullanıcı => Stake bilgisi
    mapping(address => StakeInfo) public stakes;
    
    // Toplam stake edilen LP token miktarı
    uint256 public totalStaked;

    // APR limitleri
    uint256 public constant MIN_APR = 500; // 5% (x100)
    uint256 public constant MAX_APR = 2000; // 20% (x100)
    uint256 public constant APR_DENOMINATOR = 10000; // 100% = 10000

    // Dinamik APR hesaplama için hedef stake miktarı
    uint256 public targetStakeAmount;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 newRate);
    event StakeLevelAdded(uint256 duration, uint256 multiplier);
    event TargetStakeAmountUpdated(uint256 newAmount);

    constructor(
        address _lpToken,
        address _rewardToken,
        uint256 _initialRewardRate,
        uint256 _targetStakeAmount
    ) {
        lpToken = IERC20(_lpToken);
        rewardToken = StakingToken(_rewardToken);
        rewardRate = _initialRewardRate;
        targetStakeAmount = _targetStakeAmount;

        // Daha makul stake seviyeleri
        stakeLevels.push(StakeLevel(30 days, 100));   // 1x - 30 gün
        stakeLevels.push(StakeLevel(90 days, 125));   // 1.25x - 90 gün
        stakeLevels.push(StakeLevel(180 days, 150));  // 1.5x - 180 gün
        stakeLevels.push(StakeLevel(365 days, 200));  // 2x - 365 gün
    }

    // Stake seviyesi ekleme (sadece owner)
    function addStakeLevel(uint256 duration, uint256 multiplier) external onlyOwner {
        require(duration > 0, "Duration must be > 0");
        require(multiplier >= 100 && multiplier <= 300, "Invalid multiplier range");
        stakeLevels.push(StakeLevel(duration, multiplier));
        emit StakeLevelAdded(duration, multiplier);
    }

    // Hedef stake miktarını güncelleme (sadece owner)
    function updateTargetStakeAmount(uint256 _targetStakeAmount) external onlyOwner {
        targetStakeAmount = _targetStakeAmount;
        emit TargetStakeAmountUpdated(_targetStakeAmount);
        _updateRewardRate();
    }

    // Dinamik APR hesaplama
    function _calculateAPR() internal view returns (uint256) {
        if (totalStaked == 0) return MAX_APR;
        
        // Hedef stake miktarına göre APR'yi ayarla
        if (totalStaked >= targetStakeAmount) {
            return MIN_APR;
        }
        
        uint256 stakingRatio = (totalStaked * APR_DENOMINATOR) / targetStakeAmount;
        uint256 aprRange = MAX_APR - MIN_APR;
        
        return MAX_APR - ((stakingRatio * aprRange) / APR_DENOMINATOR);
    }

    // Ödül oranını güncelleme (otomatik)
    function _updateRewardRate() internal {
        uint256 apr = _calculateAPR();
        // rewardRate = (LP Token Değeri * APR) / (365 gün * 24 saat * 3600 saniye)
        rewardRate = (1 ether * apr) / (365 days * APR_DENOMINATOR);
        emit RewardRateUpdated(rewardRate);
    }

    // LP token stake etme
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        
        // LP tokenleri transfer et
        lpToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Stake bilgisini güncelle
        if (stakes[msg.sender].amount > 0) {
            // Önce mevcut ödülleri claim et
            _claimReward(msg.sender);
        }
        
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].startTime = block.timestamp;
        stakes[msg.sender].lastClaimTime = block.timestamp;
        
        totalStaked += amount;
        
        // Ödül oranını güncelle
        _updateRewardRate();
        
        emit Staked(msg.sender, amount);
    }

    // Stake edilen LP tokenleri çekme
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(stakes[msg.sender].amount >= amount, "Insufficient stake");
        
        // Önce ödülleri claim et
        _claimReward(msg.sender);
        
        // LP tokenleri geri transfer et
        stakes[msg.sender].amount -= amount;
        totalStaked -= amount;
        lpToken.safeTransfer(msg.sender, amount);
        
        // Ödül oranını güncelle
        _updateRewardRate();
        
        emit Withdrawn(msg.sender, amount);
    }

    // Ödülleri claim etme
    function claimReward() external nonReentrant {
        _claimReward(msg.sender);
    }

    // Bekleyen ödül miktarını hesaplama
    function pendingReward(address user) public view returns (uint256) {
        if (stakes[user].amount == 0) return 0;
        
        uint256 stakeDuration = block.timestamp - stakes[user].startTime;
        uint256 multiplier = getMultiplier(stakeDuration);
        
        uint256 timeElapsed = block.timestamp - stakes[user].lastClaimTime;
        return (stakes[user].amount * timeElapsed * rewardRate * multiplier) / (100 * 1e18);
    }

    // Stake süresine göre çarpanı hesaplama
    function getMultiplier(uint256 duration) public view returns (uint256) {
        uint256 maxMultiplier = 100;
        
        for (uint256 i = 0; i < stakeLevels.length; i++) {
            if (duration >= stakeLevels[i].duration) {
                maxMultiplier = stakeLevels[i].multiplier;
            }
        }
        
        return maxMultiplier;
    }

    // Internal ödül claim fonksiyonu
    function _claimReward(address user) internal {
        uint256 reward = pendingReward(user);
        if (reward > 0) {
            stakes[user].lastClaimTime = block.timestamp;
            rewardToken.mint(user, reward);
            emit RewardClaimed(user, reward);
        }
    }

    // Mevcut APR'yi görüntüleme
    function getCurrentAPR() external view returns (uint256) {
        return _calculateAPR();
    }
} 