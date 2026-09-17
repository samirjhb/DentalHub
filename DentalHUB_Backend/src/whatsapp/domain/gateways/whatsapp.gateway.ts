export abstract class WhatsappGateway {
  abstract sendTextMessage(recipientNumber: string, message: string): Promise<any>;
  abstract sendTemplateMessage(
    recipientNumber: string,
    templateName: string,
    languageCode?: string,
  ): Promise<any>;
}
