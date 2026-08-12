import { Controller, Get, Post, Body, Patch, Param, UseGuards, Put } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('locations')
@UseGuards(AuthGuard('jwt'))
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.locationsService.findAllBySeller(user.userId);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() createLocationDto: any) {
    return this.locationsService.create(user.userId, createLocationDto);
  }

  @Put(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateLocationDto: any,
  ) {
    return this.locationsService.update(user.userId, id, updateLocationDto);
  }

  @Patch(':id/toggle')
  toggleStatus(@CurrentUser() user: any, @Param('id') id: string) {
    return this.locationsService.toggleStatus(user.userId, id);
  }
}
