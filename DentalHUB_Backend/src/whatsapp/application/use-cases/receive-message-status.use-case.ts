import { Injectable } from '@nestjs/common';

@Injectable()
export class ReceiveMessageStatusUseCase {
  async execute(rawData: any) {
    console.log('Received message status:', rawData);
    // Aquí puedes procesar el estado del mensaje como necesites
    return {
      received: true,
      timestamp: new Date().toISOString(),
      data: rawData,
    };
  }
}
