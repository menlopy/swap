// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakingToken is ERC20, Ownable {
    uint256 public constant MAXIMUM_SUPPLY = 100_000_000 ether; // 100 milyon token
    uint256 public constant INITIAL_SUPPLY = 10_000_000 ether;  // 10 milyon token başlangıç arzı
    uint256 public constant YEARLY_EMISSION = 5_000_000 ether;  // Yıllık maksimum 5 milyon token emisyonu
    
    uint256 public emissionStart;
    uint256 public lastEmissionUpdate;
    uint256 public currentYearEmission;

    constructor() ERC20("Staking Reward Token", "SRT") {
        _mint(msg.sender, INITIAL_SUPPLY);
        emissionStart = block.timestamp;
        lastEmissionUpdate = block.timestamp;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAXIMUM_SUPPLY, "Maximum supply exceeded");
        
        // Yıllık emisyon kontrolü
        uint256 currentYear = (block.timestamp - emissionStart) / 365 days;
        if (currentYear > (lastEmissionUpdate - emissionStart) / 365 days) {
            currentYearEmission = 0;
            lastEmissionUpdate = block.timestamp;
        }
        
        require(currentYearEmission + amount <= YEARLY_EMISSION, "Yearly emission limit exceeded");
        currentYearEmission += amount;
        
        _mint(to, amount);
    }

    function getCurrentEmission() external view returns (uint256) {
        return currentYearEmission;
    }

    function getRemainingYearlyEmission() external view returns (uint256) {
        return YEARLY_EMISSION - currentYearEmission;
    }
} 