import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar evento / garage sale',
    description: 'Cria um novo evento vinculado ao vendedor autenticado.',
  })
  @ApiResponse({ status: 201, description: 'Evento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBody({ type: CreateEventDto })
  create(@Body() createEventDto: CreateEventDto, @CurrentUser() user: any) {
    return this.eventsService.create(createEventDto, user.userId);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar eventos do vendedor' })
  @ApiResponse({ status: 200, description: 'Lista de eventos' })
  findAll(@CurrentUser() user: any) {
    return this.eventsService.findAllBySeller(user.userId);
  }

  @Get(':id/public')
  @ApiOperation({
    summary: 'Vitrine pública do evento',
    description: 'Retorna dados públicos do evento + produtos vinculados (sem autenticação).',
  })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiResponse({ status: 200, description: 'Dados públicos do evento' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  getPublicEvent(@Param('id') id: string) {
    return this.eventsService.getPublicEvent(id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detalhes de um evento (privado, vendedor)' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiResponse({ status: 200, description: 'Detalhes do evento' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.findOne(id, user.userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar evento' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiBody({ type: UpdateEventDto })
  @ApiResponse({ status: 200, description: 'Evento atualizado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.update(id, updateEventDto, user.userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir evento' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiResponse({ status: 200, description: 'Evento excluído' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 409, description: 'Evento possui vendas vinculadas' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.remove(id, user.userId);
  }

  // ---- Vínculo de produtos ----

  @Post(':id/products/:productId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vincular produto ao evento' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiParam({ name: 'productId', description: 'ID do produto' })
  @ApiResponse({ status: 200, description: 'Produto vinculado' })
  @ApiResponse({ status: 409, description: 'Produto já vinculado a outro evento' })
  linkProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.linkProduct(id, productId, user.userId);
  }

  @Delete(':id/products/:productId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desvincular produto do evento' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiParam({ name: 'productId', description: 'ID do produto' })
  unlinkProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.unlinkProduct(id, productId, user.userId);
  }

  // ---- QR Code ----

  @Get(':id/qr')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gerar QR Code do evento' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiResponse({ status: 200, description: 'QR Code gerado' })
  getQr(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.getEventQr(id, user.userId);
  }

  // ---- Visitas (público, sem auth) ----

  @Post(':id/visit')
  @ApiOperation({ summary: 'Registrar visita/scan ao evento (público)' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiResponse({ status: 201, description: 'Visita registrada' })
  recordVisit(@Param('id') id: string) {
    return this.eventsService.recordVisit(id);
  }

  // ---- Insights ----

  @Get(':id/insights')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Relatórios/insights do evento' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiResponse({ status: 200, description: 'Insights do evento' })
  getInsights(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.getInsights(id, user.userId);
  }
}
