import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async onModuleInit() {
    await this.seedUsers();
  }

  async seedUsers() {
    const count = await this.userRepository.count();
    if (count === 0) {
      const defaultUsers: Partial<User>[] = [
        {
          email: 'docente@sigslab.edu',
          name: 'Prof. Sofia Arboleda',
          role: 'docente'
        },
        {
          email: 'jefe@sigslab.edu',
          name: 'Ing. Marcos Paz (Jefe de Soporte)',
          role: 'jefe-soporte'
        },
        {
          email: 'tecnico@sigslab.edu',
          name: 'Juan Pérez (Bolsista)',
          role: 'tecnico'
        },
        {
          email: 'maria@sigslab.edu',
          name: 'María Gómez (Técnico)',
          role: 'tecnico'
        },
        {
          email: 'carlos@sigslab.edu',
          name: 'Carlos López (Bolsista)',
          role: 'tecnico'
        }
      ];

      for (const u of defaultUsers) {
        await this.userRepository.save(this.userRepository.create(u));
      }
      console.log('Usuarios de prueba sembrados exitosamente.');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findTechnicians(): Promise<User[]> {
    return this.userRepository.find({ where: { role: 'tecnico' } });
  }
}
