import { Controller, Post, Body, Get, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body('email') email: string): Promise<User> {
    const user = await this.authService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuario no registrado en el sistema.');
    }
    return user;
  }

  @Get('technicians')
  async getTechnicians(): Promise<User[]> {
    return this.authService.findTechnicians();
  }
}
