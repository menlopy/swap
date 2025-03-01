// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TokenSwap is ReentrancyGuard {
    IERC20 public token1;
    IERC20 public token2;
    uint256 public rate; // How many token2 per token1

    event Swap(
        address indexed user,
        uint256 token1Amount,
        uint256 token2Amount
    );

    constructor(address _token1, address _token2, uint256 _rate) {
        require(_token1 != address(0) && _token2 != address(0), "Invalid token addresses");
        require(_rate > 0, "Invalid rate");
        token1 = IERC20(_token1);
        token2 = IERC20(_token2);
        rate = _rate;
    }

    function swap(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        uint256 token2Amount = amount * rate;
        
        require(token1.transferFrom(msg.sender, address(this), amount), "Transfer of token1 failed");
        require(token2.transfer(msg.sender, token2Amount), "Transfer of token2 failed");
        
        emit Swap(msg.sender, amount, token2Amount);
    }

    function getSwapRate() external view returns (uint256) {
        return rate;
    }
} 