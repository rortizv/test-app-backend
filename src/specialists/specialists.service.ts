import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Specialist } from './entities/specialist.entity';
import { CreateSpecialistDto } from './dto/create-specialist.dto';
import { UpdateSpecialistDto } from './dto/update-specialist.dto';

@Injectable()
export class SpecialistsService {
  constructor(
    @InjectRepository(Specialist)
    private readonly specialistRepository: Repository<Specialist>,
  ) {}

  async findAll(): Promise<Specialist[]> {
    return this.specialistRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Specialist> {
    const specialist = await this.specialistRepository.findOne({ where: { id } });
    if (!specialist) {
      throw new NotFoundException(`Specialist with id "${id}" not found`);
    }
    return specialist;
  }

  async create(createSpecialistDto: CreateSpecialistDto): Promise<Specialist> {
    const specialist = this.specialistRepository.create(createSpecialistDto);
    return this.specialistRepository.save(specialist);
  }

  async update(
    id: string,
    updateSpecialistDto: UpdateSpecialistDto,
  ): Promise<Specialist> {
    const specialist = await this.findOne(id);
    Object.assign(specialist, updateSpecialistDto);
    return this.specialistRepository.save(specialist);
  }

  async remove(id: string): Promise<void> {
    const specialist = await this.findOne(id);
    await this.specialistRepository.remove(specialist);
  }

  async toggleActive(id: string): Promise<Specialist> {
    const specialist = await this.findOne(id);
    specialist.isActive = !specialist.isActive;
    return this.specialistRepository.save(specialist);
  }
}
