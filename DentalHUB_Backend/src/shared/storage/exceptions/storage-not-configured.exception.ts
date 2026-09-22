import { InternalServerErrorException } from '@nestjs/common';

// A diferencia de MailService (que loguea y sigue sin enviar si falta la API
// key, ya que el resto del flujo puede seguir sin el email), acá no hay un
// no-op razonable: sin storage configurado, subir un archivo no puede
// funcionar de ningún modo. Es un problema de configuración del servidor,
// no un error del cliente — de ahí el 500 en vez de 400/422.
export class StorageNotConfiguredException extends InternalServerErrorException {
  constructor() {
    super('El storage de archivos no está configurado en el servidor');
  }
}
