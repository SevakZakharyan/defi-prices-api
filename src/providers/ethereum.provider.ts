import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Contract, ethers, providers } from 'ethers';

@Injectable()
export class EthereumProvider implements OnModuleInit {
  private readonly logger = new Logger(EthereumProvider.name);
  private provider: ethers.providers.JsonRpcProvider;

  public async onModuleInit(): Promise<void> {
    const rpcUrl = process.env.ETHEREUM_RPC_URL;

    if (!rpcUrl) {
      throw new Error('ETHEREUM_RPC_URL is not defined');
    }

    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    try {
      const network = await this.provider.getNetwork();
      this.logger.log(
        `Connected to ${network.name} (chainId: ${network.chainId})`,
      );
    } catch (error) {
      this.logger.error('Failed to initialize Ethereum provider:', error);
      throw error;
    }
  }

  public getProvider(): providers.JsonRpcProvider {
    return this.provider;
  }

  public getContract(address: string, abi: any[]): Contract {
    return new Contract(address, abi, this.provider);
  }
}
