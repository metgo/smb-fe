import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class HashService {
  async create(plainText: string): Promise<string> {
    return await argon2.hash(plainText);
  }

  async validate(password: string, passwordEntered: string): Promise<boolean> {
    return await argon2.verify(password, passwordEntered);
  }
}
