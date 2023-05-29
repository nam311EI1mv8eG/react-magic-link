import { Networks } from './networks';

export const getBlockExplorer = () => {
  const network = localStorage.getItem('network');
  switch (network) {
    case Networks.Polygon:
      return 'https://mumbai.polygonscan.com/';
    case Networks.Optimism:
      return 'https://blockscout.com/optimism/goerli/';
    case Networks.Goerli:
      return 'https://goerli.etherscan.io/';
    default:
      return 'https://sepolia.etherscan.io/';
  }
};
