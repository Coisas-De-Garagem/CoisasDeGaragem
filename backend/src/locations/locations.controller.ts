import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Put,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth-user.interface';

type CreateLocationDto = { name: string; address: string; isActive?: boolean };
type UpdateLocationDto = {
  name?: string;
  address?: string;
  isActive?: boolean;
};

@Controller('locations')
@UseGuards(AuthGuard('jwt'))
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.locationsService.findAllBySeller(user.userId);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createLocationDto: CreateLocationDto,
  ) {
    return this.locationsService.create(user.userId, createLocationDto);
  }

  @Put(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.locationsService.update(user.userId, id, updateLocationDto);
  }

  @Patch(':id/toggle')
  toggleStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.locationsService.toggleStatus(user.userId, id);
  }
}
