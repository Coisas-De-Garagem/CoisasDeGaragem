import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Verificar saúde da aplicação',
    description: 'Retorna o status de saúde da aplicação',
  })
  @ApiResponse({
    status: 200,
    description: 'Aplicação saudável',
    schema: {
      example: {
        status: 'ok',
        message: 'Application is healthy',
      },
    },
  })
  check() {
    return { status: 'ok', message: 'Application is healthy' };
  }
}
