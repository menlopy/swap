import { Contract, BigNumber } from 'ethers';

export interface UserXP extends Contract {
  getUserDetails(address: string): Promise<[
    BigNumber,    // xp
    BigNumber,    // level
    BigNumber,    // swapCount
    BigNumber,    // volumeUSD
    string,       // badge
    string,       // title
    BigNumber     // nextLevelXP
  ]>;
}

export const UserXP__factory = {
  connect(address: string, provider: any): UserXP {
    return new Contract(
      address,
      [
        'function getUserDetails(address user) view returns (uint256, uint256, uint256, uint256, string, string, uint256)'
      ],
      provider
    ) as UserXP;
  }
}; 